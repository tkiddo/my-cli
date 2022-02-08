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
const program = require('commander');

const create = (name) => {
  inquirer
    .prompt([
      {
        type: 'input', //type： input, number, confirm, list, checkbox ...
        name: 'title', // key 名
        message: '标题', // 提示信息
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
      const targetUrl = path.resolve(cwdUrl, name);
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
};
program
  .version('0.1.0')
  .command('create <name>')
  .description('create a new project')
  .action((name) => {
    // 打印命令行输入的值
    create(name);
  });

program.parse();
