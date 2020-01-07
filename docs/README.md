# Koatty
Koa2 + Typescript = Koatty. 

Use Typescript's decorator implement auto injection and AOP, just like SpringBoot.

Koatty是基于Koa2实现的一个具备IOC自动依赖注入以及AOP切面编程的敏捷开发框架，用法类似SpringBoot。

[![Version npm](https://img.shields.io/npm/v/koatty.svg?style=flat-square)](https://www.npmjs.com/package/koatty)[![npm Downloads](https://img.shields.io/npm/dm/koatty.svg?style=flat-square)](https://npmcharts.com/compare/koatty?minimal=true)

# 快速开始

## 第一个应用

### 1.安装命令行工具

```shell
npm i -g koatty_cli
```
命令行工具的版本同Koatty框架的版本是对应的，例如 koatty_cli@1.11.x 支持 koatty@1.11.x版本的新特性。

### 2.新建项目

```shell
koatty new projectName

cd ./projectName

yarn install


```

### 3.启动服务
```shell
// dev模式
npm run dev

// pro模式
npm start

```

 浏览器中访问  `http://localhost:3000/`. 

## 调试模式

墙裂推荐使用Visual Studio Code(简称 VScode)进行开发, 编辑项目目录下的 .vscode/launch.json文件（点击调试-配置也可以打开）:

```
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

选择 `TS Program` 以debug模式启动.

# 基础功能

## 项目结构

Koatty的命令行工具`koatty_cli`在创建项目的时候，默认会形成以下目录结构:


```js
├── dist                    //应用文件目录(编译后文件)

├── logs                   //日志文件目录

├── node_modules           //node模块目录

├── src                    //应用文件目录(源文件)

    └──config              //应用配置目录

        └──config.js       //应用配置文件

        └──db.js           //应用数据库配置文件
        
        └──middleware.js   //应用中间件配置文件
        
        └──router.js       //应用路由配置文件

    └──controller　　　　   //应用控制器目录

    └──model　　　　　　　   //应用持久层目录

    └──service　　　　　　　 //应用服务层目录

├── static　　　　　　       //静态资源目录,如果使用nginx请将root指向此目录

├── App.ts                 //应用入口文件

├── package.json           //应用依赖配置
```

但是Koatty支持灵活的自定义项目结构，除配置目录(通过@ConfiguationScan()定制)以及静态资源目录(需要修改Static中间件默认配置)以外，其他目录名称、结构等都可以自行定制。

## 入口文件

Koatty默认的入口文件是 `App.ts`，内容如下：

```
import { Koatty, Bootstrap } from "koatty";
// import * as path from "path";

@Bootstrap(
    //bootstrap function
    // (app: any) => {
    //调整libuv线程池大小
    // process.env.UV_THREADPOOL_SIZE = "128";
    //忽略https自签名验证
    // process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
    //运行环境
    // process.env.RUN_TIME = 'development';
    // }
)
// @ComponentScan('./')
// @ConfiguationScan('./config')
export class App extends Koatty {
    public init() {
        // this.app_debug = true; //线上环境请将debug模式关闭，即：app_debug:false
    }
}
```

App类继承于Koatty类，而Koatty是对于Koa的继承和扩展。因此可以认为App类的实例就是koa类的实例(进行了扩展) app对象。

Koatty通过`@Bootstrap()`装饰器来定义项目入口，`@Bootstrap()`可以接受函数作为参数，该函数在项目加载启动过程中，通过`appReady`事件触发执行。

如果修改了项目目录或者想排除某些目录Bean不自动进行加载，可以通过`@ComponentScan()`装饰器进行定制。

`@ConfiguationScan()`装饰器用于定制项目配置文件目录。

`app_debug` 值为`true`时，nodeEnv环境在 `development` 模式。并且控制器打印详细的日志信息。

## 配置

实际项目中，肯定需要各种配置，包括：框架需要的配置以及项目自定义的配置。Koatty 将所有的配置都统一管理，并根据不同的功能划分为不同的配置文件。

* config.ts 通用的一些配置
* db.ts 数据库配置
* router.ts 路由配置
* middleware.ts 中间件配置

除上述常见的配置文件之外，Koatty也支持用户自行定义的配置文件命名。


### 自定义配置扫描路径

配置文件默认放在 src/config/ 目录下，我们还可以通过在入口文件App.ts类自定义配置扫描路径：

```
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

```
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

```
//
...
const conf: any = this.app.config("test");

```
* 方式二(利用装饰器进行注入，推荐用法)

```
@Controller()
export class AdminController {
    @Value("test")
    conf: any;
}

```
### 配置分类及层级

Koatty在启动扫描配置文件目录时，会按照文件名对配置进行分类。例如：db.ts加载完成后，读取该文件内的配置项需要增加类型

```
// config函数的第二个参数为类型
const conf: any = this.app.config("test", "db");

或者

@Value("test", "db")
conf: any;

```

Koatty在读取配置时支持配置层级，例如配置文件db.ts：

```
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

```
@Value("database.db_host", "db")
dbHost: string;

或者

const dbHost: string = this.app.config("database.db_host", "db");

```

需要特别注意的是，层级配置仅支持直接访问到`二级`，更深的层级请赋值后再次获取:

```
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

## 路由

Koatty 通过RequestMapping类型装饰器进行路由注册，使用[@koa/router](https://github.com/koajs/router)进行路由解析。

首先注册`@Controller("/test")`装饰器的参数作为控制器访问入口，然后再遍历该控制器的方法上的装饰器GetMaping、
DeleteMaping、PutMaping、PostMaping等进行方法路由注册。

例如：
```
@Controller("/admin")
export class AdminController extends BaseController {
    ...
    @GetMaping("/test")
    test(){
        ...
    }
    ...
}
```
上述代码注册了路由 `/admin/test` ==> AdminController.test();

* @Controller()装饰器有两个作用，一是声明bean的类型是控制器；二是绑定控制器路由。如果使用@Controller()装饰器的时候没有指定path(没有参数)，默认参数值为"/"

* 路由装饰器（包括`RequestMapping`、`GetMaping`、`PostMaping`、`DeleteMaping`、`PutMaping`、`PatchMaping`、`OptionsMaping`、`HeadMaping`）仅可用于装饰控制器类的方法。

* 路由装饰器（包括`RequestMapping`、`GetMaping`、`PostMaping`、`DeleteMaping`、`PutMaping`、`PatchMaping`、`OptionsMaping`、`HeadMaping`）可以给同一个方法添加多次。但是@Controller()装饰器同一个类仅能使用一次。

* 如果绑定的路由存在重复，按照IOC容器中控制器类的加载顺序（不可控），第一个加载的路由规则生效。需要注意此类问题。在后续版本中可能会增加优先级的特性来控制。

* 路由支持正则，支持参数绑定。详细路由相关教程请参考 [@koa/router](https://github.com/koajs/router) 


### @RequestMapping([path, requestMethod, routerOptions])

用于控制器方法绑定路由

* path  path路径
* requestMethod  路由请求方式。可以使用`RequestMethod` enum数据进行赋值，例如 `RequestMethod.GET`。如果设置为`RequestMethod.ALL`表示支持所有请求方式
* routerOptions 路由配置

### @GetMaping([path, routerOptions])

用于控制器方法绑定Get路由

* path  path路径,默认值 `/`
* routerOptions 路由配置

类似功能的装饰器还有 `PostMaping`、`DeleteMaping`、`PutMaping`、`PatchMaping`、`OptionsMaping`、`HeadMaping`。详细用法参考API章节


### 路由配置

在项目 src/config/router.ts存放着路由自定义配置，该配置用于初始化`@koa/router`实例，作为**构造方法入参**使用，具体配置项请参考 [@koa/router](https://github.com/koajs/router)。

```
    prefix: string;
    /**
     * Methods which should be supported by the router.
     */
    methods ?: string[];
    routerPath ?: string;
    /**
     * Whether or not routing should be case-sensitive.
     */
    sensitive ?: boolean;
    /**
     * Whether or not routes should matched strictly.
     *
     * If strict matching is enabled, the trailing slash is taken into
     * account when matching routes.
     */
    strict ?: boolean;
```

## 中间件

Koatty框架默认加载了static、payload、trace三个中间件，能够满足大部分的Web应用场景。用户也可以自行增加中间件进行扩展。

### 创建中间件

使用命令行工具koatty_cli，在命令行执行命令:

```bash
//custom 为自定义中间件名
koatty middleware custom
```
会自动在项目目录生成文件 src/middleware/Custom.ts

生成的中间件代码模板: 

```js

/**
 * Middleware
 * @return
 */

import { Middleware, Helper } from "koatty";
import { App } from '../App';


const defaultOpt = {
    //默认配置项
};


@Middleware()
export class Custom {

    run(options: any, app: App) {
        options = Helper.extend(defaultOpt, this.options);
        //应用启动执行一次
        // app.once('appReady', () => {
        // });

        return function (ctx: any, next: any) {
            return next();
        };
    }
}
```
* options 中间件配置，src/config/middleware.ts内config项中间件名同名属性值
* app koatty实例
* ctx koa ctx上下文对象
* next 下一中间件操作句柄


### 配置中间件
写好自定义的中间件以后，开始定义配置并挂载运行：

修改项目中间件配置 src/config/middleware.ts

```js
list: ['Custom'], //加载的中间件列表
config: { //中间件配置 
	Custom: {
		//中间件配置项
	}
}

```


### 禁用中间件

对于项目中自行开发中间件，如果要禁用，只需要修改中间件配置文件即可:

src/config/middleware.ts

```
list: [], //列表中没有Passport，因此Passport不会执行
config: { //中间件配置 
	'Passport': {
		//中间件配置项
	}
}
```
对于Koatty默认执行的三个中间件，我们也可以禁止它们执行（一般不建议）:

```
list: [], 
config: { //中间件配置 
	'Static': false //Static中间件被配置为不执行
}
```


### 单次执行
中间件的执行机制为只要挂载运行，每次request/response都会执行该中间件。

在项目开发中，往往某个功能仅需要运行一次即可，并不需要每次都执行。例如功能拓展，初始化赋值等等。

那么我们可以按照下面方式注入到启动事件队列内运行：

src/middleware/Custom.ts

```js
/**
 * Middleware
 * @return
 */

@Middleware()
export class Custom {

    run(options: any, app: App) {
        options = Helper.extend(defaultOpt, this.options);
        //应用启动执行一次
        app.once('appReady', () => {
            //仅需要单次执行的代码
        });

        return function (ctx: any, next: any) {
            return next();
        };
    }
}

```


### 使用koa中间件

Koatty支持使用koa的中间件（包括koa1.x及2.x的中间件）：

src/middleware/Passport.ts

```js
const passport = require('koa-passport');


@Middleware()
export class Custom {

    run(options: any, app: App) {
        return passport.initialize();
    }
}

```
挂载并配置使用： 

src/config/middleware.ts

```js
list: ['Passport'], //加载的中间件列表
config: { //中间件配置 
	'Passport': {
		//中间件配置项
	}
}
```

## 控制器

Koatty 基于 模块/控制器/操作 的设计原则：

* 模块： 一个应用下有多个模块，每一个模块都是很独立的功能集合。比如：前台模块、用户模块、管理员模块
* 控制器： 一个分组下有多个控制器，一个控制器是多个操作的集合。如：商品的增删改查
* 方法： 一个控制器有多个方法，每个方法都是最小的执行单元。如：添加一个商品

*注意： 根据具体的项目情况，一般复杂的项目才需要划分模块。简单的项目中，控制器同级即可满足要求，Koatty不做强制要求*

### 创建控制器

使用koatty_cli命令行工具：

单模块模式：

```bash
koatty controller index
```

会自动创建 src/controller/Index.ts文件。

多模块模式：


```bash
think controller admin/index
```

会自动创建 src/controller/Admin/Index.ts文件。


控制器模板代码如下：

```js
import { Controller, BaseController, GetMaping } from "koatty";
import { App } from '<Path>/App';

@Controller("/<New>")
export class <NewController> extends BaseController {
    app: App;

    /**
     * Custom constructor
     *
     */
    init() {
        //...
    }

    @GetMaping("/")
    index() {
        return this.ok('Hello, Koatty!');
    }
}
```
### 控制器特点

控制器类必须继承于 BaseController 或 BaseController 的子类。

Koatty 使用`init()` 方法来替代`construct()` 构造方法(construct在使用super时有限制)。

控制器里可以重写 `init` 方法如：

```js

init(){
    this.data = {};
}
```
### 访问控制

类之间的引用遵循Typescript的作用域 private | protected | public， 如果未显式声明，类方法的作用域为public。

只要给控制器类方法绑定了路由(通过路由装饰器)，那么方法即可被url映射访问，而不管该方法是否是public。这是因为目前通过反射无法获取到方法的作用域关键字(有知道的请告诉我😁)。


## 服务层

## 持久层

# 进阶应用

## 架构

![test image size](./assets/Koatty.png)

Koatty在Koa2的基础上进行了封装和扩展，方便进行快速开发；并且保持向下兼容Koa的原生用法，Koa的中间件仅需进行简单包装即可在Koatty中使用。

Koatty参考 SpringBoot设计实现IOC容器，具备自动加载、自动依赖管理等特性，并且利用延迟加载机制避免循环依赖；在使用方法上贴近SpringBoot的开发习惯，有效的降低了入门门槛。

## 默认规则约定

Koatty遵循约定大于配置的原则。为规范项目代码，提高健壮性，做了一些默认的规范和约定。

### Koatty框架及周边组件版本定义

* 小版本，如：1.1.1 => 1.1.2（小功能增加，bug 修复等，向下兼容1.1.x）

* 中版本，如：1.1.0 => 1.2.0（较大功能增加，部分模块重构等。主体向下兼容，可能存在少量特性不兼容）

* 大版本，如：1.0.0 => 2.0.0（框架整体设计、重构等，不向下兼容）

### 以Class范式编程

包括Controller、Service、Model等类型的类，使用`Class` 而非 `function`来组织代码。配置、工具、函数库、第三方库除外。

### 单个文件仅export一个类

在项目中，单个`.ts`文件仅`export`一次且导出的是`Class`。配置、工具、函数库、第三方库除外。

### 类名必须与文件名相同

熟悉JAVA的人对此一定不会陌生。类名同文件名必须相同，使得在IOC容器内保持唯一性，防止类被覆盖。

### 同类型不允许存在同名类

Koatty将IOC容器内的Bean分为 'COMPONENT' | 'CONTROLLER' | 'MIDDLEWARE' | 'SERVICE' 四种类型。相同类型的Bean不允许有同名的类，否则会导致装载失败。例如：`src/Controller/IndexController.ts` 和 `src/Controller/Test/IndexController.ts`就是同名类。需要注意的是，Bean的类型是由装饰器决定的而非文件名或目录名。给`IndexController.ts`加 `@Service()`装饰器的话那么它的类型就是`SERVICE`。

## IOC容器

IOC容器

## AOP切面

AOP切面

## 启动自定义

## 装载自定义

# Decorators装饰器

## ClassDecorator类装饰器

### @Aspect(identifier?: string)

* identifier 切面类注册到IOC容器别名。默认值为类名。

声明当前类是一个切面类。切面类在切点执行，切面类必须实现run方法供切点调用。

### @AfterEach(aopName = "__after")

* identifier 切点执行的切面类名称。如果在控制器中使用，该参数为空或者值等于`__after`，此修饰器不生效，因为控制器会默认在每个方法之后执行`__after`

### @BeforeEach(aopName = "__before")

* identifier 切点执行的切面类名称。如果在控制器中使用，该参数为空或者值等于`__before`，此修饰器不生效，因为控制器会默认在每个方法前执行`__before`

为当前类声明一个切面，在每个方法执行之前执行切面类的run方法。

为当前类声明一个切面，在每个方法执行之后执行切面类的run方法。

### @Bootstrap([bootFunc])

* bootFunc 应用启动前执行函数。具体执行时机是在app.on("appReady")事件触发。

声明当前类是一个启动类，为项目的入口文件。

### @ComponentScan(scanPath?: string | string[])

### @Component(identifier?: string)

### @ConfiguationScan(scanPath?: string | string[])

### @Controller(path = "")

### Service(identifier?: string)

### @Middleware(identifier?: string)

## PropertyDecorator属性装饰器

### @Autowired(identifier?: string, type?: CompomentType, constructArgs?: any[], isDelay = false)

### @Value(identifier: string, type?: string)

## MethodDecorator方法装饰器

### @Before(aopName: string)

* aopName 切点执行的切面类名称。

为当前方法声明一个切面，在当前方法执行之前执行切面类的run方法。

### @After(aopName: string)

* aopName 切点执行的切面类名称。

为当前方法声明一个切面，在当前方法执行之后执行切面类的run方法。

### @RequestMapping([path, requestMethod, routerOptions])

用于控制器方法绑定路由

* path  path路径
* requestMethod  路由请求方式。可以使用`RequestMethod` enum数据进行赋值，例如 `RequestMethod.GET`。如果设置为`RequestMethod.ALL`表示支持所有请求方式
* routerOptions 路由配置

### @GetMaping([path, routerOptions])

用于控制器方法绑定Get路由

* path  path路径,默认值 `/`
* routerOptions 路由配置

### @PostMaping([path, routerOptions])

用于控制器方法绑定Post路由

* path  path路径,默认值 `/`
* routerOptions 路由配置

### @DeleteMaping([path, routerOptions])

用于控制器方法绑定Delete路由

* path  path路径,默认值 `/`
* routerOptions 路由配置

### @PutMaping([path, routerOptions])

用于控制器方法绑定Put路由

* path  path路径,默认值 `/`
* routerOptions 路由配置

### @PatchMaping([path, routerOptions])

用于控制器方法绑定Patch路由

* path  path路径,默认值 `/`
* routerOptions 路由配置

### @OptionsMaping([path, routerOptions])

用于控制器方法绑定Options路由

* path  path路径,默认值 `/`
* routerOptions 路由配置

### @HeadMaping([path, routerOptions])

用于控制器方法绑定Head路由

* path  path路径,默认值 `/`
* routerOptions 路由配置

### @Scheduled(cron: string)


## ParameterDecorator参数装饰器

### @Body()

### @File(name?: string)

### @Get(name?: string)

### @Header(name?: string)

### @PathVariable(name?: string)

### @Post(name?: string)

### @RequestBody()



# API

## App

## Ctx

## BaseController

## RestController
