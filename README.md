# 聊一聊脚手架

搭建脚手架的目的就是快速的搭建项目的基本结构并提供项目规范和约定。目前日常工作中常用的脚手架有 vue-cli、create-react-app、angular-cli 等等，都是通过简单的初始化命令，完成内容的快速构建。

脚手架是我们经常使用的工具，也是团队提效的重要手段。所以系统性的掌握脚手架相关知识，对前端开发者来说是非常重要的，即使很多人今后不一定都会参与到各自部门或者公司的基建工作，但是系统性掌握好这个技能也可以方便我们后期的源码阅读。下面就一起来了解一下吧。

### 什么是脚手架

脚手架就是在启动的时候询问一些简单的问题，并且通过用户回答的结果去渲染对应的模板文件，基本工作流程如下：

1. 通过命令行交互询问用户问题
2. 根据用户回答的结果生成文件

以`vue-cli`为例：

1. 运行创建命令

```shell
vue create hello-world
```

2. 询问用户问题

![问题](/assets/question.png)

3. 生成符合用户需求的项目文件

```
.
├── README.md
├── babel.config.js
├── package.json
├── public
│   ├── favicon.ico
│   └── index.html
├── src
│   ├── App.vue
│   ├── assets
│   │   └── logo.png
│   ├── components
│   │   └── HelloWorld.vue
│   └── main.js
└── yarn.lock
```

参考上面的流程我们可以自己来 搭建一个简单的脚手架雏形

### 开始

1. 在命令行启动 cli

目标：实现在命令行执行 my-cli 来启动我们的脚手架

1. 创建项目

```shell
mkdir my-cli
cd my-cli
npm init -y
```

2. 创建入口文件 index.js

```
touch index.js
```

3. 在 `package.json` 文件中指定入口文件为 index.js

```json
{
  "name": "my-cli",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "bin": "index.js", //手动添加入口文件为index.js
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "keywords": [],
  "author": "",
  "license": "ISC"
}
```

4. 编辑`index.js`

```js
#! /usr/bin/env node

// #! 用于指定脚本的解释程序
// Node CLI 应用入口文件必须要有这样的文件头
// 如果是Linux 或者 macOS 系统下还需要修改此文件的读写权限为 755
// 具体就是通过 chmod 755 index.js 实现修改

// 用于检查入口文件是否正常执行
console.log('my-cli working~');
```

5. `npm link`到全局

`npm link`在开发 npm 包时非常有用，能在本地调试，避免了频繁发布。

```shell
npm link
```

6. 测试一下

```shell
my-cli
```

然后就能看到命令行中输出`my-cli working~`

这样，脚手架的雏形已经有了。

### 询问用户信息

实现命令行交互的功能需要引入[inquirer.js](https://github.com/SBoudrias/Inquirer.js)。

```shell
npm install inquirer
```

用法也比较简单，大家看文档就行。

```js
#! /usr/bin/env node

// #! 用于指定脚本的解释程序
// Node CLI 应用入口文件必须要有这样的文件头
// 如果是Linux 或者 macOS 系统下还需要修改此文件的读写权限为 755
// 具体就是通过 chmod 755 index.js 实现修改

const inquirer = require('inquirer');

inquirer
  .prompt([
    {
      type: 'input', //type： input, number, confirm, list, checkbox ...
      name: 'name', // key 名
      message: '项目名称', // 提示信息
      default: 'demo' // 默认值
    },
    {
      type: 'list', // 选择器
      name: 'style',
      message: 'css预处理器',
      choices: ['less', 'sass', 'stylus'],
      default: 'less'
    }
  ])
  .then((answers) => {
    // 打印互用输入结果
    console.log(answers);
  });
```

然后在命令行输入`my-cli`验证一下效果，就能看到交互式的询问。

### 按照要求生成项目文件

1. 创建模版文件夹

```shell
mkdir templates
```

创建`index.html`示例文件

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title><!-- ejs 语法 --> <%= name %></title>
  </head>
  <body>
    <h1><%= name %></h1>
  </body>
</html>
```

2. 按需渲染文件

这里借助 [ejs](https://github.com/mde/ejs) 模版引擎将用户输入的数据渲染到模版文件上

```shell
npm install ejs --save
```

完善`index.js`

```js
#! /usr/bin/env node

// #! 用于指定脚本的解释程序
// Node CLI 应用入口文件必须要有这样的文件头
// 如果是Linux 或者 macOS 系统下还需要修改此文件的读写权限为 755
// 具体就是通过 chmod 755 index.js 实现修改

// 用于检查入口文件是否正常执行

const inquirer = require('inquirer');
const path = require('path');
const fs = require('fs');
const ejs = require('ejs');

inquirer
  .prompt([
    {
      type: 'input', //type： input, number, confirm, list, checkbox ...
      name: 'name', // key 名
      message: '项目名称', // 提示信息
      default: 'demo' // 默认值
    },
    {
      type: 'list',
      name: 'style',
      message: 'css预处理器',
      choices: ['less', 'sass', 'stylus'],
      default: 'less'
    }
  ])
  .then(async (answers) => {
    // 模版文件目录
    const destUrl = path.join(__dirname, 'templates');
    // 生成文件目录
    // process.cwd() 对应控制台所在目录
    const cwdUrl = process.cwd();
    // 目标目录
    const targetUrl = path.resolve(cwdUrl, answers.name);
    // 生成项目目录
    fs.mkdir(targetUrl, { recursive: true }, () => {
      // 从模版目录中读取文件
      fs.readdir(destUrl, (err, files) => {
        if (err) throw err;
        files.forEach((file) => {
          // 使用 ejs 渲染对应的模版文件
          // renderFile（模版文件地址，传入渲染数据）
          ejs.renderFile(path.join(destUrl, file), answers).then((data) => {
            // 生成 ejs 处理后的模版文件
            fs.writeFileSync(path.join(targetUrl, file), data);
          });
        });
      });
    });
  });
```

然后在命令行执行`my-cli`，就能生成项目文件了。

### 热门脚手架工具库

- [commander](https://github.com/tj/commander.js)：命令行自定义指令

以上我们是直接运行了`my-cli`命令来执行，但往往一个脚手架会包含多项功能，创建项目只是其中一个普遍的功能。commaner 可以为脚手架自定义指令。

```js
#! /usr/bin/env node

const program = require('commander');

program
  .version('0.1.0')
  .command('create <name>')
  .description('create a new project')
  .action((name) => {
    // 打印命令行输入的值
    console.log('project name is ' + name);
  });

program.parse();
```

- [chalk](https://github.com/chalk/chalk)：命令行美化工具

- [inquirer](https://github.com/SBoudrias/Inquirer.js)：命令行交互工具

- [ora](https://github.com/sindresorhus/ora)：命令行 loading 动效

- [cross-spawn](https://github.com/moxystudio/node-cross-spawn)：shell 执行工具
