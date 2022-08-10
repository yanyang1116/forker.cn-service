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
