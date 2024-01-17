# Koatty
Koa2 + Typescript = Koatty. 

Use Typescript's decorator implement IOC and AOP, just like SpringBoot.

Koatty是基于Koa2实现的一个具备IOC自动依赖注入以及AOP切面编程的敏捷开发框架，用法类似SpringBoot。

[![Version npm](https://img.shields.io/npm/v/koatty.svg?style=flat-square)](https://www.npmjs.com/package/koatty)[![npm Downloads](https://img.shields.io/npm/dm/koatty.svg?style=flat-square)](https://npmcharts.com/compare/koatty?minimal=true)

# 快速开始

## 第一个应用

### 1.安装命令行工具

```bash
npm i -g koatty_cli
```
命令行工具的版本同Koatty框架的版本是对应的，例如 koatty_cli@1.11.x 支持 koatty@1.11.x版本的新特性。

### 2.新建项目

```bash
kt new projectName

cd ./projectName

yarn install


```

### 3.启动服务
```bash
// dev模式
npm run dev

// pro模式
npm start

```

 浏览器中访问  `http://localhost:3000/`. 

## 调试模式

墙裂推荐使用Visual Studio Code(简称 VScode)进行开发, 编辑项目目录下的 .vscode/launch.json文件（点击调试-配置也可以打开）:

```js
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

选择 `TS Program` 以debug模式启动, 访问 http://127.0.0.1:3000

## 单元测试

koatty目前仅支持jest测试框架编写测试用例


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


# 基础功能

## 项目结构

Koatty的命令行工具`koatty_cli`在创建项目的时候，默认会形成以下目录结构:

 ```bash
<projectName>
├── .vscode                       # vscode配置
│   └── launch.json               # node本地调试脚本
├── dist                          # 编译后目录
├── src                           # 项目源代码
│   ├── config
│   │   ├── config.ts             # 框架配置
│   │   ├── db.ts                 # 存储配置
│   │   ├── middleware.ts         # 中间件配置
│   │   ├── plugin.ts             # 插件配置
│   │   └── router.ts             # 路由配置
│   ├── aspect                    # AOP切面类
│   │   └── TestAspect.ts
│   ├── controller                # 控制器
│   │   └── TestController.ts
│   ├── middleware                # 中间件
│   │   ├── JwtMiddleware.ts
│   │   └── ViewMiddleware.ts
│   ├── model                     # 持久层
│   │   └── TestModel.ts
│   ├── plugin                    # 插件
│   │   └── TestPlugin.ts
│   ├── proto                     # pb协议
│   │   └── test.proto
│   ├── resource                  # 用于存放静态数据或白名单等
│   │   └── data.json
│   ├── service                   # service逻辑层
│   │   └── TestService.ts
│   ├── utils                     # 工具函数
│   │   └── tool.ts
│   └── App.ts                    # 入口文件
├── static                        # 静态文件目录
│   └── index.html
├── test                          # 测试用例
│   └── index.test.js
├── apidoc.json
├── pm2.json
├── package.json
├── README.md
└── tsconfig.json
 ```

但是Koatty支持灵活的自定义项目结构，除配置目录(通过@ConfiguationScan()定制)以及静态资源目录(需要修改Static中间件默认配置)以外，其他目录名称、结构等都可以自行定制。

## 入口文件

Koatty默认的入口文件是 `App.ts`，内容如下：

```js
import { Koatty, Bootstrap } from "koatty";
// import * as path from "path";

@Bootstrap(
    //bootstrap function
    // (app: any) => {
    //调整libuv线程池大小
    // process.env.UV_THREADPOOL_SIZE = "128";
    //忽略https自签名验证
    // process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
    // }
)
// @ComponentScan('./')
// @ConfiguationScan('./config')
export class App extends Koatty {
    public init() {
        // this.appDebug = true; //线上环境请将debug模式关闭，即：appDebug:false
    }
}
```

App类继承于Koatty类，而Koatty是对于Koa的继承和扩展。因此可以认为App类的实例就是koa类的实例(进行了扩展) app对象。

Koatty通过`@Bootstrap()`装饰器来定义项目入口。`@Bootstrap()`可以接受函数作为参数，该函数在项目加载时初始化环境参数后执行。

Koatty通过`@ComponentScan()`装饰器来定义项目目录。如果修改了项目目录， 需要传入项目相对目录名；如果想排除某些目录Bean不自动进行加载，可以将不自动加载的文件放在项目目录之外。

Koatty通过`@ConfiguationScan()`装饰器用于定制项目配置文件目录。默认值`./config`，即项目目录下的config子目录。

## 基础对象

### App

App 是全局应用对象，在一个应用中，只会实例化一个，它继承自 Koa.Application，在它上面我们可以挂载一些全局的方法和对象。我们可以轻松的在插件或者应用中扩展 App 对象。

在`CONTROLLER`,`SERVICE`,`COMPONENT`类型bean中默认已经注入了App对象，可以直接进行使用:

```js
@Controller()
export class TestController {
    ...

    test() {
        //打印app对象
        console.log(this.app);
    }
}
```

在`MIDDLEWARE`类型bean中，App对象作为函数入参传递：

```js
@Middleware()
export class TestMiddleware {
    run(options: any, app: Koatty) {
        ...
        //打印app对象
        console.log(app);
    }
}
```

### Ctx

Ctx 是一个请求级别的对象，继承自 Koa.Context。在每一次收到用户请求时，框架会实例化一个 Ctx 对象，这个对象封装了这次用户请求的信息，并提供了许多便捷的方法来获取请求参数或者设置响应信息。

在 `CONTROLLER`类型bean中，Ctx对象作为成员属性。可以直接使用：

```js
@Controller()
export class TestController {
    ...

    test() {
        //打印ctx对象
        console.log(this.ctx);
    }
}
```

在`MIDDLEWARE`类型bean中，Ctx对象作为中间件执行函数入参传递：

```js
@Middleware()
export class TestMiddleware {
    run(options: any, app: Koatty) {
        ...
        
        return async function (ctx: any, next: any) {
            
            //打印ctx对象
            console.log(ctx);

            return next();
        };
    }
}

```

在`SERVICE`,`COMPONENT`类型bean中，Ctx对象需要自行传递:

```js
@Service()
export class RequestService {
    app: App;

    Test(ctx: KoattyContext){
        //打印ctx对象
        console.log(ctx);
    }
}
```
## 配置

实际项目中，肯定需要各种配置，包括：框架需要的配置以及项目自定义的配置。Koatty 将所有的配置都统一管理，并根据不同的功能划分为不同的配置文件。

* config.ts 通用的一些配置
* db.ts 数据库配置
* router.ts 路由配置
* middleware.ts 中间件配置
* plugin.ts 插件配置

除上述常见的配置文件之外，Koatty也支持用户自行定义的配置文件命名。


### 自定义配置扫描路径

配置文件默认放在 src/config/ 目录下，我们还可以通过在入口文件App.ts类自定义配置扫描路径：

```js
//App.ts

@ConfiguationScan('./myconfig')
export class App extends Koatty {

    public init() {
        ...
    }
}
```

Koatty启动时会自动扫描项目 src/myconfig目录下所有文件(.ts),按照文件名分类加载为配置

### 配置文件格式

Koatty的配置文件必须是标准的ES6 Module格式进行导出,否则会无法加载。格式如下：

```js
export default {
    /*database config*/
    database: {
        db_type: 'mysql', //support  postgresql,mysql...
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

### 读取配置

在项目中有两种方式可以很方便的读取配置：

* 方式一(控制器、service等含有app属性的类中使用):

```js
//
...
const conf: any = this.app.config("test");

```
* 方式二(利用装饰器进行注入，推荐用法)

```js
@Controller()
export class AdminController {
    @Config("test")
    conf: any;
}

```
### 配置分类及层级

Koatty在启动扫描配置文件目录时，会按照文件名对配置进行分类。例如：db.ts加载完成后，读取该文件内的配置项需要增加类型

```js
// config函数的第二个参数为类型
const conf: any = this.app.config("test", "db");

或者

@Config("test", "db")
conf: any;

```
> 配置文件默认分类是 `config`，因此 config.ts文件内的配置项无需填写类型入参

Koatty在读取配置时支持配置层级，例如配置文件db.ts：

```js
export default {
    /*database config*/
    database: {
        db_type: 'mysql', //support  postgresql,mysql...
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

读取 `db_host`的值：

```js
@Config("database.db_host", "db")
dbHost: string;

或者

const dbHost: string = this.app.config("database.db_host", "db");

```


需要特别注意的是，层级配置仅支持直接访问到`二级`，更深的层级请赋值给变量后再次获取:

```js
//config
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

### 运行环境配置

Koatty可以自动识别当前运行环境，并且根据运行环境自动加载相应配置（如果存在）。

运行环境由三个属性来进行定义：

* appDebug

	在项目入口文件的构造方法（init）内进行定义

```js
//App.ts
@Bootstrap()
export class App extends Koatty {
    public init() {
        //appDebug值为true时，development模式
        //appDebug值为false时，production模式
        this.appDebug = false;
    }
}
```

* process.env.NODE_ENV

	Node.js的运行时环境变量，可以在系统环境定义，也可以在项目入口文件启动函数中定义

* process.env.KOATTY_ENV

	Koatty框架运行时环境变量


三者之间的关系和区别：

| 变量                   | 取值                   | 说明                  | 优先级 |
| ---------------------- | ---------------------- | --------------------- | ------ |
| appDebug               | true/false             | 调试模式              | 低     |
| process.env.NODE_ENV   | development/production | Node.js运行时环境变量 | 中     |
| process.env.KOATTY_ENV | development/production | 框架运行时环境变量    | 高     |


> 这里的优先级指加载运行时相应配置文件的优先级，优先级高的配置会覆盖优先级低的配置。


```js
const env = process.env.KOATTY_ENV || process.env.NODE_ENV || (appDebug == true ? "development" : "production");
```

如果 `env = production`, koatty_config 会自动加载以 `_pro.ts` 或 `_production.ts` 后缀的配置文件。

例如:

```sh
// 自动加载 config_dev.ts 或 config_development.ts
NODE_ENV=dev ts-node "test/test.ts" 
```

通过对这三个变量的灵活配置，可以支持多样化的运行环境及配置


### 命令行参数

Koatty可以自动识别命令行参数，并且自动填充到相应的配置项:

```sh
// 自动填充config.cc.dd.ee的值
NODE_ENV=dev ts-node "test/test.ts" --config.cc.dd.ee=77

```

### 占位符变量替换

Koatty可以自动将配置文件中使用 `${}` 占位符标识的配置项替换为process.env内的同名项的值:

config.ts
```js
export default {
    ...
    ff: "${ff_value}"
    ...
}
```

```sh
// 自动填充ff的值
NODE_ENV=dev ff_value=999 ts-node "test/test.ts"

```

### 常用的环境变量

* process.env.ROOT_PATH

Koatty定义的项目根目录，在项目中任何地方均可使用。

* process.env.APP_PATH

Koatty定义的项目应用目录(调试模式下启动，值为/`projectDIR`/src；在生产模式下启动，值为/`projectDIR`/dist)，在项目中任何地方均可使用。

* process.env.KOATTY_PATH

Koatty定义的框架根目录(/`projectDIR`/node_modules/koatty/)，在项目中任何地方均可使用。

* process.env.LOGS_PATH

Koatty定义的日志保存目录(默认为/`projectDIR`/logs，可在配置中修改)，在项目中任何地方均可使用。


## 路由

Koatty 封装了一个专门处理路由的库 `koatty_router`，支持 http1/2, websocket, gRPC 等协议类型的路由处理。

### 控制器路由

`@Controller()`装饰器的参数作为控制器访问入口，参数默认值为`/`。然后再遍历该控制器的方法上的装饰器GetMaping、
DeleteMaping、PutMaping、PostMaping等进行方法路由注册。

例如：
```js
@Controller("/admin")
export class AdminController {
    ...
    @GetMapping("/test")
    test(){
        ...
    }
    ...
}
```
上述代码注册了路由 `/admin/test` ==> AdminController.test();

> 注意：在gRPC服务中，@Controller绑定的路由必须同proto定义的serviceName相同。例如@Controller("/Book")绑定的是 proto中的 service Book。


### 方法路由

用于控制器方法绑定路由 [参考装饰器章节](##方法装饰器)

方法路由的装饰器有 `@GetMapping`、`@PostMapping`、`@DeleteMapping`、`@PutMapping`、`@PatchMapping`、`@OptionsMapping`、`@HeadMapping`、`@RequestMapping`

> 注意：在gRPC服务中，请使用 @PostMapping 或者 @RequestMapping进行绑定，并且@RequestMapping(path) 中的path必须同proto定义中的方法名一致；在WebSocket服务中，请使用 @GetMapping 或者 @RequestMapping进行绑定。

### 参数绑定

在方法路由中，有一种特殊的参数路由，可以方便实现RESTful API。

```js
@Controller("/admin")
export class AdminController {
    ...
    @GetMapping("/test/:id") //在方法装饰器中，申明参数
    test(@PathVariable("id") id: number){ // 使用PathVariable获取绑定的参数
        ...
    }
    ...
}
```
koatty的路由组件`koatty_router`基于`@koa/router`实现（gRPC除外），详细路由相关教程请参考 [@koa/router](https://github.com/koajs/router) 

### 路由配置

在项目 src/config/router.ts存放着路由自定义配置，该配置用于初始化路由实例。

```js
    prefix: string;
    methods ?: string[];
    routerPath ?: string;
    sensitive ?: boolean;
    strict ?: boolean;
```
如果项目`protocol`协议为`grpc`的时候，需要定义proto文件路径:

```js
export default {
    // prefix: string;
    // methods ?: string[];
    // routerPath ?: string;
    // sensitive ?: boolean;
    // strict ?: boolean;

    ext: {
        protoFile: "", // gRPC proto file
    }
};
```

### 路由特点

* @Controller()装饰器有两个作用，一是声明bean的类型是控制器；二是绑定控制器路由。如果使用@Controller()装饰器的时候没有指定path(没有参数)，默认参数值为"/"

* 方法路由装饰器仅可用于控制器类的方法。

* 方法路由装饰器可以给同一个方法添加多次。但是@Controller()装饰器同一个类仅能使用一次。

* 如果绑定的路由存在重复，按照IOC容器中控制器类的加载顺序，第一个加载的路由规则生效。需要注意此类问题。在后续版本中可能会增加优先级的特性来控制。

* 路由支持正则，支持参数绑定(gRPC服务中不可用)。详细路由相关教程请参考 [@koa/router](https://github.com/koajs/router) 


## 中间件

Koatty是基于 Koa 实现的，所以 Koatty 的中间件形式和 Koa 的中间件形式是一样的，都是基于洋葱圈模型。每次我们编写一个中间件，就相当于在洋葱外面包了一层。

Koatty框架默认加载了trace、payload等中间件，能够满足大部分的Web应用场景。用户也可以自行增加中间件进行扩展。

Koatty中间件类必须使用`@Middleware`来声明，该类必须要包含名为`run(options: any, app: App)`的方法。该方法在应用启动的时候会被调用执行，并且返回值是一个`function (ctx: any, next: any){}`，这个function是Koa中间件的格式。

### 使用中间件

使用命令行工具koatty_cli，在命令行执行命令:

```bash
//jwt 为自定义中间件名
kt middleware jwt
```
会自动在项目目录生成文件 src/middleware/JwtMiddleware.ts

生成的中间件代码模板: 

```js

/**
 * Middleware
 * @return
 */

import { Middleware, Helper } from "koatty";
import { App } from '../App';

@Middleware()
export class JwtMiddleware {
    run(options: any, app: App) {
        // 在此实现中间件逻辑
        ...
    }
}
```

修改项目中间件配置 src/config/middleware.ts

```js
list: ['JwtMiddleware'], //加载的中间件列表
config: { //中间件配置 
	JwtMiddleware: {
		//中间件配置项
	}
}

```
### 禁用中间件

对于项目中自行开发中间件，如果要禁用，只需要修改中间件配置文件即可:

src/config/middleware.ts

```js
list: [], //列表中没有PassportMiddleware，因此Passport中间件不会执行
config: { //中间件配置 
	'PassportMiddleware': {...}, 
}
```

### 使用koa中间件

Koatty支持使用koa的中间件（包括koa1.x及2.x的中间件）：

src/middleware/PassportMiddleware.ts

```js
const passport = require('koa-passport');


@Middleware()
export class PassportMiddleware {
    run(options: any, app: App) {
        return passport.initialize();
    }
}

```
挂载并配置使用： 

src/config/middleware.ts

```js
list: ['PassportMiddleware'], //加载的中间件列表
config: { //中间件配置 
	'PassportMiddleware': {
		//中间件配置项
	}
}
```

### 使用express中间件

Koatty兼容支持express的中间件，用法同上文koa中间一样，框架会自动识别进行兼容转换。


### 非HTTP/S协议下的中间件

如果项目使用的`protocol`协议为`grpc`、`ws`、`wss`等非HTTP/S协议，中间件需要注意ctx的部分属性会不一致，例如ctx.header在`grpc`下不存在，具体可用属性会在gRPC和WebSocket章节说明。

## 控制器

Koatty控制器类使用`@Controller()`装饰器声明，该装饰器的入参用于绑定控制器访问路由，参数默认值为`\/`。控制器类默认放在项目的`src/controller`文件夹内，支持使用子文件夹进行归类。Koatty控制器类必须实现接口`IController`。


### 创建控制器

使用koatty_cli命令行工具：

单模块模式：

```bash
kt controller index //默认http协议

//
kt controller -t http index
kt controller -t grpc index
kt controller -t ws index
```

会自动创建 src/controller/IndexController.ts文件。

多模块模式：


```bash
kt controller admin/index
```

会自动创建 src/controller/Admin/IndexController.ts文件。


控制器模板代码如下：

```js
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
### 控制器特点

* 控制器类必须实现接口 IController

* 控制器类构造方法第一个入参必须是`ctx: KoattyContext`, 且构造方法内需要给ctx属性赋值: 

```js

constructor(ctx: KoattyContext) {
  this.ctx = ctx;
}
```

* 根据软件分层架构, 控制器不能被其他控制器调用(确实需要调用的,将逻辑下沉到Service层进行代码复用), 
  也不能被其他组件引用(反模式)


### 获取参数

koatty解析和处理request参数后，在控制器中我们可以通过以下方法进行获取参数值：

* QueryString参数

通过@Get装饰器获取：

```js
...
  @GetMapping("/get")
  async get(@Get("id") id: number): Promise<any> {
    console.log(id);
  }
...
```
通过@RequestParam装饰器获取：
```js
...
  @GetMapping("/get")
  async get(@RequestParam("id") id: number): Promise<any> {
    console.log(id);
  }
...
```

通过ctx.query获取：

```js
...
  @GetMapping("/get")
  async get(): Promise<any> {
    console.log(this.ctx.query["id"]);
  }
...
```
* RESTful API参数

通过@PathVariable装饰器获取：
```js
  ...
  @GetMapping("/test/:id") //在方法装饰器中，申明参数
  test(@PathVariable("id") id: number){ // 使用PathVariable获取绑定的参数
      ...
  }
  ...
```

通过ctx.requestParam获取:
```js
  ...
  @GetMapping("/test/:id") //在方法装饰器中，申明参数
  test(){ // 使用PathVariable获取绑定的参数
      console.log(this.ctx.requestParam["id"]);...
  }
  ...
```

* Body参数

通过@Post装饰器获取：
```js
...
  @PostMapping("/post")
  async post(@Post("id") id: number): Promise<any> {
    console.log(id);
  }
...
```

通过@RequestBody装饰器获取：
```js
...
  @PostMapping("/post")
  async post(@RequestBody() body: any): Promise<any> {
    console.log(body.post);
  }
...
```

通过ctx.requestBody获取:
```js
...
  @PostMapping("/post")
  async post(): Promise<any> {
    console.log(ctx.requestBody.post);
  }
...
```

> RequestBody装饰器获取的值包括表单参数以及上传的文件对象

* 上传文件

通过@File装饰器获取：
```js
...
  @PostMapping("/post")
  async post(@File("filename") fileObject: any): Promise<any> {
    console.log(fileObject);
  }
...
```

通过@RequestBody装饰器获取：
```js
...
  @PostMapping("/post")
  async post(@RequestBody() body: any): Promise<any> {
    console.log(body.file);
  }
...
```

通过ctx.requestBody获取:
```js
...
  @PostMapping("/post")
  async post(): Promise<any> {
    console.log(ctx.requestBody.file);
  }
...
```

* HTTP header

通过@Header装饰器获取：
```js
...
  @PostMapping("/get")
  async get(@Header("x-access-token") token: string): Promise<any> {
    console.log(token);
  }
...
```

通过ctx.get获取：
```js
...
  @PostMapping("/get")
  async get(): Promise<any> {
    const token = this.ctx.get("x-access-token");
    console.log(token);
  }
...
```
通过ctx.header获取：
```js
...
  @PostMapping("/get")
  async get(): Promise<any> {
    console.log(this.ctx.header);
  }
...
```

### 访问控制

类之间的引用遵循Typescript的作用域 private | protected | public， 如果未显式声明，类方法的作用域为public。

> 只要给控制器类方法绑定了路由，那么方法即可被url映射访问(即使该方法的作用域不是public)。这是因为目前通过反射无法获取到方法的作用域关键字(有知道的请告诉我😁)，暂时未实现URL访问作用域控制。

### 控制器属性及方法

控制器属性及方法请参考 [BaseController API](https://github.com/Koatty/koatty/blob/master/docs/api/koatty.basecontroller.md)

## 服务层

简单来说，Service 就是在复杂业务场景下用于做业务逻辑封装的一个抽象层，提供这个抽象有以下几个好处：

* 保持 Controller 中的逻辑更加简洁。
* 保持业务逻辑的独立性，抽象出来的 Service 可以被多个 Controller 重复调用。
* 将逻辑和展现分离，更容易编写测试用例

Koatty中服务类使用`@Service()`装饰器声明。服务类默认放在项目的`src/service`文件夹内，支持使用子文件夹进行归类。Koatty服务类必须实现接口`IService`。

### 创建服务类

使用koatty_cli命令行工具：

```bash
kt service test
```

会自动创建src/service/test.js,生成的模板代码：

```js
import { Service, Autowired, Scheduled, Cacheable } from "koatty";
import { App } from '../App';

@Service()
export class TestService  {
    app: App;

    //实现test方法
    test(name: string) {
        return name;
    }
}
```

### 使用服务类

通过装饰器注入:

```js
@Autowired()
testService: TestService;
```

通过IOC容器获取:

```js
this.testService = IOCContainer.get("TestService", "SERVICE");
```

调用服务类方法：

```js
this.testService.test();
```

## 持久层

持久层负责将服务层中的业务对象持久化到数据库中，ORM封装对数据库的访问操作，直接把对象映射到数据库。

> 持久层是一种业务逻辑分层，在框架中并不是必须的。
> 持久层在框架IOC容器的类型是`COMPONENT`。
> 框架启动时持久层会同插件一起加载。 在插件中，是可以引用持久层的。
> Koatty目前默认支持TypeORM。如需使用其他类型的ORM，例如sequelize、mongose等，可以参考`koatty_typeorm`插件自行实现。

### 创建模型类

通过koatty_cli命令行工具创建数据模型以及实体:

```shell
kt model test
```

该工具会自动创建实体类`UserEntity`以及模型类`UserModel`:

```js
@Component()
@Entity('user') // 对应数据库表名
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
模型类`UserModel`中已经自动生成了CURD常见的数据操作方法，甚至还有分页。

除此之以外，还会在plugin目录自动引入`koatty_typeorm`插件，需要在插件列表中加载。


### 使用模型类

在service类或其他组件中，可以通过装饰器注入:

```js
@Autowired()
userModel: UserModel;
```

通过IOC容器获取:

```js
this.userModel = IOCContainer.get("UserModel", "COMPONENT");
```

调用模型类方法：

```js
this.userModel.Find();
```

### 配置

在项目的plugin配置 config/plugin.ts 中，修改数据库相关配置项:

```js
// src/config/plugin.ts
export default {
  list: ['TypeormPlugin'], // 加载的插件列表,执行顺序按照数组元素顺序
  config: { // 插件配置
    TypeormPlugin: {
        //默认配置项
        "type": "mysql", //mysql, mariadb, postgres, sqlite, mssql, oracle, mongodb, cordova
        host: "127.0.0.1",
        port: 3306,
        username: "test",
        password: "test",
        database: "test",

        "synchronize": false, //true 每次运行应用程序时实体都将与数据库同步
        "logging": true,
        "entities": [`${process.env.APP_PATH}/model/*`],
        "entityPrefix": ""
    }
  },
};

```

为了方便管理，我们也可以将数据库配置统一放到 config/db.ts内(需要删除 config/plugin.ts 中TypeormPlugin配置):

```js
export default {
    /*database config*/
    "DataBase": { // used koatty_typeorm
        //默认配置项
        "type": "mysql", //mysql, mariadb, postgres, sqlite, mssql, oracle, mongodb, cordova
        host: "${mysql_host}",
        port: "${mysql_port}",
        username: "${mysql_user}",
        password: "${mysql_pass}",
        database: "${mysql_database}",

        "synchronize": false, //true 每次运行应用程序时实体都将与数据库同步
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

## 插件

插件机制是在保证框架核心的足够精简、稳定的前提下，对框架进行底层扩展。

### 为什么需要插件

我们在使用中间件的过程中，发现一些问题：

* 中间件的定位是拦截用户请求，并在它前后做一些事情，例如：鉴权、安全检查、访问日志等等。但实际情况是，有些功能是和请求无关的，例如：定时任务、消息订阅、后台逻辑等等。

* 有些功能包含非常复杂的初始化逻辑，需要在应用启动的时候完成。这显然也不适合放到中间件中去实现。

综上所述，我们需要一套更加强大的机制，来管理、编排那些相对独立的业务逻辑。典型的应用场景就是注册中心注册、向配置中心拉取配置等。

> 在框架IOC容器中，插件是一种特殊的`COMPONENT`类型
> 
> 插件应尽量保持独立性，不和其他组件发生耦合
> 
> 在必要的情况下，插件可以调用持久层。但是不能调用服务层、中间件以及控制器，也不能被其他组件调用

### 创建插件

插件一般通过 npm 模块的方式进行复用：

```shell
npm i koatty_apollo --save
```


使用`koatty_cli`在应用中创建一个插件类:

```shell
kt plugin apollo
```
生成的插件代码模板: 

```js
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

然后需要在应用的 config/plugin.ts 中声明：

```js
list: ['ApolloPlugin'], //加载的插件列表
config: { //插件配置 
	'ApolloPlugin': {
		//插件配置项
	}
}
```
### 禁用插件

对于项目中插件，如果要禁用，只需要修改插件配置文件即可:

src/config/plugin.ts

```js
list: [], //列表中没有ApolloPlugin，因此ApolloPlugin插件不会执行

config: { //插件配置 
	'ApolloPlugin': {...}, 
}

```
# 进阶应用

## 参数验证

参数验证在项目中是非常常用的功能，Koatty框架为此专门封装了一个库 `koatty_validation`，可以在项目中很方便的使用。Koatty提供了两种参数验证的方案，分别适用于不同的场景:

### 方案一：装饰器@Valid及@Validated

@Valid及@Validated装饰器仅适用于控制器类

```js
@RequestMapping('/')
// 判断入参是否为email
index(@RequestBody() @Valid("IsEmail") body: string): Promise<any> {
  return this.ok('Hi Koatty');
}
```
@Validated装饰器需要配合Dto类使用:

```js
  @RequestMapping('/SayHello') 
  @Validated() // DTO参数验证装饰器
  SayHello(@RequestBody() params: SayHelloRequestDto): Promise<SayHelloReplyDto> {
    const res = new SayHelloReplyDto();
    return Promise.resolve(res);
  }
```

使用cli工具创建Dto类:

```sh
kt dto SayHelloRequest
```

Dto类增加验证规则:

```js
@Component()
export class SayHelloRequestDto {
  @IsNotEmpty({ message: "手机号码不能为空" })
  phoneNum: string;

  ...

}
```

### 方案二：FunctionValidator及ClassValidator

非控制器类型的bean内想要做参数验证，我们可以使用FunctionValidator及ClassValidator。

FunctionValidator:

```js
// 直接抛出错误
FunctionValidator.IsNotEmpty(str, "cannot be empty");
FunctionValidator.Contains(str, {message: "must contain s", value: "s"});

// 返回 true or false
if (ValidFuncs.IsEmail(str)) {
  ....
}
```
ClassValidator:

```js
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
### 验证规则

`koatty_validation`定义了一系列常用的[验证规则](https://github.com/Koatty/koatty_validation)

除了内置规则，还可以自定义函数验证：

* 配合 @Valid 装饰器使用自定义函数:

```js
@Controller('/api/login')
export class LoginController {
  ...

  async GetSignout(
    @Header("X-User-Token") @Valid((value: unknown) => {
    return value !== undefined && value !== null;
  }, { message: "value值不能为null或undefined"}) token: string) {
    // do something
  }
  ...

}

```

* 配合 @Validated 装饰器使用自定义函数:

```js

@Controller('/api/login')
export class LoginController {
  ...

  @Validated()
  async GetSignout(@Post() someObj: ObjectDto) {
    // do something
  }
  ...
}

// class ObjectDto
export class ObjectDto {
  ...
  @CheckFunc((value: unknown)=> {
    return value !== undefined && value !== null;
  }, { message: "用户名不能为空" })
  username: string;
  ...
}

```

* Dto类中自定义 ：

```js
@Controller('/api/login')
export class LoginController {
  ...

  @Validated()
  async GetSignout(@Post() someObj: ObjectDto) {
    // call valid()
    if (!someObj.validUserName()) {
      throw new Exception("用户被禁用", 1004, 200);
    }
  }
  ...
}

// class ObjectDto
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

## 异常处理

Koatty框架封装了koatty_exception组件，用于处理项目中需要抛出错误的场景，支持用户定制化Exception类来处理不同的业务异常。

* 规范项目中抛出错误的方式
* 定制HTTP Status、业务错误码以及错误消息
* 保存日志内错误栈

### 默认异常处理

如果应用内并没有自定义异常处理，在程序运行时产生的异常，会被框架使用默认的拦截处理机制统一拦截处理。例如直接抛出了 `Error`，框架同样可以拦截。

```js

// res: {"code":1,"message":"error"}
throw new Error("error");

// res: {"code":1000,"message":"error"}
throw new Exception("error", 1000);

// res: {"code":1000,"message":"error"}
ctx.throw("error", 1000);
```

### 自定义异常处理

我们可以自定义异常处理类，这个类需要继承 `Exception`基类:

```js

@ExceptionHandler() // 注册全局异常处理
export class BussinessException1 extends Exception {
    // 在handler内统一对异常进行处理
    async handler(ctx: KoattyContext): Promise<any> {
        // http协议下返回 ctx.res.end, 如果是gRPC协议可根据ctx.protocol进行判断处理
        return ctx.res.end(this.message);
    }
}

export class BussinessException2 extends Exception {
    // 在handler内统一对异常进行处理
    async handler(ctx: KoattyContext): Promise<any> {
        // http协议下返回 ctx.res.end, 如果是gRPC协议可根据ctx.protocol进行判断处理
        return ctx.res.end({code: this.code, message: this.message});
    }
}

```
在应用代码中，我们可以根据业务逻辑，抛出不同的异常：

```js

// res: {"code":1,"message":"error"}
throw new BussinessException1("error");

// res: {"code":1000,"message":"error"}
throw new BussinessException2("error", 1000);
```

### 全局异常处理

koatty提供了一个装饰器 `@ExceptionHandler()`来注册全局的异常处理。

```js

@ExceptionHandler() // 注册全局异常处理
export class BussinessException extends Exception {
    // 在handler内统一对异常进行处理
    async handler(ctx: KoattyContext): Promise<any> {
        // http协议下返回 ctx.res.end, 如果是gRPC协议可根据ctx.protocol进行判断处理
        return ctx.res.end(this.message);
    }
}

```

全局异常处理仅注册一次，多次注册自动覆盖。注册全局异常处理之后，除非主动抛出不同类型的异常，否则所有的异常均交给全局异常处理类拦截。

```js
...
async index(type: string) {
    if (type == '1') {
      // 指定BussinessException2处理异常
      // res: {"code":1000,"message":"error"}
      throw new BussinessException2("error", 1000);
    } else {
      // 未明确指定, 交给全局异常处理
      // res: error
      throw new Error("error", 1000);
    }
}
...
```

## 缓存

Koatty封装了一个缓存库 [koatty_cacheable](https://github.com/koatty/koatty_cacheable)，支持内存以及redis存储。 `koatty_cacheable` 提供了两个装饰器 CacheAble, CacheEvict。

### 缓存配置

缓存配置保存在 `config/db.ts`内：

```js
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
默认使用memory存储，如果需要使用redis，则需要补充redis 链接相关配置项。

### 缓存使用

* @CacheAble(cacheName: string, timeout = 3600)

开启方法结果自动缓存。当执行该方法的时候，会先查找缓存，缓存结果存在直接返回结果，不存在则执行后返回并保持执行结果。

* @CacheEvict(cacheName: string, eventTime: eventTimes = "Before")

清除方法结果缓存，eventTimes表示清除的时机，分别为 Before=方法执行前， After=方法执行后

* GetCacheStore(app: Koatty) 

获取缓存实例，可以手动调用get、set等方法操作缓存

示例：

```js
import { CacheAble, CacheEvict, GetCacheStore } from "koatty_cacheable";

@Service()
export class TestService {

    @CacheAble("testCache") // 自动缓存结果,缓存key=testCache
    getTest(){
        //todo
    }

    @CacheEvict("testCache") // 执行setTest()之前,先清除缓存,缓存key=testCache
    setTest(){
        //todo
    }

    test(){
        // 自行操作缓存实例
        const store = GetCacheStore(this.app);
        store.set(key, value);
    }
}

```

> 注意： @CacheAble以及@CacheEvict装饰器不能用于控制器类


## 计划任务

Koatty封装了一个计划任务库 [koatty_schedule](https://github.com/koatty/koatty_schedule)，支持cron表达式以及基于redis的分布式锁。

### cron表达式

cron表达式包含6位，分别代表 秒、分、小时、天、月、周：

 * Seconds: 0-59
 * Minutes: 0-59
 * Hours: 0-23
 * Day of Month: 1-31
 * Months: 1-12 (Jan-Dec)
 * Day of Week: 1-7 (Mon-Sun)

### @Scheduled(cron: string)

通过装饰器 @Scheduled 可以很方便的给方法增加任务执行计划:

```js
import { Scheduled, RedLock } from "koatty_schedule";

export class TestService {

    @Scheduled("0 * * * * *")
    Test(){
        //todo
    }
}

```

### 任务执行锁

在某些业务场景，计划任务是不能并发执行的，解决方案就是加锁。`koatty_schedule`实现了一个基于redis的分布式锁。

* RedLock(name?: string, options?: RedLockOptions)

RedLockOptions:

```
  /**
   * 锁超时时间ms, 默认 10000
   */ 
  lockTimeOut?: number;
  /**
   * 获取锁最大重试次数, 默认3次
   */
  retryCount?: number;
  /**
   * redis 配置, 支持Standalone、 Sentinel、 Cluster
   */
  RedisOptions: RedisOptions;
```

例子：

```js
import { Scheduled, RedLock } from "koatty_schedule";

export class TestService {

    @Scheduled("0 * * * * *")
    @RedLock("testCron") //locker
    Test(){
        //todo
    }
}

```

因为使用了redis，redis缓存配置保存在 `config/db.ts`内：

```js
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

也可以调用装饰器时传入配置:

```js
import { Scheduled, RedLock } from "koatty_schedule";

export class TestService {
    @Config("redisConf", "db")
    private redisConf;

    @Scheduled("0 * * * * *")
    @RedLock("testCron", {
      RedisOptions: redisConf
    }) //locker
    Test(){
        //todo
    }
}

```

需要注意几个点：

> @Scheduled及@RedLock装饰器不能用于控制器类； 
> 
> 需要根据执行计划任务的时长来配置相应的参数，防止锁失效
> 
> 当锁超时但业务逻辑未执行完时，锁会自动续期一次，续期时间到期后仍然未完成，锁会被释放

## gRPC

Koatty从 3.4.x版本开始支持gRPC服务。

### proto协议

使用koatty_cli命令行工具(>=3.4.6)：

```bash
kt proto hello
```

会自动创建 src/proto/Hello.proto文件。根据实际情况进行修改

### gRPC协议控制器

使用koatty_cli命令行工具(>=3.4.6)：

单模块模式：

```bash
kt controller -t grpc hello
```

会自动创建 src/controller/HelloController.ts文件。

多模块模式：


```bash
kt controller -t grpc admin/hello
```

会自动创建 src/controller/Admin/HelloController.ts文件。


控制器模板代码如下：

```js
import { KoattyContext, Controller, Autowired, RequestMapping, RequestBody } from 'koatty';
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
   * SayHello 接口
   * 访问路径  grpc://127.0.0.1/Hello/SayHello
   *
   * @param {SayHelloRequestDto} data
   * @returns
   */
  @RequestMapping('/SayHello') // Consistent with proto.service.method name
  @Validated() // 参数验证
  SayHello(@RequestBody() params: SayHelloRequestDto): Promise<SayHelloReplyDto> {
    const res = new SayHelloReplyDto();
    return Promise.resolve(res);
  }

}
```

除控制器文件以外，Koatty还会自动创建RPC协议的输入输出Dto类，例如上文中的 `SayHelloRequestDto`以及 `SayHelloReplyDto`

### 服务配置

修改 config/config.ts :

```js
export default {
  ...
  protocol: "grpc", // Server protocol 'http' | 'https' | 'http2' | 'grpc' | 'ws' | 'wss'

  ...

}
```

修改 config/router.ts :

```js
export default {
  ...
    /**
     *  Other extended configuration
     */
    ext: {
        protoFile: process.env.APP_PATH + "proto/Hello.proto", // gRPC proto file
    }

  ...

}
```

OK，现在可以启动一个gRPC服务器。

## WebSocket

Koatty从 3.4.x版本开始支持WebSocket服务。

### WebSocket协议控制器

使用koatty_cli命令行工具(>=3.4.6)：

单模块模式：

```bash
kt controller -t ws requst
```

会自动创建 src/controller/RequstController.ts文件。

多模块模式：


```bash
kt controller -t ws admin/requst
```

会自动创建 src/controller/Admin/RequstController.ts文件。


控制器模板代码如下：

```js
import { KoattyContext, Controller, Autowired, GetMapping } from 'koatty';
import { App } from '../App';
// import { TestService } from '../service/TestService';

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
   * index 接口
   * 访问路径  ws://127.0.0.1/requst
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

### 服务配置

修改 config/config.ts :

```js
export default {
  ...
  protocol: "ws", // Server protocol 'http' | 'https' | 'http2' | 'grpc' | 'ws' | 'wss'

  ...

}
```

OK，现在可以启动一个WebSocket服务器。

## 事件机制(event)

Koatty框架在应用启动过程中，app对象除koa自身包含的事件之外，还定义了一系列事件:

![时间轴](https://cdn.jsdelivr.net/gh/Koatty/koatty_doc@master/docs/assets/event.png)

> 注意： 
> 
> appStart阶段, 服务启动后才会触发appStart事件

我们可以根据项目需要绑定到不同的事件。例如在服务注册发现场景，如果硬件宕机，可以在appStop事件上绑定处理服务注销处理。

```js

app.once("appStop", () => {
  //注销服务
  ...
})
```

### bootFunc

装饰器`@Bootstrap`的作用是声明的项目入口类，该装饰器支持传入一个函数作为参数，此函数在项目启动时会先执行。

```js
@Bootstrap(
    //bootstrap function
    (app: any) => {
        // todo
    }
)
export class App extends Koatty {
  ...
}
```
常见的应用场景是启动之前处理一些运行环境设置，例如NODE_ENV等。启动函数支持异步。

> 注意： 启动函数执行时机在框架执行`initialize`初始化之后，此时框架的相关路径属性(appPath、rootPath等)和process.env已经加载设置完成，但是配置及其他组件(插件、中间件、控制器等)并未加载，在定义启动函数的时候需要注意。

### BindEventHook

除了 `@Bootstrap`装饰器，我们还可以通过 `BindEventHook` 自定义装饰器用于启动类来绑定应用事件(appBoot、appReady、appStart、appStop)。

```js
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

在项目启动类上使用:

```js
@Bootstrap()
@TestBootstrap()
export class App extends Koatty {
  ...
}
```

> 注意：通过BindEventHook创建的自定义装饰器，其函数执行是由 事件(appBoot、appReady、appStart、appStop)触发，需要注意框架启动逻辑及相关上下文


## 装载自定义

项目入口类还可以设置另外两个装饰器，它们分别是：

* @ComponentScan('./')
  声明项目组件的目录，默认为项目src目录，含所有的组件类型

* @ConfiguationScan('./config')
  声明项目的配置文件目录，默认为src/config目录

## IOC容器

IoC全称Inversion of Control，直译为控制反转。在以ES6 Class范式编程中，简单的通过new创建实例并持有的方式，会发现以下缺点：

* 实例化一个组件，要先实例化依赖的组件，强耦合

* 每个组件都需要实例化一个依赖组件，没有复用

* 很多组件需要销毁以便释放资源，例如DataSource，但如果该组件被多个组件共享，如何确保它的使用方都已经全部被销毁

* 随着更多的组件被引入，需要共享的组件写起来会更困难，这些组件的依赖关系会越来越复杂


如果一个系统有大量的组件，其生命周期和相互之间的依赖关系如果由组件自身来维护，不但大大增加了系统的复杂度，而且会导致组件之间极为紧密的耦合，继而给测试和维护带来了极大的困难。

因此，核心问题是：

- 1、谁负责创建组件？
- 2、谁负责根据依赖关系组装组件？
- 3、销毁时，如何按依赖顺序正确销毁？

解决这一问题的核心方案就是IoC。参考Spring IOC的实现机制，Koatty实现了一个IOC容器（koatty_container），在应用启动的时候，自动分类装载组件，并且根据依赖关系，注入相应的依赖。因此，IoC又称为依赖注入（DI：Dependency Injection），它解决了一个最主要的问题：将组件的创建+配置与组件的使用相分离，并且，由IoC容器负责管理组件的生命周期。

### 组件分类

根据组件的不同应用场景，Koatty把Bean分为 'COMPONENT' | 'CONTROLLER' | 'MIDDLEWARE' | 'SERVICE' 四种类型。

* COMPONENT
  扩展类、第三方类属于此类型，例如 Plugin，ORM持久层等

* CONTROLLER
  控制器类

* MIDDLEWARE
  中间件类

* SERVICE
  逻辑服务类

### 组件加载

通过Koatty框架核心的Loader，在项目启动时，会自动分析并装配Bean，自动处理好Bean之间的依赖问题。IOC容器提供了一系列的[API接口](#IOCContainer)，方便注册以及获取装配好的Bean。

### 循环依赖

随着项目规模的扩大，很容易出现循环依赖。koatty_container解决循环依赖的思路是延迟加载。koatty_container在 `app` 上绑定了一个 `appReady` 事件，用于延迟加载产生循环依赖的bean, 在使用IOC的时候需要进行处理：

```js
// 
app.emit("appReady");
```

注意：虽然延迟加载能够解决大部分场景下的循环依赖，但是在极端情况下仍然可能装配失败，解决方案：

1、尽量避免循环依赖，新增第三方公共类来解耦互相依赖的类

2、使用IOC容器获取类的原型(getClass)，自行实例化


## AOP切面

Koatty基于IOC容器实现了一套切面编程机制，利用装饰器以及内置特殊方法，在bean装载到IOC容器内的时候，通过嵌套函数的原理进行封装，简单而且高效。

### 切点声明类型

* 装饰器声明
  通过@Before、@After、@BeforeEach、@AfterEach装饰器声明的切点

* 内置方法声明
  通过__before、__after 内置隐藏方法声明的切点

两种声明方式的区别:

| 声明方式     | 依赖Aspect切面类 | 能否使用类作用域 | 入参依赖切点方法 | 优先级 | 使用限制                     |
| ------------ | ---------------- | ---------------- | ---------------- | ------ | ---------------------------- |
| 装饰器声明   | 依赖             | 不能             | 依赖             | 低     | 可用于所有类型的bean         |
| 内置方法声明 | 不依赖           | 能               | 不依赖           | 高     | 只能用于CONTROLLER类型的bean |

> 依赖Aspect切面类： 需要创建对应的Aspect切面类才能使用

> 能否使用类作用域： 能不能使用切点所在类的this指针

> 入参依赖切点方法： 装饰器声明切点所在方法的入参同切面共享，内置方法声明的切点因为可以使用this，理论上能获取切点所在类的任何属性，更加灵活

<mark>注意: 如果类使用了装饰器@BeforeEach，且这个类还包含\_\_before方法（不管是自身拥有还是继承自父类），那么\_\_before方法优先级高于装饰器，该类的装饰器@BeforeEach无效（@AfterEach和\_\_after也是一样） </mark>

例如: 


```js
@Controller('/')
export class TestController {
  app: App;
  ctx: KoattyContext;

  @Autowired()
  protected TestService: TestService;

  // 不依赖切面类
  async __before(): Promise<any> { // 不依赖具体方法的入参，自行通过this指针获取
      console.log(this.app)  // 可以使用类作用域，通过this指针获取当前类属性
      console.log(this.ctx)
  }

  @Before("TestAspect") //依赖TestAspect切面类, 能够获取path参数
  async test(path: string){

  }
}

```

### 创建切面类

使用`koatty_cli`进行创建：

```bash
kt aspect test
```

自动生成的模板代码:

```js 
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

## 装饰器

### 类装饰器

| 装饰器名称                     | 参数                                                                        | 说明                                                                                                                    | 备注                   |
| ------------------------------ | --------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- | ---------------------- |
| `@Aspect()`                    | `identifier` 注册到IOC容器的标识，默认值为类名。                            | 声明当前类是一个切面类。切面类在切点执行，切面类必须实现run方法供切点调用                                               | 仅用于切面类           |
| `@Bootstrap()`                 | `bootFunc` 应用启动前执行函数。具体执行时机是在app.on("appReady")事件触发。 | 声明当前类是一个启动类，为项目的入口文件。                                                                              | 仅用于应用启动类       |
| `@ComponentScan()`             | `scanPath` 字符串或字符串数组                                               | 定义项目需要自动装载进容器的目录                                                                                        | 仅用于应用启动类       |
| `@Component()`                 | `identifier` 注册到IOC容器的标识，默认值为类名。                            | 定义该类为一个组件类                                                                                                    | 第三方模块或引入类使用 |
| `@ConfiguationScan()`          | `scanPath` 字符串或字符串数组，配置文件的目录                               | 定义项目需要加载的配置文件的目录                                                                                        | 仅用于应用启动类       |
| `@Controller()`                | `path` 绑定控制器访问路由                                                   | 定义该类是一个控制器类，并绑定路由。默认路由为"/"                                                                       | 仅用于控制器类         |
| `@Service()`                   | `identifier` 注册到IOC容器的标识，默认值为类名。                            | 定义该类是一个服务类                                                                                                    | 仅用于服务类           |
| `@Middleware()`                | `identifier` 注册到IOC容器的标识，默认值为类名。                            | 定义该类是一个中间件类                                                                                                  | 仅用于中间件类         |
| `@ExceptionHandler()`          |                                                                             | 定义该类是一个全局异常处理类类                                                                                          | 仅用于异常处理类       |
| `@BeforeEach(aopName: string)` | `aopName` 切点执行的切面类名                                                | 为当前类声明一个切面，在当前类每一个方法("constructor", "init", "__before", "__after"除外)执行之前执行切面类的run方法。 |                        |
| `@AfterEach(aopName: string)`  | `aopName` 切点执行的切面类名                                                | 为当前类声明一个切面，在当前每一个方法("constructor", "init", "__before", "__after"除外)执行之后执行切面类的run方法。   |                        |
|                                |                                                                             |                                                                                                                         |                        |


### 属性装饰器

| 装饰器名称     | 参数                                                                                                                                                                                                                       | 说明                                                                 | 备注 |
| -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- | ---- |
| `@Autowired()` | `identifier` 注册到IOC容器的标识，默认值为类名 <br> `type` 注入bean的类型 <br> `constructArgs` 注入bean构造方法入参。如果传递该参数，则返回request作用域的实例 <br> `isDelay` 是否延迟加载。延迟加载主要是解决循环依赖问题 | 从IOC容器自动注入bean到当前类                                        |      |
| `@Config()`    | `key` 配置项的key <br> `type` 配置项类型                                                                                                                                                                                   | 配置项类型自动根据配置项所在文件来定义，例如 "db" 代表在 db.ts文件内 |      |
| `@Values()`    | `val` 属性的值，可以是函数，属性值为函数运算结果 <br> `defaultValue` 默认值，当val值为Null、undefined、NaN时，取默认值                                                                                                     | 用于动态修改类实例的属性值                                           |      |



### 方法装饰器

| 装饰器名称                 | 参数                                                                                                                                                                                                                      | 说明                                                                     | 备注                                          |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ | --------------------------------------------- |
| `@Before(aopName: string)` | `aopName` 切点执行的切面类名                                                                                                                                                                                              | 为当前方法声明一个切面，在当前方法执行之前执行切面类的run方法。          |                                               |
| `@After(aopName: string)`  | `aopName` 切点执行的切面类名                                                                                                                                                                                              | 为当前方法声明一个切面，在当前方法执行之后执行切面类的run方法。          |                                               |
| `@RequestMapping()`        | `path` 绑定的路由 <br> `requestMethod` 绑定的HTTP请求方式。可以使用`RequestMethod` enum数据进行赋值，例如 `RequestMethod.GET`。如果设置为`RequestMethod.ALL`表示支持所有请求方式 <br> `routerOptions` koa/_router的配置项 | 用于控制器方法绑定路由                                                   | 仅用于控制器方法                              |
| `@GetMapping()`            | `path` 绑定的路由 <br> `routerOptions` koa/_router的配置项                                                                                                                                                                | 用于控制器方法绑定Get路由                                                | 仅用于控制器方法                              |
| `@PostMapping()`           | `path` 绑定的路由 <br> `routerOptions` koa/_router的配置项                                                                                                                                                                | 用于控制器方法绑定Post路由                                               | 仅用于控制器方法                              |
| `@DeleteMapping()`         | `path` 绑定的路由 <br> `routerOptions` koa/_router的配置项                                                                                                                                                                | 用于控制器方法绑定Delete路由                                             | 仅用于控制器方法                              |
| `@PutMapping()`            | `path` 绑定的路由 <br> `routerOptions` koa/_router的配置项                                                                                                                                                                | 用于控制器方法绑定Put路由                                                | 仅用于控制器方法                              |
| `@PatchMapping()`          | `path` 绑定的路由 <br> `routerOptions` koa/_router的配置项                                                                                                                                                                | 用于控制器方法绑定Patch路由                                              | 仅用于控制器方法                              |
| `@OptionsMapping()`        | `path` 绑定的路由 <br> `routerOptions` koa/_router的配置项                                                                                                                                                                | 用于控制器方法绑定Options路由                                            | 仅用于控制器方法                              |
| `@HeadMapping()`           | `path` 绑定的路由 <br> `routerOptions` koa/_router的配置项                                                                                                                                                                | 用于控制器方法绑定Head路由                                               | 仅用于控制器方法                              |
| `@Scheduled()`             | `cron` 任务计划配置<br> * * * * * <br> Seconds: 0-59<br>Minutes: 0-59<br>Hours: 0-23<br>Day of Month: 1-31<br>Months: 1-12 (Jan-Dec)<br>Day of Week: 1-7 (Mon-Sun)                                                        | 定义类的方法执行计划任务                                                 | 不能用于控制器方法，依赖`koatty_schedule`模块 |
| `@Validated()`             |                                                                                                                                                                                                                           | 配合DTO类型进行参数验证                                                  | 方法入参没有DTO类型的不生效，仅用于控制器类   |
| `@RedLock()`               | `name` 锁的名称<br> `options` 锁配置，包含redis服务器连接配置                                                                                                                                                             | 定义方法执行时必须先获取分布式锁(基于Redis)，依赖`koatty_schedule`模块   |                                               |
| `@CacheAble()`             | `cacheName` 缓存name <br> `paramKey`基于方法入参作为缓存key,值为方法入参的位置,从0开始计数 <br> `redisOptions` Redis服务器连接配置                                                                                        | 基于Redis的缓存，依赖`koatty_cacheable`模块                              | 不能用于控制器方法                            |
| `@CacheEvict()`            | `cacheName` 缓存name <br> `paramKey`基于方法入参作为缓存key,值为方法入参的位置,从0开始计数 <br> `eventTime` 清除缓存的时点 <br>`redisOptions` Redis服务器连接配置                                                         | 同@Cacheable配合使用，用于方法执行时清理缓存，依赖`koatty_cacheable`模块 | 不能用于控制器方法                            |



### 参数装饰器

| 装饰器名称        | 参数                                                                                   | 说明                                    | 备注                     |
| ----------------- | -------------------------------------------------------------------------------------- | --------------------------------------- | ------------------------ |
| `@File()`         | `name` 文件名                                                                          | 获取上传的文件对象                      | 仅用于HTTP控制器方法参数 |
| `@Get()`          | `name` 参数名                                                                          | 获取querystring参数(获取路由绑定的参数) | 仅用于HTTP控制器方法参数 |
| `@Header()`       | `name` 参数名                                                                          | 获取Header内容                          | 仅用于HTTP控制器方法参数 |
| `@PathVariable()` | `name` 参数名                                                                          | 获取路由绑定的参数 /user/:id            | 仅用于HTTP控制器方法参数 |
| `@Post()`         | `name` 参数名                                                                          | 获取Post参数                            | 仅用于HTTP控制器方法参数 |
| `@RequestBody()`  |                                                                                        | 获取ctx.body                            | 仅用于控制器方法参数     |
| `@RequestParam()` | `name` 参数名                                                                          | 获取Get或Post参数，Post优先             | 仅用于控制器方法参数     |
| `@Valid()`        | `rule` 验证规则,支持内置规则或自定义函数 <br> `message` 规则匹配不通过时提示的错误信息 | 用于参数格式验证                        | 仅用于控制器类           |

# 编程规范和约定

Koatty遵循约定大于配置的原则。为规范项目代码，提高健壮性，做了一些默认的规范和约定。

## Koatty框架及周边组件版本定义

* 小版本：如：1.1.1 => 1.1.2（小功能增加，bug 修复等，向下兼容1.1.x）

* 中版本：如：1.1.0 => 1.2.0（较大功能增加，部分模块重构等。主体向下兼容，可能存在少量特性不兼容）

* 大版本：如：1.0.0 => 2.0.0（框架整体设计、重构等，不向下兼容）

* 稳定版本: 尾数字为偶数的版本为稳定版本，奇数的为非稳定版本

## 编程风格

* 以Class范式编程
  
  包括Controller、Service、Model等类型的类，使用`Class` 而非 `function`来组织代码。配置、工具、函数库、第三方库除外。

* 单个文件仅export一个类

在项目中，单个`.ts`文件仅`export`一次且导出的是`Class`。配置、工具、函数库、第三方库除外。

* 类名必须与文件名相同

熟悉JAVA的人对此一定不会陌生。类名同文件名必须相同，使得在IOC容器内保持唯一性，防止类被覆盖。

* 同类型不允许存在同名类
  

Koatty将IOC容器内的Bean分为 'COMPONENT' | 'CONTROLLER' | 'MIDDLEWARE' | 'SERVICE' 四种类型。

相同类型的Bean不允许有同名的类，否则会导致装载失败。

例如：`src/Controller/IndexController.ts` 和 `src/Controller/Test/IndexController.ts`就是同名类。

需要注意的是，Bean的类型是由装饰器决定的而非文件名或目录名。给`IndexController.ts`加 `@Service()`装饰器的话那么它的类型就是`SERVICE`。

* 对于Koatty官方出品的组件，我们建议通过 ^ 的方式引入依赖，并且强烈不建议锁定版本。

```js
{
  "dependencies": {
    "koatty_lib": "^1.0.0"
  }
}
```

# Q & A

Comesoon...
# API

## app

[API doc](https://github.com/Koatty/koatty_core/blob/main/docs/api/koatty_core.koatty.md)
## ctx

[API doc](https://github.com/Koatty/koatty_core/blob/main/docs/api/koatty_core.koattycontext.md)

## IOCContainer

[API doc](https://github.com/Koatty/koatty_container/blob/master/docs/api/koatty_container.container.md)

## 其他API

[API doc](https://github.com/Koatty/koatty/blob/master/docs/api/koatty.md)