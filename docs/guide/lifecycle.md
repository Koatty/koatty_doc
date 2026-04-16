# Application Lifecycle

Understand Koatty's 11-step startup sequence and how to hook into lifecycle events.

## Startup Sequence

Koatty follows a strict 11-step initialization process:

```
1. appBoot           → Application instance created
2. loadConfigure     → Configuration files loaded
3. loadComponent     → Components initialized
4. loadPlugin        → Plugins loaded
5. loadMiddleware    → Middleware registered
6. loadService       → Services instantiated
7. loadController    → Controllers registered
8. loadRouter        → Routes initialized
9. loadServe         → Server instances created
10. appReady         → Application ready
11. appStart         → Server starts listening
```

## Lifecycle Events

### AppEvent Enum

```typescript
import { AppEvent } from 'koatty';

enum AppEvent {
  appBoot = "appBoot",
  loadConfigure = "loadConfigure",
  loadComponent = "loadComponent",
  loadPlugin = "loadPlugin",
  loadMiddleware = "loadMiddleware",
  loadService = "loadService",
  loadController = "loadController",
  loadRouter = "loadRouter",
  loadServe = "loadServe",
  appReady = "appReady",
  appStart = "appStart",
  appStop = "appStop"  // Triggered on process termination
}
```

## Hooking into Lifecycle Events

### Using @OnEvent Decorator

```typescript
import { Service, OnEvent, AppEvent } from 'koatty';

@Service()
export class InitializationService {
  
  @OnEvent(AppEvent.appBoot)
  async onAppBoot() {
    console.log('Application booting...');
  }
  
  @OnEvent(AppEvent.loadConfigure)
  async onLoadConfigure() {
    console.log('Configuration loaded');
  }
  
  @OnEvent(AppEvent.appReady)
  async onAppReady() {
    console.log('Application ready!');
    // Perform startup tasks: warm cache, connect to services, etc.
  }
  
  @OnEvent(AppEvent.appStart)
  async onAppStart() {
    console.log('Server started and listening');
  }
  
  @OnEvent(AppEvent.appStop)
  async onAppStop() {
    console.log('Application shutting down...');
    // Cleanup: close connections, flush buffers, etc.
  }
}
```

## Detailed Event Descriptions

### 1. appBoot

Application instance created, before any configuration loading.

```typescript
@OnEvent(AppEvent.appBoot)
async onBoot() {
  // Set up global error handlers
  // Initialize logging systems
  // Validate environment
}
```

### 2. loadConfigure

Configuration files from `src/config/` are loaded and merged.

```typescript
@OnEvent(AppEvent.loadConfigure)
async onLoadConfigure() {
  // Access loaded configuration
  const config = this.app.config();
  // Validate configuration values
}
```

### 3. loadComponent

Components (like RouterComponent, ServeComponent) are initialized.

```typescript
@OnEvent(AppEvent.loadComponent)
async onLoadComponent() {
  // Components ready
  // Can access component instances
}
```

### 4. loadPlugin

Plugins defined in `src/config/plugin.ts` are loaded.

```typescript
@OnEvent(AppEvent.loadPlugin)
async onLoadPlugin() {
  // Plugins initialized
  // Can interact with plugin APIs
}
```

### 5. loadMiddleware

Middleware from `src/config/middleware.ts` is registered.

```typescript
@OnEvent(AppEvent.loadMiddleware)
async onLoadMiddleware() {
  // Middleware pipeline ready
}
```

### 6. loadService

Service classes are instantiated and registered in IOC container.

```typescript
@OnEvent(AppEvent.loadService)
async onLoadService() {
  // Services ready for injection
  // Can perform service initialization
}
```

### 7. loadController

Controller classes are registered.

```typescript
@OnEvent(AppEvent.loadController)
async onLoadController() {
  // Controllers ready
  // Routes not yet initialized
}
```

### 8. loadRouter

Router maps routes to controllers and initializes routing logic.

```typescript
@OnEvent(AppEvent.loadRouter)
async onLoadRouter() {
  // Routes initialized
  // Can inspect routing table
}
```

### 9. loadServe

Server instances (HTTP, gRPC, WebSocket, etc.) are created.

```typescript
@OnEvent(AppEvent.loadServe)
async onLoadServe() {
  // Servers created but not listening
  // Can configure server options
}
```

### 10. appReady

All components loaded, application is ready to start.

```typescript
@OnEvent(AppEvent.appReady)
async onAppReady() {
  // Application fully initialized
  // Perfect for:
  // - Warming caches
  // - Establishing database connections
  // - Starting background jobs
  // - Health checks
}
```

### 11. appStart

Server starts listening on configured ports.

```typescript
@OnEvent(AppEvent.appStart)
async onAppStart() {
  // Server is listening
  // Application is live
  console.log('Server started on port', this.app.config('server.port'));
}
```

### appStop (Shutdown)

Triggered when process receives termination signal (SIGTERM, SIGINT).

```typescript
@OnEvent(AppEvent.appStop)
async onAppStop() {
  // Graceful shutdown
  // - Close database connections
  // - Flush buffers
  // - Stop background jobs
  // - Release resources
}
```

## Graceful Shutdown

Koatty handles graceful shutdown automatically:

```typescript
import { Service, OnEvent, AppEvent } from 'koatty';

@Service()
export class DatabaseService {
  private connection: any;
  
  @OnEvent(AppEvent.appReady)
  async connect() {
    this.connection = await createConnection();
  }
  
  @OnEvent(AppEvent.appStop)
  async disconnect() {
    if (this.connection) {
      await this.connection.close();
      console.log('Database connection closed');
    }
  }
}
```

## Event Execution Order

Events execute in strict sequence. Hooks registered for the same event execute in undefined order.

```
appBoot → loadConfigure → loadComponent → loadPlugin → 
loadMiddleware → loadService → loadController → loadRouter → 
loadServe → appReady → appStart
                                    ↓
                                appStop (on termination)
```

## Best Practices

### ✅ Do

- Use `appReady` for initialization tasks
- Use `appStop` for cleanup
- Keep event handlers async
- Handle errors gracefully

```typescript
@OnEvent(AppEvent.appReady)
async onAppReady() {
  try {
    await this.warmCache();
    await this.connectServices();
  } catch (error) {
    this.logger.error('Initialization failed', error);
    process.exit(1);
  }
}
```

### ❌ Don't

- Don't block event handlers with synchronous operations
- Don't rely on execution order within same event
- Don't throw unhandled errors in lifecycle hooks

## Monitoring Lifecycle

Track application lifecycle with logging:

```typescript
import { Service, OnEvent, AppEvent } from 'koatty';

@Service()
export class LifecycleMonitor {
  private startTime: number;
  
  @OnEvent(AppEvent.appBoot)
  onBoot() {
    this.startTime = Date.now();
    console.log('[Lifecycle] App boot started');
  }
  
  @OnEvent(AppEvent.appStart)
  onStart() {
    const duration = Date.now() - this.startTime;
    console.log(`[Lifecycle] App started in ${duration}ms`);
  }
}
```

## Next Steps

- [Middleware Guide](./middleware.md) - Create custom middleware
- [Configuration](./config.md) - Configure your application
- [Multi-Protocol](../protocols/http.md) - Set up HTTP/2 and HTTP/3
