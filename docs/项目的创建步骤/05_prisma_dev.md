# Prisma - 开发

这里不解释概念了。
先理解 Tooling。

## 开发环境 - 创建

假定已经启动 postgres 数据库。并不需要提前创建数据库。

### 第 1 步：启动 prisma

1.1 安装 prisma

```
yarn add prisma -D
```

1.2 启动 prisma Cli

```
npx prisma
```

1.3 创建 prisma schema 文件

```
npx prisma init
```

这个步骤会：

-   根目录创建一个 .env 文件（在我的架构里，用不到它，最后删掉）；
-   根目录创建了一个 `prisma` 文件夹，其中有一个 `schema.prisma` 文件

### 第 2 步：确定 schema

在 `prisma/schema.prisma` 文件里确定 schema。

比如一个简单的 Todo App 有如下 Schema。

```ts
model Todo {
    id        Int      @id @default(autoincrement())
    createdAt DateTime @default(now())
    updatedAt DateTime @updatedAt
    text      String   @db.VarChar(255)
}
```

### 第 3 步：准备环境变量

这里的关键是：prisma 需要一个名为`DATABASE_URL`的环境变量。

#### 3.1 删除 `.env`

`npx prisma init` 会在根目录创建一个`.env`文件，我不用这个方法保存环境变量，所以删除它。

#### 3.2 安装`dotenv-cli`

```
yarn add dotenv-cli
```

之后会需要用到它。

#### 3.3 在 `prisma` 文件创建一个 `.env.dev`

里面输入`DATABASE_URL`的环境变量。

### 第 4 步：Migrate

#### 4.1 init migrate

在 `pacakge.json` 里创建一个 script

```json
"migrate:dev": "dotenv -e ./prisma/.env.db.dev prisma migrate dev",
```

这里用了两个命令：

-   `dotenv -e ./prisma/.env.db.dev`，这是 `dotenv-cli` 提供的功能，会读取`.env.db.dev`并设置为环境变量
-   `prisma migrate dev`: migrate 数据库，会提示给个名字给这个 migration

执行这个 script:

```
yarn migrate:dev
```

效果：

-   如果没有 db，会创建 db
-   在 db 里创建 schema 和 tables
-   在 `prisma` 文件夹里创建一个 `migrations` 文件夹，并记录 migration history

### 第 5 步：安装 Prisma Client

```
yarn add @prisma/client
```

`@prisma/client` 根据 schema 记录了 model 的各种 type 信息。

如果 schema 改变，需要手动运行 `prisma generate`。

### 第 6 步：建立 client

在 `src` 里创建一个 `db` 文件夹，并创建一个 `client.ts`。

这个文件做两件事情：

-   创建一个 prisma client 的 instance，供 app 使用；
-   export schema 定义的 type

```ts
import { PrismaClient } from "@prisma/client";

// 由 prisma 生成的 type
export { Todo } from "@prisma/client";

const prisma = new PrismaClient();
export default prisma;
```

### 第 7 步：运行 app

#### 7.1 修改 `package.json` 里的 `dev` 命令

`scripts`里的`dev`新增：`dotenv -e ./prisma/.env.db.dev`

```json
"dev": "ENV_FILE=./config/.env.dev dotenv -e ./prisma/.env.db.dev tsnd -r tsconfig-paths/register --respawn --transpile-only ./src/index.ts",
```

注意： 必须放在 `ENV_FILE`环境变量 之后，否则会报错

#### 7.2 在 app 里引用 client

```ts
import prisma from "@example/db/client";

prisma.todo.create({
    data: {
        text: "learn TS",
    },
});
```

client 更多方法参考[client 文档](https://www.prisma.io/docs/reference/api-reference/prisma-client-reference#create-1)

## 开发环境 - schema 改变后

我们修改了 schema

```ts
model Todo {
    id        Int      @id @default(autoincrement())
    createdAt DateTime @default(now())
    updatedAt DateTime @updatedAt
    text      String   @db.VarChar(255)
    isDone    Boolean  @db.Boolean // 新增这行
}
```

### 第 1 步：migrate

```
yarn migrate:dev
```

会被提示给个名字。

效果：DB 的 schema 更新

### 第 2 步：`prisma generate`

```
yarn prisma generate
```

会更新 `@prisma/client`。

之前项目里的下列代码就会报错，提示需要`isDone`

```ts
await prisma.todo.create({
    data: {
        text,
    },
});
```

## 参考

-   [Prisma - Start from scratch](https://www.prisma.io/docs/getting-started/setup-prisma/start-from-scratch-typescript-postgres)
