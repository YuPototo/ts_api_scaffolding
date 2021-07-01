# Prisma - 生产环境

开发环境下的 database 是 dev database，可以随意删除。
生产环境下的 database 是 prod database。

当我们把更新部署到 production 环境时，存在一个问题：如何把 database 的 schema 更新应用到 prod server 上？

这主要依靠 [Prisma Migrate](https://www.prisma.io/docs/concepts/components/prisma-migrate)

## 工作流

当 prisma schema 改变时，部署 app 的工作流是怎样的呢？

1. `prisma migrate dev`
2. app 的开发和测试
3. `prisma migrate deploy`
4. 生产环境下的 `prisma generate`（从这一步开始，在 Docker 内进行）
5. 编译 JS 代码
6. 运行 node app

### 第 1 步：`prisma migrate dev`

这一步会创建一系列 .sql 文件，即 migration history。它们将作用于 dev db，并在之后作用于 prod db。

### 第 2 步：app 的开发

schema 的修改可能伴随着 app 开发的修改。比如一个 `Todo` model 的 `content` field 并重新命名为 `text`，那么 app 内的代码也需要修改。

这一步在开发环境进行。

通过测试后，准备好进入部署环境，就进入第 3 步。

### 第 3 步：`prisma migrate deploy`

这个命令需要提供 prod db 的 URL，并把 `prisma migrate dev` 创建的 migration 应用到 prod db 上。
Prisma 建议在 CI/CD 执行这个步骤。
但为了节约时间，我会在本地执行这个步骤，即远程 deploy migration。

### 第 4 步：`prisma generate`

schema 更新后，需要手动更新生产环境下的 prisma client，即在生产环境下使用 `prisma generate` 命令。

从这一步开始会在 Docker 内进行。

### 第 5 步：编译 JS 代码

即 typescript 的 `tsc` 命令。

### 第 6 步：运行 node app

即 `node index.js` 命令。`index.js`是编译后的 app entry point。

## 我的操作步骤

这里描述操作步骤，并解释命令。

前两步就不解释了。

1. `prisma migrate dev`。这个参考 05_prisma_dev 文档。
2. app 的开发，略

### 两个 env 文件

创建两个 env 文件，分别给 app 和 prisma 使用。

注意：这不是 best practice。

#### `prisma/.env.db.prod`

需要先在根目录的 prisma 文件夹内创建一个 env 文件 `.env.db.prod`，这个文件不进入 source control，里面有 prod db 的 url。

#### `config/.env.prod`

在 config 文件夹内创建一个 `.env.prod`，不进入 source control。

这是给 app 用的。

### 第 3 步：`prisma migrate deploy`

在 `package.json` 内有一个 script:

```json

"scripts": {
    "migrate:prod": "dotenv -e ./prisma/.env.db.prod prisma migrate deploy",
}

```

直接在本地环境内运行 `yarn migrate:prod`，完成 migration。

### 第 4 步到第 6 步：

#### package.json

`package.json` 需要有 2 个命令：

```json
"scripts": {
    "build": "tsc",
    "start": "ENV_FILE=./config/.env.prod dotenv -e ./prisma/.env.db.prod -- node -r tsconfig-paths/register ./dist/index.js"
}
```

`build` 就不解释了。

`start` 命令分为 3 部分：

-   设置一个环境变量 `ENV_FILE`，给 app 使用
-   `dotenv -e ./prisma/.env.db.prod --`，这是给 `prisma client` 用的，告诉 prisma DB 的 url 是啥。
-   `node -r tsconfig-paths/register ./dist/index.js`，参考文档 01_ts_and_express 的解释。

#### Dockerfile

image 内包含如下主要动作：

-   安装 dependency 和 devDependency
-   `prisma generate`
-   build app

```dockerfile
FROM node:14

WORKDIR /app

# 安装 dependencies
COPY package.json .
COPY yarn.lock .
RUN yarn install

# COPY source code
COPY . ./

# migrate db
RUN yarn prisma generate

# build
RUN yarn build

```

#### docker-compose

在根目录创建 `docker-compose.prod.yml`，主要运行 `yarn start` 命令

```yml
version: "3.9"
services:
    node-app:
        build: .
        ports:
            - "3000:3000"
        command: yarn start
```

这里只考虑了 app，不考虑 reverse proxy 问题，之后添加 nginx 后，会更新这个 docker-compose 文件。
