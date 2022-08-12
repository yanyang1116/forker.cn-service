# forker.cn-service

服务端

docker 安装
配置一个镜像，包括 mongodb、redis、koa2、koaRouter

ng 文件可配置，用 docker 命令执行

错误码的包装，从简吧

nodejs 一定要用异步编程的，但是我这里先写同步代码
TODO: nodejs 异步的事情要好好研究一下

x-www-form-urlencoded 请求体下
ctx.request.body，会保证将用户输入，变成字符串：
{
userName: 'null', null -> 'null'
pwd: '123123' 123123 -> '123123'
}

todo: error log，这个完全不着急

检查代码
shell 脚本 docker 放一个
dockerfile 自己的镜像

权限系统:
设计一个借口返回权限列表，服务端暂时不做接口层面的校验 (TODO)

## 记一笔

koa 上下文中 ctx.throw，是可以被下文 catch 到的
详情见 login.ts

try {
ctx.throw('数据重复')
} catch (err) {
client.close();
dbConnected = false;
// 一样，抛出错误，这里就会 500
ctx.throw(err);
}

nodejs io 阻塞的事情要验证一下

---

## 部署相关

> 大致流程: 网络请求 -> 宿主机 ng -> 应用 docker 容器
> 应用 docker 容器开始工作，通过容器间通讯调用数据库 docker 容器
> **dockerfile 仅仅是定义容器的语句。它仅仅是定义容器内部的状态，不能通过它停止，删除容器。只能通过宿主机的 docker 命令来做**

### 数据库

> 数据库进行人为（半自动化）部署，包括初始化、迁移、备份，人为会更好一些
> 初始化数据库

1. 宿主机，拉下来仓库
2. 运行仓库中的 /initDB/dockerfile

### 应用 docker 容器的部署

1. 宿主机，拉下来仓库
2. 宿主机关闭当前正在运行的 docker 容器
3. 运行仓库中的 /app/dockerfile

这个流程中，docker 容器自带回滚的功能

### TODO

1. 是否需要加一层 nginx 的 docker 完全不用宿主机的 nignx 配置
2. 在关闭 docker 容器的时候灰度，可以考虑下，其实也能想到，大致就是一个一个容器替换，也可能要配合 ng 的一些脚本，报错了轮询到下一个容器来提供内容
