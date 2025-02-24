# Koatty

Koatty is an agile development framework based on Koa2, featuring automatic dependency injection (IoC) and Aspect-Oriented Programming (AOP) using TypeScript decorators, similar to SpringBoot.

## Quick Start

### First Application

1. **Install the Command Line Tool**
   
   ```bash
   npm i -g koatty_cli
   ```
   
   The version of the command line tool corresponds to the version of the Koatty framework. For example, `koatty_cli@1.11.x` supports the new features of `koatty@1.11.x`.

2. **Create a New Project**
   
   ```bash
   kt new projectName
   cd ./projectName
   yarn install
   ```

3. **Start the Service**
   
   - **Development Mode**
     
     ```bash
     npm run dev
     ```
   
   - **Production Mode**
     
     ```bash
     npm start
     ```
     
     Access the application in your browser at `http://localhost:3000`.

### Debugging Mode

It is highly recommended to use Visual Studio Code (VSCode) for development. Edit the `.vscode/launch.json` file in the project directory (you can also open it by clicking on Debug > Add Configuration):

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

### Unit Testing

Koatty currently only supports Jest for writing test cases.

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

## Basic Features

### Project Structure

The Koatty CLI `koatty_cli` creates the following directory structure by default when creating a project:

```
<projectName>
├── .vscode                       # VSCode configuration
│   └── launch.json               # Node local debugging script
├── dist                          # Compiled directory
├── src                           # Project source code
│   ├── config
│   │   ├── config.ts             # Framework configuration
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
│   ├── proto                     # Protocol Buffers
│   │   └── test.proto
│   ├── resource                  # Static data or whitelist
│   │   └── data.json
│   ├── service                   # Service logic
│   │   └── TestService.ts
│   ├── utils                     # Utility functions
│   │   └── tool.ts
│   └── App.ts                    # Entry file
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

However, Koatty supports flexible customization of the project structure. Except for the configuration directory (which can be customized through `@ConfigurationScan()`), and the static resources directory (which requires modifying the default configuration of the Static middleware), other directory names and structures can be customized.

### Entry File

The default entry file for Koatty is `App.ts`, which looks like this:

```typescript
import { Koatty, Bootstrap } from "koatty";
// import * as path from "path";

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
    // this.appDebug = true; // Set debug mode to false in production environment
  }
}
```

The `App` class inherits from `Koa.Application`. Therefore, an instance of `App` is an extended instance of `koa` (extended). Koatty defines the project entry through the `@Bootstrap()` decorator. The `@Bootstrap()` decorator can accept a function as a parameter, which is executed after initializing environmental parameters when the project is loaded.

Koatty uses the `@ComponentScan()` decorator to define the project directory. If the project directory is modified, the relative directory name of the project needs to be passed; if certain directories are excluded from automatic loading of beans, the files that should not be automatically loaded can be placed outside the project directory.

Koatty uses the `@ConfigurationScan()` decorator to customize the project configuration directory. The default value is `./config`, which is the `config` subdirectory under the project directory.

## Basic Objects

### App

`App` is a global application object. Only one instance will be instantiated in an application, inheriting from `Koa.Application`. We can mount some global methods and objects on the `App` object. It is easy to extend the `App` object in plugins or applications.

In `CONTROLLER`, `SERVICE`, `COMPONENT` type beans, the `App` object is injected by default and can be used directly:

```typescript
@Controller()
export class TestController {
  ...
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
    ...
    // Print app object
    console.log(app);
  }
}
```

### Ctx

`Ctx` is a request-level object, inheriting from `Koa.Context`. Every time a user request is received, the framework instantiates a `Ctx` object, which encapsulates the information of this user request and provides many convenient methods to get request parameters or set response information.

In `CONTROLLER` type beans, the `Ctx` object is a member property and can be used directly:

```typescript
@Controller()
export class TestController {
  ...
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
    ...
    return async function (ctx: any, next: any) {
      // Print ctx object
      console.log(ctx);
      return next();
    };
  }
}
```

In `SERVICE`, `COMPONENT` type beans, the `Ctx` object needs to be passed manually:

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

Note the difference between `app.context` and `context.app`: `app.context` is a prototype for the context object created for each request. Each time a request is received, Koa creates a new context object for that request and assigns it to the current `ctx` variable. Although each request's context is based on `app.context`, this does not mean that `app.context` will be overwritten. `app.context` is actually a template for generating new context instances. The context contains a reference to `app`, but the relationship between them is unidirectional (the context accesses `app` through properties, but not vice versa).

## Configuration

In actual projects, various configurations are definitely needed, including framework-required configurations and project-customized configurations. Koatty manages all configurations uniformly and divides them into different configuration files according to different functions.

### Common Configurations

- `config.ts`: General configurations
- `db.ts`: Database configurations
- `router.ts`: Router configurations
- `middleware.ts`: Middleware configurations
- `plugin.ts`: Plugin configurations

In addition to the common configuration files mentioned above, Koatty also supports custom configuration file naming.

### Custom Configuration Scan Path

Configuration files are placed in the `src/config/` directory by default. You can also customize the configuration scan path in the entry file `App.ts`:

```typescript
@ConfigurationScan('./myconfig')
export class App extends Koatty {
  public init() {
    ...
  }
}
```

When Koatty starts, it will automatically scan all `.ts` files in the project `src/myconfig` directory and load them as configurations according to the filename.

### Configuration File Format

Koatty's configuration files must be exported in standard ES6 Module format, otherwise they will not be loaded. The format is as follows:

```javascript
export default {
  ...
  aa: "bb",
  cc: {
    dd: ""
  }
  ...
}
```

### Reading Configurations

There are two ways to read configurations conveniently in the project: Method One (using `app.config` function):

```typescript
...
const conf: Test = this.app.config("test");
```

Method Two (using decorator injection, recommended usage):

```typescript
@Controller()
export class AdminController {
  @Config("test")
  conf: Test;
}
```

The configuration type `Test` in the above configuration reading code is a defined configuration class. Of course, you can also use `Object` or `any` types.

### Configuration Classification and Hierarchy

When Koatty scans the configuration file directory at startup, it classifies configurations according to filenames. For example, after loading `db.ts`, the configuration items in the file need to have a type added:

```typescript
// The second parameter of the config function is the configuration type
const conf: Test = this.app.config("test", "db");
```

Or

```typescript
@Config("test", "db")
conf: Test;
```

The default classification of configurations is `config`, so configuration items in `config.ts` do not need to fill in the type parameter.

Koatty supports configuration hierarchy when reading configurations. For example, in the configuration file `db.ts`:

```javascript
export default {
  /* database config */
  database: {
    db_type: 'mysql', // support postgresql, mysql...
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
```

Or

```typescript
const dbHost: string = this.app.config("database.db_host", "db");
```

It should be noted that hierarchical configurations only support direct access to the second level. For deeper levels, assign the value to a variable and retrieve it again:

```javascript
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

- `appDebug`: Defined in the constructor method (`init`) of the project entry file.
  
  ```typescript
  @Bootstrap()
  export class App extends Koatty {
    public init() {
      // appDebug is true for development mode
      // appDebug is false for production mode
      this.appDebug = false;
    }
  }
  ```

- `process.env.NODE_ENV`: The runtime environment variable of Node.js, which can be defined in the system environment or in the startup function of the project entry file.

- `process.env.KOATTY_ENV`: The runtime environment variable of the Koatty framework.

The relationship and difference between the three variables:
| Variable | Value | Description | Priority |
|----------|-------|-------------|----------|
| `appDebug` | `true/false` | Debug mode | High |
| `process.env.KOATTY_ENV` | `development/production` | Framework runtime environment variable | Medium |
| `process.env.NODE_ENV` | `development/production` | Node.js runtime environment variable | Low |

The priority here refers to the priority of loading runtime configurations. Higher priority configurations will override lower priority configurations.

`app.env = process.env.KOATTY_ENV || process.env.NODE_ENV;`
If `app.env = production`, `koatty_config` will automatically load configuration files with `_pro.ts` or `_production.ts` suffixes. If `app.env = development`, it will automatically load configuration files with `_dev.ts` or `_development.ts` suffixes.

For example:

```bash
# Automatically loads config_dev.ts or config_development.ts
NODE_ENV=dev ts-node "test/test.ts"
```

Through flexible configuration of these three variables, diverse runtime environments and configurations can be supported.

### Command Line Arguments

Koatty can automatically recognize command line arguments and automatically fill them into corresponding configuration items:

```bash
# Automatically fills the value of config.cc.dd.ee
NODE_ENV=dev ts-node "test/test.ts" --config.cc.dd.ee=77
```

### Placeholder Variable Replacement

Koatty can automatically replace configuration items in configuration files identified by `${}` placeholders with values of the same name in `process.env`:

```typescript
// Automatically fills the value of ff_value
export default {
  ...
  ff: "${ff_value}"
  ...
}
NODE_ENV=dev ff_value=999 ts-node "test/test.ts"
```

### Common Environment Variables

- `process.env.ROOT_PATH`: The root directory defined by Koatty. Can be used anywhere in the project.
- `process.env.APP_PATH`: The application directory defined by Koatty (in debug mode, it is `/projectDIR/src`; in production mode, it is `/projectDIR/dist`). Can be used anywhere in the project.
- `process.env.KOATTY_PATH`: The root directory of the Koatty framework (`/projectDIR/node_modules/koatty/`). Can be used anywhere in the project.
- `process.env.LOGS_PATH`: The directory for saving logs (default is `/projectDIR/logs`, which can be modified in the configuration). Can be used anywhere in the project.

## Routing

Koatty encapsulates a routing library `koatty_router` specifically for handling routes, supporting HTTP1/2, WebSocket, gRPC, and other protocol types.

### Controller Routing

The `@Controller()` decorator's parameter serves as the controller's access entry, with the default value being `/`. Then, iterate over the controller's methods and register route mappings using decorators such as `GetMapping`, `DeleteMapping`, `PutMapping`, `PostMapping`.

For example:

```typescript
@Controller("/admin")
export class AdminController {
  ...
  @GetMapping("/test")
  test() {
    ...
  }
  ...
}
```

The above code registers the route `/admin/test` to `AdminController.test()`.

Note: In gRPC services, the route bound by `@Controller` must match the `serviceName` defined in the proto.

For example, `@Controller("/Book")` binds to the service `Book` in the proto.

### Method Routing

Used to bind routes to controller methods. Refer to the decorator section for details.

The method routing decorators are `@GetMapping`, `@PostMapping`, `@DeleteMapping`, `@PutMapping`, `@PatchMapping`, `@OptionsMapping`, `@HeadMapping`, `@RequestMapping`.

Note: In gRPC services, please use `@PostMapping` or `@RequestMapping` for binding, and the `path` in `@RequestMapping` must match the method name defined in the proto; in WebSocket services, please use `@GetMapping` or `@RequestMapping` for binding.

### Parameter Binding

In method routing, there is a special parameter route that can easily implement RESTful APIs.

```typescript
@Controller("/admin")
export class AdminController {
  ...
  @GetMapping("/test/:id") // Declare parameters in the method decorator
  test(@PathVariable("id") id: number) { // Use PathVariable to get the bound parameter
    ...
  }
  ...
}
```

Koatty's routing component `koatty_router` is based on `@koa/router` (except for gRPC), and detailed routing tutorials can be found in `@koa/router`.

### Route Configuration

The custom route configuration is stored in `src/config/router.ts`, which initializes the routing instance.

```typescript
export default {
  prefix: string;
  methods?: string[];
  routerPath?: string;
  sensitive?: boolean;
  strict?: boolean;
};

// If the project protocol is grpc, the proto file path needs to be defined:
export default {
  // prefix: string;
  // methods?: string[];
  // routerPath?: string;
  // sensitive?: boolean;
  // strict?: boolean;
  ext: {
    protoFile: "", // gRPC proto file
  };
};
```

### Route Features

- The `@Controller()` decorator has two roles: declaring the type of the bean as a controller and binding the controller route. If no path is specified when using the `@Controller()` decorator (no parameters), the default value is `/`.
- Method routing decorators can be added multiple times to the same method. However, the `@Controller()` decorator can only be used once per class.
- If duplicate routes are bound, the first loaded route rule takes effect according to the loading order of the controller class in the IOC container. This issue needs attention. In future versions, priority features may be added to control this.

Routes support regular expressions and parameter binding (not available in gRPC services). Detailed routing tutorials can be found in `@koa/router`.

## ## Middleware

Koatty is built on top of Koa, so the form of middleware in Koatty is essentially the same as in Koa, which is based on the onion model. Every time we write a middleware, it is like wrapping another layer around the onion.

Koatty's framework defaults to loading middleware such as trace and payload, which can meet most web application scenarios. Users can also add their own middleware for extension.

Different from Koa middleware, Koatty middleware is written in the form of classes and uses the `@Middleware` decorator to declare the component type.

Middleware classes must contain a method named `run(options: any, app: App)`. This method is called when the application starts and returns a function `(ctx: any, next: any){}`, which is the format of the Koa middleware.

### Using Middleware

Use the command line tool `koatty_cli` to execute commands in the command line:

```bash
# Create a custom middleware named jwt
kt middleware jwt
```

This will automatically generate a file `src/middleware/JwtMiddleware.ts` in the project directory with the generated middleware code template:

```typescript
/**
* Middleware
* @return
*/
import { Middleware, Helper } from "koatty";
import { App } from '../App';

@Middleware()
export class JwtMiddleware {
  run(options: any, app: App) {
    // Logic before returning middleware, e.g., reading configuration, etc.
    ...
    return function (ctx: any, next: any) {
      // Implement middleware logic here
      ...
    }
  }
}
```

Modify the project middleware configuration in `src/config/middleware.ts`:

```typescript
list: ['JwtMiddleware'], // List of loaded middleware
config: { // Middleware configuration
  JwtMiddleware: {
    // Middleware configuration items
  }
}
```

### Disabling Middleware

To disable middleware developed by the project, simply modify the middleware configuration file:

```typescript
list: [], // If PassportMiddleware is not in the list, the Passport middleware will not execute
config: { // Middleware configuration
  'PassportMiddleware': {...},
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
list: ['PassportMiddleware'], // List of loaded middleware
config: { // Middleware configuration
  'PassportMiddleware': {
    // Middleware configuration items
  }
}
```

### Using Express Middleware

Koatty is compatible with Express middleware, and the usage is the same as Koa middleware. The framework will automatically recognize and convert for compatibility.

### Middleware for Non-HTTP/S Protocols

If the project uses protocols such as `grpc`, `ws`, `wss`, etc., middleware needs to be aware that some properties of `ctx` will be inconsistent. For example, `ctx.header` does not exist in `grpc`. The specific available properties will be explained in the gRPC and WebSocket chapters.

## Controller

Koatty controller classes use the `@Controller()` decorator to declare them, and the parameter of this decorator is used to bind the controller's access route, with the default value being `/`. Controller classes are placed in the project's `src/controller` folder by default and support subfolders for classification. Koatty controller classes must implement the `IController` interface.

### Creating Controllers

Use the `koatty_cli` command line tool:

- Single module mode:
  
  ```bash
  kt controller index # Default http protocol
  kt controller -t http index
  kt controller -t grpc index
  kt controller -t ws index
  ```
  
  This will automatically create `src/controller/IndexController.ts`.

- Multi-module mode:
  
  ```bash
  kt controller admin/index
  ```
  
  This will automatically create `src/controller/Admin/IndexController.ts`.

The template code for the controller is as follows:

```typescript
import { Controller, GetMapping } from "koatty";
import { App } from '../../App';

@Controller("/")
export class IndexController {
  app: App;
  ctx: KoattyContext;

  /**
  * constructor
  *
  */
  constructor(ctx: KoattyContext) {
    this.ctx = ctx;
  }

  @GetMapping("/")
  index() {
    return this.ok('Hello, Koatty!');
  }
}
```

### Controller Features

Controller classes must implement the `IController` interface.
The constructor method of the controller class must have `ctx: KoattyContext` as the first parameter and assign it to the `ctx` property in the constructor method:

```typescript
constructor(ctx: KoattyContext) {
  this.ctx = ctx;
}
```

According to the software layered architecture, controllers should not be called by other controllers (if indeed needed, move the logic to the Service layer for code reuse), nor should they be referenced by other components (anti-pattern).

### Getting Parameters

Koatty parses and processes request parameters, and in the controller, we can obtain parameter values through the following methods:

#### Query String Parameters

- Using `@Get` decorator:
  
  ```typescript
  ...
  @GetMapping("/get")
  async get(@Get("id") id: number): Promise<any> {
    console.log(id);
  }
  ...
  ```

- Using `@RequestParam` decorator:
  
  ```typescript
  ...
  @GetMapping("/get")
  async get(@RequestParam("id") id: number): Promise<any> {
    console.log(id);
  }
  ...
  ```

- Using `ctx.query`:
  
  ```typescript
  ...
  @GetMapping("/get")
  async get(): Promise<any> {
    console.log(this.ctx.query["id"]);
  }
  ...
  ```

#### RESTful API Parameters

- Using `@PathVariable` decorator:
  
  ```typescript
  ...
  @GetMapping("/test/:id") // Declare parameters in the method decorator
  test(@PathVariable("id") id: number) { // Use PathVariable to get the bound parameter
    ...
  }
  ...
  ```

- Using `ctx.requestParam`:
  
  ```typescript
  ...
  @GetMapping("/test/:id") // Declare parameters in the method decorator
  test() { // Use PathVariable to get the bound parameter
    console.log(this.ctx.requestParam["id"]);
  }
  ...
  ```

#### Body Parameters

- Using `@Post` decorator:
  
  ```typescript
  ...
  @PostMapping("/post")
  async post(@Post("id") id: number): Promise<any> {
    console.log(id);
  }
  ...
  ```

- Using `@RequestBody` decorator:
  
  ```typescript
  ...
  @PostMapping("/post")
  async post(@RequestBody() body: any): Promise<any> {
    console.log(body.post);
  }
  ...
  ```

- Using `ctx.requestBody`:
  
  ```typescript
  ...
  @PostMapping("/post")
  async post(): Promise<any> {
    console.log(ctx.requestBody.post);
  }
  ...
  ```

#### File Upload

- Using `@File` decorator:
  
  ```typescript
  ...
  @PostMapping("/post")
  async post(@File("filename") fileObject: any): Promise<any> {
    console.log(fileObject);
  }
  ...
  ```

- Using `@RequestBody` decorator:
  
  ```typescript
  ...
  @PostMapping("/post")
  async post(@RequestBody() body: any): Promise<any> {
    console.log(body.file);
  }
  ...
  ```

- Using `ctx.requestBody`:
  
  ```typescript
  ...
  @PostMapping("/post")
  async post(): Promise<any> {
    console.log(ctx.requestBody.file);
  }
  ...
  ```

#### HTTP Header

- Using `@Header` decorator:
  
  ```typescript
  ...
  @PostMapping("/get")
  async get(@Header("x-access-token") token: string): Promise<any> {
    console.log(token);
  }
  ...
  ```

- Using `ctx.get`:
  
  ```typescript
  ...
  @PostMapping("/get")
  async get(): Promise<any> {
    const token = this.ctx.get("x-access-token");
    console.log(token);
  }
  ...
  ```

- Using `ctx.header`:
  
  ```typescript
  ...
  @PostMapping("/get")
  async get(): Promise<any> {
    console.log(this.ctx.header);
  }
  ...
  ```

### Access Control

Class references follow TypeScript's scope `private | protected | public`. If not explicitly declared, the scope of class methods is `public`.
As long as a controller class method is bound to a route, the method can be accessed via URL mapping (even if the method's scope is not `public`). This is because currently, it is not possible to obtain the method's scope keyword through reflection (if you know how, please let me know), and URL access scope control has not been implemented.

### Controller Properties and Methods

Refer to the `BaseController API` for controller properties and methods.

## Service Layer

In simple terms, a Service is an abstraction layer used for encapsulating business logic in complex business scenarios. The benefits of providing this abstraction are:

- Keeping the logic in the Controller simpler.
- Maintaining the independence of business logic, abstracted Services can be called repeatedly by multiple Controllers.
- Separating logic from presentation, making it easier to write test cases.

Koatty service classes use the `@Service()` decorator to declare them. Service classes are placed in the project's `src/service` folder by default and support subfolders for classification. Koatty service classes must implement the `IService` interface.

### Creating Service Classes

Use the `koatty_cli` command line tool:

```bash
kt service test
```

This will automatically create `src/service/test.js`, with the generated template code:

```typescript
import { Service, Autowired, Scheduled, Cacheable } from "koatty";
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

The persistence layer is a type of business logic layering and is not mandatory in the framework. The persistence layer is of type `COMPONENT` in the framework's IOC container. It is loaded together with plugins when the framework starts. Plugins can reference the persistence layer.

Koatty currently supports TypeORM by default. If you need to use other types of ORMs, such as Sequelize or Mongoose, you can refer to the `koatty_typeorm` plugin to implement it yourself.

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

Inject through decorators:

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

Modify the database-related configuration items in the project's `plugin` configuration `config/plugin.ts`:

```typescript
// src/config/plugin.ts
export default {
  list: ['TypeormPlugin'], // List of loaded plugins, execution order according to array element order
  config: { // Plugin configuration
    TypeormPlugin: {
      // Default configuration items
      "type": "mysql", // mysql, mariadb, postgres, sqlite, mssql, oracle, mongodb,
      host: "127.0.0.1",
      port: 3306,
      username: "test",
      password: "test",
      database: "test",
      "synchronize": false, // true means entities will synchronize with the database every time the application runs
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
  "DataBase": { // used koatty_typeorm
    // Default configuration items
    "type": "mysql", // mysql, mariadb, postgres, sqlite, mssql, oracle, mongodb,
    host: "${mysql_host}",
    port: "${mysql_port}",
    username: "${mysql_user}",
    password: "${mysql_pass}",
    database: "${mysql_database}",
    "synchronize": false, // true means entities will synchronize with the database every time the application runs
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

The plugin mechanism is to manage and orchestrate relatively independent business logic on the premise of ensuring that the core of the framework is sufficiently lean and stable.

### Why Do We Need Plugins?

In the process of using middleware, we found some problems:

- The positioning of middleware is to intercept user requests and do something before and after them, such as authentication, security checks, access logs, etc. However, in reality, some functions are unrelated to requests, such as scheduled tasks, message subscriptions, background logic, etc.
- Some functions contain very complex initialization logic that needs to be completed when the application starts. This is obviously not suitable for implementation in middleware.

In summary, we need a more powerful mechanism to manage and orchestrate those relatively independent business logics. Typical application scenarios include service registration discovery, pulling configurations from the configuration center, etc.

In the framework's IOC container, plugins are a special type of `COMPONENT`.

Plugins should try to maintain independence and not couple with other components.
If necessary, plugins can call the persistence layer (operate databases and caches, etc.). However, they cannot call the service layer, middleware, or controllers, nor can they be called by other components.

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
import { Plugin, IPlugin } from 'koatty';
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
list: ['ApolloPlugin'], // List of loaded plugins
config: { // Plugin configuration
  'ApolloPlugin': {
    // Plugin configuration items
  }
}
```

### Disabling Plugins

To disable a plugin in the project, simply modify the plugin configuration file:

```typescript
list: [], // If ApolloPlugin is not in the list, the ApolloPlugin plugin will not execute
config: { // Plugin configuration
  'ApolloPlugin': {...},
}
```

## Advanced Applications

### Parameter Validation

Parameter validation is a very common function in projects, and Koatty has specially encapsulated a library `koatty_validation`, which can be easily used in projects. Koatty provides two schemes for parameter validation, suitable for different scenarios:

#### Scheme One: Decorators `@Valid` and `@Validated`

- `@Valid` and `@Validated` decorators are only applicable to controller classes.
  
  ```typescript
  @RequestMapping('/')
  // Check if the input parameter is an email
  index(@RequestBody() @Valid("IsEmail") body: string): Promise<any> {
    return this.ok('Hi Koatty');
  }
  ```

- The `@Validated` decorator needs to be used with a DTO class:
  
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
  ...
}
```

#### Scheme Two: `FunctionValidator` and `ClassValidator`

For bean parameter validation in non-controller types, we can use `FunctionValidator` and `ClassValidator`.

- `FunctionValidator`:
  
  ```typescript
  // Throw an error directly
  FunctionValidator.IsNotEmpty(str, "cannot be empty");
  FunctionValidator.Contains(str, {message: "must contain s", value: "s"});
  // Return true or false
  if (ValidFuncs.IsEmail(str)) {
    ...
  }
  ```

- `ClassValidator`:
  
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

`koatty_validation` defines a series of common validation rules.
In addition to built-in rules, custom function validation can also be defined:

Use custom functions with the `@Valid` decorator:




```typescript
@Controller('/api/login')
export class LoginController {
  ...
  @Validated()
  async GetSignout(@Post() someObj: ObjectDto) {
    // do something
  }
  ...
}
```

  // class ObjectDto

```typescript
export class ObjectDto {
  ...
  @CheckFunc((value: unknown) => {
    return value !== undefined && value !== null;
  }, { message: "Username cannot be empty" })
  username: string;
  ...
}
```

- Custom validation in DTO classes:
  
  ```typescript
  @Controller('/api/login')
  export class LoginController {
    ...
    @Validated()
    async GetSignout(@Post() someObj: ObjectDto) {
      // Call valid()
      if (!someObj.validUserName()) {
        throw new Exception("User is disabled", 1004, 200);
      }
    }
    ...
  }
  ```
  
  // class ObjectDto
  
  ```typescript
  export class ObjectDto {
    ...
    @IsDefined()
    username: string;
    validUserName(): boolean {
      return this.username === "test";
    }
    ...
  }
  ```

## Exception Handling

Koatty framework encapsulates the `koatty_exception` component for handling errors that need to be thrown in the project, supporting the customization of exception classes to handle different business exceptions.

### Standardizing Error Throwing

Customize HTTP status, business error codes, and error messages.
Save the error stack in logs.

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
    // Return ctx.res.end for http protocol, handle based on ctx.protocol for gRPC protocol
    return ctx.res.end(this.message);
  }
}

export class BusinessException2 extends Exception {
  // Handle exceptions uniformly in the handler
  async handler(ctx: KoattyContext): Promise<any> {
    // Return ctx.res.end for http protocol, handle based on ctx.protocol for gRPC protocol
    return ctx.res.end({code: this.code, message: this.message});
  }
}
```

In the application code, we can throw different exceptions according to business logic:

```typescript
// res: {"code":1,"message":"error"}
throw new BusinessException1("error");
// res: {"code":1000,"message":"error"}
throw new BusinessException2("error", 1000);
```

### Global Exception Handling

Koatty provides a decorator `@ExceptionHandler()` to register global exception handling.

```typescript
@ExceptionHandler() // Register global exception handling
export class BusinessException extends Exception {
  // Handle exceptions uniformly in the handler
  async handler(ctx: KoattyContext): Promise<any> {
    // Return ctx.res.end for http protocol, handle based on ctx.protocol for gRPC protocol
    return ctx.res.end(this.message);
  }
}
```

Global exception handling is registered only once, and multiple registrations will overwrite each other. After registering global exception handling, unless a different type of exception is explicitly thrown, all exceptions will be intercepted by the global exception handling class.

...

```typescript
async index(type: string) {
  if (type == '1') {
    // Specify BusinessException2 to handle exceptions
    // res: {"code":1000,"message":"error"}
    throw new BusinessException2("error", 1000);
  } else {
    // Not explicitly specified, handled by global exception handling
    // res: error
    throw new Error("error", 1000);
  }
}
...
```

## Caching

Koatty encapsulates a caching library `koatty_cacheable`, which supports memory and Redis storage. `koatty_cacheable` provides two decorators `CacheAble` and `CacheEvict`.

### Cache Configuration

Cache configuration is saved in `config/db.ts`:

```typescript
export default {
  ...
  "CacheStore": {
    type: "memory", // redis or memory, memory is default
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
  ...
};
```

The default uses memory storage, and if Redis is needed, Redis connection-related configuration items need to be supplemented.

### Cache Usage

`@CacheAble(cacheName: string, {params: string[], timeout = 3600})`
Enables automatic caching of method results. When this method is executed, it first checks the cache. If the cached result exists, it returns the result directly; otherwise, it executes and then returns and stores the result. The elements of the `params` array are parameter names, which will be used to get the parameter values, and then concatenated with the cache prefix to form the cache key. For example: `@CacheAble("getUser", {params:["name"]})`, if the `name` parameter value is `tom`, the concatenated cache key is `getUser:name:tom`.

`@CacheEvict(cacheName: string, {params: string[], delayedDoubleDeletion = true})`
Clears the method result cache. The `params` parameter is used the same as `CacheAble`. `delayedDoubleDeletion` is `true` to enable delayed double deletion strategy.

`GetCacheStore(app: Koatty)`
Gets the cache instance, which can manually call `get`, `set`, and other methods to operate the cache.
Example:

```typescript
import { CacheAble, CacheEvict, GetCacheStore } from "koatty_cacheable";
@Service()
export class TestService {
  @CacheAble("testCache") // Automatically caches the result, cache key=testCache
  getTest() {
    // todo
  }

  @CacheEvict("testCache") // Clears the cache before executing setTest(), cache key=testCache
  setTest() {
    // todo
  }

  test() {
    // Manually operate the cache instance
    const store = GetCacheStore(this.app);
    store.set(key, value);
  }
}
```

Note: Decorators `@CacheAble` and `@CacheEvict` cannot be used for controller classes.

## Scheduling Tasks

Koatty encapsulates a scheduling task library `koatty_schedule`, which supports cron expressions and distributed locks based on Redis.

### Cron Expressions

Cron expressions consist of 6 fields, representing seconds, minutes, hours, day of month, month, and day of week:

- Seconds: 0-59
- Minutes: 0-59
- Hours: 0-23
- Day of Month: 1-31
- Months: 1-12 (Jan-Dec)
- Day of Week: 1-7 (Mon-Sun)

`@Scheduled(cron: string)`
Easily add task execution plans to methods through the `@Scheduled` decorator:

```typescript
import { Scheduled, RedLock } from "koatty_schedule";
export class TestService {
  @Scheduled("0 * * * * *")
  Test() {
    // todo
  }
}
```

### Task Execution Lock

In some business scenarios, scheduled tasks cannot be executed concurrently, and the solution is to add a lock. `koatty_schedule` implements a distributed lock based on Redis.
`RedLock(name?: string, options?: RedLockOptions)`

`RedLockOptions`:

- `lockTimeOut?`: Lock timeout in milliseconds, default 10000
- `retryCount?`: Maximum retry count, default 3
- `RedisOptions`: Redis configuration, supports Standalone, Sentinel, Cluster

Example:

```typescript
import { Scheduled, RedLock } from "koatty_schedule";
export class TestService {
  @Scheduled("0 * * * * *")
  @RedLock("testCron") // locker
  Test() {
    // todo
  }
}
```

Because Redis is used, Redis cache configuration is saved in `config/db.ts`:

```typescript
export default {
  ...
  "RedLock": {
    host: '127.0.0.1',
    port: 6379,
    name: "",
    username: "",
    password: "",
    db: 0
  },
  ...
};
```

You can also pass in the configuration when calling the decorator:

```typescript
import { Scheduled, RedLock } from "koatty_schedule";
export class TestService {
  @Config("redisConf", "db")
  private redisConf;
  @Scheduled("0 * * * * *")
  @RedLock("testCron", {
    RedisOptions: redisConf
  }) // locker
  Test() {
    // todo
  }
}
```

Several points to note:

- Decorators `@Scheduled` and `@RedLock` cannot be used for controller classes;
- Configure corresponding parameters according to the duration of the scheduled task to prevent lock expiration.
- When the lock expires but the business logic has not been completed, the lock will automatically extend for one time. If the extension time expires and the business logic is still not completed, the lock will be released.

## gRPC

Koatty supports gRPC services starting from version 3.4.x.

### Proto Protocol

Use the `koatty_cli` command line tool (>=3.4.6):

```bash
kt proto hello
```

This will automatically create `src/proto/Hello.proto`. Modify according to the actual situation.

### gRPC Protocol Controller

Use the `koatty_cli` command line tool (>=3.4.6):

- Single module mode:
  
  ```bash
  kt controller -t grpc hello
  ```
  
  This will automatically create `src/controller/HelloController.ts`.

- Multi-module mode:
  
  ```bash
  kt controller -t grpc admin/hello
  ```
  
  This will automatically create `src/controller/Admin/HelloController.ts`.

The controller template code is as follows:

```typescript
import { KoattyContext, Controller, Autowired, RequestMapping, RequestBody } from 'ko';
import { App } from '../App';
import { SayHelloRequestDto } from '../dto/SayHelloRequestDto';
import { SayHelloReplyDto } from '../dto/SayHelloReplyDto';

@Controller('/Hello') // Consistent with proto.service name
export class HelloController {
  app: App;
  ctx: KoattyContext;

  /**
  * Custom constructor
  *
  */
  constructor(ctx: KoattyContext) {
    this.ctx = ctx;
  }

  /**
  * SayHello interface
  * Access path: grpc://127.0.0.1/Hello/SayHello
  *
  * @param {SayHelloRequestDto} data
  * @returns
  */
  @RequestMapping('/SayHello') // Consistent with proto.service.method name
  @Validated() // Parameter validation
  SayHello(@RequestBody() params: SayHelloRequestDto): Promise<SayHelloReplyDto> {
    const res = new SayHelloReplyDto();
    return Promise.resolve(res);
  }
}
```

In addition to the controller file, Koatty will also automatically create RPC protocol input and output DTO classes, such as the aforementioned `SayHelloRequestDto` and `SayHelloReplyDto`.

### Service Configuration

Modify `config/config.ts`:

```typescript
export default {
  ...
  protocol: "grpc", // Server protocol 'http' | 'https' | 'http2' | 'grpc' | 'ws' |
  ...
}
```

Modify `config/router.ts`:

```typescript
export default {
  ...
  /**
  * Other extended configuration
  */
  ext: {
    protoFile: process.env.APP_PATH + "proto/Hello.proto", // gRPC proto file
  }
  ...
}
```

OK, now you can start a gRPC server.

## WebSocket

Koatty supports WebSocket services starting from version 3.4.x.

### WebSocket Protocol Controller

Use the `koatty_cli` command line tool (>=3.4.6):

- Single module mode:
  
  ```bash
  kt controller -t ws requst
  ```
  
  This will automatically create `src/controller/RequstController.ts`.

- Multi-module mode:
  
  ```bash
  kt controller -t ws admin/requst
  ```
  
  This will automatically create `src/controller/Admin/RequstController.ts`.

The controller template code is as follows:

```typescript
import { KoattyContext, Controller, Autowired, GetMapping } from 'koatty';
import { App } from '../App';
// import { TestService } from '../service/TestService';
...

@Controller('/requst')
export class RequstController {
  app: App;
  ctx: KoattyContext;
  // @Autowired()
  // protected TestService: TestService;
  /**
  * Custom constructor
  *
  */
  constructor(ctx: KoattyContext) {
    this.ctx = ctx;
  }

  /**
  * index interface
  * Access path: ws://127.0.0.1/requst
  *
  * @returns
  * @memberof RequstController
  */
  @RequestMapping('/')
  index(@RequestBody() @Valid("IsEmail") body: string): Promise<any> {
    return this.ok('Hi Koatty');
  }
}
```

### Service Configuration

Modify `config/config.ts`:

```typescript
export default {
  ...
  protocol: "ws", // Server protocol 'http' | 'https' | 'http2' | 'grpc' | 'ws' |
  ...
}
```

OK, now you can start a WebSocket server.

## Event Mechanism (Event)

During the application startup process, the `app` object in the Koatty framework defines a series of events in addition to the events inherent in Koa itself:


![](https://cdn.jsdelivr.net/gh/Koatty/koatty_doc@master/docs/assets/event.png)Note:

- The `appStart` event is triggered after the service starts.
  We can bind to different events according to project needs. For example, in the scenario of service registration discovery, if hardware failure occurs, you can bind to the `appStop` event to handle service deregistration.

```typescript
app.once("appStop", () => {
  // Deregister service
  ...
})
```

### BootFunc

The role of the `@Bootstrap` decorator is to declare the project entry class, which supports passing a function as a parameter. This function will be executed first when the project starts.

```typescript
@Bootstrap(
  // bootstrap function
  (app: any) => {
    // todo
  }
)
export class App extends Koatty {
  ...
}
```

Common application scenarios are to handle some runtime environment settings before startup, such as `NODE_ENV`. The startup function supports asynchronous execution.
Note: The startup function is executed after the framework's `initialize` initialization, at which point the framework's related path attributes (`appPath`, `rootPath`, etc.) and `process.env` have been loaded and set, but other components (plugins, middleware, controllers, etc.) have not been loaded. Be aware when defining the startup function.

### BindEventHook

In addition to the `@Bootstrap` decorator, we can also use the `BindEventHook` custom decorator to bind application events (`appBoot`, `appReady`, `appStart`, `appStop`) to the startup class.

```typescript
// src/TestBootstrap.ts:
export function TestBootstrap(): ClassDecorator {
  return (target: Function) => {
    BindEventHook(AppEvent.appBoot, (app: Koatty) => {
      // todo
      return Promise.resolve();
    }, target)
  }
}
```

Use on the project startup class:

```typescript
@Bootstrap()
@TestBootstrap()
export class App extends Koatty {
  ...
}
```

Note: The function execution of the custom decorator created by `BindEventHook` is triggered by the event (`appBoot`, `appReady`, `appStart`, `appStop`), and attention should be paid to the framework startup logic and related context.

### Loading Customizations

The entry class of the project can also set two other decorators, which are:

- `@ComponentScan('./')`: Declares the directory of project components, default is the project `src` directory, containing all types of components.
- `@ConfigurationScan('./config')`: Declares the directory of project configuration files, default is `src/config` directory.

## IOC Container

IoC stands for Inversion of Control, which translates to control inversion in English. In ES6 Class-style programming, simply creating instances and holding them reveals the following disadvantages:

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

### Component Classification

According to different application scenarios of components, Koatty divides Beans into four types: `COMPONENT`, `CONTROLLER`, `MIDDLEWARE`, `SERVICE`.

- `COMPONENT`: Extension classes, third-party classes belong to this type, such as Plugins, ORM persistence layers, etc.

- `MIDDLEWARE`: Middleware classes
- `SERVICE`: Service classes

### Component Loading

Through the core Loader of the Koatty framework, components are automatically analyzed and assembled at project startup, and the dependency issues between components are automatically handled. The IOC container provides a series of API interfaces for convenient registration and retrieval of assembled Beans.

### Circular Dependencies

As the scale of the project expands, circular dependencies are easily introduced. The approach of `koatty_container` to solve circular dependencies is lazy loading. `koatty_container` binds an `appReady` event on the `app`, which is used for lazy loading of beans that produce circular dependencies. Attention needs to be paid when using IOC:

```typescript
app.emit("appReady");
```

Note: Although lazy loading can solve most scenarios of circular dependencies, it may still fail to assemble in extreme cases. Solutions:

1. Try to avoid circular dependencies, introduce new third-party common classes to decouple mutually dependent classes.
2. Use the IOC container to get the prototype of the class (`getClass`) and instantiate it manually.

## AOP Aspects

Koatty implements an aspect-oriented programming mechanism based on the IOC container, using decorators and built-in special methods. Encapsulation is achieved through nested functions, which is simple and efficient.

### Pointcut Declaration Types

- Decorator declaration: Use `@Before`, `@After`, `@BeforeEach`, `@AfterEach` decorators to declare pointcuts.
- Built-in method declaration: Use `__before`, `__after` built-in hidden methods to declare pointcuts.

### Differences Between Declaration Methods

- Declaration method
  - Dependency on Aspect Aspect Class
  - Ability to use class scope
  - Parameter dependency of pointcut method
  - Priority
  - Usage restrictions

**Decorator Declaration**

- Dependency: Requires the creation of a corresponding Aspect aspect class to use.
- Ability to use class scope: No
- Parameter dependency of pointcut method: Yes, low
- Priority: Low
- Usable for all types of beans

**Built-in Method Declaration**

- Dependency: Does not depend on the Aspect aspect class.
- Ability to use class scope: Yes
- Parameter dependency of pointcut method: No, high
- Only usable for `CONTROLLER` type beans, as it depends on the `this` pointer of the class.

Note: If a class uses the decorator `@BeforeEach` and this class also contains the `__before` method (whether it is its own or inherited from the parent class), then the `__before` method has higher priority than the decorator, and the class's decorator `@BeforeEach` is invalid (`@AfterEach` and `__after` are the same).

For example:

```typescript
@Controller('/')
export class TestController {
  app: App;
  ctx: KoattyContext;
  @Autowired()
  protected TestService: TestService;
  // Does not depend on the Aspect aspect class
  async __before(): Promise<any> { // Does not depend on the specific method's parameters, obtain through this pointer
    console.log(this.app);  // Can use class scope, obtain the current class attribute through this pointer
    console.log(this.ctx)
  }
  @Before("TestAspect") // Depends on TestAspect aspect class, able to get path parameter
  async test(path: string) {
    ...
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

### Decorators

#### Class Decorators

- Name
  - Parameter
  - Description
  - Remarks

**@Aspect()**

- Identifier: Registered in the IOC container, default is the class name.
  - Declare the current class as an aspect class. The aspect class is executed at the pointcut, and the aspect class must implement the `run` method for the pointcut to call.
  - Only for aspect classes

**@Bootstrap()**

- bootFunc: Function to execute before application startup. The specific execution timing is when the `app.on("appReady")` event is triggered.
  - Declare the current class as a startup class, which is the entry file of the project.
  - Only for startup classes

**@ComponentScan()**

- scanPath: String or string array
  - Define the directory that the project needs to automatically load into the container.
  - Only for application startup classes

**@Component()**

- identifier: Registered in the IOC container, default is the class name.
  - Define the class as a component class.
  - Used for third-party modules or imported classes

**@ConfigurationScan()**

- scanPath: String or string array, configuration file directory
  - Define the directory of project configuration files.
  - Only for application startup classes

**@Controller()**

- path: Binding controller access route
  - Define the class as a controller class and bind the route. The default route is `/`.
  - Only for controller classes

**@Service()**

- identifier: Registered in the IOC container, default is the class name.
  - Define the class as a service class.
  - Only for service classes

**@Middleware()**

- identifier: Registered in the IOC container, default is the class name.
  - Define the class as a middleware class.
  - Only for middleware classes

**@ExceptionHandler()**

- Define the class as a global exception handling class.
  - Only for exception handling classes

**@BeforeEach(aopName:string)**

- aopName: Name of the aspect class executing the pointcut
  - Declare an aspect for the current class, which will execute the aspect class's `run` method before each method ("constructor", "init", "__before", "__after" excepted) of the current class.
  - Only for controller classes

**@AfterEach(aopName:string)**

- aopName: Name of the aspect class executing the pointcut
  - Declare an aspect for the current class, which will execute the aspect class's `run` method after each method ("constructor", "init", "__before", "__after" excepted) of the current class.
  - Only for controller classes

#### Property Decorators

- Name
  - Parameter
  - Description
  - Remarks

**@Autowired()**

- identifier: Registered in the IOC container, default is the class name.
  - type: Type of bean to inject
  - constructArgs: Constructor method arguments of the injected bean. If passed, return an instance of the bean automatically injected from the IOC container to the current class.
  - isDelay: Whether to delay loading. Delayed loading is mainly to solve circular dependency issues.
  - Only for constructor arguments (constructor)

**@Config()**

- key: Key of the configuration item
  - type: Type of the configuration item. The type of the configuration item is automatically defined according to the file where the configuration item is located, e.g., "db" represents the file `db.ts`.
  - Only for configuration items

**@Values()**

- val: Value of the attribute, can be a function, the attribute value is the result of the function operation.
  - defaultValue: Default value, when val is `Null`, `undefined`, `NaN`, take the default value.
  - Used to dynamically modify the attribute value of the class instance.
  - Only for class attributes

#### Method Decorators

- Name
  - Parameter
  - Description
  - Remarks

**@Before(aopName:string)**

- aopName: Name of the aspect class executing the pointcut
  - Declare an aspect for the current method, which will execute the aspect class's `run` method before the current method.
  - Only for controller methods

**@After(aopName:string)**

- aopName: Name of the aspect class executing the pointcut
  - Declare an aspect for the current method, which will execute the aspect class's `run` method after the current method.
  - Only for controller methods

**@RequestMapping()**

- path: Bound route
  - requestMethod: Bound HTTP request method. Use `RequestMethod` enum data for assignment, e.g., `RequestMethod.GET`.
  - If set to `RequestMethod.ALL`, it means support all request methods
  - routerOptions: Configuration items of `koa/_router`
  - Used for binding routes to controller methods
  - Only for controller methods

**@GetMapping()**

- path: Bound route
  - routerOptions: Configuration items of `koa/_router`
  - Used for binding Get routes to controller methods
  - Only for controller methods

**@PostMapping()**

- path: Bound route
  - routerOptions: Configuration items of `koa/_router`
  - Used for binding Post routes to controller methods
  - Only for controller methods

**@DeleteMapping()**

- path: Bound route
  - routerOptions: Configuration items of `koa/_router`
  - Used for binding Delete routes to controller methods
  - Only for controller methods

**@PutMapping()**

- path: Bound route
  - routerOptions: Configuration items of `koa/_router`
  - Used for binding Put routes to controller methods
  - Only for controller methods

**@PatchMapping()**

- path: Bound route
  - routerOptions: Configuration items of `koa/_router`
  - Used for binding Patch routes to controller methods
  - Only for controller methods

**@OptionsMapping()**

- path: Bound route
  - routerOptions: Configuration items of `koa/_router`
  - Used for binding Options routes to controller methods
  - Only for controller methods

**@HeadMapping()**

- path: Bound route
  - routerOptions: Configuration items of `koa/_router`
  - Used for binding Head routes to controller methods
  - Only for controller methods

**@Scheduled()**

- cron: Task scheduling configuration
  - * * * * *
    
    Seconds: 0-59
    Minutes: 0-59
    Hours: 0-23
    Day of Month: 1-31
    Months: 1-12 (Jan-Dec)
    Day of Week: 1-7 (Mon-Sun)
  - Define the execution plan task of the class method.
  - Cannot be used for controller methods, dependent on the `koatty_schedule` module.

**@Validated()**

- Used in conjunction with DTO types for parameter validation
  - Method parameters without DTO types are not effective, only for controller classes

**@RedLock()**

- name: Name of the lock
  - options: Lock configuration, including Redis server connection configuration
  - Define that the method must first obtain a distributed lock (based on Redis) before execution.
  - Dependent on the `koatty_schedule` module

**@CacheAble()**

- cacheName: Cache name
  - paramKey: Based on method input parameters as cache key, value is the position of the method input parameter, starting from 0
  - redisOptions: Redis server connection configuration
  - Dependent on the `koatty_cacheable` module
  - Cannot be used for controller methods

**@CacheEvict()**

- cacheName: Cache name
  - paramKey: Based on method input parameters as cache key, value is the position of the method input parameter, starting from 0
  - eventTime: Time point for clearing the cache
  - redisOptions: Redis server connection configuration
  - Used together with `@Cacheable`, for clearing the cache when the method is executed
  - Dependent on the `koatty_cacheable` module
  - Cannot be used for controller methods

#### Parameter Decorators

- Name
  - Parameter
  - Description
  - Remarks

**@File()**

- name: File name
  - Get the uploaded file object
  - Only for HTTP controller method parameters

**@Get()**

- name: Parameter name
  - Get querystring parameters (get route-bound parameters)
  - Only for HTTP controller method parameters

**@Header()**

- name: Parameter name
  - Get Header content
  - Only for HTTP controller method parameters

**@PathVariable()**

- name: Parameter name
  - Get route-bound parameters `/user/:id`
  - Only for HTTP controller method parameters

**@Post()**

- name: Parameter name
  - Get Post parameters
  - Only for HTTP controller method parameters

**@RequestBody()**

- Get `ctx.body`
- Only for controller method parameters

**@RequestParam()**

- name: Parameter name
  - Get Get or Post parameters, Post takes precedence
  - Only for controller method parameters

**@Valid()**

- rule: Validation rule, supports built-in rules or custom functions
  - message: Error message when the rule does not match
  - Used for parameter format validation
  - Only for controller classes

**@Inject()**

- paramName: Constructor method argument name (formal parameter)
  - cType: Type of bean to inject
  - This decorator uses the class constructor method argument to inject dependencies. If used together with `@Autowired()`, it may overwrite the same property injected by `autowired`.
  - Only for constructor arguments (constructor)

## Programming Standards and Conventions

Koatty follows the principle that conventions are more important than configuration. To standardize project code and improve robustness, some default standards and conventions have been made.

### Koatty Framework and Peripheral Component Version Definition

- Minor version: e.g., `1.1.1 => 1.1.2` (minor feature additions, bug fixes, etc., downward compatible with 1.1.x)
- Middle version: e.g., `1.1.0 => 1.2.0` (larger feature additions, partial module refactoring, etc. Mainly downward compatible, may have a small number of features incompatible)
- Major version: e.g., `1.0.0 => 2.0.0` (overall design, refactoring, etc. of the framework, not downward compatible)
- Stable version: Even-numbered versions at the end are stable versions, odd-numbered versions are unstable versions.

### Programming Style

Use Class-style programming including Controller, Service, Model, etc., use `Class` instead of `function` to organize code. Excludes configurations, tools, function libraries, third-party libraries, etc.
Single file only exports one class
In the project, a single `.ts` file only exports once and exports a `Class`. Excludes configurations, tools, function libraries, third-party libraries, etc.
Class names must be the same as file names
People familiar with JAVA will not be unfamiliar with this. The class name must be the same as the file name to maintain uniqueness in the IOC container and prevent class overwriting.
No duplicate classes of the same type are allowed
Koatty divides Beans in the IOC container into four types: `COMPONENT`, `CONTROLLER`, `MIDDLEWARE`, `SERVICE`.
Beans of the same type cannot have the same class name, otherwise loading will fail.
For example: `src/Controller/IndexController.ts` and `src/Controller/Test/IndexController.ts` are duplicate classes.
It should be noted that the type of Bean is determined by the decorator, not the filename or directory name. If `IndexController.ts` is decorated with `@Service()`, then its type is `SERVICE`.

For Koatty official components, we recommend using `^` for dependency introduction, and strongly advise against locking versions.

```json
{
  "dependencies": {
    "koatty_lib": "^1.0.0"
  }
}
```

## Q & A

Comesoon...

## API

- `app`
  
  - API documentation

- `ctx`
  
  - API documentation

- `IOCContainer`
  
  - API documentation

- Other APIs
  
  - API documentation
