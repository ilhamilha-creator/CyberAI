"""Prometheus metrics middleware"""
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response
from prometheus_client import Counter, Histogram, generate_latest, CONTENT_TYPE_LATEST
import time

REQUEST_COUNT = Counter("cyberai_requests_total", "Total requests", ["method", "path", "status"])
REQUEST_LATENCY = Histogram("cyberai_request_latency", "Request latency", ["path"])

class PrometheusMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        if request.url.path == "/api/v1/prometheus/metrics":
            return Response(generate_latest(), media_type=CONTENT_TYPE_LATEST)
        start = time.time()
        response = await call_next(request)
        REQUEST_COUNT.labels(request.method, request.url.path, response.status_code).inc()
        REQUEST_LATENCY.labels(request.url.path).observe(time.time() - start)
        return response
