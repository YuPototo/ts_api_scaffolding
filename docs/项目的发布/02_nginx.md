# 01 Nginx

Nginx 是一个 Web Server，我主要使用它的如下功能：

-   Serve static files
-   Reverse Proxy
-    作为 HTTPS server

我通过 docker 使用 Nginx。

## Nginx 配置

在根目录新建一个 `nginx` 文件夹。

在其中创建一个 `default.conf`。

配置如下：

```conf
server {
    listen 80;

    location /api/ {
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header Host $http_host;
        proxy_set_header X-Nginx-Proxy true;
        proxy_redirect off;

        proxy_pass http://node-app:5000;
    }
}

```

`location /api/`，要把 app 内的 routes 都添加上 `/api/`

`proxy_set_header` 命令可以重新定义或添加字段传递给代理服务器的 header，第一个 parameter 是 field，第 2 个 parameter 是 value。
[参考文档](http://nginx.org/en/docs/http/ngx_http_proxy_module.html#proxy_set_header)

这里先默认具体的配置符合需求。

`proxy_pass` 设定了代理服务器的地址和 port。这里使用 `http://node-app:5000;` 是因为：

-   在 docker-compose.prod.yml 里，app 的服务名称是 `node-app`
-   在 app 里，PORT 是 5000

## docker compose 配置

```yml
version: "3.9"
services:
    nginx:
        image: nginx:stable-alpine
        volumes:
            - ./nginx/default.conf:/etc/nginx/conf.d/default.conf:ro
        ports:
            - "80:80"

    node-app:
        build: .
        command: yarn start
```

`services` 里对 nginx 里最重要的配置是 `volumes: - ./nginx/default.conf:/etc/nginx/conf.d/default.conf:ro`。
这里设置了一个 volume，即使用项目内的 `/nginx/default.conf` 文件，并映射到容器内的`/etc/nginx/conf.d/default.conf`，请规定容器内的该文件 `read-only`。

注意，这里的 `node-app` 删除了 `ports` 设置，不再对外开放。
