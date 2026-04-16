# OpenTelemetry and Prometheus Tracing

Implement full-stack observability with OpenTelemetry and Prometheus in Koatty.

## Overview

Koatty provides built-in support for:
- **OpenTelemetry**: Distributed tracing across services
- **Prometheus**: Metrics collection and monitoring
- **Jaeger/Zipkin**: Trace visualization

## Enable Tracing

### Basic Configuration

```typescript
// src/config/server.ts
export default {
  hostname: '127.0.0.1',
  port: 3000,
  protocol: 'http',
  trace: true  // Enable full stack tracing
};
```

## OpenTelemetry Setup

### Install Dependencies

```bash
pnpm add @opentelemetry/api \
  @opentelemetry/sdk-node \
  @opentelemetry/exporter-trace-otlp-grpc \
  @opentelemetry/exporter-metrics-otlp-grpc
```

### Initialize OpenTelemetry

```typescript
// src/app.ts
import { Koatty } from 'koatty';
import { NodeSDK } from '@opentelemetry/sdk-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-grpc';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-grpc';

// Initialize OpenTelemetry SDK
const sdk = new NodeSDK({
  traceExporter: new OTLPTraceExporter({
    url: 'http://localhost:4317',  // OTLP gRPC endpoint
  }),
  metricExporter: new OTLPMetricExporter({
    url: 'http://localhost:4317',
  }),
  instrumentations: [
    // Auto-instrument HTTP, gRPC, etc.
  ],
});

// Start SDK
sdk.start();

export class Application extends Koatty {
  async appStop() {
    await sdk.shutdown();
  }
}
```

### Custom Spans

```typescript
import { Service } from 'koatty';
import { trace } from '@opentelemetry/api';

const tracer = trace.getTracer('my-service');

@Service()
export class UserService {
  async getUser(id: string) {
    const span = tracer.startSpan('getUser');
    span.setAttribute('user.id', id);
    
    try {
      const user = await this.database.query(id);
      span.setAttribute('user.name', user.name);
      return user;
    } catch (error) {
      span.recordException(error);
      throw error;
    } finally {
      span.end();
    }
  }
}
```

### Context Propagation

```typescript
import { Controller, Get } from 'koatty';
import { context, trace, propagation } from '@opentelemetry/api';

@Controller('/api')
export class ApiController {
  @Get('/users/:id')
  async getUser() {
    // Extract trace context from incoming request
    const ctx = context.active();
    const span = trace.getSpan(ctx);
    
    // Propagate context to downstream services
    const headers = {};
    propagation.inject(ctx, headers);
    
    const response = await fetch('http://downstream-service/api', {
      headers
    });
    
    return response.json();
  }
}
```

## Prometheus Metrics

### Install Dependencies

```bash
pnpm add prom-client
```

### Setup Prometheus Metrics

```typescript
// src/middleware/PrometheusMiddleware.ts
import { Middleware, IMiddleware } from 'koatty';
import client from 'prom-client';

// Create Registry
const register = new client.Registry();

// Default metrics (CPU, memory, etc.)
client.collectDefaultMetrics({ register });

// Custom metrics
const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.1, 0.5, 1, 2, 5, 10]
});

const httpRequestTotal = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code']
});

register.registerMetric(httpRequestDuration);
register.registerMetric(httpRequestTotal);

@Middleware()
export class PrometheusMiddleware implements IMiddleware {
  async run(ctx: any, next: () => Promise<any>) {
    const start = Date.now();
    
    try {
      await next();
      
      // Record metrics
      const duration = (Date.now() - start) / 1000;
      const route = ctx.route || ctx.path;
      
      httpRequestDuration.labels(
        ctx.method,
        route,
        ctx.status.toString()
      ).observe(duration);
      
      httpRequestTotal.labels(
        ctx.method,
        route,
        ctx.status.toString()
      ).inc();
    } catch (error) {
      throw error;
    }
  }
  
  static getMetrics() {
    return register.metrics();
  }
}
```

### Expose Metrics Endpoint

```typescript
// src/controller/MetricsController.ts
import { Controller, Get } from 'koatty';
import { PrometheusMiddleware } from '../middleware/PrometheusMiddleware';

@Controller('/metrics')
export class MetricsController {
  @Get()
  async metrics() {
    this.ctx.type = 'text/plain';
    return PrometheusMiddleware.getMetrics();
  }
}
```

## Custom Metrics

### Counters

```typescript
import { Service } from 'koatty';
import client from 'prom-client';

const counter = new client.Counter({
  name: 'user_logins_total',
  help: 'Total number of user logins',
  labelNames: ['user_type']
});

@Service()
export class AuthService {
  async login(userId: string, userType: string) {
    // Business logic...
    
    // Increment counter
    counter.labels(userType).inc();
  }
}
```

