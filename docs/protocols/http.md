# HTTP/2 and HTTP/3 (QUIC) Configuration

Configure high-performance HTTP/2 and HTTP/3 protocols in Koatty.

## HTTP/2 Setup

### Basic HTTP/2 Configuration

```typescript
// src/config/server.ts
export default {
  hostname: '0.0.0.0',
  port: 443,
  protocol: 'http2',
  ssl: {
    mode: 'auto',
    key: './ssl/server.key',
    cert: './ssl/server.crt'
  }
};
```

### HTTP/2 with SSL

HTTP/2 requires SSL/TLS in production:

```typescript
export default {
  hostname: '0.0.0.0',
  port: 8443,
  protocol: 'http2',
  ssl: {
    mode: 'manual',
    key: './ssl/private.key',
    cert: './ssl/certificate.crt',
    ca: './ssl/ca_bundle.crt'
  }
};
```

### HTTP/2 Benefits

- **Multiplexing**: Multiple requests over single TCP connection
- **Header Compression**: HPACK compression reduces overhead
- **Server Push**: Proactively push resources to clients
- **Binary Protocol**: More efficient than HTTP/1.1 text protocol
- **Stream Prioritization**: Control resource loading order

## HTTP/3 (QUIC) Setup

HTTP/3 uses QUIC protocol over UDP instead of TCP:

```typescript
// src/config/server.ts
export default {
  hostname: '0.0.0.0',
  port: 443,
  protocol: 'http3',
  ssl: {
    mode: 'auto',
    key: './ssl/server.key',
    cert: './ssl/server.crt'
  }
};
```

### HTTP/3 Advantages

- **Faster Connections**: 0-RTT connection establishment
- **No Head-of-Line Blocking**: Independent streams over UDP
- **Connection Migration**: Survive network changes
- **Built-in Encryption**: TLS 1.3 integrated into QUIC
- **Improved Performance**: Better for mobile and unreliable networks

## Multi-Protocol Configuration

Run HTTP, HTTP/2, and HTTP/3 simultaneously:

```typescript
// src/config/server.ts
export default {
  hostname: '0.0.0.0',
  port: [80, 443, 443],  // HTTP:80, HTTP/2:443, HTTP/3:443
  protocol: ['http', 'http2', 'http3'],
  ssl: {
    mode: 'auto',
    key: './ssl/server.key',
    cert: './ssl/server.crt'
  }
};
```

### Automatic Protocol Upgrade

Koatty supports automatic HTTP/1.1 to HTTP/2 upgrade:

```typescript
// src/config/server.ts
export default {
  hostname: '0.0.0.0',
  port: 443,
  protocol: 'http2',
  ssl: {
    mode: 'auto',
    key: './ssl/server.key',
    cert: './ssl/server.crt'
  },
  // Allow HTTP/1.1 fallback
  http2: {
    allowHTTP1: true  // Fallback to HTTP/1.1 for incompatible clients
  }
};
```

## Protocol-Specific Middleware

Bind middleware to specific protocols:

```typescript
import { Middleware, IMiddleware } from 'koatty';

@Middleware({
  protocol: ['http2', 'http3']  // Only for HTTP/2 and HTTP/3
})
export class Http2Middleware implements IMiddleware {
  run(ctx: any, next: () => Promise<any>) {
    // HTTP/2 specific logic
    ctx.set('X-Protocol', 'HTTP/2+');
    return next();
  }
}
```

## Server Push (HTTP/2)

Implement server push for proactive resource delivery:

```typescript
import { Controller, Get } from 'koatty';

@Controller('/')
export class HomeController {
  @Get('/')
  async index() {
    // Check if HTTP/2 push is available
    if (this.ctx.protocol === 'http2' && this.ctx.res.push) {
      // Push CSS file
      const stream = this.ctx.res.push('/styles/main.css', {
        request: { accept: '*/*' },
        response: { 'content-type': 'text/css' }
      });
      
      stream.end('body { margin: 0; }');
    }
    
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <link rel="stylesheet" href="/styles/main.css">
        </head>
        <body>Hello HTTP/2!</body>
      </html>
    `;
  }
}
```

## Configuration Options

### HTTP/2 Options

```typescript
// src/config/router.ts
export default {
  ext: {
    http2: {
      maxConcurrentStreams: 100,
      maxHeaderListSize: '64kb',
      enablePush: true,
      allowHTTP1: true  // Fallback support
    }
  }
};
```

### HTTP/3 Options

```typescript
export default {
  ext: {
    http3: {
      maxStreams: 100,
      maxData: '10mb',
      idleTimeout: 30000,
      // QUIC-specific options
      ccAlgo: 'cubic',  // Congestion control algorithm
      enable0Rtt: true  // Enable 0-RTT connections
    }
  }
};
```

## SSL/TLS Certificate Setup

### Generate Self-Signed Certificates (Development)

```bash
# Generate private key
openssl genrsa -out ssl/server.key 2048

# Generate certificate signing request
openssl req -new -key ssl/server.key -out ssl/server.csr

# Generate self-signed certificate
openssl x509 -req -days 365 -in ssl/server.csr \
  -signkey ssl/server.key -out ssl/server.crt
```

### Use Let's Encrypt (Production)

```bash
# Install certbot
sudo apt-get install certbot

# Obtain certificate
sudo certbot certonly --standalone -d yourdomain.com

# Certificates saved to:
# /etc/letsencrypt/live/yourdomain.com/fullchain.pem
# /etc/letsencrypt/live/yourdomain.com/privkey.pem
```

Update configuration:

```typescript
export default {
  protocol: 'http2',
  ssl: {
    mode: 'manual',
    key: '/etc/letsencrypt/live/yourdomain.com/privkey.pem',
    cert: '/etc/letsencrypt/live/yourdomain.com/fullchain.pem'
  }
};
```

## Performance Optimization

### Enable Compression

```typescript
import { Middleware, IMiddleware } from 'koatty';
import compress from 'koa-compress';

@Middleware()
export class CompressionMiddleware implements IMiddleware {
  run(ctx: any, next: () => Promise<any>) {
    return compress({
      threshold: 1024,  // Compress responses > 1KB
      flush: require('zlib').Z_SYNC_FLUSH
    })(ctx, next);
  }
}
```

### Connection Pooling

HTTP/2 and HTTP/3 handle connection pooling automatically:

```typescript
// Single connection handles multiple requests
// No need for connection pooling configuration
```

### Keep-Alive Configuration

```typescript
// src/config/server.ts
export default {
  protocol: 'http2',
  // HTTP/2 uses keep-alive by default
  keepAliveTimeout: 65000,  // 65 seconds
  maxKeepAliveRequests: 1000
};
```

## Debugging

### Enable Trace Logging

```typescript
// src/config/server.ts
export default {
  protocol: 'http2',
  trace: true  // Enable full stack trace
};
```

### Check Protocol Version

```typescript
@Controller('/api')
export class ApiController {
  @Get('/info')
  getInfo() {
    return {
      protocol: this.ctx.protocol,
      httpVersion: this.ctx.req.httpVersion,
      alpnProtocol: this.ctx.req.socket.alpnProtocol
    };
  }
}
```

## Browser Support

| Protocol | Chrome | Firefox | Safari | Edge |
|----------|--------|---------|--------|------|
| HTTP/2   | ✅ 41+ | ✅ 36+ | ✅ 9+ | ✅ 12+ |
| HTTP/3   | ✅ 87+ | ✅ 88+ | ✅ 14+ | ✅ 87+ |

## Fallback Strategy

```typescript
// src/config/server.ts
export default {
  hostname: '0.0.0.0',
  port: [80, 443],
  protocol: ['http', 'http2'],
  ssl: {
    mode: 'auto',
    key: './ssl/server.key',
    cert: './ssl/server.crt'
  },
  http2: {
    allowHTTP1: true  // Fallback to HTTP/1.1
  }
};
```

## Next Steps

- [WebSocket Configuration](./websocket.md) - Set up WebSocket
- [gRPC Configuration](./grpc.md) - Configure gRPC services
- [Tracing](../extensions/trace.md) - Add OpenTelemetry tracing
