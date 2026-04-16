# Migration Guide: v3 to v4

Upgrade your Koatty application from version 3 to version 4.

## Breaking Changes

### 1. Multi-Protocol Architecture

**v3 (Single Protocol)**
```typescript
// src/config/config.ts
export default {
  port: 3000,
  protocol: 'http'
};
```

**v4 (Multi-Protocol)**
```typescript
// src/config/server.ts
export default {
  hostname: '127.0.0.1',
  port: [3000, 50051],  // Array for multi-protocol
  protocol: ['http', 'grpc']
};
```

**Migration:**
- Move server configuration from `config.ts` to `server.ts`
- Use array syntax for multiple protocols
- Configure protocol-specific options in `router.ts` under `ext`

### 2. Configuration Structure

**v3**
```typescript
// src/config/config.ts
export default {
  port: 3000,
  hostname: '0.0.0.0',
  protocol: 'http'
};
```

**v4**
```typescript
// src/config/server.ts
export default {
  hostname: '0.0.0.0',
  port: 3000,
  protocol: 'http',
  trace: false
};
```

**Migration:**
- Split configuration into separate files:
  - `config.ts` → Application config (logs, custom settings)
  - `server.ts` → Server settings (port, protocol, SSL)
  - `router.ts` → Router and protocol-specific config
  - `middleware.ts` → Middleware configuration
  - `plugin.ts` → Plugin configuration

### 3. Router Configuration

**v3**
```typescript
// src/config/router.ts
export default {
  prefix: '/api',
  ext: {
    protoFile: './proto/service.proto'
  }
};
```

**v4**
```typescript
// src/config/router.ts
export default {
  payload: {
    limit: '20mb',
    encoding: 'utf-8'
  },
  ext: {
    http: {},
    grpc: {
      protoFile: './resource/proto/service.proto',
      poolSize: 10
    }
  }
};
```

**Migration:**
- Protocol-specific config now under `ext.{protocol}`
- Add `payload` configuration
- Separate gRPC config under `ext.grpc`

### 4. Middleware Registration

**v3**
```typescript
// src/config/middleware.ts
export default {
  list: ['cors', 'bodyParser']
};
```

**v4**
```typescript
// src/config/middleware.ts
export default {
  cors: {
    origin: '*'
  },
  bodyParser: {
    enable: true
  }
};
```

**Migration:**
- Middleware now configured as object instead of array
- Each middleware has its own configuration object

### 5. Lifecycle Events

**v3**
```typescript
export class App extends Koatty {
  init() {
    // Initialization
  }
}
```

**v4**
```typescript
import { OnEvent, AppEvent } from 'koatty';

@Service()
export class InitService {
  @OnEvent(AppEvent.appReady)
  async onAppReady() {
    // Initialization
  }
}
```

**Migration:**
- Use `@OnEvent` decorator instead of overriding `init()`
- Hook into specific lifecycle events
- More granular control over initialization order

### 6. Protocol-Specific Middleware

**v3**
```typescript
@Middleware()
export class MyMiddleware implements IMiddleware {
  // Applied to all protocols
}
```

**v4**
```typescript
@Middleware({
  protocol: ['http', 'grpc']  // Specify protocols
})
export class MyMiddleware implements IMiddleware {
  // Only applied to HTTP and gRPC
}
```

**Migration:**
- Add `protocol` option to `@Middleware` decorator
- Control which protocols use the middleware

### 7. IOC Container Changes

**v3**
```typescript
import { Container } from 'koatty';

const instance = Container.get('MyService');
```

**v4**
```typescript
import { IOCContainer } from 'koatty_container';

const instance = IOCContainer.get('MyService');
```

**Migration:**
- Import from `koatty_container` package
- Use `IOCContainer` instead of `Container`

### 8. SSL Configuration

**v3**
```typescript
export default {
  ssl: true,
  keyFile: './ssl.key',
  certFile: './ssl.crt'
};
```

**v4**
```typescript
export default {
  ssl: {
    mode: 'auto',  // 'auto' | 'manual' | 'mutual_tls'
    key: './ssl/server.key',
    cert: './ssl/server.crt',
    ca: './ssl/ca.crt'
  }
};
```

**Migration:**
- SSL config now an object
- Support for mutual TLS
- Separate `ca` file for certificate chain

### 9. Error Handling

**v3**
```typescript
// Global error handler
app.use(async (ctx, next) => {
  try {
    await next();
  } catch (error) {
    ctx.status = 500;
    ctx.body = error.message;
  }
});
```

