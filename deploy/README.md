# 部署数据库 docker 镜像

这个文件主要是对于数据库的初始化

## 创建容器

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

## 运行 part1

1. 当 db docker 容器初始化好之后，db 容器就是真实的数据库了，操作要
   **【谨慎】【谨慎】【谨慎】**

2. 运行 db 容器：`docker run -d --name db forker/db:v1`
   建议用 db-日期，并且打上日期为主的 tag 方便管理（commit、迁移、备份）: `docker run -d --name db-0812 forker/db:v1`
   注意，下文都用 db 来代替 db-0812 了，实际操作中，还是建议要加上【日期后缀】的
   本地开发环境执行：
   `docker run -d -p 10010:10010 -p 27017:27017 --name db forker/db:v1`

## 初始化数据

运行命令，完成初始化
`docker exec -it db mongo 127.0.0.1:27017 /home/init.js`

## 运行 part2

1. ~~本来是想用 `CMD` 来自启动 ng 的，不过试了下会和 mongo 的自启动有冲突~~
   务必要执行一次，才能开启 db 容器中的 ng：`docker exec -it db nginx`

2. `docker exec -it db bash` 进入容器控制台进行

3. `docker stop db` 关闭容器

4. `docker start db` 重启开启容器
