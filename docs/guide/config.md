# Configuration Guide

Learn how to configure your Koatty application.

## Configuration Files

Koatty uses TypeScript configuration files in the `src/config/` directory:

```
src/config/
├── config.ts       # Application configuration
├── server.ts       # Server settings
├── router.ts       # Router configuration
├── middleware.ts   # Middleware configuration
└── plugin.ts       # Plugin configuration
```

## Application Configuration (config.ts)

```typescript
// src/config/config.ts
export default {
  // Log level: "debug" | "info" | "warning" | "error"
  logsLevel: "debug",
  
  // Log file directory (optional)
  logsPath: "./logs",
  
  // Sensitive fields that won't be logged
  sensFields: ["password", "token", "secret"],
  
  // Custom configuration
  app: {
    name: "MyApp",
    version: "1.0.0"
  }
};
```

## Server Configuration (server.ts)

### Basic Settings

```typescript
// src/config/server.ts
export default {
  hostname: '127.0.0.1',
  port: 3000,
  protocol: 'http',
  trace: false
};
```

### Multi-Protocol Configuration

```typescript
export default {
  hostname: '127.0.0.1',
  port: [3000, 50051, 4000],  // Array for multi-protocol
  protocol: ['http', 'grpc', 'ws'],
  trace: false
};
```

### SSL/TLS Configuration

```typescript
export default {
  hostname: '0.0.0.0',
  port: 443,
  protocol: 'https',
  ssl: {
    mode: 'auto',  // 'auto' | 'manual' | 'mutual_tls'
    key: './ssl/server.key',
    cert: './ssl/server.crt',
    ca: './ssl/ca.crt'  // For mutual TLS
  }
};
```

### Protocol Options

- `http` - HTTP/1.1
- `https` - HTTPS (HTTP/1.1 + TLS)
- `http2` - HTTP/2
- `http3` - HTTP/3 (QUIC)
- `grpc` - gRPC
- `ws` - WebSocket
- `wss` - Secure WebSocket
- `graphql` - GraphQL (over HTTP/HTTPS)

## Router Configuration (router.ts)

### Payload Limits

```typescript
// src/config/router.ts
export default {
  payload: {
    extTypes: {
      json: ['application/json'],
      form: ['application/x-www-form-urlencoded'],
      text: ['text/plain'],
      multipart: ['multipart/form-data'],
      xml: ['text/xml'],
      grpc: ['application/grpc'],
      graphql: ['application/graphql+json'],
      websocket: ['application/websocket']
    },
    limit: '20mb',        // Maximum request body size
    encoding: 'utf-8',
    multiples: true,      // Accept multiple files
    keepExtensions: true  // Keep file extensions
  }
};
```

### Protocol-Specific Extensions

```typescript
export default {
  payload: { /* ... */ },
  
  // Protocol-specific configuration
  ext: {
    // HTTP configuration
    http: {},
    
    // gRPC configuration
    grpc: {
      protoFile: './resource/proto/service.proto',
      poolSize: 10,
      streamConfig: {
        maxConcurrentStreams: 50
      }
    },
    
    // WebSocket configuration
    ws: {
      maxFrameSize: 1024 * 1024,     // 1MB
      heartbeatInterval: 15000,       // 15 seconds
      maxConnections: 1000
    },
    
    // GraphQL configuration
    graphql: {
      schemaFile: './resource/graphql/schema.graphql',
      playground: true,
      introspection: true,
      // Enable HTTP/2 for GraphQL
      keyFile: './ssl/server.key',
      crtFile: './ssl/server.crt'
    }
  }
};
```

## Environment Variables

Koatty supports environment variable substitution in configuration files:

```typescript
// src/config/config.ts
export default {
  db: {
    host: '${DB_HOST}',
    port: '${DB_PORT}',
    password: '${DB_PASSWORD}'
  }
};
```

Set environment variables:

```bash
export DB_HOST=localhost
export DB_PORT=5432
export DB_PASSWORD=secret

KOATTY_ENV=production pnpm start
```

## Configuration Depth Limits

### Important Security Considerations

Koatty imposes **depth limits** on configuration objects to prevent:

1. **Stack overflow attacks** from deeply nested configs
2. **Memory exhaustion** from circular references
3. **Performance degradation** from excessive nesting

### Default Limits

- **Maximum object depth**: 10 levels
- **Maximum array length**: 1000 elements
- **Maximum string length**: 10MB

### Best Practices

✅ **Good** - Flat configuration structure:
```typescript
export default {
  database: {
    host: 'localhost',
    port: 5432,
    username: 'user',
    password: 'pass'
  }
};
```

❌ **Avoid** - Deeply nested configuration:
```typescript
export default {
  level1: {
    level2: {
      level3: {
        level4: {
          level5: {
            level6: {
              level7: {
                level8: {
                  level9: {
                    level10: {
                      level11: 'too deep!'
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
};
```

### Handling Deep Configurations

If you need deeper nesting, split into separate files:

```typescript
// src/config/database.ts
export default {
  primary: { /* ... */ },
  replica: { /* ... */ }
};

// src/config/cache.ts
export default {
  redis: { /* ... */ },
  memory: { /* ... */ }
};
```

## Using Configuration in Code

### Inject Configuration

```typescript
import { Service, Config } from 'koatty';

@Service()
export class DatabaseService {
  @Config('database')
  private dbConfig: any;
  
  @Config('database.host')
  private dbHost: string;
  
  async connect() {
    console.log(`Connecting to ${this.dbHost}`);
    // Use this.dbConfig...
  }
}
```

### Access Configuration Dynamically

```typescript
import { Controller, Get } from 'koatty';

@Controller('/api')
export class ApiController {
  @Get('/config')
  getConfig() {
    const app = this.app;
    const dbConfig = app.config('database');
    const cacheConfig = app.config('cache', 'config');
    
    return {
      database: dbConfig.host,
      cache: cacheConfig.type
    };
  }
}
```

## Environment-Specific Configuration

Create environment-specific config files:

```
src/config/
├── config.ts           # Default config
├── config_development.ts  # Development overrides
├── config_production.ts   # Production overrides
└── config_staging.ts      # Staging overrides
```

Load based on `KOATTY_ENV`:

```bash
KOATTY_ENV=production pnpm start
# Loads config.ts then merges config_production.ts
```

## Next Steps

- [Lifecycle Hooks](./lifecycle.md) - Hook into application lifecycle
- [Middleware](./middleware.md) - Create custom middleware
- [Multi-Protocol Setup](../protocols/http.md) - Configure HTTP/2 and HTTP/3
