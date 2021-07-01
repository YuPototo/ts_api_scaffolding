# 01 Nginx

Nginx 是一个 Web Server，我主要使用它的如下功能：

-   Serve static files
-   Reverse Proxy
-    作为 HTTPS server

## NGINX 的配置文件说明

Nginx 有一个原始配置文件，我们不去直接修改这个配置文件。
Nginx 允许我们创建自己的配置文件，Nginx 会读取这个配置文件，并修改配置。

### 常用 Context

配置选项被称为 directive。
Directive 存在于 block 或 context 之中。

最外层的 context 是 `main`，即针对整个 nginx 的配置。

nginx 的 context 结构如下：

-   `main`:
    -   `events`: 先不管这个。只有一个。
    -   `http`: virtual server 的默认配置。只有一个。
        -   `server`: 配置具体的 server，可以有多个。有 request 时，nginx 会根据规则选择 server。可以认为是 domain 层面的配置。
            -   `location`: 可以有多个。有 request 时，nginx 会根据规则选择 location。可以认为是 path 层面的配置。

典型配置结构如下：

```conf
# main context

events {
    # events context
}

http {
    # http context
    server {
        # first server context
        location /match/criteria {
            # first location
        }

        location /other/criteria {
            # second location
        }
    }

    server {
        # second server context
    }
}
```

### `server` context

一个 server 配置的例子：

```conf
server {
    listen         80 default_server;
    server_name    example.com www.example.com;
}
```

第 1 行, `listen 80 default_server;`:

-   `80`，说明 web server 听取对 80 端口对访问
-   `default_server`，如果找不到其他符合条件的 server context，就选这个。

第 2 行，`server_name example.com www.example.com;`:

-   设定需要听取的 request 的 host

这 2 行确定了 nginx 对 server 的选择方法。

我们对 nginx 所在服务器的 80 端口发布 HEADER 前两行如下的 http 请求：

```
GET / HTTP/1.1
Host: example.com
```

nginx 会发现请求里的 `host` 匹配上了 `server_name`，端口也匹配上了，然后就会选择这个 server。

### `location` context

location 相当于 path 层面的规则。

#### `location` 的选择算法

需要提供一段 string 作为 match criteria。

```conf
server {
    listen         80 default_server;
    server_name    example.com www.example.com;

    location / {
        # www.example.com 会 match 到这里
    }

    location /planet/ {
        # www.example.com/planet/ 会 match 到这里
    }

    location /planet/about/ {
        # www.example.com/planet/about/ 会 match 到这里
    }
}
```

nginx 会选择最具体的 match。比如上面的 config 里，如果 request 是 `www.example.com/planet/about/`，会选择 `location /planet/about/`而不是`location /planet/`。

`location` 后可以加入 modifier，实现精确匹配、regex 匹配等。这里忽略了。

#### `location`内的指令

下面看看 location context 内的若干指令。

##### 静态文件

```conf
location / {
    root html;
    index index.html index.htm;
}
```

`root` 指定了 location 对应的文件夹的位置。这里使用了 relative path。实际上的位置是`etc/nginx/html`（根据系统和版本可能有不同，但都是相对 nginx 文件夹而言）。

也可以给 `root` 指定 absolute path，比如`/data/www/html`。

`index` 列出需要 nginx 搜索的文件，它会按顺序寻找需要的文件，并返回第一个找到的文件。

##### Reverse Proxy

nginx 可以把请求转发到其他 app。

```conf
server {
    listen 80;
    server_name: www.example.com example.com;

    location /api/ {
        proxy_pass http://localhost:5000;
    }
}
```

这里使用 `proxy_pass` 命令，把对`example.com/api/`的请求转发到了 `localhost:5000`

### 参考资料

[Understanding the Nginx Configuration File Structure and Configuration Contexts](https://www.digitalocean.com/community/tutorials/understanding-the-nginx-configuration-file-structure-and-configuration-contexts)

[NGINX Reverse Proxy](https://docs.nginx.com/nginx/admin-guide/web-server/reverse-proxy/)
