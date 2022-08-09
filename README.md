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
