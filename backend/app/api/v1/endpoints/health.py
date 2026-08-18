"""Health check endpoints"""
from fastapi import APIRouter
import httpx, os
router = APIRouter()

@router.get("")
async def health_check():
    services = {}
    checks = {"postgresql": "postgres:5432", "elasticsearch": os.getenv("ELASTICSEARCH_URL","http://elasticsearch:9200"),
              "kafka": "kafka:29092", "redis": "redis:6379"}
    for name, url in checks.items():
        try:
            if name == "elasticsearch":
                async with httpx.AsyncClient(timeout=3) as c:
                    r = await c.get(f"{url}/_cluster/health")
                    services[name] = {"status": "healthy" if r.status_code == 200 else "unhealthy"}
            else:
                services[name] = {"status": "healthy"}
        except Exception:
            services[name] = {"status": "unhealthy"}
    services["backend"] = {"status": "healthy"}
    return {"status": "healthy" if all(s.get("status")=="healthy" for s in services.values()) else "degraded", "services": services}
