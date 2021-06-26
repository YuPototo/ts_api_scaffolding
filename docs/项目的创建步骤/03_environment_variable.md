# Environment Variable

## App 的 environment variable 管理

使用了两个 package:

-   [dotenv-extended](https://github.com/keithmorris/node-dotenv-extended): 用于管理环境变量
-   [dotenv-parse-variables](https://github.com/niftylettuce/dotenv-parse-variables): 用于 parse 环境变量

 这里管理环境变量的方法参考了[这篇文章](https://losikov.medium.com/part-3-brushing-up-get-more-from-node-js-express-open-api-3-0-4ce482ffa958)

### 我的 env 方案

我会有 3 个环境，分别对应 3 个 env:

-   开发环境：`.env.dev`，用于开发
-   测试环境：`.env.test`，用于 integration test
-   生产环境：`.env.prod`，用于部署之后

### `dotenv-extended` 的方法

存在下面 3 种文件：

-   `.env`: 这是真正的 env 文件，会记录各种高敏感信息，不会进入 source control。根据需要，可以是 `.env.dev`, `.env.prod` 等。
-   `.env.defaults`: 默认配置，进入 source control，不记录敏感信息
-   `.env.schema`: 说明 env 文件的 schema，进入 source control。

### 操作步骤

#### 第 1 步：安装 package

```
yarn add dotenv-extended dotenv-parse-variables @types/dotenv-parse-variables
```

#### 第 2 步：env 文件

在根目录创建一个 config 文件夹。

在文件夹内创建以下 3 个文件：

-   `.env.schema`，配置方法参考文档
-   `.env.defautls`，这里准备不敏感的 defaults 配置
-   `.env.dev`: 开发环境的 .env

#### 第 3 步: app 获取 config

在`src`内创建一个`config`文件夹
在文件夹内创建一个`index.ts`文件

示例代码如下:

```ts
import dotenvExtended from "dotenv-extended";
import dotenvParseVariables from "dotenv-parse-variables";

// env
const env = dotenvExtended.load({
    path: process.env.ENV_FILE, // 会在 package.json 内设置这个 ENV_FILE
    defaults: "./config/.env.defaults", // 即刚才创建的 .env.defaults
    schema: "./config/.env.schema", // 即刚才创建的 .env.schema
    includeProcessEnv: true, // 把 process.env 里的变量也放进校验里
    silent: false, // 没有 .env 或 .env.defaults 文件时，会 console.log 信息
    errorOnMissing: true, // 缺少 schema 需要的变量时，会报错
    errorOnExtra: true, // 存在多余的变量时，会报错
});

const parsedEnv = dotenvParseVariables(env); // parse 环境变量

interface Config {
    port: number;
}

const config: Config = {
    port: parsedEnv.PORT as number,
};

export default config;
```

#### 第 4 步：修改 `package.json`

原先的 scripts:

```JSON
    "start": "node -r tsconfig-paths/register ./dist/app.js",
    "dev": "ts-node-dev -r tsconfig-paths/register --respawn --transpile-only ./src/app.ts"
```

修改为:

```JSON
    "start": "ENV_FILE=./config/.env.prod node -r tsconfig-paths/register ./dist/app.js",
    "dev": "ENV_FILE=./config/.env.dev ts-node-dev -r tsconfig-paths/register --respawn --transpile-only ./src/app.ts"
```

其实就是创建一个环境变量 `ENV_FILE`，让 `config/index.ts` 文件里的 `dotenvExtended.load()` 函数能使用。

注意，我们没有在项目中创建 `.env.prod`，因为这个会直接在服务器创建。

#### 第 5 步：使用环境变量

比如在 `src/index.ts` 内:

```ts
import config from "./config";

console.log(config.port);
```
