import bodyParser from 'koa-bodyparser';
import Router from 'koa-router';
import Koa from 'koa';
import path from 'path';
import chalk from 'chalk';
import cors from 'koa2-cors';
import compress from 'koa-compress';
// import koaStatic from 'koa-static';
// import mount from 'koa-mount';

// 这里不能用别名，当 import 执行完之后，下文都可以用别名
import alias from './utils/alias';
alias();

import appRoutes from '@controller/router';
import proxyConfig from '@config/proxy';
import reqProxy from '@middleware/reqProxy';
import auth from '@middleware/auth';

const app = new Koa();
const router = new Router({ prefix: '/api' });
appRoutes(router);

if (process.env.NODE_ENV === 'development')
	app.use(cors({ credentials: true, origin: 'http://localhost:5173' }));

app.use(reqProxy(proxyConfig));

/**
 * 用这个插件，增加了一层 /s，才能访问到静态文件，主要为了结构方便管理
 * mount 和 koa-static 也是非常常用的中间件，这个项目虽然没用，但是代码保留方便以后参考
 */
// app.use(mount('/s', koaStatic(path.join(__dirname, '../static'), {})));

// 到时候开 ng 看下大小
// app.use(compress());

app.use(bodyParser());
app.use(auth());
app.use(router.routes());
app.use(router.allowedMethods()); // 这个中间件，如果请求的 methods 路由没有定义会自动抛出错误

// 验证一下
// app.proxy = true; // 如果有项目配置了 nginx 转发，这样设置可以在程序中，获取访问者的真是ip，而并不是 127.0.0.1

app.listen(8899, () => console.log(chalk.yellow('listen at 8899')));
