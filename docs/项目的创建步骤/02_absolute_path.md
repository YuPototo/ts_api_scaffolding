# Absolute Path

在正常的项目里，import script 时使用的是 relative path。

```ts
import config from "./config";
```

这时需要记住各个文件之间的相对路径。
使用 absolute path 的话，import 时可以输入绝对路径，减少出错的情况。

## tsconfig-paths

安装 tsconfig-paths

```
yarn add tsconfig-paths
```

### 修改 package.json

修改如下两段 script:

```JSON
    "start": "node ./dist/app.js",
    "dev": "ts-node-dev --respawn --transpile-only ./src/app.ts"
```

新增一个命令 `-r tsconfig-paths/register`，变为：

```JSON
    "start": "node -r tsconfig-paths/register ./dist/app.js",
    "dev": "ts-node-dev -r tsconfig-paths/register --respawn --transpile-only ./src/app.ts"
```

### 修改 `tsconfig.json`

```JSON
    "baseUrl": "./",
    "paths": {
    "@example/*": ["src/*", "dist/*"]
    },
```

把`@example`改为你想使用的项目名称。

## absolute import

整个项目的引用，都会以`src`作为根目录来进行，输入绝对路径即可。

之前的:

```ts
import config from "./config";
```

就可以写作

```ts
import config from "@example/config";
```
