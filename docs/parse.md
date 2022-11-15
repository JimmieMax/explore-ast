Babel为当前最流行的代码JavaScript编译器了，其使用的JavaScript解析器为[babel-parser](https://link.juejin.cn?target=https%3A%2F%2Fgithub.com%2Fbabel%2Fbabel%2Ftree%2Fmaster%2Fpackages%2Fbabel-parser)，最初是从Acorn 项目fork出来的。Acorn 非常快，易于使用，并且针对非标准特性(以及那些未来的标准特性) 设计了一个基于插件的架构。本文主要介绍[esprima](https://link.juejin.cn?target=https%3A%2F%2Fgithub.com%2Fjquery%2Fesprima)解析生成的抽象语法树节点，esprima的实现也是基于Acorn的。

JavaScript Parser 是把js源码转化为抽象语法树（AST）的解析器。这个步骤分为两个阶段：[词法分析（Lexical Analysis）](https://link.juejin.cn/?target=https%3A%2F%2Fen.wikipedia.org%2Fwiki%2FLexical_analysis) 和 [语法分析（Syntactic Analysis）](https://link.juejin.cn/?target=https%3A%2F%2Fen.wikipedia.org%2Fwiki%2FParsing)。<br />常用的JavaScript Parser：

- [esprima](https://link.juejin.cn/?target=https%3A%2F%2Fgithub.com%2Fjquery%2Fesprima)
- [uglifyJS2](https://link.juejin.cn/?target=https%3A%2F%2Fgithub.com%2Fmishoo%2FUglifyJS2)
- [traceur](https://link.juejin.cn/?target=https%3A%2F%2Fgithub.com%2Fgoogle%2Ftraceur-compiler)
- [acorn](https://link.juejin.cn/?target=https%3A%2F%2Fgithub.com%2Facornjs%2Facorn)
- [espree](https://link.juejin.cn/?target=https%3A%2F%2Fgithub.com%2Feslint%2Fespree)
- [@babel/parser](https://link.juejin.cn/?target=https%3A%2F%2Fgithub.com%2Fbabel%2Fbabel%2Ftree%2Fmaster%2Fpackages%2Fbabel-parser)

<a name="RPTnI"></a>
### 词法分析
词法分析阶段把字符串形式的代码转换为 令牌（tokens）流。你可以把令牌看作是一个扁平的语法片段数组。
```javascript
n * n;
```
例如上面n*n的词法分析得到结果如下：
```javascript
[
  { type: { ... }, value: "n", start: 0, end: 1, loc: { ... } },
  { type: { ... }, value: "*", start: 2, end: 3, loc: { ... } },
  { type: { ... }, value: "n", start: 4, end: 5, loc: { ... } },
]
```
每一个 type 有一组属性来描述该令牌：
```javascript
{
  type: {
    label: 'name',
    keyword: undefined,
    beforeExpr: false,
    startsExpr: true,
    rightAssociative: false,
    isLoop: false,
    isAssign: false,
    prefix: false,
    postfix: false,
    binop: null,
    updateContext: null
  },
  ...
}
```
和 AST 节点一样它们也有 start，end，loc 属性。
<a name="OAN4U"></a>
### 语法分析
语法分析就是根据词法分析的结果，也就是令牌tokens，将其转换成AST。
```javascript
function square(n) {
  return n * n;
}
```
如上面代码，生成的AST结构如下：
```javascript
{
  type: "FunctionDeclaration",
  id: {
    type: "Identifier",
    name: "square"
  },
  params: [{
    type: "Identifier",
    name: "n"
  }],
  body: {
    type: "BlockStatement",
    body: [{
      type: "ReturnStatement",
      argument: {
        type: "BinaryExpression",
        operator: "*",
        left: {
          type: "Identifier",
          name: "n"
        },
        right: {
          type: "Identifier",
          name: "n"
        }
      }
    }]
  }
}
```
下文将对AST各个类型节点做解释。更多AST生成，入口如下:

- [AST Explorer](https://link.juejin.cn/?target=https%3A%2F%2Fastexplorer.net%2F)
- [esprima](https://link.juejin.cn/?target=http%3A%2F%2Fesprima.org%2Fdemo%2Fparse.html)

结合[可视化工具](https://link.juejin.cn/?target=http%3A%2F%2Fresources.jointjs.com%2Fdemos%2Fjavascript-ast)，举个例子<br />如下代码：
```javascript
var a = 42;
var b = 5;
function addA(d) {
  return a + d;
}
var c = addA(2) + b;
```
第一步词法分析之后长成如下图所示：<br />![image.png](https://cdn.nlark.com/yuque/0/2022/png/202915/1665977954382-0f0859b2-fd7a-472f-91b0-064da51d6ad4.png#clientId=ubce63ce9-d209-4&crop=0&crop=0&crop=1&crop=1&from=paste&height=95&id=u99d4799d&margin=%5Bobject%20Object%5D&name=image.png&originHeight=189&originWidth=911&originalType=binary&ratio=1&rotation=0&showTitle=false&size=60168&status=done&style=none&taskId=u8e538836-6ae3-4213-8f2b-b9e9b4aad37&title=&width=455.5)<br />语法分析，生产抽象语法树，生成的抽象语法树如下图所示<br />![image.png](https://cdn.nlark.com/yuque/0/2022/png/202915/1665977967741-ef94c76c-7c1f-412a-b343-a3b71965dbc0.png#clientId=ubce63ce9-d209-4&crop=0&crop=0&crop=1&crop=1&from=paste&height=365&id=uc8fe4244&margin=%5Bobject%20Object%5D&name=image.png&originHeight=730&originWidth=1223&originalType=binary&ratio=1&rotation=0&showTitle=false&size=64409&status=done&style=none&taskId=u6056795a-8884-457f-96f2-3c8385d8c7f&title=&width=611.5)

<a name="ZUMC3"></a>
## Base
<a name="ikJbp"></a>
### Node
所有节点类型都实现以下接口：
```typescript
interface Node {
  type: string;
  range?: [number, number];
  loc?: SourceLocation;
}
```
该type字段是表示AST变体类型的字符串。该loc字段表示节点的源位置信息。如果解析器没有生成有关节点源位置的信息，则该字段为null;否则它是一个对象，包括一个起始位置（被解析的源区域的第一个字符的位置）和一个结束位置.
```typescript
interface SourceLocation {
    start: Position;
    end: Position;
    source?: string | null;
}
```
每个Position对象由一个line数字（1索引）和一个column数字（0索引）组成：
```typescript
interface Position {
  line: uint32 >= 1;
  column: uint32 >= 0;
}
```
<a name="z4ypr"></a>
### Programs
```typescript
interface Program <: Node {
    type: "Program";
    sourceType: 'script' | 'module';
    body: StatementListItem[] | ModuleItem[];
}
```
表示一个完整的源代码树。
<a name="E5yGD"></a>
## Scripts and Modules
源代码数的来源包括两种，一种是script脚本，一种是modules模块<br />当为script时，body为StatementListItem。 当为modules时，body为ModuleItem。<br />类型StatementListItem和ModuleItem类型如下。
<a name="EcwBj"></a>
### ImportDeclaration
import语法，导入模块
```typescript
type ImportDeclaration {
    type: 'ImportDeclaration';
    specifiers: ImportSpecifier[];
    source: Literal;
}
```
ImportSpecifier类型如下：
```typescript
interface ImportSpecifier {
    type: 'ImportSpecifier' | 'ImportDefaultSpecifier' | 'ImportNamespaceSpecifier';
    local: Identifier;
    imported?: Identifier;
}
```
ImportSpecifier语法如下：
```typescript
import { foo } from './foo';
```
ImportDefaultSpecifier语法如下：
```typescript
import * as foo from './foo';
```
ImportNamespaceSpecifier语法如下
```typescript
import * as foo from './foo';
```
<a name="LgEYr"></a>
### ExportDeclaration
export类型如下
```typescript
type ExportDeclaration = ExportAllDeclaration | ExportDefaultDeclaration | ExportNamedDeclaration;
```
ExportAllDeclaration从指定模块中导出
```typescript
interface ExportAllDeclaration {
    type: 'ExportAllDeclaration';
    source: Literal;
}
```
语法如下:
```typescript
export * from './foo';
```
ExportDefaultDeclaration导出默认模块
```typescript
interface ExportDefaultDeclaration {
    type: 'ExportDefaultDeclaration';
    declaration: Identifier | BindingPattern | ClassDeclaration | Expression | FunctionDeclaration;
}
```
语法如下：
```typescript
export default 'foo';
```
ExportNamedDeclaration导出部分模块
```typescript
interface ExportNamedDeclaration {
    type: 'ExportNamedDeclaration';
    declaration: ClassDeclaration | FunctionDeclaration | VariableDeclaration;
    specifiers: ExportSpecifier[];
    source: Literal;
}
```
语法如下：
```typescript
export const foo = 'foo';
```
<a name="xpsN6"></a>
## Declarations and Statements
declaration，即声明，类型如下：
```typescript
type Declaration = VariableDeclaration | FunctionDeclaration | ClassDeclaration;
```
statements，即语句，类型如下：
```typescript
type Statement = BlockStatement | BreakStatement | ContinueStatement |
    DebuggerStatement | DoWhileStatement | EmptyStatement |
    ExpressionStatement | ForStatement | ForInStatement |
    ForOfStatement | FunctionDeclaration | IfStatement |
    LabeledStatement | ReturnStatement | SwitchStatement |
    ThrowStatement | TryStatement | VariableDeclaration |
    WhileStatement | WithStatement;
```
<a name="OISF7"></a>
### VariableDeclarator
变量声明，kind 属性表示是什么类型的声明，因为 ES6 引入了 const/let。
```typescript
interface VariableDeclaration <: Declaration {
    type: "VariableDeclaration";
    declarations: [ VariableDeclarator ];
    kind: "var" | "let" | "const";
}
```
<a name="ucTWs"></a>
### FunctionDeclaration
函数声明（非函数表达式）
```typescript
interface FunctionDeclaration {
    type: 'FunctionDeclaration';
    id: Identifier | null;
    params: FunctionParameter[];
    body: BlockStatement;
    generator: boolean;
    async: boolean;
    expression: false;
}
```
例如：
```typescript
function foo() {}

function *bar() { yield "44"; }

async function noop() { await new Promise(function(resolve, reject) { resolve('55'); }) }
```
<a name="WLBZq"></a>
### ClassDeclaration
类声明（非类表达式）
```typescript
interface ClassDeclaration {
    type: 'ClassDeclaration';
    id: Identifier | null;
    superClass: Identifier | null;
    body: ClassBody;
}
```
ClassBody声明如下：
```typescript
interface ClassBody {
    type: 'ClassBody';
    body: MethodDefinition[];
}
```
MethodDefinition表示方法声明；
```typescript
interface MethodDefinition {
    type: 'MethodDefinition';
    key: Expression | null;
    computed: boolean;
    value: FunctionExpression | null;
    kind: 'method' | 'constructor';
    static: boolean;
}
```
```typescript
class foo {
    constructor() {}
    method() {}
};
```
<a name="muFME"></a>
### ContinueStatement
continue语句
```typescript
interface ContinueStatement {
    type: 'ContinueStatement';
    label: Identifier | null;
}
```
例如：
```typescript
for (var i = 0; i < 10; i++) {
    if (i === 0) {
        continue;
    }
}
```
<a name="L0zyp"></a>
### DebuggerStatement
debugger语句
```typescript
interface DebuggerStatement {
    type: 'DebuggerStatement';
}
```
例如
```typescript
while(true) {
    debugger;
}
```
<a name="N3VCB"></a>
### DoWhileStatement
do-while语句
```typescript
interface DoWhileStatement {
    type: 'DoWhileStatement';
    body: Statement;
    test: Expression;
}
```
test表示while条件<br />例如：
```typescript
var i = 0;
do {
    i++;
} while(i = 2)
```
<a name="jmfN0"></a>
### EmptyStatement
空语句
```typescript
interface EmptyStatement {
    type: 'EmptyStatement';
}
```
例如：
```typescript
if(true);

var a = [];
for(i = 0; i < a.length; a[i++] = 0);
```
<a name="JEEHl"></a>
### ExpressionStatement
表达式语句，即，由单个表达式组成的语句。
```typescript
interface ExpressionStatement {
    type: 'ExpressionStatement';
    expression: Expression;
    directive?: string;
}
```
当表达式语句表示一个指令(例如“use strict”)时，directive属性将包含该指令字符串。<br />例如：
```typescript
(function(){});
```
<a name="foGHu"></a>
### ForStatement
for语句
```typescript
interface ForStatement {
    type: 'ForStatement';
    init: Expression | VariableDeclaration | null;
    test: Expression | null;
    update: Expression | null;
    body: Statement;
}
```
<a name="IX4jT"></a>
### ForInStatement
for...in语句
```typescript
interface ForInStatement {
    type: 'ForInStatement';
    left: Expression;
    right: Expression;
    body: Statement;
    each: false;
}
```
<a name="Ya1Na"></a>
### ForOfStatement
for...of语句
```typescript
interface ForOfStatement {
    type: 'ForOfStatement';
    left: Expression;
    right: Expression;
    body: Statement;
}
```
<a name="pjQPX"></a>
### IfStatement
if 语句
```typescript
interface IfStatement {
    type: 'IfStatement';
    test: Expression;
    consequent: Statement;
    alternate?: Statement;
}
```
consequent表示if命中后内容，alternate表示else或者else if的内容。
<a name="RGHyr"></a>
### LabeledStatement
label语句，多用于精确的使用嵌套循环中的continue和break。
```typescript
interface LabeledStatement {
    type: 'LabeledStatement';
    label: Identifier;
    body: Statement;
}
```
如：
```typescript
var num = 0;
outPoint:
for (var i = 0 ; i < 10 ; i++){
        for (var j = 0 ; j < 10 ; j++){
            if( i == 5 && j == 5 ){
                break outPoint;
            }
            num++;
        }
}
```
<a name="vhaB4"></a>
### ReturnStatement
return 语句
```typescript
interface ReturnStatement {
    type: 'ReturnStatement';
    argument: Expression | null;
}
```
<a name="qEEr5"></a>
### SwitchStatement
Switch语句
```typescript
interface SwitchStatement {
    type: 'SwitchStatement';
    discriminant: Expression;
    cases: SwitchCase[];
}
```
discriminant表示switch的变量。<br />SwitchCase类型如下<br />interface SwitchCase {<br />    type: 'SwitchCase';<br />    test: Expression | null;<br />    consequent: Statement[];<br />}
<a name="RdA5N"></a>
### ThrowStatement
throw语句
```typescript
interface ThrowStatement {
    type: 'ThrowStatement';
    argument: Expression;
}
```
<a name="qoAls"></a>
### TryStatement
try...catch语句
```typescript
interface TryStatement {
    type: 'TryStatement';
    block: BlockStatement;
    handler: CatchClause | null;
    finalizer: BlockStatement | null;
}
```
handler为catch处理声明内容，finalizer为finally内容。<br />CatchClause 类型如下
```typescript
interface CatchClause {
    type: 'CatchClause';
    param: Identifier | BindingPattern;
    body: BlockStatement;
}
```
例如：
```typescript
try {
    foo();
} catch (e) {
    console.erroe(e);
} finally {
    bar();
}
```
<a name="eADVE"></a>
### WhileStatement
while语句
```typescript
interface WhileStatement {
    type: 'WhileStatement';
    test: Expression;
    body: Statement;
}
```
test为判定表达式
<a name="ou7XI"></a>
### WithStatement
with语句（指定块语句的作用域的作用域）
```typescript
interface WithStatement {
    type: 'WithStatement';
    object: Expression;
    body: Statement;
}
```
如：
```typescript
var a = {};

with(a) {
    name = 'xiao.ming';
}

console.log(a); // {name: 'xiao.ming'}
```
<a name="GHLy6"></a>
## Expressions and Patterns
Expressions可用类型如下：
```typescript
type Expression = ThisExpression | Identifier | Literal |
    ArrayExpression | ObjectExpression | FunctionExpression | ArrowFunctionExpression | ClassExpression |
    TaggedTemplateExpression | MemberExpression | Super | MetaProperty |
    NewExpression | CallExpression | UpdateExpression | AwaitExpression | UnaryExpression |
    BinaryExpression | LogicalExpression | ConditionalExpression |
    YieldExpression | AssignmentExpression | SequenceExpression;
```
Patterns可用有两种类型，函数模式和对象模式如下：
```typescript
type BindingPattern = ArrayPattern | ObjectPattern;
```
<a name="IyNdW"></a>
### ThisExpression
this 表达式
```typescript
interface ThisExpression {
    type: 'ThisExpression';
}
```
<a name="eYhMD"></a>
### Identifier
标识符，就是我们写 JS 时自定义的名称，如变量名，函数名，属性名，都归为标识符。相应的接口是这样的：
```typescript
interface Identifier {
    type: 'Identifier';
    name: string;
}
```
<a name="HXliu"></a>
### Literal
字面量，这里不是指 [] 或者 {} 这些，而是本身语义就代表了一个值的字面量，如 1，“hello”, true 这些，还有正则表达式（有一个扩展的 Node 来表示正则表达式），如 /\d?/。
```typescript
interface Literal {
    type: 'Literal';
    value: boolean | number | string | RegExp | null;
    raw: string;
    regex?: { pattern: string, flags: string };
}
```
例如：
```typescript
var a = 1;
var b = 'b';
var c = false;
var d = /\d/;
```
<a name="sdUgy"></a>
### ArrayExpression
数组表达式
```typescript
interface ArrayExpression {
    type: 'ArrayExpression';
    elements: ArrayExpressionElement[];
}
```
例:
```typescript
[1, 2, 3, 4];
```
<a name="uSOQ8"></a>
### ArrayExpressionElement
数组表达式的节点，类型如下
```typescript
type ArrayExpressionElement = Expression | SpreadElement;
```
Expression包含所有表达式，SpreadElement为扩展运算符语法。
<a name="M1DNR"></a>
### SpreadElement
扩展运算符
```typescript
interface SpreadElement {
    type: 'SpreadElement';
    argument: Expression;
}
```
如：
```typescript
var a = [3, 4];
var b = [1, 2, ...a];

var c = {foo: 1};
var b = {bar: 2, ...c};
```
<a name="eLKfW"></a>
### ObjectExpression
对象表达式
```typescript
interface ObjectExpression {
    type: 'ObjectExpression';
    properties: Property[];
}
```
Property代表为对象的属性描述<br />类型如下
```typescript
interface Property {
    type: 'Property';
    key: Expression;
    computed: boolean;
    value: Expression | null;
    kind: 'get' | 'set' | 'init';
    method: false;
    shorthand: boolean;
}
```
kind用来表示是普通的初始化，或者是 get/set。<br />例如：
```typescript
var obj = {
    foo: 'foo',
    bar: function() {},
    noop() {}, // method 为 true
    ['computed']: 'computed'  // computed 为 true
}
```
<a name="tX7Kk"></a>
### FunctionExpression
函数表达式
```typescript
interface FunctionExpression {
    type: 'FunctionExpression';
    id: Identifier | null;
    params: FunctionParameter[];
    body: BlockStatement;
    generator: boolean;
    async: boolean;
    expression: boolean;
}
```
例如：
```typescript
var foo = function () {}
```
<a name="yVRzm"></a>
### ArrowFunctionExpression
箭头函数表达式
```typescript
interface ArrowFunctionExpression {
    type: 'ArrowFunctionExpression';
    id: Identifier | null;
    params: FunctionParameter[];
    body: BlockStatement | Expression;
    generator: boolean;
    async: boolean;
    expression: false;
}
```
generator表示是否为generator函数，async表示是否为async/await函数，params为参数定义。<br />FunctionParameter类型如下
```typescript
type FunctionParameter = AssignmentPattern | Identifier | BindingPattern;
```
例：
```typescript
var foo = () => {};
```
<a name="rRjGG"></a>
### ClassExpression
类表达式
```typescript
interface ClassExpression {
    type: 'ClassExpression';
    id: Identifier | null;
    superClass: Identifier | null;
    body: ClassBody;
}
```
例如：
```typescript
var foo = class {
    constructor() {}
    method() {}
};
```
<a name="KdaSe"></a>
### TaggedTemplateExpression
标记模板文字函数
```typescript
interface TaggedTemplateExpression {
    type: 'TaggedTemplateExpression';
    readonly tag: Expression;
    readonly quasi: TemplateLiteral;
}
```
TemplateLiteral类型如下
```typescript
interface TemplateLiteral {
    type: 'TemplateLiteral';
    quasis: TemplateElement[];
    expressions: Expression[];
}
```
TemplateElement类型如下
```typescript
interface TemplateElement {
    type: 'TemplateElement';
    value: { cooked: string; raw: string };
    tail: boolean;
}
```
例如
```typescript
var foo = function(a){ console.log(a); }
foo`test`;
```
<a name="imPPM"></a>
### MemberExpression
属性成员表达式
```typescript
interface MemberExpression {
    type: 'MemberExpression';
    computed: boolean;
    object: Expression;
    property: Expression;
}
```
例如：
```typescript
const foo = {bar: 'bar'};
foo.bar;
foo['bar']; // computed 为 true
```
<a name="meCRP"></a>
### Super
父类关键字
```typescript
interface Super {
    type: 'Super';
}
```
例如:
```typescript
class foo {};
class bar extends foo {
    constructor() {
        super();
    }
}
```
<a name="M5Hfa"></a>
### MetaProperty
import.meta是一个给JavaScript模块暴露特定上下文的元数据属性的对象。它包含了这个模块的信息，比如说这个模块的URL。
```typescript
interface MetaProperty {
    type: 'MetaProperty';
    meta: Identifier;
    property: Identifier;
}
```
例如:
```html
<script type="module" src="my-module.mjs">
  console.log(import.meta); // { url: "file:///home/user/my-module.mjs" }
</script>
```
<a name="s8Ucg"></a>
### CallExpression
函数执行表达式
```typescript
interface CallExpression {
  type: 'CallExpression';
  callee: Expression | Import;
  arguments: ArgumentListElement[];
}
```
Import类型。
```typescript
interface Import {
    type: 'Import'
}
```
ArgumentListElement类型
```typescript
type ArgumentListElement = Expression | SpreadElement;
```
如：
```typescript
var foo = function (){};
foo();
```
<a name="SNu6f"></a>
### NewExpression
new 表达式
```typescript
interface NewExpression {
    type: 'NewExpression';
    callee: Expression;
    arguments: ArgumentListElement[];
}
```
<a name="wlRqP"></a>
### UpdateExpression
更新操作符表达式，如++、--;
```typescript
interface UpdateExpression {
  type: "UpdateExpression";
  operator: '++' | '--';
  argument: Expression;
  prefix: boolean;
}
```
如:
```typescript
var i = 0;
i++;
++i; // prefix为true
```
<a name="Sfx46"></a>
### AwaitExpression
await表达式，会与async连用。
```typescript
interface AwaitExpression {
    type: 'AwaitExpression';
    argument: Expression;
}
```
如
```typescript
async function foo() {
    var bar = function() {
        new Primise(function(resolve, reject) {
            setTimeout(function() {
                resove('foo')
            }, 1000);
        });
    }
    return await bar();
}

foo() // foo
```
<a name="J9FM6"></a>
### UnaryExpression
一元操作符表达式
```typescript
interface UnaryExpression {
  type: "UnaryExpression";
  operator: UnaryOperator;
  prefix: boolean;
  argument: Expression;
}
```
枚举UnaryOperator
```typescript
enum UnaryOperator {
  "-" | "+" | "!" | "~" | "typeof" | "void" | "delete" | "throw"
}
```
<a name="qNh8i"></a>
### BinaryExpression
二元操作符表达式
```typescript
interface BinaryExpression {
    type: 'BinaryExpression';
    operator: BinaryOperator;
    left: Expression;
    right: Expression;
}
```
枚举BinaryOperator
```typescript
enum BinaryOperator {
  "==" | "!=" | "===" | "!=="
     | "<" | "<=" | ">" | ">="
     | "<<" | ">>" | ">>>"
     | "+" | "-" | "*" | "/" | "%"
     | "**" | "|" | "^" | "&" | "in"
     | "instanceof"
     | "|>"
}
```
<a name="v1Xtz"></a>
### LogicalExpression
逻辑运算符表达式
```typescript
interface LogicalExpression {
    type: 'LogicalExpression';
    operator: '||' | '&&';
    left: Expression;
    right: Expression;
}
```
如：
```typescript
var a = '-';
var b = a || '-';

if (a && b) {}
```
<a name="HKewl"></a>
### ConditionalExpression
条件运算符
```typescript
interface ConditionalExpression {
    type: 'ConditionalExpression';
    test: Expression;
    consequent: Expression;
    alternate: Expression;
}
```
例如：
```typescript
var a = true;
var b = a ? 'consequent' : 'alternate';
```
<a name="JlDJZ"></a>
### YieldExpression
yield表达式
```typescript
interface YieldExpression {
    type: 'YieldExpression';
    argument: Expression | null;
    delegate: boolean;
}
```
例如：
```typescript
function* gen(x) {
  var y = yield x + 2;
  return y;
}
```
<a name="yzsQG"></a>
### AssignmentExpression
赋值表达式。
```typescript
interface AssignmentExpression {
    type: 'AssignmentExpression';
    operator: '=' | '*=' | '**=' | '/=' | '%=' | '+=' | '-=' |
        '<<=' | '>>=' | '>>>=' | '&=' | '^=' | '|=';
    left: Expression;
    right: Expression;
}
```
operator属性表示一个赋值运算符，left和right是赋值运算符左右的表达式。
<a name="OcJ4S"></a>
### SequenceExpression
序列表达式（使用逗号）。
```typescript
interface SequenceExpression {
    type: 'SequenceExpression';
    expressions: Expression[];
}
```
```typescript
var a, b;
a = 1, b = 2
```
<a name="P3GOY"></a>
### ArrayPattern
数组解析模式
```typescript
interface ArrayPattern {
    type: 'ArrayPattern';
    elements: ArrayPatternElement[];
}
```
例：
```typescript
const [a, b] = [1,3];
```
elements代表数组节点<br />ArrayPatternElement如下
```typescript
type ArrayPatternElement = AssignmentPattern | Identifier | BindingPattern | RestElement | null;
```
<a name="Q7FDD"></a>
### AssignmentPattern
默认赋值模式，数组解析、对象解析、函数参数默认值使用。
```typescript
interface AssignmentPattern {
    type: 'AssignmentPattern';
    left: Identifier | BindingPattern;
    right: Expression;
}
```
例：
```typescript
const [a, b = 4] = [1,3];
```
<a name="UPWhJ"></a>
### RestElement
剩余参数模式，语法与扩展运算符相近。
```typescript
interface RestElement {
    type: 'RestElement';
    argument: Identifier | BindingPattern;
}
```
例：
```typescript
const [a, b, ...c] = [1, 2, 3, 4];
```
<a name="ROCI5"></a>
### ObjectPatterns
对象解析模式
```typescript
interface ObjectPattern {
    type: 'ObjectPattern';
    properties: Property[];
}
```
例：
```typescript
const object = {a: 1, b: 2};
const { a, b } = object;
```
<a name="nlzQV"></a>
## 结束
AST的作用大致分为几类

1. IDE使用，如代码风格检测(eslint等)、代码的格式化，代码高亮，代码错误等等
2. 代码的混淆压缩
3. 转换代码的工具。如webpack，rollup，vite，各种代码规范之间的转换，ts，jsx等转换为原生js

了解AST，最终还是为了让我们了解我们使用的工具，当然也让我们更了解JavaScript，更靠近JavaScript。

作者：杨溜溜<br />链接：https://juejin.cn/post/6844903798347939853<br />来源：稀土掘金<br />著作权归作者所有。商业转载请联系作者获得授权，非商业转载请注明出处。
