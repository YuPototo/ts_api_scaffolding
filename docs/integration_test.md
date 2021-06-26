# integration test

Integration test 会调用各个 endpoint，并跟真实数据库发生交互。

参考了[prisma 文档](https://www.prisma.io/docs/guides/testing/integration-testing)的思路。

测试数据库会放在 docker 内，container 被关闭时，数据库也会被销毁，保证不存在一个 persistent test db。

## workflow

1. 测试准备：
    - Start the container and create the database
    - Migrate the schema
2. 测试：运行测试用例，这部分可以重复进行
3. 测试结束：Destroy the container

上面几个动作以此对应如下 `package.json` 里的 scripts

### 1.1 Start the container and create the database

需要先创建 container，具体参考下面的 `Docker 设置` 部分。

```JSON
    "scripts": {
        "test-docker:up": "docker compose -f docker-compose.test.yml up -d",
    }
```

### 1.2 Migrate the schema

```JSON
    "scripts": {
        "migrate:test": "dotenv -e ./prisma/.env.db.test npx prisma migrate dev --name init",
    }
```

需要安装 `dotenv-cli` 这个包，才能运行`dotenv`命令。
需要在 prisma 文件夹创建一个 `.env.db.test` 文件。

`.env.db.test` 的内容：

```
DATABASE_URL="postgresql://prisma:prisma@localhost:5433/tests"
```

使用上面的 URL 是以为 docker-compose.yml 内的配置。

### 前 2 步合并为一个 script

```JSON
    "scripts": {
        "test:up": "yarn test-docker:up && yarn migrate:test",
    }
```

### 2. Run the tests

运行测试

```JSON
    "scripts": {
        "test": "ENV_FILE=./config/.env.test dotenv -e ./prisma/.env.db.test jest",
    }
```

说明：

-   `ENV_FILE=./config/.env.test`: app 在 test 环境下需要的 config 文件。
-   `dotenv -e ./prisma/.env.db.test`: prisma-client 需要的 DB URL 在这个文件里。
-   `jest`: 运行测试

### 3. 结束测试

摧毁 container

```JSON
    "scripts": {
        "test:down": "docker compose -f docker-compose.test.yml down",
    }
```

## Docker 设置

### 1. `docker-compose.yml`

在根目录创建一个文件 `docker-compose.test.yml`。

```yml
# Set the version of docker compose to use
version: "3.9"

# The containers that compose the project
services:
    db:
        image: postgres:13
        restart: always # 我不太理解这个 restart 的意义，先搁置。
        container_name: integration-tests-prisma
        ports:
            - "5433:5432"
        environment:
            POSTGRES_USER: prisma
            POSTGRES_PASSWORD: prisma
            POSTGRES_DB: tests # 会创建一个名为 test 的 db
```

这个 container 里的 postgres 会被暴露给主机，端口为 5433。

### 2. 测试 docker 内创建了 test db

1. 运行

```
docker compose -f docker-compose.test.yml up -d
```

2. 查看 container 的 id

```
docker ps
```

获得 container 的 id

3. 列出 container 里的 db

```
docker exec -it 1322e42d833f psql -U prisma tests
```

`1322e42d833f` 替换为 container 的 id

4. 运行 psql 的命令 `\l`

这时应该能够看到 `tests` db 的存在。

## 其他信息

### Test Suites 内的数据准备

在每个 Test Suit 里，使用 `beforeAll` 创建初始数据，使用 `afterAll` 清空数据。

具体参考：[Prisma 的例子](https://www.prisma.io/docs/guides/testing/integration-testing#the-test-suite)

### 使用 `supertest` 作为测试 request

参考了[这个例子](https://losikov.medium.com/part-4-node-js-express-typescript-unit-tests-with-jest-5204414bf6f0)
