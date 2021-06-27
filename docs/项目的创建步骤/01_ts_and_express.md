# TS + Express

说明如何创建项目

## 步骤

### 1. 新建 npm 项目

需要先安装 npm

```
npm init
```

需要回答的问题：

-   entry point: (index.js), 写 `src/app.ts`(也可以直接修改 `package.json` 文件)

### 2. 安装 dependency

-   express
-   typescript

```
yarn add express typescript
```

### 3. 新建 TypeScript 项目

```
yarn tsc --init --rootDir ./src --outDir ./dist --noImplicitAny true --target "ES2018"
```

相比默认配置，修改了：

-   `target` 改为 `ES2018`
-   `outDir`: 改为 `./dist`
-   `rootDir` 改为 `./src`
-   `noImplicitAny`: 改为`true`

### 4. 在根目录创建一个 `src` 文件夹

用于写 ts 代码

### 5. 安装 dev dependency

需要的 dev dependency:

-   `@types/node`: 给 node 提供 type
-   `@types/express`: 给 express 提供 type
-   `ts-node-dev`: 运行 ts 代码，在源代码更新后能自动重新编译

```
yarn add ts-node-dev @types/node @types/express -D
```

### 7. `app.ts` 文件

在 `src` 文件创建一个 `app.ts`，并写如下代码。

```ts
import express from "express";

const app = express();

const port = 3000;

app.get("/", (req, res) => {
    res.send("Hello World!");
});

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});
```

### 8.增加 package.json scripts

```json
    "scripts": {
        // ...
        "build": "tsc",
        "start": "node ./dist/app.js",
        "dev": "ts-node-dev --respawn --transpile-only ./src/app.ts"
    },
```

尝试运行上面的 scripts。

-   `yarn dev`: 测试修改源代码后自动重新编译
-   `yarn build`: 编译为 JS 代码
-   `yarn start`: 在运行了 `yarn build` 之后运行，确定项目能跑起来