### Gauges

```typescript
const gauge = new client.Gauge({
  name: 'active_connections',
  help: 'Number of active connections',
  labelNames: ['protocol']
});

// Set gauge value
gauge.labels('http').set(42);

// Increment/decrement
gauge.labels('websocket').inc();
gauge.labels('websocket').dec();
```

### Histograms

```typescript
const histogram = new client.Histogram({
  name: 'database_query_duration_seconds',
  help: 'Database query duration',
  labelNames: ['query_type'],
  buckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5]
});

const end = histogram.labels('select').startTimer();
// ... execute query
end();  // Records duration
```

### Summaries

```typescript
const summary = new client.Summary({
  name: 'response_size_bytes',
  help: 'Response size in bytes',
  labelNames: ['endpoint'],
  percentiles: [0.5, 0.9, 0.95, 0.99]
});

summary.labels('/api/users').observe(1024);
```

## Grafana Dashboard

### Prometheus Configuration

```yaml
# prometheus.yml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'koatty-app'
    static_configs:
      - targets: ['localhost:3000']
```

### Grafana Dashboard JSON

```json
{
  "dashboard": {
    "title": "Koatty Application",
    "panels": [
      {
        "title": "Request Rate",
        "targets": [
          {
            "expr": "rate(http_requests_total[5m])"
          }
        ]
      },
      {
        "title": "Response Time (p95)",
        "targets": [
          {
            "expr": "histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))"
          }
        ]
      },
      {
        "title": "Error Rate",
        "targets": [
          {
            "expr": "rate(http_requests_total{status_code=~\"5..\"}[5m])"
          }
        ]
      }
    ]
  }
}
```

## Distributed Tracing

### Trace Across Services

```typescript
// Service A
@Controller('/orders')
export class OrderController {
  @Post('/')
  async createOrder() {
    const span = tracer.startSpan('createOrder');
    
    // Call Service B
    const inventory = await this.checkInventory();
    
    // Call Service C
    const payment = await this.processPayment();
    
    span.end();
    return { orderId: '123' };
  }
}
```

### Jaeger Integration

```bash
# Run Jaeger in Docker
docker run -d --name jaeger \
  -p 16686:16686 \
  -p 4317:4317 \
  jaegertracing/all-in-one:latest
```

Configure OpenTelemetry to export to Jaeger:

```typescript
import { JaegerExporter } from '@opentelemetry/exporter-jaeger';

const sdk = new NodeSDK({
  traceExporter: new JaegerExporter({
    endpoint: 'http://localhost:14268/api/traces',
  }),
});
```

## Performance Impact

### Sampling Strategies

```typescript
import { AlwaysOnSampler, TraceIdRatioBasedSampler } from '@opentelemetry/sdk-trace-base';

const sdk = new NodeSDK({
  sampler: new TraceIdRatioBasedSampler(0.1),  // Sample 10% of traces
  // OR
  sampler: new AlwaysOnSampler(),  // Sample all traces (dev only)
});
```

### Production Recommendations

- **Sample Rate**: 1-10% for high-traffic services
- **Buffer Size**: Configure batch exporter for efficiency
- **Export Interval**: 5-10 seconds
- **Memory**: Monitor OpenTelemetry overhead

## Best Practices

### ✅ Do

```typescript
// Add meaningful attributes
span.setAttribute('user.id', userId);
span.setAttribute('order.total', orderTotal);

// Use semantic conventions
span.setAttribute('http.method', 'GET');
span.setAttribute('http.url', '/api/users');

// Handle errors properly
try {
  await riskyOperation();
} catch (error) {
  span.recordException(error);
  span.setStatus({ code: SpanStatusCode.ERROR });
  throw error;
}
```

### ❌ Don't

```typescript
// Don't create too many spans
for (const item of items) {
  const span = tracer.startSpan('process');  // ❌ Too many spans
}

// Don't forget to end spans
const span = tracer.startSpan('operation');
// ... do work
// Missing: span.end()  ❌

// Don't record sensitive data
span.setAttribute('user.password', password);  // ❌ Security risk
```

## Monitoring Stack

Complete observability stack:

```yaml
# docker-compose.yml
version: '3'
services:
  prometheus:
    image: prom/prometheus
    ports:
      - "9090:9090"
  
  grafana:
    image: grafana/grafana
    ports:
      - "3000:3000"
  
  jaeger:
    image: jaegertracing/all-in-one
    ports:
      - "16686:16686"
      - "4317:4317"
```

## Next Steps

- [Migration Guide](../migration/v3-to-v4.md) - Upgrade from v3
- [Lifecycle Hooks](../guide/lifecycle.md) - Hook into app lifecycle
- [Configuration](../guide/config.md) - Configure your application
