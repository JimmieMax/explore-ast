const core = require("@babel/core"); //babel核心模块

let sourceCode = `
const sum = function(a, b){
    return a + b;
}
`;

const functionToArrowFunctionPlugin = {
  visitor: {
    //如果是普通函数，那么就会进来此函数，参数是函数的节点路径对象
    FunctionExpression(path) {
      let { node } = path;
      node.type = "ArrowFunctionExpression";
    },
  },
};

let targetSource = core.transform(sourceCode, {
  plugins: [functionToArrowFunctionPlugin], //使用插件
});

console.log(targetSource.code);
// const sum = (a, b) => {
//   return a + b;
// };