**v4**
```typescript
import { ExceptionHandler } from 'koatty';

@ExceptionHandler()
export class GlobalExceptionHandler {
  handle(error: Error, ctx: any) {
    ctx.status = 500;
    ctx.body = {
      error: error.message,
      timestamp: Date.now()
    };
  }
}
```

**Migration:**
- Use `@ExceptionHandler` decorator
- Centralized error handling
- Support for multiple exception handlers

### 10. Trace Configuration

**v3**
```typescript
export default {
  trace: true
};
```

**v4**
```typescript
export default {
  trace: true,  // In server.ts
  // OpenTelemetry config separate
};
```

**Migration:**
- `trace` option moved to `server.ts`
- Full OpenTelemetry integration
- See [Tracing Guide](../extensions/trace.md)

## Deprecated Features

### Removed in v4

1. **`config.ts` for server config** → Use `server.ts`
2. **Array middleware list** → Object-based middleware config
3. **Single protocol only** → Multi-protocol support
4. **`Container` class** → `IOCContainer` from `koatty_container`

## Migration Steps

### Step 1: Update Dependencies

```bash
# Update koatty and related packages
pnpm update koatty@^4.0.0
pnpm update koatty_core@latest
pnpm update koatty_container@latest
pnpm update koatty_router@latest
pnpm update koatty_serve@latest
```

### Step 2: Restructure Configuration

```bash
# Create new config files
touch src/config/server.ts
touch src/config/router.ts
touch src/config/middleware.ts
touch src/config/plugin.ts
```

Move configuration:
- Server settings → `server.ts`
- Router options → `router.ts`
- Middleware list → `middleware.ts`
- Plugin config → `plugin.ts`

### Step 3: Update Server Configuration

```typescript
// src/config/server.ts
export default {
  hostname: process.env.IP || '127.0.0.1',
  port: process.env.PORT || 3000,
  protocol: 'http',  // Or ['http', 'grpc'] for multi-protocol
  trace: false,
  ssl: {
    mode: 'auto',
    key: '',
    cert: ''
  }
};
```

### Step 4: Update Router Configuration

```typescript
// src/config/router.ts
export default {
  payload: {
    limit: '20mb',
    encoding: 'utf-8',
    multiples: true,
    keepExtensions: true
  },
  ext: {
    // Protocol-specific config
  }
};
```

### Step 5: Update Lifecycle Hooks

```typescript
// Before (v3)
export class App extends Koatty {
  init() {
    console.log('App initialized');
  }
}

// After (v4)
import { Service, OnEvent, AppEvent } from 'koatty';

@Service()
export class AppInitService {
  @OnEvent(AppEvent.appBoot)
  onBoot() {
    console.log('App initialized');
  }
}
```

### Step 6: Update Middleware

```typescript
// Before (v3)
@Middleware()
export class AuthMiddleware implements IMiddleware {
  // ...
}

// After (v4)
@Middleware({
  protocol: ['http', 'https']  // Specify protocols
})
export class AuthMiddleware implements IMiddleware {
  // ...
}
```

### Step 7: Test Migration

```bash
# Run tests
pnpm test

# Start in development mode
pnpm dev

# Check for errors
pnpm lint
```

## Compatibility Layer

If you need gradual migration, use the compatibility layer:

```typescript
// src/config/config.ts
import { v3Compat } from 'koatty/migration';

export default v3Compat({
  // v3-style configuration
  port: 3000,
  protocol: 'http'
});
```

## Common Issues

### Issue 1: Port Already in Use

**Problem:** Multiple protocols trying to use same port.

**Solution:**
```typescript
// Use different ports
export default {
  port: [3000, 50051],  // HTTP:3000, gRPC:50051
  protocol: ['http', 'grpc']
};
```

### Issue 2: Middleware Not Applied

**Problem:** Middleware not running on specific protocol.

**Solution:**
```typescript
@Middleware({
  protocol: ['http']  // Only HTTP
})
export class MyMiddleware implements IMiddleware {
  // ...
}
```

### Issue 3: IOC Container Import Error

**Problem:** `Container` not found.

**Solution:**
```typescript
// Change import
import { IOCContainer } from 'koatty_container';
```

## Getting Help

- [GitHub Issues](https://github.com/koatty/koatty/issues)
- [Documentation](https://koatty.github.io)
- [Discord Community](https://discord.gg/koatty)

## Next Steps

- [Getting Started](../guide/getting-started.md) - Learn v4 basics
- [Configuration](../guide/config.md) - v4 configuration guide
- [Lifecycle](../guide/lifecycle.md) - New lifecycle events
