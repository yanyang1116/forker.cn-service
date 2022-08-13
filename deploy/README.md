# 部署数据库 docker 镜像

这个文件主要是对于数据库的初始化

## 初始化

> 数据库 docker 进行包括：mongo 以及由 ng 提供的静态资源服务

物理机进入当前目录，运行 `docker build . -t forker/db:v1`
_如果遇到网络问题，记得关闭代理_

v1: 为 tag，如果镜像有更新，可以看情况迭代（不过这种本地 dockerfile 构建的，tag 其实无所谓）
额外说明，暴露了两个对外端口：

```
EXPOSE 10010 # nginx
EXPOSE 27017 # mongo
```

---

## 运行

1. 当 db docker 容器初始化好之后，db 容器就是真实的数据库了，操作要
   **【谨慎】【谨慎】【谨慎】**

2. 运行 db 容器：docker run -d --name db-0812 forker/db:0812
   建议用 db-日期，并且打上日期为主的 tag 方便管理（commit、迁移、备份）

3. ~~ `docker exec -it db-0812 nginx` ~~
   ~~务必要执行一次，才能开启 db 容器中的 ng~~
   使用了 `CMD` ，容器启动时可以自动启动 ng 了

4. `docker exec -it db-0812 bash` 进入容器控制台进行

5. `docker stop db-0812` 关闭容器

6. `docker start db-0812` 重启开启容器
