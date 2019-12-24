# koatty
Koa2 + Typescript = koatty. 

Use Typescript's decorator implement auto injection just like SpringBoot.

Koatty是基于Koa2实现的一个具备IOC自动依赖注入的敏捷开发框架，用法类似SpringBoot。

[![Version npm](https://img.shields.io/npm/v/koatty.svg?style=flat-square)](https://www.npmjs.com/package/koatty)[![npm Downloads](https://img.shields.io/npm/dm/koatty.svg?style=flat-square)](https://npmcharts.com/compare/koatty?minimal=true)

# 快速开始

## 第一个应用

### 1.安装命令行工具

```shell
npm i -g koatty_cli
```

### 2.新建项目

```shell
koatty new projectName

cd ./projectName

yarn install

npm start
```

### 3.创建控制器
```shell
koatty controller index

```

 使用 `npm start` 重新启动项目, 浏览器中访问  `http://localhost:3000/`. 

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

## 配置

实际项目中，肯定需要各种配置，包括：框架需要的配置以及项目自定义的配置。Koatty 将所有的配置都统一管理，并根据不同的功能划分为不同的配置文件。

* config.ts 通用的一些配置
* db.ts 数据库配置
* router.ts 自定义路由配置
* middleware.ts middlware 配置

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
* 方式二(利用注解进行注入，推荐用法)

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

需要特别注意的是，层级配置仅支持读取`二级`，更深的层级请赋值后再次获取:

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

## 中间件

## 控制器



# 进阶应用

## 架构

![test image size](./assets/Koatty.png)

Koatty在Koa2的基础上进行了封装和扩展，方便进行快速开发；并且保持向下兼容Koa的原生用法，Koa的中间件仅需进行简单包装即可在Koatty中使用。

Koatty参考 SpringBoot设计实现IOC容器，具备自动加载、自动依赖管理等特性，并且利用延迟加载机制避免循环依赖；在使用方法上贴近SpringBoot的开发习惯，有效的降低了入门门槛。

## IOC容器

# API