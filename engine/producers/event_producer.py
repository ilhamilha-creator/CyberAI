"""
CyberAI-Expert v8.0 — Hybrid Event Producer
MODE=hybrid: reads real Zeek/Suricata logs + generates synthetic traffic
MODE=generator: synthetic only
MODE=sensor: real logs only
"""
import os, sys, json, time, signal, logging, glob, threading
from datetime import datetime, timezone

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

logger = logging.getLogger("cyberai.producer")
MODE = os.getenv("MODE", "hybrid")
KAFKA_BROKER = os.getenv("KAFKA_BROKER", "kafka:29092")
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://cyberai:CyberAI_S3cur3_2024!@postgres:5432/cyberai_soc")
ES_URL = os.getenv("ELASTICSEARCH_URL", "http://elasticsearch:9200")
ZEEK_LOG_DIR = os.getenv("ZEEK_LOG_DIR", "/zeek-logs")
SURICATA_LOG_DIR = os.getenv("SURICATA_LOG_DIR", "/suricata-logs")

shutdown = threading.Event()
signal.signal(signal.SIGTERM, lambda *a: shutdown.set())
signal.signal(signal.SIGINT, lambda *a: shutdown.set())


def connect_kafka():
    from kafka import KafkaProducer
    for attempt in range(15):
        try:
            p = KafkaProducer(bootstrap_servers=[KAFKA_BROKER], value_serializer=lambda v: json.dumps(v, default=str).encode())
            logger.info("Kafka connected (attempt %d)", attempt+1)
            return p
        except Exception as e:
            logger.warning("Kafka not ready (%d/15): %s", attempt+1, e)
            time.sleep(min(5*attempt, 30))
    return None


def connect_postgres():
    import psycopg2
    for attempt in range(10):
        try:
            conn = psycopg2.connect(DATABASE_URL)
            conn.autocommit = True
            logger.info("PostgreSQL connected")
            return conn
        except Exception as e:
            logger.warning("PostgreSQL not ready (%d/10): %s", attempt+1, e)
            time.sleep(3*attempt)
    return None


def connect_elasticsearch():
    from elasticsearch import Elasticsearch
    for attempt in range(10):
        try:
            es = Elasticsearch([ES_URL], request_timeout=30)
            if es.ping():
                logger.info("Elasticsearch connected")
                # Create index if not exists
                if not es.indices.exists(index="cyberai-events"):
                    es.indices.create(index="cyberai-events", body={"settings": {"number_of_shards": 1, "number_of_replicas": 0}})
                return es
        except Exception as e:
            logger.warning("ES not ready (%d/10): %s", attempt+1, e)
            time.sleep(5*attempt)
    return None


def parse_zeek_log(line: str) -> dict:
    """Parse a Zeek JSON log line into a network event."""
    try:
        data = json.loads(line)
        return {
            "uid": data.get("uid", f"zeek-{time.time_ns()}"),
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "src_ip": data.get("id.orig_h", data.get("orig_h", "")),
            "dst_ip": data.get("id.resp_h", data.get("resp_h", "")),
            "src_port": data.get("id.orig_p", data.get("orig_p", 0)),
            "dst_port": data.get("id.resp_p", data.get("resp_p", 0)),
            "proto": data.get("proto", "TCP"),
            "service": data.get("service", ""),
            "duration": data.get("duration", 0) or 0,
            "orig_bytes": data.get("orig_bytes", 0) or 0,
            "resp_bytes": data.get("resp_bytes", 0) or 0,
            "orig_pkts": data.get("orig_pkts", 0) or 0,
            "resp_pkts": data.get("resp_pkts", 0) or 0,
            "conn_state": data.get("conn_state", ""),
            "source": "zeek",
            "is_attack": False,
            "attack_type": "normal",
            "severity": "info",
            "confidence": 0.0,
        }
    except Exception:
        return None


def parse_suricata_eve(line: str) -> dict:
    """Parse a Suricata EVE JSON log line."""
    try:
        data = json.loads(line)
        event_type = data.get("event_type", "")
        is_alert = event_type == "alert"
        alert_data = data.get("alert", {})
        return {
            "uid": f"suri-{data.get('flow_id', time.time_ns())}",
            "timestamp": data.get("timestamp", datetime.now(timezone.utc).isoformat()),
            "src_ip": data.get("src_ip", ""),
            "dst_ip": data.get("dest_ip", ""),
            "src_port": data.get("src_port", 0),
            "dst_port": data.get("dest_port", 0),
            "proto": data.get("proto", "TCP"),
            "service": data.get("app_proto", ""),
            "source": "suricata",
            "is_attack": is_alert,
            "attack_type": alert_data.get("category", "normal") if is_alert else "normal",
            "severity": _suricata_severity(alert_data.get("severity", 3)) if is_alert else "info",
            "confidence": 0.9 if is_alert else 0.0,
            "indicators": {"signature": alert_data.get("signature", ""), "sid": alert_data.get("signature_id", 0)} if is_alert else {},
        }
    except Exception:
        return None


def _suricata_severity(sev: int) -> str:
    return {1: "critical", 2: "high", 3: "medium"}.get(sev, "low")


