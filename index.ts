import bodyParser from 'koa-bodyparser';
import Router from 'koa-router';
import Koa from 'koa';
import chalk from 'chalk';
import cors from 'koa2-cors';
import compress from 'koa-compress';

// import path from 'path';
// import koaStatic from 'koa-static';
// import mount from 'koa-mount';

/**
 * 这里不能用别名，当 import 执行完之后，下文都可以用别名
 * 这个包，修改了 node 原型关于 module 的解析，以此来实现运行时别名
 */
import alias from './utils/alias';
alias();

import appRoutes from '@controller/router';
import proxyConfig from '@config/proxy';
// import corsOriginConfig from '@config/cors';
import reqProxy from '@middleware/reqProxy';
import auth from '@middleware/auth';

const app = new Koa();
const router = new Router({ prefix: '/api' });
appRoutes(router);

if (process.env.NODE_ENV === 'development') app.use(cors());

app.use(reqProxy(proxyConfig));

/**
 * 用这个插件，增加了一层 /s，才能访问到静态文件，主要为了结构方便管理
 * mount 和 koa-static 也是非常常用的中间件，这个项目虽然没用，但是代码保留方便以后参考
 */
// app.use(mount('/s', koaStatic(path.join(__dirname, '../static'), {})));

// 到时候开 ng 看下大小
// app.use(compress());

/**
 * 关于 bodyParser 的转化：
 * 默认只对于 x-www-form-urlencoded 进行
 * 如果请求是 form-data 类型，一般都是处理文件上传，使用 multer 进行
 *
 * 也可以用 formidable 这个中间件，但是 multer 好像不兼容，可能要额外排除文件上传的路由进行处理
 * 所以，这里就记录一笔，只使用 x-www-form-urlencoded 这种方式
 *
 * 注意，这个中间件转化后，任何输入都是字符串，这个也是一般后端服务的通常做法：
 * {
 *		userName: 'null', null -> 'null'
 *  	pwd: '123123' 123123 -> '123123'
 * }
 */
app.use(bodyParser());
app.use(auth());
app.use(router.routes());
app.use(router.allowedMethods()); // 这个中间件，如果请求的 methods 路由没有定义会自动抛出错误

/**
 * Request remote address. Supports X-Forwarded-For when app.proxy is true.
 * 如果这个打开的话，如果有反向代理，会返回第一个原始的 id
 * ctx.request.ids 字段会把代理信息记录下来
 * TODO，可以认证下，不过应该问题不大，有官方文档的例子
 * https://github.com/koajs/koa/blob/master/docs/api/index.md
 */
app.proxy = true;

app.listen(8899, () => console.log(chalk.yellow('listen at 8899')));
