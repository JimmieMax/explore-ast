const core = require("@babel/core"); //babel核心模块
let types = require("@babel/types"); //用来生成或者判断节点的AST语法树的节点
const pathlib = require("path");

let sourceCode = `
  console.log("日志")
`;

const logPlugin = {
  visitor: {
    CallExpression(path, state) {
      const { node } = path;
      if (types.isMemberExpression(node.callee)) {
        if (node.callee.object.name === "console") {
          //找到console
          if (["log", "info", "warn", "error"].includes(node.callee.property.name)) {
            //找到方法名
            const { line, column } = node.loc.start; //找到所处位置的行和列
            node.arguments.push(types.stringLiteral(`${line}:${column}`)); //向右边添加我们的行和列信息
            //找到文件名
            const filename = state.file.opts.filename;
            //输出文件的相对路径
            const relativeName = pathlib
              .relative(__dirname, filename)
              .replace(/\\/g, "/"); //兼容window
            node.arguments.push(types.stringLiteral(relativeName)); //向右边添加我们的行和列信息
         }
        }
      }
    },
  },
};

let targetSource = core.transform(sourceCode, {
  plugins: [logPlugin], //使用插件
  filename: "hello.js", //模拟环境
});

console.log(targetSource.code); // console.log("日志", "2:2", "../hello.js");