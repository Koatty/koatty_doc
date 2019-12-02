# koatty
Koa2 + Typescript = koatty. 

Use Typescript's decorator implement auto injection just like SpringBoot.

Koatty是基于Koa2实现的一个具备IOC自动依赖注入、AOP切面编程功能的敏捷开发框架，用法类似SpringBoot。

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

# 进阶

## 项目结构


## 配置

## 路由

## 中间件

## 控制器