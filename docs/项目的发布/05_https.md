# 05 HTTPS

## 获得 certificate

certificate 帮助实现 HTTPS，需要从 certificate authority 获取。

网上有很多获取免费 certificate 的服务。

获取 certificate 后，需要证明我真的持有这个域名。

按照服务商操作后，就会获得证书。

可以使用腾讯云的证书服务，可以下载到证书的文件。

## NGINX 如何配置

参考这里即可： https://cloud.tencent.com/document/product/400/35244

## NGINX + Docker 如何配置

需要把 certificate 传入 container 内。

docker-compose 文件新增两个 volume

```yml
volumes:
    - ./nginx/default.conf:/etc/nginx/conf.d/default.conf:ro # 之前的
    - ./nginx/1_qingqu1024.com_bundle.crt:/etc/nginx/1_qingqu1024.com_bundle.crt # 新增的
    - ./nginx/2_qingqu1024.com.key:/etc/nginx/2_qingqu1024.com.key # 新增的
```

再用 FileZilla 把两个证书文件复制到服务器内，路径为项目根目录的的 `nginx` 文件夹内。（注意：不能把 certificate 文件放到 source control）。

然后运行 docker-compose 即可。

### 参考

[HTTPS in a nutshell](https://samselikoff.com/blog/https-in-a-nutshell)
[How HTTPS works ...in a comic](https://howhttps.works/)
[What is HTTPS](https://www.cloudflare.com/learning/ssl/what-is-https/)
[What is an SSL certificate?](https://www.cloudflare.com/learning/ssl/what-is-an-ssl-certificate/)
