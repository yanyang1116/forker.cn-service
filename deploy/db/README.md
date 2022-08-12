1. 当 db docker 容器初始化好之后，db 容器就是真实的数据库了，操作要
   **【谨慎】【谨慎】【谨慎】**

2. 运行 db 容器：docker run -d --name db-0812 forker/db:0812
   建议用 db-日期，并且打上日期为主的 tag 方便管理（commit、迁移、备份）

3. `docker exec -it db-0812 nginx`
   务必要执行一次，才能开启 db 容器中的 ng

4. `docker exec -it db-0812 bash` 进入容器控制台进行

5. `docker stop db-0812` 关闭容器

6. `docker start db-0812` 重启开启容器
