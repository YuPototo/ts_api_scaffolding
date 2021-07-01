# 03. dockerize db

为什么要 dockerize db 呢？

部署的时候比较方便，不需要在系统内安装 postgres 并创建用户和密码等。

## 问题 1：data persistency

container 关闭后，里面的数据会被删除，我需要让数据库的数据实现 data persistency。是该用 volume 还是 mount 呢？

如果使用 volume 的话，删除 docker volume 时会把数据也删除，比较危险。还是使用 mount 比较好。

我把数据库保存在一个 absolute path 里 `/db/pgData`。

是否有数据库的权限问题吗？待考虑

## 问题 2: 数据库敏感信息的存储。

`docker-compose.prod.yml` 会进入 source control，不应该在其中暴露数据库的用户名等。

将数据库信息存在 `prisma/.env.db.prod` 里，包含如下 4 个变量:

-   POSTGRES_USER
-   POSTGRES_PASSWORD
-   POSTGRES_DB
-   DATABASE_URL

然后在 docker-compose.prod.yml 内使用这 3 个 environment variable

在运行 docker compose 命令时，使用 `--env-file` flag:

```
docker compose --env-file ./prisma/.env.db.prod -f docker-compose.prod.yml up -d
```

因为这里已经成功把 `DATABASE_URL` 创建为了环境变量，下面的 `package.json` 的 script 可以简化：

```
"start": "ENV_FILE=./config/.env.prod dotenv -e ./prisma/.env.db.prod -- node -r tsconfig-paths/register ./dist/index.js"
```

可以删除掉 `dotenv -e ./prisma/.env.db.prod --`，简化为：

```
"start": "ENV_FILE=./config/.env.prod node -r tsconfig-paths/register ./dist/index.js",
```

## 部署步骤

### 第 1 次部署

假定源代码已经被 pull 到 prod 环境。

在 prod server 内创建一个 dir `/db/pgData`，这会是 mount 的源文件。

1. prod 环境：`docker compose -f docker-compose.prod.yml up -d`，创建 image，并运行
2. 本地环境：`yarn migrate:prod`

### 第 2 次部署

如果 schema 发生了改变

1. 本地环境：`yarn migrate:prod`
2. prod 环境：`docker compose -f docker-compose.prod.yml up -d --build`
