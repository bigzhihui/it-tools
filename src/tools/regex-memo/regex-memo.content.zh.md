### 普通字符 (Normal characters)

表达式 | 说明
:--|:--
`.` 或 `[^\n\r]` | 匹配除了换行符和回车符之外的任意单个字符
`[A-Za-z]` | 任意大小写英文字母
`[a-z]` | 小写英文字母
`[A-Z]` | 大写英文字母
`\d` 或 `[0-9]` | 匹配数字 (0-9)
`\D` 或 `[^0-9]` | 匹配非数字字符
`_` | 下划线
`\w` 或 `[A-Za-z0-9_]` | 匹配英文字母、数字或下划线
`\W` 或 `[^A-Za-z0-9_]` | 匹配非字母、数字和下划线的字符（即 `\w` 的反集）
`\S` | 匹配非空白字符（即 `\s` 的反集）

### 空白字符 (Whitespace characters)

表达式 | 说明
:--|:--
` ` | 空格 (Space)
`\t` | 制表符 (Tab)
`\n` | 换行符 (Newline)
`\r` | 回车符 (Carriage return)
`\s` | 匹配任意空白符（空格、制表符、换行符或回车符）

### 字符集 (Character set)

表达式 | 说明
:--|:--
`[xyz]` | 匹配 `x`、`y` 或 `z` 中的任意一个字符
`[^xyz]` | 匹配既不是 `x` 也不是 `y`、`z` 的任意字符
`[1-3]` | 匹配 `1`、`2` 或 `3` 中的任意一个
`[^1-3]` | 匹配不是 `1`、`2`、`3` 的任意字符

- 方括号内的字符集可以看作是单个字符间的“逻辑或 (OR)”运算。
- 在左括号 `[` 后紧跟 `^` 表示字符集“取反（否定）”。
- 在字符集方括号内部，`.` 表示字面量句号点，不需要额外转义。

### 需要转义的特殊字符 (Escaping)

#### 字符集外部

表达式 | 说明
:--|:--
`\.` | 点号句号 (Period)
`\^` | 脱字符 (Caret)
`\$` | 美元符号 (Dollar sign)
`\|` | 竖线管道符 (Pipe)
`\\` | 反斜杠 (Back slash)
`\/` | 正斜杠 (Forward slash)
`\(` | 左圆括号 (Opening bracket)
`\)` | 右圆括号 (Closing bracket)
`\[` | 左方括号 (Opening square bracket)
`\]` | 右方括号 (Closing square bracket)
`\{` | 左花括号 (Opening curly bracket)
`\}` | 右花括号 (Closing curly bracket)

#### 字符集内部

表达式 | 说明
:--|:--
`\\` | 反斜杠 (Back slash)
`\]` | 右方括号 (Closing square bracket)

- 字符集内部，只有当 `^` 紧跟在左括号 `[` 之后时才需要转义（以避免被解析为取反）。
- 连字符 `-` 只有位于两个字母或两个数字之间表示范围时具有特殊含义，如需表示字面量 `-` 建议转义或置于末尾。

### 量词 (Quantifiers)

表达式 | 说明
:--|:--
`{2}` | 精确匹配 2 次
`{2,}` | 至少匹配 2 次
`{2,7}` | 匹配 2 到 7 次
`*` | 匹配 0 次或多次（等价于 `{0,}`）
`+` | 匹配 1 次或多次（等价于 `{1,}`）
`?` | 匹配 0 次或 1 次（等价于 `{0,1}`）

- 量词需直接跟在要被限定的表达式后面。

### 边界匹配 (Boundaries)

表达式 | 说明
:--|:--
`^` | 匹配字符串的开头
`$` | 匹配字符串的结尾
`\b` | 单词边界 (Word boundary)

- 单词边界匹配规则：
    - 字符串开头且第一个字符是 `\w`。
    - 字符串内部相邻两个字符之间，一个是 `\w` 且另一个是 `\W`。
    - 字符串结尾且最后一个字符是 `\w`。

### 逻辑与零宽断言 (Matching)

表达式 | 说明
:--|:--
`foo\|bar` | 匹配 `foo` 或 `bar`
`foo(?=bar)` | 正向肯定查找（先行断言）：仅当后面跟着 `bar` 时匹配 `foo`
`foo(?!bar)` | 正向否定查找（先行断言）：仅当后面不跟 `bar` 时匹配 `foo`
`(?<=bar)foo` | 反向肯定查找（后行断言）：仅当前面是 `bar` 时匹配 `foo`
`(?<!bar)foo` | 反向否定查找（后行断言）：仅当前面不是 `bar` 时匹配 `foo`

### 分组与捕获 (Grouping and capturing)

表达式 | 说明
:--|:--
`(foo)` | 捕获型分组：匹配并捕获 `foo`
`(?:foo)` | 非捕获型分组：匹配 `foo` 但不保存捕获结果
`(foo)bar\1` | `\1` 是对第 1 个捕获组的反向引用；匹配 `foobarfoo`

- 捕获组主要在以下方法中生效：
    - `string.match(regexp)`
    - `string.matchAll(regexp)`
    - `string.replace(regexp, callback)`
- `\N` 是对第 `N` 个捕获分组的反向引用。捕获分组从 1 开始编号。

## 参考资料与工具

- [MDN 正则表达式指南](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Guide/Regular_Expressions)
- [RegExplained 正则可视化](https://leaverou.github.io/regexplained/)