def tail_file(filepath: str, parser_fn, kafka_producer, pg_conn, es_client):
    """Tail a log file and publish events."""
    try:
        with open(filepath, 'r') as f:
            f.seek(0, 2)  # Go to end
            while not shutdown.is_set():
                line = f.readline()
                if not line:
                    time.sleep(0.5)
                    continue
                event = parser_fn(line.strip())
                if event:
                    publish_event(event, kafka_producer, pg_conn, es_client)
    except Exception as e:
        logger.error("Error tailing %s: %s", filepath, e)


def publish_event(event: dict, kafka_producer, pg_conn, es_client):
    """Publish event to Kafka, PostgreSQL, Elasticsearch."""
    topic = "suricata-alerts" if event.get("is_attack") else "zeek-events"
    if kafka_producer:
        try:
            kafka_producer.send(topic, value=event)
        except Exception:
            pass
    if es_client:
        try:
            es_client.index(index="cyberai-events", document=event)
        except Exception:
            pass
    if pg_conn:
        try:
            cur = pg_conn.cursor()
            cur.execute("""INSERT INTO network_events (uid, ts, src_ip, dst_ip, src_port, dst_port, proto, service,
                duration, orig_bytes, resp_bytes, orig_pkts, resp_pkts, conn_state, is_attack, attack_type,
                severity, confidence, source, indicators)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                ON CONFLICT (uid) DO NOTHING""",
                (event.get("uid"), event.get("timestamp", datetime.now(timezone.utc).isoformat()),
                 event.get("src_ip",""), event.get("dst_ip",""), event.get("src_port",0), event.get("dst_port",0),
                 event.get("proto","TCP"), event.get("service",""), event.get("duration",0),
                 event.get("orig_bytes",0), event.get("resp_bytes",0), event.get("orig_pkts",0), event.get("resp_pkts",0),
                 event.get("conn_state",""), event.get("is_attack",False), event.get("attack_type","normal"),
                 event.get("severity","info"), event.get("confidence",0), event.get("source","unknown"),
                 json.dumps(event.get("indicators", {}))))
            if event.get("is_attack"):
                cur.execute("""INSERT INTO alerts (event_uid, ts, severity, alert_type, title, description, src_ip, dst_ip,
                    src_port, dst_port, confidence, source, raw_event)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)""",
                    (event["uid"], event.get("timestamp"), event.get("severity","medium"), event.get("attack_type","unknown"),
                     f"[{event.get('severity','').upper()}] {event.get('attack_type','')} detected",
                     f"From {event.get('src_ip')} to {event.get('dst_ip')}:{event.get('dst_port')}",
                     event.get("src_ip"), event.get("dst_ip"), event.get("src_port"), event.get("dst_port"),
                     event.get("confidence",0), event.get("source",""), json.dumps(event)))
            cur.close()
        except Exception as e:
            logger.debug("PG insert error: %s", e)


def run_generator(kafka_producer, pg_conn, es_client):
    """Run synthetic log generator."""
    from engine.generators.log_generator import LogGenerator
    gen = LogGenerator(attack_ratio=float(os.getenv("ATTACK_RATIO","0.25")),
                       events_per_second=float(os.getenv("EVENTS_PER_SECOND","8")),
                       enable_sessions=True)
    logger.info("Starting synthetic generator at %.1f eps", gen.events_per_second)
    interval = 1.0 / gen.events_per_second
    while not shutdown.is_set():
        try:
            event = gen.generate_event()
            publish_event(event.to_dict(), kafka_producer, pg_conn, es_client)
            if gen.total_events % 100 == 0:
                stats = gen.get_stats()
                logger.info("Generator stats: %d events, %d attacks, %d sessions",
                           stats["total_events"], stats["total_attacks"], stats["active_sessions"])
            time.sleep(interval)
        except Exception as e:
            logger.error("Generator error: %s", e)
            time.sleep(1)


def main():
    logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(name)s] %(levelname)s: %(message)s")
    logger.info("=" * 60)
    logger.info("CyberAI-Expert v8.0 — Hybrid Event Producer")
    logger.info("MODE=%s", MODE)
    logger.info("=" * 60)

    time.sleep(int(os.getenv("STARTUP_DELAY", "15")))

    kafka = connect_kafka()
    pg = connect_postgres()
    es = connect_elasticsearch()

    threads = []

    # Real sensor logs
    if MODE in ("hybrid", "sensor"):
        zeek_conn = os.path.join(ZEEK_LOG_DIR, "current", "conn.log")
        if os.path.exists(zeek_conn):
            t = threading.Thread(target=tail_file, args=(zeek_conn, parse_zeek_log, kafka, pg, es), daemon=True)
            t.start(); threads.append(t)
            logger.info("Tailing Zeek conn.log")

        suri_eve = os.path.join(SURICATA_LOG_DIR, "eve.json")
        if os.path.exists(suri_eve):
            t = threading.Thread(target=tail_file, args=(suri_eve, parse_suricata_eve, kafka, pg, es), daemon=True)
            t.start(); threads.append(t)
            logger.info("Tailing Suricata eve.json")

        if not threads:
            logger.warning("No sensor logs found, falling back to generator mode")

    # Synthetic generator
    if MODE in ("hybrid", "generator") or (MODE == "sensor" and not threads):
        t = threading.Thread(target=run_generator, args=(kafka, pg, es), daemon=True)
        t.start(); threads.append(t)

    logger.info("Producer running with %d threads", len(threads))
    shutdown.wait()
    logger.info("Shutting down producer")


if __name__ == "__main__":
    main()
