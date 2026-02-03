# Koatty 🚀

> **Language**: English | [简体中文](README.md)

[![npm version](https://img.shields.io/npm/v/koatty)](https://www.npmjs.com/package/koatty)
[![License](https://img.shields.io/badge/License-BSD%203--Clause-blue.svg)](https://opensource.org/licenses/BSD-3-Clause)

Koa + TypeScript + IOC = Koatty. **Koatty** is a progressive Node.js framework for building efficient and scalable server-side applications. It's perfect for crafting enterprise-level APIs, microservices, and full-stack applications with TypeScript excellence.

## Why Koatty? 💡

- 🚄 **High Performance**: Built on top of Koa with optimized architecture
- 🧩 **Full-Featured**: Supports gRPC, HTTP, WebSocket, GraphQL, scheduled tasks, and more
- 🧠 **TypeScript First**: Native TypeScript support with elegant OOP design
- 🌀 **Spring-like IOC Container**: Powerful dependency injection system with autowiring
- ✂️ **AOP Support**: Aspect-oriented programming with decorator-based interceptors
- 🔌 **Extensible Architecture**: Plugin system with dependency injection
- 📦 **Modern Tooling**: CLI scaffolding, testing utilities, and production-ready configurations
- 🌐 **Protocol Agnostic**: Write once, deploy as HTTP/gRPC/WebSocket/GraphQL services

## ✨ Latest Features

### Architecture Upgrades

- ✅ **Multi-Protocol Architecture** - Run HTTP, HTTPS, HTTP/2, HTTP/3, gRPC, WebSocket, and GraphQL simultaneously with independent server instances for each protocol
- ✅ **Intelligent Metadata Cache** - LRU caching with preloading for 70%+ performance boost, metadata operations < 0.01ms/call
- ✅ **Application Lifecycle Hooks** - Use `@OnEvent` decorator API for appBoot/appReady/appStart/appStop lifecycle events
- ✅ **Version Conflict Detection** - Automatic detection and resolution of dependency conflicts
- ✅ **Configuration Restructuring** - Server configuration separated to `server.ts`, router ext configuration uses protocol name as key
- ✅ **Enhanced Component Decorator** - Supports `priority`, `scope`, `requires`, `version`, `description` configuration options

### Routing & Middleware

- ✅ **Router Middleware Manager** - Route-level middleware isolation, support for priority configuration and conditional execution
- ✅ **Protocol-Specific Middleware** - Bind middleware to specific protocols with `@Middleware({ protocol: [...] })`
- ✅ **Middleware Metadata Passing** - Pass configuration parameters via `withMiddleware()`, support for dynamic enable/disable
- ✅ **Router Factory Pattern** - Flexible router creation and management, support for custom router registration

### Protocol Enhancements

- ✅ **Enhanced gRPC Support**
  - Support for four gRPC stream types (server-streaming, client-streaming, bidirectional-streaming, unary)
  - Automatic stream type detection and backpressure control
  - Connection pool management and batch processing support
  - Timeout detection and duplicate call protection
- ✅ **GraphQL over HTTP/2** - Automatic HTTP/2 upgrade with SSL for multiplexing and compression, automatic HTTP/1.1 fallback
- ✅ **WebSocket Enhancements** - Heartbeat detection, connection limits, frame size control

### Operations & Monitoring

- ✅ **Graceful Shutdown** - Five-step graceful shutdown process, enhanced connection pool management and cleanup handlers
  - Stop accepting new requests
  - Wait for in-flight requests to complete
  - Trigger stop event
  - Clean up WebSocket connections, gRPC streams, and other resources
  - Exit process gracefully
- ✅ **OpenTelemetry Tracing** - Full-stack observability with distributed tracing
- ✅ **Multi-Protocol Metrics Collection** - Automatically collect HTTP, WebSocket, and gRPC metrics and export to Prometheus
  - Request count (requests_total)
  - Error count (errors_total)
  - Response time (response_time_seconds)
- ✅ **Health Checks** - Multi-level health status monitoring

### Exception Handling

- ✅ **Global Exception Handling** - `@ExceptionHandler()` decorator for centralized error management, support for multi-protocol exception handling
- ✅ **Chained Exception Calls** - Support for method chaining, more elegant code
- ✅ **Custom Exception Handlers** - Support for custom error response formats and log formats

### Performance Optimizations

- ✅ **High-Performance Connection Pools** - Protocol-optimized connection pool implementations, intelligent monitoring and automatic cleanup
- ✅ **Configuration Hot Reload** - Intelligent configuration change detection, automatic restart strategy decision
- ✅ **Performance Boost** - HTTP context creation < 0.1ms, GraphQL context creation < 0.2ms, concurrent processing > 10,000 ops/sec

### Developer Experience

- 💪 **Swagger/OpenAPI 3.0** - Automatic API documentation generation
- ✅ **Full TypeScript Support** - Complete type definitions and type safety
- ✅ **Koa 3.0 Upgrade** - Upgraded to Koa 3.0, improved performance and compatibility
- ✅ **Decorator Pattern** - Unified decorator API, cleaner code style

## 📚 Documentation

- [Getting Started Guide](#quick-start)
- [API Reference](https://koatty.org/#/?id=api)
- [Example Projects](https://github.com/Koatty/koatty_demo)

## Quick Start

### 1. Install CLI Tool

```bash
npm install -g koatty_cli
```

The CLI tool version corresponds to the Koatty framework version. For example, `koatty_cli@1.11.x` supports new features in `koatty@1.11.x`.

### 2. Create a New Project

```bash
kt new projectName
cd ./projectName
yarn install
```

### 3. Start the Service

```bash
# Development mode
npm run dev

# Production mode
npm start
```

Visit `http://localhost:3000/` in your browser.

## Debugging Mode

We strongly recommend using Visual Studio Code (VSCode) for development. Edit the `.vscode/launch.json` file in the project directory:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "TS Program",
      "args": [
        "${workspaceRoot}/src/App.ts"
      ],
      "runtimeArgs": [
        "--nolazy",
        "-r",
        "ts-node/register"
      ],
      "sourceMaps": true,
      "cwd": "${workspaceRoot}",
      "protocol": "inspector",
      "internalConsoleOptions": "neverOpen"
    }
  ]
}
```

Select `TS Program` to start in debug mode and access `http://127.0.0.1:3000`.

## Unit Testing

Koatty currently only supports Jest for writing test cases:

```javascript
import request from 'supertest';
import { ExecBootStrap } from 'koatty';
import { App } from '../src/App';

describe('UT example', () => {
  let server;
  beforeAll(async () => {
    const appInstance = await ExecBootStrap()(App);
    server = appInstance.callback();
  });

  it('request', async (done) => {
    const rsp = await request(server).get('/path/to/server');
    expect(rsp.status).toBe(200);
    done();
  });
});
```

# Core Features

## Project Structure

The Koatty CLI tool `koatty_cli` creates the following directory structure by default:

```bash
<projectName>
├── .vscode                       # VSCode configuration
│   └── launch.json               # Node debugging script
├── dist                          # Compiled directory
├── src                           # Project source code
│   ├── config
│   │   ├── config.ts             # General framework configuration
│   │   ├── server.ts             # Server configuration (protocol, port, SSL, etc.)
│   │   ├── db.ts                 # Database configuration
│   │   ├── middleware.ts         # Middleware configuration
│   │   ├── plugin.ts             # Plugin configuration
│   │   └── router.ts             # Router configuration
│   ├── aspect                    # AOP aspect classes
│   │   └── TestAspect.ts
│   ├── controller                # Controllers
│   │   └── TestController.ts
│   ├── middleware                # Middleware
│   │   ├── JwtMiddleware.ts
│   │   └── ViewMiddleware.ts
│   ├── model                     # Persistence layer
│   │   └── TestModel.ts
│   ├── plugin                    # Plugins
│   │   └── TestPlugin.ts
│   ├── resource                  # Static data or resources
│   │   ├── proto                 # Protocol Buffers
│   │   │   └── test.proto
│   │   └── data.json
│   ├── service                   # Service logic layer
│   │   └── TestService.ts
│   ├── utils                     # Utility functions
│   │   └── tool.ts
│   └── App.ts                    # Entry file
├── resource                      # Static data or resources
│   └── proto                     # Protocol Buffers
│   │     └── test.proto
│   └── graphql                   # Protocol graphql
│   │     └── User.graphql
│   └── data.json
├── static                        # Static files directory
│   └── index.html
├── test                          # Test cases
│   └── index.test.js
├── apidoc.json
├── pm2.json
├── package.json
├── README.md
└── tsconfig.json
```

Koatty supports flexible project structure customization. Except for the configuration directory (customizable through `@ConfigurationScan()`) and static resources directory (requires modifying the Static middleware default configuration), other directory names and structures can be customized.

## Entry File

The default entry file for Koatty is `App.ts`:

```typescript
import { Koatty, Bootstrap } from "koatty";

@Bootstrap(
  // bootstrap function
  // (app: any) => {
  // Adjust libuv thread pool size
  // process.env.UV_THREADPOOL_SIZE = "128";
  // Ignore https self-signed verification
  // process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
  // }
)
// @ComponentScan('./')
// @ConfigurationScan('./config')
export class App extends Koatty {
  public init() {
    // this.appDebug = true; // Set debug mode to false in production
  }
}
```

The `App` class inherits from `Koatty`, which extends `Koa.Application`. Therefore, an `App` instance is an extended Koa instance.

Koatty defines the project entry through the `@Bootstrap()` decorator, which can accept a function as a parameter. This function is executed after environment parameters are initialized when the project loads.

Koatty uses the `@ComponentScan()` decorator to define the project directory. If the project directory is modified, pass the relative directory name; to exclude certain directories from automatic bean loading, place files outside the project directory.

Koatty uses the `@ConfigurationScan()` decorator to customize the project configuration directory. The default value is `./config`, which is the `config` subdirectory under the project directory.

## Core Objects

### App

`App` is a global application object. Only one instance is created per application, inheriting from `Koa.Application`. We can mount global methods and objects on the `App` object, making it easy to extend in plugins or applications.

In `CONTROLLER`, `SERVICE`, and `COMPONENT` type beans, the `App` object is injected by default and can be used directly:

```typescript
@Controller()
export class TestController {
  app: App;
  
  test() {
    // Print app object
    console.log(this.app);
  }
}
```

In `MIDDLEWARE` type beans, the `App` object is passed as a function argument:

```typescript
@Middleware()
export class TestMiddleware {
  run(options: any, app: Koatty) {
    // Print app object
    console.log(app);
    
    return async (ctx: any, next: any) => {
      await next();
    };
  }
}
```

### Ctx

`Ctx` is a request-level object, inheriting from `Koa.Context`. Each time a user request is received, the framework instantiates a `Ctx` object, which encapsulates the request information and provides many convenient methods to get request parameters or set response information.

In `CONTROLLER` type beans, the `Ctx` object is a member property and can be used directly:

```typescript
@Controller()
export class TestController {
  ctx: KoattyContext;
  
  test() {
    // Print ctx object
    console.log(this.ctx);
  }
}
```

In `MIDDLEWARE` type beans, the `Ctx` object is passed as an argument to the middleware execution function:

```typescript
@Middleware()
export class TestMiddleware {
  run(options: any, app: Koatty) {
    return async (ctx: KoattyContext, next: any) => {
      // Print ctx object
      console.log(ctx);
      await next();
    };
  }
}
```

In `SERVICE` and `COMPONENT` type beans, the `Ctx` object needs to be passed manually:

```typescript
@Service()
export class RequestService {
  app: App;
  
  Test(ctx: KoattyContext) {
    // Print ctx object
    console.log(ctx);
  }
}
```

> Note the difference between `app.context` and `context.app`:
> `app.context` is a prototype for the context object created for each request. Each time a request is received, Koa creates a new context object and assigns it to the current `ctx` variable. Although each request's context is based on `app.context`, this does not mean `app.context` will be overwritten. `app.context` is actually a template for generating new context instances.
> The context contains a reference to `app`, but the relationship is unidirectional (context accesses `app` through properties, but not vice versa).

## Configuration

In actual projects, various configurations are needed, including framework-required configurations and project-customized configurations. Koatty manages all configurations uniformly and divides them into different configuration files according to different functions.

**Configuration Files**:

- `config.ts` - General configurations (log level, log path, sensitive fields, etc.)
- `server.ts` - Server configuration (protocol, port, SSL, tracing, etc.)
- `db.ts` - Database configurations
- `router.ts` - Router configurations (route prefix, payload parsing, protocol-specific extension configuration)
- `middleware.ts` - Middleware configurations
- `plugin.ts` - Plugin configurations

> **Note**: Starting from Koatty 4.0, server-related configurations (hostname, port, protocol, ssl, etc.) have been separated from `config.ts` to `server.ts` for clearer server configuration management.

In addition to the common configuration files mentioned above, Koatty also supports custom configuration file naming.

### Server Configuration (server.ts)

Starting from Koatty 4.0, server configuration has been separated to `config/server.ts`. It supports running multiple protocols simultaneously.

```typescript
// config/server.ts
export default {
  hostname: '127.0.0.1', // Server hostname
  port: 3000,            // Server port (single value or array)
  protocol: "http",      // Single protocol mode
  trace: false,          // Enable tracing
  ssl: {
    mode: 'auto',        // 'auto' | 'manual' | 'mutual_tls'
    key: '',             // SSL key file path
    cert: '',            // SSL certificate file path
    ca: ''               // CA certificate file path
  }
}

// Multi-protocol mode
export default {
  hostname: '127.0.0.1',
  // Port configuration: single value or array
  // If array, each port maps to corresponding protocol
  // If single value, first protocol uses it, others auto-increment (3000, 3001, 3002...)
  port: [3000, 50051],
  protocol: ["http", "grpc"], // Multiple protocols: 'http' | 'https' | 'http2' | 'grpc' | 'ws' | 'wss' | 'graphql'
  trace: false,
  ssl: {
    mode: 'auto',
    key: './ssl/server.key',
    cert: './ssl/server.crt'
  }
}
```

**How It Works**:
- `koatty_serve` automatically creates server instances for each protocol
- `koatty_router` creates dedicated router instances for each protocol
- Controllers are automatically registered to appropriate routers based on their decorators
- HTTP controllers (`@Controller`) work with HTTP/HTTPS/HTTP2
- gRPC controllers (`@GrpcController`) work with gRPC
- GraphQL controllers (`@GraphQLController`) work with GraphQL (over HTTP/HTTPS)
- WebSocket controllers (`@WsController`) work with WebSocket

**Important Notes**:

- **GraphQL Protocol**: GraphQL is an application-layer protocol that runs over HTTP/HTTP2, not a separate transport protocol. When you specify `protocol: "graphql"`, Koatty automatically:
  - Uses **HTTP** as transport by default
  - Uses **HTTP/2** when SSL certificates are configured (recommended for production)
  
- **GraphQL over HTTP/2** (Recommended): HTTP/2 provides significant benefits for GraphQL:
  - **Multiplexing**: Handle multiple queries over a single connection
  - **Header Compression**: Reduce bandwidth for large queries
  - **Server Push**: Prefetch related resources
  - **HTTP/1.1 Fallback**: Automatic downgrade for compatibility
  
  To enable HTTP/2 for GraphQL, configure in `config/server.ts`:
  ```typescript
  // config/server.ts
  export default {
    hostname: '127.0.0.1',
    port: 3000,
    protocol: "graphql",
    trace: false,
    ssl: {
      mode: 'auto',
      key: './ssl/server.key',
      cert: './ssl/server.crt'
    }
  }
  ```
  
  Then configure GraphQL schema in `config/router.ts` (using protocol name as key):
  ```typescript
  // config/router.ts
  export default {
    ext: {
      graphql: {
        schemaFile: "./resource/graphql/schema.graphql",
        playground: true,              // Enable GraphQL Playground
        introspection: true,           // Enable introspection
        depthLimit: 10,                // Query depth limit
        // Optional: HTTP/2 configuration
        // http2: { maxConcurrentStreams: 100 }
      }
    }
  }
  ```

### Custom Configuration Scan Path

Configuration files are placed in the `src/config/` directory by default. You can customize the configuration scan path in the entry file `App.ts`:

```typescript
// App.ts
@ConfigurationScan('./myconfig')
export class App extends Koatty {
  public init() {
    // ...
  }
}
```

Koatty will automatically scan all `.ts` files in the project `src/myconfig` directory and load them as configurations according to filenames.

### Configuration File Format

Koatty configuration files must be exported in standard ES6 Module format:

```typescript
export default {
  aa: "bb",
  cc: {
    dd: ""
  }
}
```

### Reading Configurations

There are two ways to read configurations in the project:

**Method 1** (using `app.config` function):

```typescript
const conf: Test = this.app.config("test");
```

**Method 2** (using decorator injection, recommended):

```typescript
@Controller()
export class AdminController {
  @Config("test")
  conf: Test;
}
```

> The configuration type `Test` in the above code is a defined configuration class. You can also use `Object` or `any` types.

### Configuration Classification and Hierarchy

When Koatty scans the configuration file directory at startup, it classifies configurations according to filenames. For example, after loading `db.ts`, reading configuration items in the file requires adding a type:

```typescript
// The second parameter of the config function is the configuration type
const conf: Test = this.app.config("test", "db");

// Or
@Config("test", "db")
conf: Test;
```

> The default classification for configurations is `config`, so configuration items in `config.ts` do not need to fill in the type parameter.

Koatty supports configuration hierarchy when reading configurations. For example, in the configuration file `db.ts`:

```typescript
export default {
  /* database config */
  database: {
    db_type: 'mysql',
    db_host: '127.0.0.1',
    db_port: 3306,
    db_name: 'test',
    db_user: 'test',
    db_pwd: '',
    db_prefix: '',
    db_charset: 'utf8'
  }
}
```

To read the value of `db_host`:

```typescript
@Config("database.db_host", "db")
dbHost: string;

// Or
const dbHost: string = this.app.config("database.db_host", "db");
```

Note that hierarchical configurations only support direct access to the **second level**. For deeper levels, assign the value to a variable and retrieve again:

```typescript
// config
export default {
  test: {
    bb: {
      cc: 1
    }
  }
}

const conf: any = this.app.config("test");
const cc: number = conf.bb.cc;
```

### Runtime Environment Configuration

Koatty can automatically recognize the current runtime environment and load corresponding configurations (if available) according to the runtime environment.

The runtime environment is defined by three properties:

**appDebug**

Defined in the constructor method (`init`) of the project entry file:

```typescript
// App.ts
@Bootstrap()
export class App extends Koatty {
  public init() {
    // appDebug is true for development mode
    // appDebug is false for production mode
    this.appDebug = false;
  }
}
```

**process.env.NODE_ENV**

Node.js runtime environment variable, which can be defined in the system environment or in the startup function of the project entry file.

**process.env.KOATTY_ENV**

Koatty framework runtime environment variable.

**Relationship and Differences**:

| Variable | Value | Description | Priority |
|----------|-------|-------------|----------|
| `appDebug` | `true/false` | Debug mode | High |
| `process.env.KOATTY_ENV` | `development/production` | Framework runtime environment variable | Medium |
| `process.env.NODE_ENV` | `development/production` | Node.js runtime environment variable | Low |

> The priority here refers to the priority of loading runtime configurations. Higher priority configurations will override lower priority configurations.

```typescript
app.env = process.env.KOATTY_ENV || process.env.NODE_ENV;
if (app.appDebug) {
  app.env = 'development';
}
```

If `app.env = production`, `koatty_config` will automatically load configuration files with `_pro.ts` or `_production.ts` suffixes. If `app.env = development`, it will automatically load configuration files with `_dev.ts` or `_development.ts` suffixes.

For example:

```bash
# Automatically loads config_dev.ts or config_development.ts
NODE_ENV=dev ts-node "test/test.ts"
```

Through flexible configuration of these three variables, diverse runtime environments and configurations can be supported.

### Command Line Arguments

Koatty can automatically recognize command line arguments and fill them into corresponding configuration items:

```bash
# Automatically fills the value of config.cc.dd.ee
NODE_ENV=dev ts-node "test/test.ts" --config.cc.dd.ee=77
```

### Placeholder Variable Replacement

Koatty can automatically replace configuration items identified by `${}` placeholders in configuration files with values of the same name in `process.env`:

```typescript
// config.ts
export default {
  ff: "${ff_value}"
}
```

```bash
# Automatically fills the value of ff_value
NODE_ENV=dev ff_value=999 ts-node "test/test.ts"
```

### Common Environment Variables

- **process.env.ROOT_PATH**: The root directory defined by Koatty. Can be used anywhere in the project.
- **process.env.APP_PATH**: The application directory defined by Koatty (in debug mode, it is `/projectDIR/src`; in production mode, it is `/projectDIR/dist`). Can be used anywhere in the project.
- **process.env.KOATTY_PATH**: The root directory of the Koatty framework (`/projectDIR/node_modules/koatty/`). Can be used anywhere in the project.
- **process.env.LOGS_PATH**: The directory for saving logs (default is `/projectDIR/logs`, which can be modified in the configuration). Can be used anywhere in the project.

## Routing

Koatty encapsulates a routing library `koatty_router` specifically for handling routes, supporting HTTP1/2, WebSocket, gRPC, and other protocol types.

### Router Factory Pattern

Koatty 4.0 introduces a router factory pattern, providing flexible router creation and management:

```typescript
import { RouterFactory, RegisterRouter } from "koatty_router";

const factory = RouterFactory.getInstance();

// Get supported protocols
console.log(factory.getSupportedProtocols());
// ['http', 'https', 'ws', 'wss', 'grpc', 'graphql']

// Create router
const router = factory.create("http", app, { prefix: "/api" });

// Register custom router
@RegisterRouter("mqtt")
class MqttRouter implements KoattyRouter {
  // Custom router implementation
}
```

### Controller Routing

The `@Controller()` decorator's parameter serves as the controller's access entry, with the default value being `/`. Then, iterate over the controller's methods and register route mappings using decorators such as `GetMapping`, `DeleteMapping`, `PutMapping`, `PostMapping`.

For example:

```typescript
@Controller("/admin")
export class AdminController {
  @GetMapping("/test")
  test() {
    // ...
  }
}
```

The above code registers the route `/admin/test` to `AdminController.test()`.

> Note: In gRPC services, the route bound by `@Controller` must match the `serviceName` defined in the proto. For example, `@Controller("/Book")` binds to the service `Book` in the proto.

### Method Routing

Method routing decorators include `@GetMapping`, `@PostMapping`, `@DeleteMapping`, `@PutMapping`, `@PatchMapping`, `@OptionsMapping`, `@HeadMapping`, `@RequestMapping`.

> Note: In gRPC services, please use `@PostMapping` or `@RequestMapping` for binding, and the path in `@RequestMapping` must match the method name defined in the proto; in WebSocket services, please use `@GetMapping` or `@RequestMapping` for binding.

### Parameter Binding

In method routing, there is a special parameter route that can easily implement RESTful APIs:

```typescript
@Controller("/admin")
export class AdminController {
  @GetMapping("/test/:id") // Declare parameters in the method decorator
  test(@PathVariable("id") id: number) { // Use PathVariable to get the bound parameter
    // ...
  }
}
```

Koatty's routing component `koatty_router` is based on `@koa/router` (except for gRPC). For detailed routing tutorials, please refer to [@koa/router](https://github.com/koajs/router).

### Route Configuration

The custom route configuration is stored in `src/config/router.ts`, which initializes the routing instance:

```typescript
export default {
    prefix: string;           // Route prefix
    methods?: string[];       // Supported HTTP methods
    routerPath?: string;      // Route path
    sensitive?: boolean;      // Case sensitive
    strict?: boolean;         // Strict matching
    payload?: PayloadOptions; // Payload parsing options

    // Protocol-specific extension configuration (using protocol name as key)
    ext?: {
      http?: {};                        // HTTP protocol config (optional)
      grpc?: GrpcExtOptions;            // gRPC protocol config (optional)
      ws?: WebSocketExtOptions;         // WebSocket protocol config (optional)
      graphql?: GraphQLExtOptions;      // GraphQL protocol config (optional)
    }
};
```

> **Note**: Starting from Koatty 4.0, `ext` configuration uses protocol name as key for better multi-protocol support. E.g., `ext.grpc`, `ext.ws`, `ext.graphql`, etc.

**Protocol-Specific Extension Configuration Options**:

**gRPC Configuration Options (GrpcExtOptions)**:
```typescript
{
  protoFile: string;           // gRPC proto file path (required)
  poolSize?: number;           // Connection pool size, default 10
  batchSize?: number;          // Batch size, default 10
  streamConfig?: {             // Stream configuration
    maxConcurrentStreams?: number;    // Max concurrent streams, default 50
    streamTimeout?: number;           // Stream timeout (ms), default 60s
    backpressureThreshold?: number;   // Backpressure threshold (bytes), default 2048
  };
  enableReflection?: boolean;  // Enable reflection, default false
}
```

**WebSocket Configuration Options (WebSocketExtOptions)**:
```typescript
{
  maxFrameSize?: number;        // Max frame size (bytes), default 1MB
  heartbeatInterval?: number;   // Heartbeat interval (ms), default 15s
  heartbeatTimeout?: number;    // Heartbeat timeout (ms), default 30s
  maxConnections?: number;      // Max connections, default 1000
  maxBufferSize?: number;       // Max buffer size (bytes), default 10MB
}
```

**GraphQL Configuration Options (GraphQLExtOptions)**:
```typescript
{
  schemaFile: string;          // GraphQL Schema file path (required)
  playground?: boolean;        // Enable GraphQL Playground, default false
  introspection?: boolean;     // Enable introspection query, default true
  debug?: boolean;             // Debug mode, default false
  depthLimit?: number;         // Query depth limit, default 10
  complexityLimit?: number;    // Query complexity limit, default 1000
  // Optional: HTTP/2 configuration
  // keyFile?: string;         // SSL key file path
  // crtFile?: string;         // SSL certificate file path
  // http2?: { maxConcurrentStreams?: number }
}
```

**Protocol-Specific Extension Configuration Examples**:

#### Single Protocol Configuration

##### gRPC Configuration
```typescript
export default {
    ext: {
        grpc: {
            protoFile: "./resource/proto/Hello.proto",  // gRPC proto file
            poolSize: 10,                               // Connection pool size
            streamConfig: {
                maxConcurrentStreams: 50,               // Max concurrent streams
                streamTimeout: 60000                    // Stream timeout (ms)
            }
        }
    }
};
```

##### WebSocket Configuration
```typescript
export default {
    ext: {
        ws: {
            maxFrameSize: 1024 * 1024,     // Max frame size 1MB
            heartbeatInterval: 15000,       // Heartbeat interval 15s
            maxConnections: 1000            // Max connections
        }
    }
};
```

##### GraphQL Configuration
```typescript
export default {
    ext: {
        graphql: {
            schemaFile: "./resource/graphql/schema.graphql",  // GraphQL Schema file
            playground: true,                                 // Enable GraphQL Playground
            introspection: true,                              // Enable introspection
            depthLimit: 10,                                   // Query depth limit
            complexityLimit: 1000                             // Query complexity limit
        }
    }
};
```

#### Multi-Protocol Configuration (Recommended)

When running multiple protocols, use protocol names as keys for extension parameters:

```typescript
// config/router.ts - Multi-protocol configuration example
export default {
    payload: {
        extTypes: {
            json: ['application/json'],
            form: ['application/x-www-form-urlencoded'],
            grpc: ['application/grpc'],
            graphql: ['application/graphql+json'],
            websocket: ['application/websocket']
        },
        limit: '20mb',
        encoding: 'utf-8',
    },
    ext: {
        http: {},  // HTTP protocol (no special config)
        grpc: {
            protoFile: "./resource/proto/service.proto",
            poolSize: 10,
            streamConfig: { maxConcurrentStreams: 50 }
        },
        graphql: {
            schemaFile: "./resource/graphql/schema.graphql",
            playground: true,
            introspection: true,
            // Optional: Enable HTTP/2
            // keyFile: "./ssl/server.key",
            // crtFile: "./ssl/server.crt"
        },
        ws: {
            maxFrameSize: 1024 * 1024,
            heartbeatInterval: 15000,
            maxConnections: 1000
        }
    }
};
```

### Route Features

- The `@Controller()` decorator has two roles: declaring the type of the bean as a controller and binding the controller route. If no path is specified when using the `@Controller()` decorator (no parameters), the default value is `/`.
- Method routing decorators can be added multiple times to the same method. However, the `@Controller()` decorator can only be used once per class.
- If duplicate routes are bound, the first loaded route rule takes effect according to the loading order of the controller class in the IOC container. This issue needs attention. In future versions, priority features may be added to control this.
- Routes support regular expressions and parameter binding (not available in gRPC services). For detailed routing tutorials, please refer to [@koa/router](https://github.com/koajs/router).

## Middleware

Koatty is built on top of Koa, so the form of middleware in Koatty is essentially the same as in Koa, based on the onion model. Every time we write a middleware, it's like wrapping another layer around the onion.

Koatty's framework defaults to loading middleware such as trace and payload, which can meet most web application scenarios. Users can also add their own middleware for extension.

Different from Koa middleware, Koatty middleware is written in the form of classes and uses the `@Middleware` decorator to declare the component type.

Middleware classes must contain a method named `run(options: any, app: App)`. This method is called when the application starts and returns a function `(ctx: any, next: any){}`, which is the format of the Koa middleware.

### Route-Level Middleware Management

Koatty 4.0 introduces `RouterMiddlewareManager`, focusing on route-level middleware registration, composition, and conditional execution.

#### Core Features

- 🎯 **Route-Level Isolation** - Each route's middleware instances are independently configured
- 🔧 **Intelligent Instance Management** - Uses `${middlewareName}@${route}#${method}` format for unique identification
- ⚡ **Pre-Composition Optimization** - Compose middleware at registration time, improving runtime performance
- 🔄 **Async Middleware Classes** - Full support for asynchronous `run` methods

#### Route-Level Middleware Usage

Route-level middleware can be directly configured to controllers or methods via decorators:

##### 1. Basic Middleware Configuration

```typescript
import { Controller, GetMapping, PostMapping, Middleware } from "koatty";

// Controller-level middleware
@Controller('/api', [AuthMiddleware])
export class UserController {

  @GetMapping('/users')
  getUsers() {
    return 'users list';
  }

  // Method-level middleware
  @PostMapping('/admin', {
    middleware: [RateLimitMiddleware]
  })
  adminAction() {
    return 'admin action';
  }
}
```

##### 2. Advanced Middleware Configuration

Use the `withMiddleware` function to configure priority, conditions, metadata, and other advanced features:

```typescript
import { Controller, GetMapping, PostMapping, withMiddleware } from "koatty";

@Controller('/api')
export class UserController {

  @GetMapping('/users', {
    middleware: [
      withMiddleware(AuthMiddleware, {
        priority: 100,
        metadata: { role: 'admin' }
      }),
      withMiddleware(RateLimitMiddleware, {
        priority: 90,
        conditions: [
          { type: 'header', value: 'x-api-key', operator: 'contains' }
        ]
      })
    ]
  })
  getUsers() {
    return 'users list';
  }

  // Conditional middleware
  @PostMapping('/admin', {
    middleware: [
      withMiddleware(AuthMiddleware, {
        priority: 100,
        conditions: [
          { type: 'header', value: 'x-admin-token', operator: 'contains' }
        ]
      })
    ]
  })
  adminAction() {
    return 'admin action';
  }
}
```

##### 3. Middleware Metadata Configuration

Pass configuration parameters to middleware via `metadata`:

```typescript
import { withMiddleware } from "koatty";

@Controller('/api')
export class RateLimitController {

  @GetMapping('/rate-limited', {
    middleware: [
      withMiddleware(RateLimitMiddleware, {
        priority: 100,
        metadata: {
          limit: 100,           // Max requests per minute
          window: 60000,        // Time window (milliseconds）
          keyGenerator: 'ip'    // Rate limit key generation strategy
        }
      })
    ]
  })
  rateLimitedEndpoint() {
    return 'rate limited endpoint';
  }
}
```

**Middleware class receives configuration:**

```typescript
class RateLimitMiddleware {
  async run(config: any, app: any) {
    const {
      limit = 60,
      window = 60000,
      keyGenerator = 'ip'
    } = config;

    return async (ctx: KoattyContext, next: KoattyNext) => {
      const key = keyGenerator === 'ip' ? ctx.ip : ctx.user?.id;

      if (await this.isRateLimited(key, limit, window)) {
        ctx.status = 429;
        ctx.body = { error: 'Rate limit exceeded' };
        return;
      }

      await next();
    };
  }
}
```

##### 4. Middleware Disable and Add Features

Use the `enabled: false` configuration to disable middleware execution:

- **Controller-level disable**: All routes under the controller will not execute the middleware
- **Method-level disable**: Only that method will not execute the specified middleware (only for middleware declared by the controller）
- **Method-level add**: Can add middleware not declared by the controller, which only takes effect in that method

```typescript
import { Controller, GetMapping, PostMapping, PutMapping, withMiddleware } from "koatty";

@Controller('/api', [
  AuthMiddleware,
  withMiddleware(RateLimitMiddleware, { enabled: false }), // Controller-level disable
  LoggingMiddleware
])
export class UserController {

  @GetMapping('/users')
  async getUsers() {
    // Execute AuthMiddleware and LoggingMiddleware
  }

  @PostMapping('/users', [
    withMiddleware(AuthMiddleware, { enabled: false }), // Method-level disable
    ValidationMiddleware // Method-level add
  ])
  async createUser() {
    // Execute LoggingMiddleware and ValidationMiddleware
  }

  @PutMapping('/users/:id', [
    withMiddleware(AuthMiddleware, { enabled: false }),     // Disable authentication
    withMiddleware(AdminAuthMiddleware, { priority: 80 })   // Add admin authentication
  ])
  async updateUser() {
    // Only execute AdminAuthMiddleware
  }
}
```

**Priority Planning Recommendations:**
- **100+**: Authentication and authorization middleware
- **90-99**: Rate limiting and security middleware
- **80-89**: Validation and data processing middleware
- **70-79**: Logging and monitoring middleware
- **50-69**: Business logic middleware

### Using Middleware

Use the command line tool `koatty_cli` to execute commands:

```bash
# jwt is the custom middleware name
kt middleware jwt
```

This will automatically generate a file `src/middleware/JwtMiddleware.ts` with the middleware code template:

```typescript
/**
 * Middleware
 * @return
 */
import { Middleware } from "koatty";
import { App } from '../App';

@Middleware()
export class JwtMiddleware {
  run(options: any, app: App) {
    // Logic before returning middleware, e.g., reading configuration
    
    return async (ctx: any, next: any) => {
      // Implement middleware logic here
      await next();
    }
  }
}
```

Modify the project middleware configuration in `src/config/middleware.ts`:

```typescript
export default {
  list: ['JwtMiddleware'], // List of loaded middleware
  config: { // Middleware configuration
    JwtMiddleware: {
      // Middleware configuration items
    }
  }
}
```

### Protocol-Specific Middleware

Starting from version 3.14.x, middleware can be bound to specific protocols and only execute in requests of the specified protocols:

```typescript
// Middleware that only executes in HTTP/HTTPS protocols
@Middleware({ protocol: ["http", "https"] })
export class HttpOnlyMiddleware {
  run(options: any, app: App) {
    return async (ctx: KoattyContext, next: Function) => {
      // This middleware only runs for HTTP/HTTPS protocols
      console.log('HTTP request:', ctx.url);
      await next();
    };
  }
}

// Middleware that executes in multiple protocols
@Middleware({ protocol: ["http", "grpc", "ws"] })
export class MultiProtocolMiddleware {
  run(options: any, app: App) {
    return async (ctx: KoattyContext, next: Function) => {
      // Execute different logic based on protocol type
      if (ctx.protocol === 'grpc') {
        // gRPC specific logic
      } else if (ctx.protocol === 'websocket') {
        // WebSocket specific logic
      } else {
        // HTTP specific logic
      }
      await next();
    };
  }
}

// Middleware that executes in all protocols (default behavior)
@Middleware()
export class UniversalMiddleware {
  run(options: any, app: App) {
    return async (ctx: KoattyContext, next: Function) => {
      // This middleware runs in all protocols
      await next();
    };
  }
}
```

### Disabling Middleware

To disable middleware developed by the project, simply modify the middleware configuration file:

```typescript
// src/config/middleware.ts
export default {
  list: [], // If PassportMiddleware is not in the list, the Passport middleware will not execute
  config: {
    'PassportMiddleware': {...},
  }
}
```

### Using Koa Middleware

Koatty supports using Koa middleware (including middleware for Koa 1.x and 2.x):

```typescript
const passport = require('koa-passport');

@Middleware()
export class PassportMiddleware {
  run(options: any, app: App) {
    return passport.initialize();
  }
}
```

Mount and configure usage:

```typescript
export default {
  list: ['PassportMiddleware'], // List of loaded middleware
  config: {
    'PassportMiddleware': {
      // Middleware configuration items
    }
  }
}
```

### Using Express Middleware

Koatty is compatible with Express middleware. Usage is the same as Koa middleware, and the framework will automatically recognize and convert for compatibility.

### Middleware for Non-HTTP/S Protocols

If the project uses protocols such as `grpc`, `ws`, `wss`, etc., middleware needs to be aware that some properties of `ctx` will be inconsistent. For example, `ctx.header` does not exist in `grpc`. The specific available properties will be explained in the gRPC and WebSocket chapters.

## Controller

Koatty supports multi-protocol controllers, with different decorators for each protocol. Controller classes are placed in the project's `src/controller` folder by default and support subfolders for classification. Koatty controller classes must implement the `IController` interface.

### Multi-Protocol Controller Decorators

Koatty provides dedicated controller decorators for different protocols:

- `@Controller()` - HTTP/HTTPS/HTTP2 protocol controller
- `@GrpcController()` - gRPC protocol controller
- `@GraphQLController()` - GraphQL protocol controller (based on HTTP/HTTPS)
- `@WsController()` - WebSocket protocol controller

### Creating Controllers

Use the `koatty_cli` command line tool:

**Single module mode:**

```bash
kt controller index # Default http protocol

# Or specify protocol
kt controller -t http index
kt controller -t grpc index
kt controller -t ws index
kt controller -t graphql index
```

This will automatically create `src/controller/IndexController.ts`.

**Multi-module mode:**

```bash
kt controller admin/index
```

This will automatically create `src/controller/Admin/IndexController.ts`.

### HTTP Controller Template

```typescript
import { Controller, GetMapping } from "koatty";
import { App } from '../../App';

@Controller("/")
export class IndexController {
  app: App;
  ctx: KoattyContext;

  constructor(ctx: KoattyContext) {
    this.ctx = ctx;
  }

  @GetMapping("/")
  index() {
    return this.ok('Hello, Koatty!');
  }
}
```

### gRPC Controller Template

```typescript
import { GrpcController, PostMapping, RequestBody, Validated } from "koatty";
import { App } from '../App';

@GrpcController('/Hello') // Must match the service name in proto
export class HelloController {
  app: App;
  ctx: KoattyContext;

  constructor(ctx: KoattyContext) {
    this.ctx = ctx;
  }

  @PostMapping('/SayHello') // Must match the method name in proto
  @Validated() // Parameter validation
  async sayHello(@RequestBody() params: SayHelloRequestDto): Promise<SayHelloReplyDto> {
    const res = new SayHelloReplyDto();
    res.message = `Hello, ${params.name}!`;
    return res;
  }
}
```

### GraphQL Controller Template

```typescript
import { GraphQLController, GetMapping, PostMapping, RequestParam } from "koatty";
import { App } from '../App';

@GraphQLController('/graphql')
export class UserController {
  app: App;
  ctx: KoattyContext;

  constructor(ctx: KoattyContext) {
    this.ctx = ctx;
  }

  // Query operation
  @GetMapping()
  async getUser(@RequestParam() id: string): Promise<User> {
    return { id, name: 'GraphQL User' };
  }

  // Mutation operation
  @PostMapping()
  async createUser(@RequestParam() input: UserInput): Promise<User> {
    return { id: input.id, name: input.name };
  }
}
```

### WebSocket Controller Template

```typescript
import { WsController, GetMapping, RequestBody } from "koatty";
import { App } from '../App';

@WsController('/ws')
export class ChatController {
  app: App;
  ctx: KoattyContext;

  constructor(ctx: KoattyContext) {
    this.ctx = ctx;
  }

  @GetMapping("/")
  async message(@RequestBody() data: any) {
    // WebSocket message handling
    return { type: 'response', data: data };
  }
}
```

### Controller Features

- Controller classes must implement the `IController` interface.
- The constructor method of the controller class must have `ctx: KoattyContext` as the first parameter and assign it to the `ctx` property in the constructor method:

```typescript
constructor(ctx: KoattyContext) {
  this.ctx = ctx;
}
```

- According to software layered architecture, controllers should not be called by other controllers (if needed, move the logic to the Service layer for code reuse), nor should they be referenced by other components (anti-pattern).

### Getting Parameters

Koatty parses and processes request parameters. In the controller, we can obtain parameter values through the following methods:

#### Query String Parameters

Using `@Get` decorator:

```typescript
@GetMapping("/get")
async get(@Get("id") id: number): Promise<any> {
  console.log(id);
}
```

Using `@RequestParam` decorator:

```typescript
@GetMapping("/get")
async get(@RequestParam("id") id: number): Promise<any> {
  console.log(id);
}
```

Using `ctx.query`:

```typescript
@GetMapping("/get")
async get(): Promise<any> {
  console.log(this.ctx.query["id"]);
}
```

#### RESTful API Parameters

Using `@PathVariable` decorator:

```typescript
@GetMapping("/test/:id") // Declare parameters in the method decorator
test(@PathVariable("id") id: number) { // Use PathVariable to get the bound parameter
  // ...
}
```

Using `ctx.requestParam`:

```typescript
@GetMapping("/test/:id") // Declare parameters in the method decorator
test() {
  console.log(this.ctx.requestParam["id"]);
}
```

#### Body Parameters

Using `@Post` decorator:

```typescript
@PostMapping("/post")
async post(@Post("id") id: number): Promise<any> {
  console.log(id);
}
```

Using `@RequestBody` decorator:

```typescript
@PostMapping("/post")
async post(@RequestBody() body: any): Promise<any> {
  console.log(body.post);
}
```

Using `ctx.requestBody`:

```typescript
@PostMapping("/post")
async post(): Promise<any> {
  console.log(this.ctx.requestBody.post);
}
```

> The `RequestBody` decorator gets values including form parameters and uploaded file objects.

#### File Upload

Using `@File` decorator:

```typescript
@PostMapping("/post")
async post(@File("filename") fileObject: any): Promise<any> {
  console.log(fileObject);
}
```

Using `@RequestBody` decorator:

```typescript
@PostMapping("/post")
async post(@RequestBody() body: any): Promise<any> {
  console.log(body.file);
}
```

Using `ctx.requestBody`:

```typescript
@PostMapping("/post")
async post(): Promise<any> {
  console.log(this.ctx.requestBody.file);
}
```

#### HTTP Header

Using `@Header` decorator:

```typescript
@PostMapping("/get")
async get(@Header("x-access-token") token: string): Promise<any> {
  console.log(token);
}
```

Using `ctx.get`:

```typescript
@PostMapping("/get")
async get(): Promise<any> {
  const token = this.ctx.get("x-access-token");
  console.log(token);
}
```

Using `ctx.header`:

```typescript
@PostMapping("/get")
async get(): Promise<any> {
  console.log(this.ctx.header);
}
```

### Access Control

Class references follow TypeScript's scope `private | protected | public`. If not explicitly declared, the scope of class methods is `public`.

> As long as a controller class method is bound to a route, the method can be accessed via URL mapping (even if the method's scope is not `public`). This is because currently, it is not possible to obtain the method's scope keyword through reflection, and URL access scope control has not been implemented.

## Service Layer

In simple terms, a Service is an abstraction layer used for encapsulating business logic in complex business scenarios. The benefits of providing this abstraction are:

- Keeping the logic in the Controller simpler.
- Maintaining the independence of business logic; abstracted Services can be called repeatedly by multiple Controllers.
- Separating logic from presentation, making it easier to write test cases.

Koatty service classes use the `@Service()` decorator to declare them. Service classes are placed in the project's `src/service` folder by default and support subfolders for classification. Koatty service classes must implement the `IService` interface.

### Creating Service Classes

Use the `koatty_cli` command line tool:

```bash
kt service test
```

This will automatically create `src/service/TestService.ts` with the generated template code:

```typescript
import { Service } from "koatty";
import { App } from '../App';

@Service()
export class TestService {
  app: App;

  // Implement test method
  test(name: string) {
    return name;
  }
}
```

### Using Service Classes

Inject through decorators:

```typescript
@Autowired()
testService: TestService;
```

Get through the IOC container:

```typescript
this.testService = IOCContainer.get("TestService", "SERVICE");
```

Call the service class method:

```typescript
this.testService.test();
```

## Persistence Layer

The persistence layer is responsible for persisting business objects from the service layer into the database. ORM encapsulates database access operations, directly mapping objects to the database.

> The persistence layer is a type of business logic layering and is not mandatory in the framework.
> The persistence layer is of type `COMPONENT` in the framework's IOC container.
> It is loaded together with plugins when the framework starts. Plugins can reference the persistence layer.
> Koatty currently supports TypeORM by default. If you need to use other types of ORMs, such as Sequelize or Mongoose, you can refer to the `koatty_typeorm` plugin to implement it yourself.

### Creating Model Classes

Create data models and entities using the `koatty_cli` command line tool:

```bash
kt model test
```

This tool will automatically create an entity class `UserEntity` and a model class `UserModel`:

```typescript
@Component()
@Entity('user') // Corresponds to the database table name
export class UserEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @CreateDateColumn()
  createdDate: Date;

  @UpdateDateColumn()
  updatedDate: Date;
}
```

The model class `UserModel` has already generated common CURD data operation methods, including pagination.

In addition, the `koatty_typeorm` plugin will be automatically introduced in the `plugin` directory, which needs to be loaded in the plugin list.

### Using Model Classes

Inject through decorators in service classes or other components:

```typescript
@Autowired()
userModel: UserModel;
```

Get through the IOC container:

```typescript
this.userModel = IOCContainer.get("UserModel", "COMPONENT");
```

Call the model class method:

```typescript
this.userModel.Find();
```

### Configuration

Modify the database-related configuration items in the project's plugin configuration `config/plugin.ts`:

```typescript
// src/config/plugin.ts
export default {
  list: ['TypeormPlugin'], // List of loaded plugins
  config: { // Plugin configuration
    TypeormPlugin: {
      // Default configuration items
      "type": "mysql", // mysql, mariadb, postgres, sqlite, mssql, oracle, mongodb
      host: "127.0.0.1",
      port: 3306,
      username: "test",
      password: "test",
      database: "test",
      "synchronize": false, // true means entities will synchronize with the database every time
      "logging": true,
      "entities": [`${process.env.APP_PATH}/model/*`],
      "entityPrefix": ""
    },
  },
};
```

For easier management, we can also unify the database configuration to `config/db.ts` (you need to delete the `TypeormPlugin` configuration in `config/plugin.ts`):

```typescript
export default {
  /* database config */
  "DataBase": { // used by koatty_typeorm
    "type": "mysql",
    host: "${mysql_host}",
    port: "${mysql_port}",
    username: "${mysql_user}",
    password: "${mysql_pass}",
    database: "${mysql_database}",
    "synchronize": false,
    "logging": true,
    "entities": [`${process.env.APP_PATH}/model/*`],
    "entityPrefix": ""
  },
  
  "CacheStore": {
    type: "memory", // redis or memory
    // key_prefix: "koatty",
    // host: '127.0.0.1',
    // port: 6379,
    // name: "",
    // username: "",
    // password: "",
    // db: 0,
    // timeout: 30,
    // pool_size: 10,
    // conn_timeout: 30
  },
};
```

## Plugins

The plugin mechanism is to manage and orchestrate relatively independent business logic while ensuring that the core of the framework is sufficiently lean and stable.

### Why Do We Need Plugins?

In the process of using middleware, we found some problems:

- The positioning of middleware is to intercept user requests and do something before and after them, such as authentication, security checks, access logs, etc. However, in reality, some functions are unrelated to requests, such as scheduled tasks, message subscriptions, background logic, etc.
- Some functions contain very complex initialization logic that needs to be completed when the application starts. This is obviously not suitable for implementation in middleware.

In summary, we need a more powerful mechanism to manage and orchestrate those relatively independent business logics. Typical application scenarios include service registration discovery, pulling configurations from the configuration center, etc.

> In the framework's IOC container, plugins are a special type of `COMPONENT`.
> Plugins should try to maintain independence and not couple with other components.
> If necessary, plugins can call the persistence layer (operate databases and caches, etc.). However, they cannot call the service layer, middleware, or controllers, nor can they be called by other components.

### Creating Plugins

Plugins are generally reused through npm modules:

```bash
npm i koatty_apollo --save
```

Use `koatty_cli` to create a plugin class in the application:

```bash
kt plugin apollo
```

This will generate the plugin code template:

```typescript
import { Plugin } from 'koatty';
import { App } from '../App';
import { Apollo } from 'koatty_apollo';

@Plugin()
export class ApolloPlugin {
  run(options: any, app: App) {
    return Apollo(options, app);
  }
}
```

Then declare it in the application's `config/plugin.ts`:

```typescript
export default {
  list: ['ApolloPlugin'], // List of loaded plugins
  config: {
    'ApolloPlugin': {
      // Plugin configuration items
    }
  }
}
```

### Disabling Plugins

To disable a plugin in the project, simply modify the plugin configuration file:

```typescript
// src/config/plugin.ts
export default {
  list: [], // If ApolloPlugin is not in the list, the plugin will not execute
  config: {
    'ApolloPlugin': {...},
  }
}
```

# Advanced Features

## Parameter Validation

Parameter validation is a very common function in projects. Koatty has specially encapsulated a library `koatty_validation`, which can be easily used in projects. Koatty provides two schemes for parameter validation, suitable for different scenarios:

### Scheme One: Decorators `@Valid` and `@Validated`

`@Valid` and `@Validated` decorators are only applicable to controller classes.

```typescript
@RequestMapping('/')
// Check if the input parameter is an email
index(@RequestBody() @Valid("IsEmail") body: string): Promise<any> {
  return this.ok('Hi Koatty');
}
```

The `@Validated` decorator needs to be used with a DTO class:

```typescript
@RequestMapping('/SayHello')
@Validated() // DTO parameter validation decorator
SayHello(@RequestBody() params: SayHelloRequestDto): Promise<SayHelloReplyDto> {
  const res = new SayHelloReplyDto();
  return Promise.resolve(res);
}
```

Use the cli tool to create a DTO class:

```bash
kt dto SayHelloRequest
```

Add validation rules to the DTO class:

```typescript
@Component()
export class SayHelloRequestDto {
  @IsNotEmpty({ message: "Phone number cannot be empty" })
  phoneNum: string;
  
  // ...
}
```

### Scheme Two: `FunctionValidator` and `ClassValidator`

For bean parameter validation in non-controller types, we can use `FunctionValidator` and `ClassValidator`.

**FunctionValidator:**

```typescript
// Throw an error directly
FunctionValidator.IsNotEmpty(str, "cannot be empty");
FunctionValidator.Contains(str, {message: "must contain s", value: "s"});

// Return true or false
if (ValidFuncs.IsEmail(str)) {
  // ...
}
```

**ClassValidator:**

```typescript
class SchemaClass {
  @IsDefined
  id: number;
  
  @IsNotEmpty
  name: string;
}

const ins = new SchemaClass();
ins.name = "";
ClassValidator.valid(SchemaClass, ins, true).catch(err => {
  console.log(err);
})
```

### Validation Rules

`koatty_validation` defines a series of common [validation rules](https://github.com/Koatty/koatty_validation).

In addition to built-in rules, custom function validation can also be defined:

**Use custom functions with the `@Valid` decorator:**

```typescript
@Controller('/api/login')
export class LoginController {
  async GetSignout(
    @Header("X-User-Token") @Valid((value: unknown) => {
      return value !== undefined && value !== null;
    }, { message: "Value cannot be null or undefined"}) token: string
  ) {
    // do something
  }
}
```

**Use custom functions with the `@Validated` decorator:**

```typescript
@Controller('/api/login')
export class LoginController {
  @Validated()
  async GetSignout(@Post() someObj: ObjectDto) {
    // do something
  }
}

// class ObjectDto
export class ObjectDto {
  @CheckFunc((value: unknown)=> {
    return value !== undefined && value !== null;
  }, { message: "Username cannot be empty" })
  username: string;
}
```

**Custom validation in DTO classes:**

```typescript
@Controller('/api/login')
export class LoginController {
  @Validated()
  async GetSignout(@Post() someObj: ObjectDto) {
    // Call valid()
    if (!someObj.validUserName()) {
      throw new Exception("User is disabled", 1004, 200);
    }
  }
}

// class ObjectDto
export class ObjectDto {
  @IsDefined()
  username: string;

  validUserName(): boolean {
    return this.username === "test";
  }
}
```

## Exception Handling

Koatty framework encapsulates the `koatty_exception` component for handling errors that need to be thrown in the project, supporting customization of exception classes to handle different business exceptions.

### Core Features

- 🎯 **Unified Exception Handling** - Provides standardized exception handling mechanism
- 🔗 **Chained Exception Calls** - Support for method chaining, more elegant code
- 🌐 **Multi-Protocol Support** - Supports HTTP, gRPC, WebSocket multiple protocols
- 📊 **Observability** - Integrated with OpenTelemetry tracing
- 🔧 **Highly Configurable** - Supports custom log formats, error response formats, etc.
- 📝 **TypeScript Support** - Complete type definitions and type safety
- 🚀 **Zero Dependency Core** - Core functionality has no external dependencies
- 📦 **Decorator Pattern** - Uses `@ExceptionHandler` decorator to register exception handlers

### Exception Class Basic Usage

```typescript
import { Exception, Output, CommonErrorCode } from 'koatty_exception';

// Create basic exception
const error = new Exception('User not found', CommonErrorCode.RESOURCE_NOT_FOUND, 404);

// Chained call to set exception properties
const customError = new Exception('Validation failed')
  .setCode(CommonErrorCode.VALIDATION_ERROR)
  .setStatus(400)
  .setContext({
    requestId: 'req-123',
    path: '/api/users',
    method: 'POST'
  });

// Use Output class to format responses
const successResponse = Output.ok('Operation successful', { id: 1, name: 'John Doe' });
const errorResponse = Output.fail('Operation failed', null, 1001);
```

### Default Exception Handling

If no custom exception handling is defined in the application, exceptions thrown during program execution will be intercepted and handled uniformly by the framework's default interception mechanism. For example, throwing `Error`, the framework can still intercept it.

```typescript
// res: {"code":1,"message":"error"}
throw new Error("error");

// res: {"code":1000,"message":"error"}
throw new Exception("error", 1000);

// res: {"code":1000,"message":"error"}
ctx.throw("error", 1000);
```

### Custom Exception Handling

We can customize exception handling classes, which need to inherit from the `Exception` base class:

```typescript
@ExceptionHandler() // Register global exception handling
export class BusinessException1 extends Exception {
  // Handle exceptions uniformly in the handler
  async handler(ctx: KoattyContext): Promise<any> {
    // Return ctx.res.end for http protocol
    // Handle based on ctx.protocol for gRPC protocol
    return ctx.res.end(this.message);
  }
}

export class BusinessException2 extends Exception {
  // Handle exceptions uniformly in the handler
  async handler(ctx: KoattyContext): Promise<any> {
    return ctx.res.end({code: this.code, message: this.message});
  }
}
```

#### Advanced Custom Exception Handler

```typescript
import { Exception, ExceptionHandler } from 'koatty_exception';
import { KoattyContext } from 'koatty_core';

@ExceptionHandler()
export class ValidationException extends Exception {
  constructor(message: string, field?: string) {
    super(message, CommonErrorCode.VALIDATION_ERROR, 400);

    if (field) {
      this.setContext({ field });
    }
  }

  async handler(ctx: KoattyContext): Promise<any> {
    // Custom handling logic
    const response = {
      error: 'VALIDATION_ERROR',
      message: this.message,
      field: this.context?.field,
      timestamp: new Date().toISOString()
    };

    ctx.status = this.status;
    ctx.type = 'application/json';
    return ctx.res.end(JSON.stringify(response));
  }
}

// Use custom exception
throw new ValidationException('Email format is incorrect', 'email');
```

#### Multi-Protocol Exception Handling

```typescript
@ExceptionHandler()
export class MultiProtocolException extends Exception {
  async handler(ctx: KoattyContext): Promise<any> {
    // Handle differently based on protocol type
    if (ctx.protocol === 'grpc') {
      // gRPC protocol handling
      return {
        code: this.code,
        message: this.message
      };
    } else if (ctx.protocol === 'websocket') {
      // WebSocket protocol handling
      ctx.websocket.send(JSON.stringify({
        error: this.code,
        message: this.message
      }));
      return;
    } else {
      // HTTP protocol handling (default）
      ctx.status = this.status || 500;
      ctx.type = 'application/json';
      return ctx.res.end(JSON.stringify({
        code: this.code,
        message: this.message,
        context: this.context
      }));
    }
  }
}
```

In application code, we can throw different exceptions according to business logic:

```typescript
// res: {"code":1,"message":"error"}
throw new BusinessException1("error");

// res: {"code":1000,"message":"error"}
throw new BusinessException2("error", 1000);
```

### @Catch() Method Decorator

Starting from Koatty 4.0, `koatty_exception` provides the `@Catch()` method decorator for actively catching errors at the method level and converting them to Exception.

#### Basic Usage

```typescript
import { Catch, Exception } from 'koatty_exception';

@Service()
class UserService {

  // Usage 1: Basic - Catch all errors and convert to Exception
  @Catch()
  async findUser(id: string): Promise<User> {
    return await this.userRepository.findById(id);
  }

  // Usage 2: Specify error code and message (shorthand)
  @Catch(1001, 'User creation failed')
  async createUser(data: CreateUserDTO): Promise<User> {
    return await this.userRepository.create(data);
  }

  // Usage 3: Use custom Exception class (shorthand)
  @Catch(ValidationException)
  async validateUser(data: UserDTO): Promise<boolean> {
    return await this.validator.validate(data);
  }

  // Usage 4: Full configuration
  @Catch({
    code: 2001,
    status: 400,
    message: (err) => `Operation failed: ${err.message}`,
    exception: BusinessException,
  })
  async updateUser(id: string, data: UpdateUserDTO): Promise<User> {
    return await this.userRepository.update(id, data);
  }

  // Usage 5: Catch specific error types only
  @Catch([TypeError, RangeError], { code: 3001, message: 'Parameter type error' })
  async processData(data: unknown): Promise<void> {
    // Only catches TypeError and RangeError, other errors are re-thrown
  }
}
```

#### Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `code` | `number` | `1` | Business error code |
| `status` | `number` | `500` | HTTP status code |
| `message` | `string \| (err) => string` | Original error message | Error message (supports dynamic generation) |
| `exception` | `ExceptionConstructor` | `Exception` | Custom exception class |
| `catchTypes` | `ErrorType[]` | Catch all | Error types to catch |
| `transform` | `(ex, err) => ex` | - | Error transformation callback |
| `preserveStack` | `boolean` | `true` | Whether to preserve original stack trace |
| `suppress` | `boolean` | `false` | Whether to suppress error (don't throw) |

#### Use Cases

- **Unified Error Handling**: Catch and transform underlying errors uniformly in Service layer
- **Error Classification**: Convert different types of errors to corresponding business exceptions
- **Error Message Beautification**: Provide user-friendly error messages
- **Logging and Tracing**: Add context information via transform callback

### Global Exception Handling

Koatty provides a decorator `@ExceptionHandler()` to register global exception handling:

```typescript
@ExceptionHandler() // Register global exception handling
export class BusinessException extends Exception {
  // Handle exceptions uniformly in the handler
  async handler(ctx: KoattyContext): Promise<any> {
    // Return ctx.res.end for http protocol
    // Handle based on ctx.protocol for gRPC protocol
    return ctx.res.end(this.message);
  }
}
```

Global exception handling is registered only once, and multiple registrations will overwrite each other. After registering global exception handling, unless a different type of exception is explicitly thrown, all exceptions will be intercepted by the global exception handling class.

```typescript
async index(type: string) {
  if (type == '1') {
    // Specify BusinessException2 to handle exceptions
    // res: {"code":1000,"message":"error"}
    throw new BusinessException2("error", 1000);
  } else {
    // Not explicitly specified, handled by global exception handling
    // res: error
    throw new Error("error");
  }
}
```

## Log Handling

Koatty uses [koatty_logger](https://github.com/thinkkoa/koatty_logger) for logging. You can inject a logger instance into Controller, Service, and other classes via the `@Log()` property decorator, without manually calling `new Logger()`.

### Setup

If your application already uses koatty_container, the framework registers the `"Log"` decorator when initializing `PropertyDecoratorManager`; no extra setup is required. If you do not use the container, call this once at application entry:

```typescript
import { registerLogDecorator } from 'koatty_logger';
import { decoratorManager } from 'koatty_container';

registerLogDecorator(decoratorManager.property);
```

### Inject Global DefaultLogger

Use `@Log()` to inject the global default logger in a Controller or Service:

```typescript
import { Controller, GetMapping, QueryParam } from 'koatty_router';
import { Log } from 'koatty_logger';

@Controller('/api/users')
export class UserController {
  app: App;
  ctx: any;

  @Log()
  logger: any;

  @GetMapping('/')
  async getUsers(
    @QueryParam('page') page: number = 1,
    @QueryParam('limit') limit: number = 10
  ): Promise<any> {
    this.logger.info(`Get user list: page=${page}, limit=${limit}`);
    const result = await this.userService.findAll(page, limit);
    return { code: 200, message: 'OK', data: result };
  }
}
```

### Inject Custom Logger Instance

For a dedicated logger (e.g. different level or file path), pass `LoggerOpt`; the framework caches one instance per class + property:

```typescript
import { Log } from 'koatty_logger';

@Service()
export class MyService {
  @Log() logger: any;  // Global DefaultLogger

  @Log({ logLevel: 'debug', logFilePath: './logs/service.log' })
  debugLogger: any;  // Dedicated Logger instance
}
```

| Usage | Description |
|-------|-------------|
| `@Log()` | Assigns the global `DefaultLogger` singleton to the property |
| `@Log(options)` | Assigns a `new Logger(options)` instance to the property; same class+property share the same instance |

**Note:** When koatty_container is not used, `@Log()` has no effect and does not affect existing code.

## Caching

Koatty encapsulates a caching library [koatty_cacheable](https://github.com/koatty/koatty_cacheable), which supports memory and Redis storage. `koatty_cacheable` provides two decorators `CacheAble` and `CacheEvict`.

### 1. Generate Plugin Template

Use Koatty CLI to generate the plugin template:

```bash
kt plugin Cacheable
```

Create `src/plugin/Cacheable.ts`:

```typescript
import { Plugin, IPlugin, App } from "koatty";
import { KoattyCached } from "koatty_cacheable";

@Plugin()
export class Cacheable implements IPlugin {
  run(options: any, app: App) {
    return KoattyCached(options, app);
  }
}
```

### 2. Configure Plugin

Update `src/config/plugin.ts`:

```typescript
export default {
  list: ["Cacheable"], // Plugin loading order
  config: {
    Cacheable: {
      type: "memory", // Cache type: "redis" or "memory", default is "memory"
      db: 0,
      timeout: 30,
      // Redis configuration (when type is "redis")
      // key_prefix: "koatty",
      // host: '127.0.0.1',
      // port: 6379,
      // name: "",
      // username: "",
      // password: "",
      // pool_size: 10,
      // conn_timeout: 30
    }
  }
};
```

**Important Notes:**
- The plugin will automatically initialize the cache when the application starts
- Must provide correct cache configuration in the plugin configuration
- If the cache is not correctly initialized, decorated methods will execute directly without caching (graceful degradation)

### 3. Cache Usage

#### Basic Usage

```typescript
import { CacheAble, CacheEvict, GetCacheStore } from "koatty_cacheable";

@Service()
export class TestService {

    // Automatically cache method return value
    @CacheAble("testCache", {
        params: ["id"],    // Use id parameter as part of cache key
        timeout: 300       // Cache expiration time (seconds), default 300
    })
    async getTest(id: string){
        //todo
    }

    // Automatically clear related cache
    @CacheEvict("testCache", {
        params: ["id"],                    // Use id parameter to locate cache to clear
        delayedDoubleDeletion: true        // Enable delayed double deletion strategy, default true
    })
    async setTest(id: string){
        //todo
    }

    // Manual cache operations
    async test(){
        // Manually operate cache instance
        const store = await GetCacheStore(this.app);
        await store.set(key, value, 60);
        const value = await store.get(key);
        await store.del(key);
    }
}
```

#### Advanced Usage

```typescript
@Service()
export class ProductService {

    // No parameter cache
    @CacheAble("productStats")
    async getProductStats(): Promise<ProductStats> {
        return await this.calculateStats();
    }

    // Multi-parameter cache
    @CacheAble("productSearch", {
        params: ["category", "keyword"],
        timeout: 600
    })
    async searchProducts(category: string, keyword: string, page: number = 1): Promise<Product[]> {
        return await this.productRepository.search(category, keyword, page);
    }

    // Immediate cache clear (without delayed double deletion)
    @CacheEvict("productSearch", {
        params: ["category"],
        delayedDoubleDeletion: false
    })
    async updateProductCategory(category: string, updates: any): Promise<void> {
        await this.productRepository.updateCategory(category, updates);
    }
}
```

### API Reference

#### `@CacheAble(cacheName: string, options?)`

Automatically caches the method return value. When executing the method, it first checks the cache. If the cached result exists, it returns the result directly; otherwise, it executes and then returns and stores the result.

**Parameters:**
- `cacheName: string` - Cache name
- `options?: CacheAbleOpt` - Cache options
  - `params?: string[]` - Array of parameter names used as cache keys
  - `timeout?: number` - Cache expiration time (seconds), default 300

#### `@CacheEvict(cacheName: string, options?)`

Automatically clears method result cache.

**Parameters:**
- `cacheName: string` - Cache name to clear
- `options?: CacheEvictOpt` - Clear options
  - `params?: string[]` - Array of parameter names used to locate cache
  - `delayedDoubleDeletion?: boolean` - Whether to enable delayed double deletion strategy, default true

#### `GetCacheStore(app?)`

Gets the cache store instance, which can manually call `get`, `set`, and other methods to operate the cache.

**Parameters:**
- `app?: Application` - Koatty application instance

**Returns:** `Promise<CacheStore>`

### Cache Key Generation Rules

Cache keys are generated in the following format:
```
{cacheName}:{paramName1}:{paramValue1}:{paramName2}:{paramValue2}...
```

For example:
- `@CacheAble("user", {params: ["id"]})` + `getUserById("123")` → `user:id:123`
- When cache key length exceeds 128 characters, it will automatically use murmur hash for compression

### Delayed Double Deletion Strategy

Delayed double deletion is a strategy to solve cache consistency problems:

1. Delete cache immediately
2. Execute data update operation
3. Delete cache again after 5 seconds delay

This avoids dirty data in concurrent scenarios.

> Note: Decorators `@CacheAble` and `@CacheEvict` cannot be used for controller classes.

## Scheduled Tasks

Koatty encapsulates a scheduling task library [koatty_schedule](https://github.com/koatty/koatty_schedule), which supports cron expressions and distributed locks based on Redis.

### 1. Generate Plugin Template

Use Koatty CLI to generate the plugin template:

```bash
kt plugin Scheduled
```

Create `src/plugin/Scheduled.ts`:

```typescript
import { Plugin, IPlugin, App } from "koatty";
import { KoattyScheduled } from "koatty_schedule";

@Plugin()
export class Scheduled implements IPlugin {
  run(options: any, app: App) {
    return KoattyScheduled(options, app);
  }
}
```

### 2. Configure Plugin

Update `src/config/plugin.ts`:

```typescript
import { RedisMode } from "koatty_schedule";

export default {
  list: ["Scheduled"], // Plugin loading order
  config: {
    Scheduled: {
      timezone: "Asia/Shanghai",  // Global timezone configuration
      lockTimeOut: 10000,        // Lock timeout (ms)
      maxRetries: 3,             // Maximum retry count for acquiring lock
      retryDelayMs: 200,         // Retry delay (ms)
      redisConfig: {
        mode: RedisMode.STANDALONE,  // Redis mode: STANDALONE | SENTINEL | CLUSTER
        host: "127.0.0.1",
        port: 6379,
        db: 0,
        keyPrefix: "koatty:schedule:"
        // password: "your-password",  // Optional
      }
    }
  }
};
```

### 3. Basic Usage

#### Cron Expressions

Cron expressions support both 5-part and 6-part formats:

**6-part format (recommended, includes seconds):**
```
┌────────────── second (0-59)
│ ┌──────────── minute (0-59)
│ │ ┌────────── hour (0-23)
│ │ │ ┌──────── day of month (1-31)
│ │ │ │ ┌────── month (1-12 or JAN-DEC)
│ │ │ │ │ ┌──── day of week (0-7 or SUN-SAT, 0 and 7 are Sunday)
│ │ │ │ │ │
* * * * * *
```

**5-part format (without seconds):**
```
┌──────────── minute (0-59)
│ ┌────────── hour (0-23)
│ │ ┌──────── day of month (1-31)
│ │ │ ┌────── month (1-12 or JAN-DEC)
│ │ │ │ ┌──── day of week (0-7 or SUN-SAT)
│ │ │ │ │
* * * * *
```

#### Basic Scheduling

```typescript
import { Scheduled, RedLock } from "koatty_schedule";

@Service()
export class TestService {

    // Execute every minute
    @Scheduled("0 * * * * *")
    async test(){
        //todo
    }

    // Execute with specified timezone
    @Scheduled("0 0 2 * * *", "UTC") // Execute daily at 2 AM UTC
    async dailyTask(){
        //todo
    }
}
```

#### Distributed Lock

In some business scenarios, scheduled tasks cannot be executed concurrently, and the solution is to add a lock. `koatty_schedule` implements a distributed lock based on Redis.

```typescript
import { Scheduled, RedLock } from "koatty_schedule";

@Service()
export class TestService {

    @Scheduled("0 * * * * *")
    @RedLock("testCron") // Use default distributed lock configuration
    async test(){
        //todo
    }

    // Custom lock configuration
    @Scheduled("0 */10 * * * *")
    @RedLock("critical-task", {
        lockTimeOut: 30000,    // Lock timeout (ms)
        maxRetries: 5,         // Maximum retry count
        retryDelayMs: 500      // Retry delay (ms)
    })
    async criticalTask(){
        //todo
    }
}
```

### 4. Advanced Configuration

#### Redis Deployment Modes

koatty_schedule supports three Redis deployment modes:

**Standalone Mode (default):**

```typescript
import { RedisMode } from "koatty_schedule";

export default {
  config: {
    Scheduled: {
      redisConfig: {
        mode: RedisMode.STANDALONE,
        host: "127.0.0.1",
        port: 6379,
        password: "your-password",
        db: 0,
        keyPrefix: "koatty:schedule:"
      }
    }
  }
};
```

**Sentinel Mode (high availability):**

```typescript
import { RedisMode } from "koatty_schedule";

export default {
  config: {
    Scheduled: {
      redisConfig: {
        mode: RedisMode.SENTINEL,
        sentinels: [
          { host: "192.168.1.10", port: 26379 },
          { host: "192.168.1.11", port: 26379 },
          { host: "192.168.1.12", port: 26379 }
        ],
        name: "mymaster",  // Sentinel master name
        password: "your-password",
        sentinelPassword: "sentinel-password",  // Optional
        db: 0,
        keyPrefix: "koatty:schedule:"
      }
    }
  }
};
```

**Cluster Mode (horizontal scaling):**

```typescript
import { RedisMode } from "koatty_schedule";

export default {
  config: {
    Scheduled: {
      redisConfig: {
        mode: RedisMode.CLUSTER,
        nodes: [
          { host: "192.168.1.10", port: 7000 },
          { host: "192.168.1.11", port: 7001 },
          { host: "192.168.1.12", port: 7002 }
        ],
        redisOptions: {
          password: "your-password",
          db: 0
        },
        keyPrefix: "koatty:schedule:"
      }
    }
  }
};
```

#### Configuration Priority

The library uses a three-tier priority system for configuration:

1. **Method-level** (highest priority)
2. **Global plugin config**
3. **Built-in defaults** (lowest priority)

```typescript
// Method-level timezone overrides global config
@Scheduled('0 0 12 * * *', 'UTC')  // Uses UTC (method-level)
async task1() { ... }

@Scheduled('0 0 12 * * *')  // Uses global timezone from plugin config
async task2() { ... }
```

### 5. Health Check

```typescript
import { RedLocker } from "koatty_schedule";

@Service()
export class MonitoringService {
  
  @Scheduled('*/30 * * * * *') // Every 30 seconds
  async checkSystemHealth() {
    const redLocker = RedLocker.getInstance();
    const health = await redLocker.healthCheck();
    
    console.log('RedLock Status:', health.status);
    console.log('Connection Details:', health.details);
    
    if (health.status === 'unhealthy') {
      console.error('RedLock is unhealthy!', health.details);
    }
  }
}
```

### Notes

> Decorators `@Scheduled` and `@RedLock` cannot be used for controller classes; 
> 
> Configure corresponding parameters according to the duration of the scheduled task to prevent lock expiration
> 
> When the lock expires but the business logic has not been completed, the lock will automatically extend (up to 3 times). If the extension time expires and the business logic is still not completed, the lock will be released
> 
> Method-level configuration overrides global configuration, global configuration overrides default configuration

## Distributed Tracing and Performance Monitoring

Koatty starting from version 3.14.x integrates OpenTelemetry full-link tracing and Prometheus metrics export features.

### OpenTelemetry Tracing

Enable tracing configuration (in `config/config.ts` or middleware configuration):

```typescript
import { Trace } from 'koatty_trace';

app.use(Trace({
  enableTrace: true,
  timeout: 10000,
  requestIdHeaderName: 'X-Request-Id',
  
  // OpenTelemetry configuration
  opentelemetryConf: {
    endpoint: "http://localhost:4318/v1/traces", // OTLP endpoint
    enableTopology: false,            // Enable topology analysis
    headers: {},                      // OTLP request headers
    resourceAttributes: {             // Resource attributes
      'service.name': 'my-service',
      'service.version': '1.0.0'
    },
    samplingRate: 1.0,               // Sampling rate
    timeout: 10000,                  // Export timeout
    spanTimeout: 30000,              // Span timeout
    maxActiveSpans: 1000,            // Max active spans
  }
}, app));
```

### Prometheus Metrics Export

Enable multi-protocol metrics collection and export:

```typescript
import { Trace } from 'koatty_trace';

app.use(Trace({
  enableTrace: true,
  
  // Prometheus metrics configuration
  metricsConf: {
    metricsEndpoint: '/metrics',    // Metrics endpoint path
    metricsPort: 9464,             // Metrics service port
    reportInterval: 5000,          // Report interval (ms)
    defaultAttributes: {           // Default labels
      service: 'my-service',
      version: '1.0.0',
      environment: 'production'
    }
  }
}, app));
```

**Automatically Collected Metrics:**

#### 1. Total Requests (`requests_total`)
- **Type**: Counter
- **Description**: Total request statistics across all protocols
- **Labels**:
  - `method`: Request method (GET, POST, PUT, DELETE, etc.)
  - `status`: Status code (HTTP status code or gRPC status code)
  - `path`: Normalized request path (e.g., `/users/:id`)
  - `protocol`: Protocol type (`http`, `websocket`, `grpc`)
  - `compression`: Compression type (WebSocket: `deflate`/`none`, gRPC: `gzip`/`brotli`/`none`)
  - `grpc_service`: gRPC service name (gRPC protocol only)

#### 2. Total Errors (`errors_total`)
- **Type**: Counter
- **Description**: Error request statistics across all protocols
- **Labels**: Same as above, with additional `error_type`
  - HTTP/WebSocket: `client_error` (4xx), `server_error` (5xx)
  - gRPC: `grpc_error` (non-zero status code)

#### 3. Response Time (`response_time_seconds`)
- **Type**: Histogram
- **Description**: Request response time distribution across all protocols
- **Unit**: Seconds
- **Buckets**: [0.1, 0.5, 1, 2.5, 5, 10]

#### 4. WebSocket Connections (`websocket_connections_total`)
- **Type**: Counter
- **Description**: WebSocket connection statistics

**Access Metrics:**
```bash
curl http://localhost:9464/metrics
```

**Prometheus Configuration Example** (`prometheus.yml`):
```yaml
scrape_configs:
  - job_name: 'koatty-app'
    static_configs:
      - targets: ['localhost:9464']
    scrape_interval: 15s
    metrics_path: /metrics
```

**Grafana Query Examples:**
```promql
# Request QPS
rate(requests_total[5m])

# Error rate
rate(errors_total[5m]) / rate(requests_total[5m])

# Average response time
rate(response_time_seconds_sum[5m]) / rate(response_time_seconds_count[5m])

# P95 response time
histogram_quantile(0.95, rate(response_time_seconds_bucket[5m]))
```

## gRPC

Koatty supports gRPC services starting from version 3.4.x.

### Proto Protocol

Use the `koatty_cli` command line tool (>=3.4.6):

```bash
kt proto hello
```

This will automatically create `src/resource/proto/Hello.proto`. Modify according to actual situation.

### gRPC Protocol Controller

Use the `koatty_cli` command line tool (>=3.4.6):

**Single module mode:**

```bash
kt controller -t grpc hello
```

This will automatically create `src/controller/HelloController.ts`.

**Multi-module mode:**

```bash
kt controller -t grpc admin/hello
```

This will automatically create `src/controller/Admin/HelloController.ts`.

The controller template code is as follows:

```typescript
import { KoattyContext, GrpcController, Autowired, PostMapping, RequestBody, Validated } from 'koatty';
import { App } from '../App';
import { SayHelloRequestDto } from '../dto/SayHelloRequestDto';
import { SayHelloReplyDto } from '../dto/SayHelloReplyDto';

@GrpcController('/Hello') // Consistent with proto.service name
export class HelloController {
  app: App;
  ctx: KoattyContext;

  constructor(ctx: KoattyContext) {
    this.ctx = ctx;
  }

  /**
   * SayHello interface
   * Access path: grpc://127.0.0.1/Hello/SayHello
   */
  @PostMapping('/SayHello') // Consistent with proto.service.method name
  @Validated() // Parameter validation
  SayHello(@RequestBody() params: SayHelloRequestDto): Promise<SayHelloReplyDto> {
    const res = new SayHelloReplyDto();
    res.message = `Hello, ${params.name}!`;
    return Promise.resolve(res);
  }
}
```

In addition to the controller file, Koatty will also automatically create RPC protocol input and output DTO classes, such as the aforementioned `SayHelloRequestDto` and `SayHelloReplyDto`.

### Service Configuration

Modify `config/server.ts`:

```typescript
// config/server.ts
export default {
  hostname: '127.0.0.1',
  port: 50051,
  protocol: "grpc", // Server protocol: 'http' | 'https' | 'http2' | 'grpc' | 'ws' | 'wss' | 'graphql'
  trace: false,
}
```

Modify `config/router.ts`:

```typescript
// config/router.ts
export default {
    // Protocol-specific extension configuration (using protocol name as key)
    ext: {
        grpc: {
            protoFile: process.env.APP_PATH + "resource/proto/Hello.proto", // gRPC proto file
            poolSize: 10,
            streamConfig: {
                maxConcurrentStreams: 50,
                streamTimeout: 60000
            }
        }
    }
}
```

OK, now you can start a gRPC server.

## WebSocket

Koatty supports WebSocket services starting from version 3.4.x.

### WebSocket Protocol Controller

Use the `koatty_cli` command line tool (>=3.4.6):

**Single module mode:**

```bash
kt controller -t ws request
```

This will automatically create `src/controller/RequestController.ts`.

**Multi-module mode:**

```bash
kt controller -t ws admin/request
```

This will automatically create `src/controller/Admin/RequestController.ts`.

The controller template code is as follows:

```typescript
import { KoattyContext, WsController, GetMapping, RequestBody, Valid } from 'koatty';
import { App } from '../App';

@WsController('/request')
export class RequestController {
  app: App;
  ctx: KoattyContext;

  constructor(ctx: KoattyContext) {
    this.ctx = ctx;
  }

  /**
   * index interface
   * Access path: ws://127.0.0.1/request
   */
  @GetMapping('/')
  index(@RequestBody() @Valid("IsEmail") body: string): Promise<any> {
    return this.ok('Hi Koatty');
  }
}
```

### Service Configuration

Modify `config/server.ts`:

```typescript
// config/server.ts
export default {
  hostname: '127.0.0.1',
  port: 3000,
  protocol: "ws", // Server protocol: 'http' | 'https' | 'http2' | 'grpc' | 'ws' | 'wss' | 'graphql'
  trace: false,
}
```

Optional: Modify `config/router.ts` to configure WebSocket extension parameters:

```typescript
// config/router.ts
export default {
    ext: {
        ws: {
            maxFrameSize: 1024 * 1024,     // Max frame size 1MB
            heartbeatInterval: 15000,       // Heartbeat interval 15s
            heartbeatTimeout: 30000,        // Heartbeat timeout 30s
            maxConnections: 1000            // Max connections
        }
    }
}
```

OK, now you can start a WebSocket server.

## Event Mechanism

During the application startup process, the `app` object in the Koatty framework defines a series of events in addition to the events inherent in Koa itself:

![Event Timeline](https://cdn.jsdelivr.net/gh/Koatty/koatty_doc@master/docs/assets/event.png)

> Note: The `appStart` event is triggered after the service starts.

We can bind to different events according to project needs. For example, in the scenario of service registration discovery, if hardware failure occurs, you can bind to the `appStop` event to handle service deregistration.

```typescript
app.once("appStop", () => {
  // Deregister service
  // ...
})
```

### bootFunc

The role of the `@Bootstrap` decorator is to declare the project entry class, which supports passing a function as a parameter. This function will be executed first when the project starts.

```typescript
@Bootstrap(
  // bootstrap function
  (app: any) => {
    // todo
  }
)
export class App extends Koatty {
  // ...
}
```

Common application scenarios are to handle some runtime environment settings before startup, such as `NODE_ENV`. The startup function supports asynchronous execution.

> Note: The startup function is executed after the framework's `initialize` initialization, at which point the framework's related path attributes (`appPath`, `rootPath`, etc.) and `process.env` have been loaded and set, but other components (plugins, middleware, controllers, etc.) have not been loaded. Be aware when defining the startup function.

### @OnEvent Decorator (4.0 New)

Starting from Koatty 4.0, the `@OnEvent` decorator is added for binding methods to application lifecycle events in `@Component` or `@Plugin` classes. This provides a more intuitive and declarative way to handle application lifecycle.

**Supported Event Types (AppEvent):**

| Event Name | Trigger Time | Description |
| ---------- | ------------ | ----------- |
| `appBoot` | After app initialization | Configuration loaded, components not yet loaded |
| `loadServe` | When server loads | Create server instance |
| `loadRouter` | When router loads | Initialize routing |
| `appReady` | Application ready | All components loaded, server about to start |
| `appStart` | Application started | Server started, accepting requests |
| `appStop` | Application stopping | Graceful shutdown, cleanup resources |

**Usage Example:**

```typescript
import { Component, OnEvent, AppEvent, KoattyApplication } from "koatty";

@Component("MyComponent", { 
  scope: 'user', 
  priority: 50,
  description: 'Custom component example'
})
export class MyComponent {
  
  // Execute when router loads
  @OnEvent(AppEvent.loadRouter)
  async initRouter(app: KoattyApplication) {
    console.log('Initializing router...');
    // Custom router initialization logic
  }
  
  // Execute when application is ready
  @OnEvent(AppEvent.appReady)
  async onReady(app: KoattyApplication) {
    console.log('Application ready');
    // Service registration, connection pool initialization, etc.
  }
  
  // Execute when application stops
  @OnEvent(AppEvent.appStop)
  async cleanup(app: KoattyApplication) {
    console.log('Cleaning up resources...');
    // Close connections, release resources
  }
}
```

**Can also be used in bootstrap class:**

```typescript
// src/bootstrap/TestBootStrap.ts
import { Component, OnEvent, AppEvent, KoattyApplication, Logger } from "koatty";

@Component()
export class TestBootStrap {
  
  @OnEvent(AppEvent.appBoot)
  async onBoot(app: KoattyApplication) {
    Logger.Info('Application booting...');
    // Initialize environment configuration
  }
  
  @OnEvent(AppEvent.appStart)
  async onStart(app: KoattyApplication) {
    Logger.Info('Application started');
    // Service registration, health checks, etc.
  }
}
```

**Important Restrictions:**

- `@OnEvent` decorator can **only** be used in `@Component` or `@Plugin` decorated classes
- Cannot be used in `@Controller`, `@Service`, `@Middleware`, or other types of Beans
- If used in unsupported types, the framework will throw an error

```typescript
// ❌ Wrong usage - Cannot use in Controller
@Controller('/api')
export class UserController {
  @OnEvent(AppEvent.appReady)  // Will throw error
  async onReady() {}
}

// ✅ Correct usage - Use in Component
@Component()
export class UserComponent {
  @OnEvent(AppEvent.appReady)  // Correct
  async onReady() {}
}
```

## Loading Customizations

The entry class of the project can also set two other decorators:

- **`@ComponentScan('./')`**: Declares the directory of project components, default is the project `src` directory, containing all types of components.
- **`@ConfigurationScan('./config')`**: Declares the directory of project configuration files, default is `src/config` directory.

## IOC Container

IoC stands for Inversion of Control. In ES6 Class-style programming, simply creating instances through `new` reveals the following disadvantages:

- To instantiate a component, you must first instantiate dependent components, leading to tight coupling.
- Each component needs to instantiate a dependent component, without reuse.
- Many components need to be destroyed to release resources, such as DataSource. However, if the component is shared by multiple components, how to ensure that all users have been destroyed.
- As more components are introduced, it becomes more difficult to write shared components, and the dependency relationships between them become more complex.

If a system has a large number of components, if the lifecycle and interdependent relationships of these components are maintained by the components themselves, it not only greatly increases the complexity of the system but also leads to extremely tight coupling between components, which brings great difficulties to testing and maintenance.

Therefore, the core issues are:

1. Who is responsible for creating components?
2. Who is responsible for assembling components according to dependency relationships?
3. How to correctly destroy components in order of dependency when destroying?

The core solution to this problem is IoC. Referring to the implementation mechanism of Spring IoC, Koatty implements an IOC container (`koatty_container`), which automatically classifies and loads components at startup and injects corresponding dependencies according to dependency relationships. Therefore, IoC is also known as Dependency Injection (DI: Dependency Injection), which solves one of the main problems: separating the creation and configuration of components from their use, and managing the lifecycle of components by the IoC container.

### Performance Optimization Features (3.14.x New)

**Intelligent Metadata Cache:**
- ✅ **LRU Cache Mechanism** - Significantly improves performance, reduces reflection operations by 70%+
- ✅ **Metadata Preloading** - Preload at startup, optimize component registration
- ✅ **Version Conflict Detection** - Automatically detect and resolve dependency version conflicts
- ✅ **Circular Dependency Detection** - Circular dependency detection and resolution suggestions

```typescript
// In Loader.ts - Metadata is now preloaded for optimal performance
IOC.preloadMetadata(); // Preload all metadata to populate cache

// Intelligent caching reduces reflect operations by 70%+
// Cache hits: ~95% in typical applications
```

**Performance Improvements:**
- Reflection operations reduced by 70%+
- Metadata access cache hit rate ~95%
- Startup performance improvement 40%+
- Runtime performance improvement 30%+

### Component Classification

According to different application scenarios of components, Koatty divides Beans into four types: `COMPONENT`, `CONTROLLER`, `MIDDLEWARE`, `SERVICE`.

- **COMPONENT**: Extension classes, third-party classes belong to this type, such as Plugins, ORM persistence layers, etc.
- **CONTROLLER**: Controller classes
- **MIDDLEWARE**: Middleware classes
- **SERVICE**: Service classes

### Component Loading

Through the core Loader of the Koatty framework, components are automatically analyzed and assembled at project startup, and the dependency issues between components are automatically handled. The IOC container provides a series of API interfaces for convenient registration and retrieval of assembled Beans.

### Circular Dependencies

As the scale of the project expands, circular dependencies are easily introduced. The approach of `koatty_container` to solve circular dependencies is lazy loading. `koatty_container` binds an `appReady` event on the `app`, which is used for lazy loading of beans that produce circular dependencies. Attention needs to be paid when using IOC:

```typescript
app.emit("appReady");
```

Note: Although lazy loading can solve most scenarios of circular dependencies, it may still fail to assemble in extreme cases. Solutions:

1. Try to avoid circular dependencies; introduce new third-party common classes to decouple mutually dependent classes.
2. Use the IOC container to get the prototype of the class (`getClass`) and instantiate it manually.

## AOP Aspects

Koatty implements an aspect-oriented programming mechanism based on the IOC container, using decorators and built-in special methods. Encapsulation is achieved through nested functions, which is simple and efficient.

### Pointcut Declaration Types

**Decorator Declaration:**
Use `@Before`, `@After`, `@BeforeEach`, `@AfterEach` decorators to declare pointcuts.

**Built-in Method Declaration:**
Use `__before`, `__after` built-in hidden methods to declare pointcuts.

### Differences Between Declaration Methods

| Declaration Method | Dependency on Aspect Class | Can Use Class Scope | Parameter Dependency | Priority | Usage Restrictions |
|--------------------|---------------------------|---------------------|---------------------|----------|-------------------|
| Decorator Declaration | Depends | No | Yes | Low | Can be used for all types of beans |
| Built-in Method Declaration | Does not depend | Yes | No | High | Only usable for CONTROLLER type beans |

> Dependency on Aspect Class: Requires the creation of a corresponding Aspect aspect class to use.
> Can Use Class Scope: Can or cannot use the `this` pointer of the class where the pointcut is located.
> Parameter Dependency: Decorator declaration pointcuts share parameters with the method; built-in method declaration pointcuts can use `this` to access any property of the class, more flexible.

**Note:** If a class uses the decorator `@BeforeEach` and this class also contains the `__before` method (whether it is its own or inherited from the parent class), then the `__before` method has higher priority than the decorator, and the class's decorator `@BeforeEach` is invalid (`@AfterEach` and `__after` are the same).

For example:

```typescript
@Controller('/')
export class TestController {
  app: App;
  ctx: KoattyContext;

  @Autowired()
  protected TestService: TestService;

  // Does not depend on the Aspect aspect class
  async __before(): Promise<any> {
    // Does not depend on specific method parameters
    // Can use class scope through this pointer
    console.log(this.app);
    console.log(this.ctx);
  }

  @Before("TestAspect") // Depends on TestAspect aspect class
  async test(path: string) {
    // ...
  }
}
```

### Creating Aspect Classes

Use `koatty_cli` to create:

```bash
kt aspect test
```

This will automatically generate the template code:

```typescript
import { Aspect } from "koatty";
import { App } from '../App';

@Aspect()
export class TestAspect {
  app: App;

  run() {
    console.log('TestAspect');
  }
}
```

## Decorators

Koatty framework provides rich decorators to simplify development. Decorators are categorized by scope: Class Decorators, Property Decorators, Method Decorators, and Parameter Decorators.

### Class Decorators

#### Core Decorators

| Decorator Name | Parameters | Description | Remarks |
| -------------- | ---------- | ----------- | ------- |
| `@Bootstrap()` | `bootFunc?: (...args: any[]) => any` - Function to execute before startup | Declare the class as a startup class, the entry file of the project. Startup class must inherit from `Koatty` | Only for startup classes |
| `@ComponentScan()` | `scanPath?: string \| string[]` - Scan directory | Define directories for auto-loading into container, default scans `src` directory | Only for startup classes |
| `@ConfigurationScan()` | `scanPath?: string \| string[]` - Config file directory | Define config file directories, default `./config` | Only for startup classes |

#### Component Decorators

| Decorator Name | Parameters | Description | Remarks |
| -------------- | ---------- | ----------- | ------- |
| `@Component()` | `identifier?: string` - IOC container identifier<br>`options?: IComponentOptions` - Config options:<br>- `enabled?: boolean` Whether enabled (default true)<br>- `priority?: number` Load priority (default 0)<br>- `scope?: 'core' \| 'user'` Component scope<br>- `requires?: string[]` Dependent component names<br>- `version?: string` Component version<br>- `description?: string` Component description | Define class as a component. Can be used with `@OnEvent` decorator for lifecycle event binding | For third-party modules or extensions |
| `@Plugin()` | `identifier?: string` - IOC identifier (must end with "Plugin")<br>`options?: IPluginOptions` - Same as `@Component` | Define class as a plugin. Plugin must implement `run(options, app)` method | Only for plugin classes |
| `@Service()` | `identifier?: string` - IOC identifier<br>`options?: object` - Optional config | Define class as a service class | Only for service classes |
| `@Middleware()` | `identifier?: string` - Custom identifier<br>`options?: IMiddlewareOptions` - Config options:<br>- `protocol?: string \| string[]` Protocol list<br>- `priority?: number` Priority (default 50)<br>- `enabled?: boolean` Whether enabled (default true) | Define class as middleware. Can specify `protocol` to limit effective protocols | Only for middleware classes |

#### Controller Decorators

| Decorator Name | Parameters | Description | Remarks |
| -------------- | ---------- | ----------- | ------- |
| `@Controller()` | `path?: string` - Route path (default "/")<br>`options?: IControllerOptions` - Config options:<br>- `middleware?: Function[]` Controller-level middleware | Define HTTP/HTTPS/HTTP2 controller class | Only for HTTP controllers |
| `@GrpcController()` | `path?: string` - Route path (must match proto service name)<br>`options?: IExtraControllerOptions` - Config options:<br>- `middleware?: Function[]` Controller-level middleware | Define gRPC controller class | Only for gRPC controllers |
| `@WebSocketController()` | `path?: string` - Route path<br>`options?: IExtraControllerOptions` | Define WebSocket controller class | Only for WebSocket controllers |
| `@GraphQLController()` | `path?: string` - Route path<br>`options?: IControllerOptions` | Define GraphQL controller class | Only for GraphQL controllers |

#### AOP Class Decorators

> Note: AOP also has method-level decorators `@Before`, `@After`, `@Around`, see "Method Decorators" section below.

| Decorator Name | Parameters | Description | Remarks |
| -------------- | ---------- | ----------- | ------- |
| `@Aspect()` | `identifier?: string` - IOC identifier | Declare aspect class. Class name must end with "Aspect", must implement `run` method | Only for aspect classes |
| `@BeforeEach()` | `aopName: ClassOrString` - Aspect class name or class<br>`options?: any` - Optional config | Execute aspect before each method in class (excluding constructor/init/__before/__after) | Class decorator |
| `@AfterEach()` | `aopName: ClassOrString` - Aspect class name or class<br>`options?: any` - Optional config | Execute aspect after each method in class | Class decorator |
| `@AroundEach()` | `aopName: ClassOrString` - Aspect class name or class<br>`options?: any` - Optional config | Wrap execution of each method in class | Class decorator |

#### Other Class Decorators

| Decorator Name | Parameters | Description | Remarks |
| -------------- | ---------- | ----------- | ------- |
| `@ExceptionHandler()` | None | Define global exception handling class. Class must inherit `Exception` and implement `handler` method | Only for exception handling classes |


### Property Decorators

| Decorator Name | Parameters | Description | Remarks |
| -------------- | ---------- | ----------- | ------- |
| `@Autowired()` | `paramName?: ClassOrString` - Dependency class or identifier<br>`cType?: string` - Component type (default "COMPONENT")<br>`constructArgs?: any[]` - Constructor arguments<br>`isDelay?: boolean` - Whether to delay load (default false) | Auto-inject dependency from IOC container. Cannot inject CONTROLLER type | Property decorator |
| `@Config()` | `key?: string` - Config key<br>`type?: string` - Config type (default "config") | Inject config value. Type corresponds to config file name, e.g., "db" for db.ts | Property decorator |
| `@Values()` | `value: unknown \| Function` - Property value or function returning value<br>`defaultValue?: unknown` - Default value | Dynamically set property value. Performs type checking | Property decorator |
| `@Log()` | None | Inject global DefaultLogger singleton. Requires koatty_container | Property decorator |
| `@Log(options)` | `options?: LoggerOpt` - Optional config (logLevel, logFilePath, sensFields, batchConfig, etc.) | Inject a `new Logger(options)` instance, cached per class+property | Property decorator |
| `@IsDefined()` / `@Expose()` | None | Mark property as defined, for exporting in validation | Validation decorator |


### Method Decorators

#### Lifecycle Decorators

| Decorator Name | Parameters | Description | Remarks |
| -------------- | ---------- | ----------- | ------- |
| `@OnEvent()` | `event: AppEvent` - Event type:<br>- `AppEvent.appBoot` After app initialization<br>- `AppEvent.loadServe` When server loads<br>- `AppEvent.loadRouter` When router loads<br>- `AppEvent.appReady` Application ready<br>- `AppEvent.appStart` Application started<br>- `AppEvent.appStop` Application stopping | Bind method to application lifecycle event | Only for `@Component` or `@Plugin` classes |

#### AOP Method Decorators

For single method aspect declaration. Unlike class-level `@BeforeEach`/`@AfterEach`/`@AroundEach`, these decorators only apply to the decorated method.

| Decorator Name | Parameters | Description | Remarks |
| -------------- | ---------- | ----------- | ------- |
| `@Before()` | `aopName: ClassOrString` - Aspect class name or class<br>`options?: any` - Optional config | Execute aspect's `run` method before method execution | Method decorator |
| `@After()` | `aopName: ClassOrString` - Aspect class name or class<br>`options?: any` - Optional config | Execute aspect's `run` method after method execution | Method decorator |
| `@Around()` | `aopName: ClassOrString` - Aspect class name or class<br>`options?: any` - Optional config | Wrap method execution, aspect's `run` receives `proceed` function | Method decorator |

**AOP Decorator Comparison:**

| Decorator | Type | Scope | Use Case |
| --------- | ---- | ----- | -------- |
| `@Before()` | Method decorator | Single method | Pre-processing for specific method |
| `@After()` | Method decorator | Single method | Post-processing for specific method |
| `@Around()` | Method decorator | Single method | Wrap specific method, control execution flow |
| `@BeforeEach()` | Class decorator | All methods in class | Unified pre-processing for all methods |
| `@AfterEach()` | Class decorator | All methods in class | Unified post-processing for all methods |
| `@AroundEach()` | Class decorator | All methods in class | Wrap all methods in class |

#### Route Decorators

| Decorator Name | Parameters | Description | Remarks |
| -------------- | ---------- | ----------- | ------- |
| `@RequestMapping()` | `path?: string` - Route path (default "/")<br>`reqMethod?: RequestMethod` - Request method (default GET)<br>`routerOptions?: object` - Config options:<br>- `routerName?: string` Route name<br>- `middleware?: Function[] \| MiddlewareDecoratorConfig[]` Method-level middleware | Bind route to method | Only for controller methods |
| `@GetMapping()` | `path?: string` - Route path<br>`routerOptions?: RouterOption` | Bind GET route | Only for controller methods |
| `@PostMapping()` | `path?: string` - Route path<br>`routerOptions?: RouterOption` | Bind POST route | Only for controller methods |
| `@PutMapping()` | `path?: string` - Route path<br>`routerOptions?: RouterOption` | Bind PUT route | Only for controller methods |
| `@DeleteMapping()` | `path?: string` - Route path<br>`routerOptions?: RouterOption` | Bind DELETE route | Only for controller methods |
| `@PatchMapping()` | `path?: string` - Route path<br>`routerOptions?: RouterOption` | Bind PATCH route | Only for controller methods |
| `@OptionsMapping()` | `path?: string` - Route path<br>`routerOptions?: RouterOption` | Bind OPTIONS route | Only for controller methods |
| `@HeadMapping()` | `path?: string` - Route path<br>`routerOptions?: RouterOption` | Bind HEAD route | Only for controller methods |

#### Validation Decorators

| Decorator Name | Parameters | Description | Remarks |
| -------------- | ---------- | ----------- | ------- |
| `@Validated()` | `isAsync?: boolean` - Whether async mode (default true) | Auto-validate DTO objects in method parameters | Only for controller methods |

#### Exception Handling Decorators

| Decorator Name | Parameters | Description | Remarks |
| -------------- | ---------- | ----------- | ------- |
| `@Catch()` | No parameters | Catch all errors and convert to Exception | Method decorator |
| `@Catch()` | `exception: ExceptionConstructor` - Custom exception class | Use specified Exception class to handle errors | Method decorator |
| `@Catch()` | `code: number, message?: string` - Error code and message | Specify error code and message | Method decorator |
| `@Catch()` | `options: CatchOptions` - Full configuration | Full config mode, supports code/status/message/exception/catchTypes/transform/preserveStack/suppress | Method decorator |
| `@Catch()` | `errorTypes: ErrorType[], options?: CatchOptions` | Catch specific error types only | Method decorator |

#### Cache Decorators

| Decorator Name | Parameters | Description | Remarks |
| -------------- | ---------- | ----------- | ------- |
| `@CacheAble()` | `cacheName: string` - Cache name<br>`options?: CacheAbleOpt` - Config options:<br>- `params?: string[]` Parameter names for cache key<br>- `timeout?: number` Expiration time (seconds, default 300) | Auto-cache method return value | Only for SERVICE/COMPONENT classes |
| `@CacheEvict()` | `cacheName: string` - Cache name<br>`options?: CacheEvictOpt` - Config options:<br>- `params?: string[]` Parameter names to locate cache<br>- `delayedDoubleDeletion?: boolean` Enable delayed double deletion (default true)<br>- `delayTime?: number` Delay time (ms, default 5000) | Clear method-related cache | Only for SERVICE/COMPONENT classes |

#### Scheduled Task Decorators

| Decorator Name | Parameters | Description | Remarks |
| -------------- | ---------- | ----------- | ------- |
| `@Scheduled()` | `cron: string` - Cron expression (5 or 6 parts)<br>`timezone?: string` - Timezone (default 'Asia/Beijing') | Define scheduled execution method | Only for SERVICE/COMPONENT classes |
| `@RedLock()` | `lockName?: string` - Lock name (auto-generated if not provided)<br>`options?: RedLockMethodOptions` - Config options:<br>- `lockTimeOut?: number` Lock timeout (ms)<br>- `maxRetries?: number` Max retry count<br>- `retryDelayMs?: number` Retry delay (ms) | Acquire distributed lock before method execution | Only for SERVICE/COMPONENT classes |


### Parameter Decorators

#### Request Parameter Decorators

| Decorator Name | Parameters | Description | Remarks |
| -------------- | ---------- | ----------- | ------- |
| `@Header()` | `name?: string` - Parameter name<br>`defaultValue?: any` - Default value | Get request header. Without name, gets all headers | Only for controller method parameters |
| `@PathVariable()` | `name?: string` - Parameter name<br>`defaultValue?: any` - Default value | Get route parameter (ctx.params) | Only for controller method parameters |
| `@Get()` | `name?: string` - Parameter name<br>`defaultValue?: any` - Default value | Get querystring parameter (ctx.query) | Only for controller method parameters |
| `@Post()` | `name?: string` - Parameter name<br>`defaultValue?: any` - Default value | Get POST request body parameter | Only for controller method parameters |
| `@File()` | `name?: string` - File name<br>`defaultValue?: any` - Default value | Get uploaded file object | Only for controller method parameters |
| `@RequestBody()` / `@Body()` | None | Get complete request body (including body and file) | Only for controller method parameters |
| `@RequestParam()` / `@Param()` | None | Get merged query and path parameters | Only for controller method parameters |

#### Validation Decorators

| Decorator Name | Parameters | Description | Remarks |
| -------------- | ---------- | ----------- | ------- |
| `@Valid()` | `rule: ValidRules \| Function` - Validation rule or custom function<br>`options?: string \| ValidOtpions` - Error message or config | Validate single parameter | Only for controller method parameters |

#### Dependency Injection Decorators

| Decorator Name | Parameters | Description | Remarks |
| -------------- | ---------- | ----------- | ------- |
| `@Inject()` | `paramName?: ClassOrString` - Dependency class or identifier<br>`cType?: string` - Component type (default "COMPONENT") | Inject dependency through constructor parameter | Only for constructor parameters |


### Validation Rule Decorators

Decorators for DTO class property validation (used with `@Validated()`):

#### Chinese Validation Decorators

| Decorator Name | Description |
| -------------- | ----------- |
| `@IsCnName()` | Validate Chinese name |
| `@IsIdNumber()` | Validate ID number |
| `@IsMobile()` | Validate mobile number |
| `@IsZipCode()` | Validate zip code |
| `@IsPlateNumber()` | Validate license plate number |

#### General Validation Decorators

| Decorator Name | Parameters | Description |
| -------------- | ---------- | ----------- |
| `@IsNotEmpty()` | `options?: ValidationOptions` | Validate not empty |
| `@IsEmail()` | `options?: IsEmailOptions, validationOptions?: ValidationOptions` | Validate email |
| `@IsIP()` | `version?: any, validationOptions?: ValidationOptions` | Validate IP address |
| `@IsPhoneNumber()` | `region?: CountryCode, validationOptions?: ValidationOptions` | Validate international phone number |
| `@IsUrl()` | `options?: IsURLOptions, validationOptions?: ValidationOptions` | Validate URL |
| `@IsHash()` | `algorithm: HashAlgorithm, validationOptions?: ValidationOptions` | Validate hash value |
| `@IsDate()` | `options?: ValidationOptions` | Validate date |

#### Numeric Comparison Decorators

| Decorator Name | Parameters | Description |
| -------------- | ---------- | ----------- |
| `@Gt()` | `min: number` | Greater than |
| `@Gte()` | `min: number` | Greater than or equal |
| `@Lt()` | `max: number` | Less than |
| `@Lte()` | `max: number` | Less than or equal |
| `@Equals()` | `comparison: any` | Equals |
| `@NotEquals()` | `comparison: any` | Not equals |

#### String Validation Decorators

| Decorator Name | Parameters | Description |
| -------------- | ---------- | ----------- |
| `@Contains()` | `seed: string` | Contains string |
| `@IsIn()` | `possibleValues: any[]` | In array |
| `@IsNotIn()` | `possibleValues: any[]` | Not in array |


### Route Middleware Helper Function

#### withMiddleware()

Create advanced middleware configuration with priority, conditional execution, and metadata support:

```typescript
import { withMiddleware, GetMapping } from "koatty";

@Controller('/api')
export class UserController {
  
  @GetMapping('/users', {
    middleware: [
      withMiddleware(AuthMiddleware, { 
        priority: 100,           // Priority, higher executes first
        enabled: true,           // Whether enabled
        conditions: [            // Conditional execution
          { type: 'header', value: 'authorization', operator: 'contains' }
        ],
        metadata: { role: 'admin' }  // Metadata passed to middleware
      }),
      withMiddleware(RateLimitMiddleware, { 
        priority: 90,
        metadata: { limit: 100, window: 60000 }
      })
    ]
  })
  async getUsers() {
    return 'users list';
  }
}
```

# Programming Standards and Conventions

Koatty follows the principle that conventions are more important than configuration. To standardize project code and improve robustness, some default standards and conventions have been made.

## Koatty Framework and Peripheral Component Version Definition

- **Minor version**: e.g., `1.1.1 => 1.1.2` (minor feature additions, bug fixes, etc., downward compatible with 1.1.x)
- **Middle version**: e.g., `1.1.0 => 1.2.0` (larger feature additions, partial module refactoring, etc. Mainly downward compatible, may have a small number of features incompatible)
- **Major version**: e.g., `1.0.0 => 2.0.0` (overall design, refactoring, etc. of the framework, not downward compatible)
- **Stable version**: Even-numbered versions at the end are stable versions, odd-numbered versions are unstable versions.

## Programming Style

**Use Class-Style Programming**

Including Controller, Service, Model, etc., use `Class` instead of `function` to organize code. Excludes configurations, tools, function libraries, third-party libraries, etc.

**Single File Only Exports One Class**

In the project, a single `.ts` file only exports once and exports a `Class`. Excludes configurations, tools, function libraries, third-party libraries, etc.

**Class Names Must Be the Same as File Names**

People familiar with JAVA will not be unfamiliar with this. The class name must be the same as the file name to maintain uniqueness in the IOC container and prevent class overwriting.

**No Duplicate Classes of the Same Type Are Allowed**

Koatty divides Beans in the IOC container into four types: `COMPONENT`, `CONTROLLER`, `MIDDLEWARE`, `SERVICE`.

Beans of the same type cannot have the same class name, otherwise loading will fail.

For example: `src/Controller/IndexController.ts` and `src/Controller/Test/IndexController.ts` are duplicate classes.

It should be noted that the type of Bean is determined by the decorator, not the filename or directory name. If `IndexController.ts` is decorated with `@Service()`, then its type is `SERVICE`.

**For Koatty Official Components**

We recommend using `^` for dependency introduction, and strongly advise against locking versions.

```json
{
  "dependencies": {
    "koatty_lib": "^1.0.0"
  }
}
```

# Q & A

Coming soon...

# API Reference

- **app**: [API Documentation](https://github.com/Koatty/koatty_core/blob/main/docs/api/koatty_core.koatty.md)
- **ctx**: [API Documentation](https://github.com/Koatty/koatty_core/blob/main/docs/api/koatty_core.koattycontext.md)
- **IOCContainer**: [API Documentation](https://github.com/Koatty/koatty_container/blob/master/docs/api/koatty_container.container.md)
- **Other APIs**: [API Documentation](https://github.com/Koatty/koatty/blob/master/docs/api/koatty.md)

---

## Community

- [GitHub Discussions](https://github.com/Koatty/koatty/discussions)
- [中文文档](https://koatty.org/)

## License

[BSD-3-Clause](https://opensource.org/licenses/BSD-3-Clause) © Koatty Team
