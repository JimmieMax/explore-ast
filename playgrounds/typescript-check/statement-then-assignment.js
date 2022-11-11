
const babel = require("@babel/core");

function transformType(type) {
  switch (type) {
    case "TSNumberKeyword":
    case "NumberTypeAnnotation":
      return "number";
    case "TSStringKeyword":
    case "StringTypeAnnotation":
      return "string";
  }
}
const tsCheckPlugin = () => {
  return {
    pre(file) {
      file.set("errors", []);
    },
    visitor: {
      AssignmentExpression(path, state) {
        const errors = state.file.get("errors");
        //第一步：先获取左侧变量的定义（age）
        const variable = path.scope.getBinding(path.get("left"));
        //第二步：在获取左侧变量定义的类型（number）
        const variableAnnotation = variable.path.get("id").getTypeAnnotation();
        const variableType = transformType(variableAnnotation.type);
        //第三步：获取右侧的值的类型（“12”）
        const valueType = transformType(
          path.get("right").getTypeAnnotation().type
        );
        //第四步：判断变量的左侧变量的类型和右侧的值的类型是否相同
        if (variableType !== valueType) {
          Error.stackTraceLimit = 0;
          errors.push(
            path
              .get("init")
              .buildCodeFrameError(
                `无法把${valueType}赋值给${variableType}`,
                Error
              )
          );
        }
      },
    },
    post(file) {
      console.log(...file.get("errors"));
    },
  };
};

let sourceCode = `
   var age:number;
   age = "12";
 `;

const result = babel.transform(sourceCode, {
  parserOpts: { plugins: ["typescript"] },
  plugins: [tsCheckPlugin()],
});
console.log(result.code);