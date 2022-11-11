const core = require("@babel/core"); //babel核心模块

const sourceCode = `var age:number="12";`;

const TypeAnnotationMap = {
  TSNumberKeyword: "NumericLiteral",
};

const tsCheckPlugin = {
  //遍历前
  pre(file) {
    file.set("errors", []);
  },
  visitor: {
    VariableDeclarator(path, state) {
      const errors = state.file.get("errors");
      const { node } = path;
      //第一步：获取拿到声明的类型（number）
      const idType =
        TypeAnnotationMap[node.id.typeAnnotation.typeAnnotation.type]; //拿到声明的类型 TSNumberKeyword
      //第二步：获取真实值的类型（"12"的类型）
      const initType = node.init.type; //这里拿到的是真实值的类型 StringLiteral
      //第三步：比较声明的类型和值的类型是否相同
      if (idType !== initType) {
        errors.push(
          path
            .get("init") //拿到子路径init
            .buildCodeFrameError(`无法把${initType}类型赋值给${idType}类型`, Error)
        );
      }
    },
  },
  //遍历后
  post(file) {
    console.log(...file.get("errors"));
  },
};

let targetSource = core.transform(sourceCode, {
  parserOpts: { plugins: ["typescript"] }, //解析的参数，这样才能识别ts语法
  plugins: [tsCheckPlugin], //使用插件
});

console.log(targetSource.code);