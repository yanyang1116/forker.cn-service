import bodyParser from 'koa-bodyparser'
import Router from 'koa-router'
import Koa from 'koa'
import chalk from 'chalk'
import cors from 'koa2-cors'
import compress from 'koa-compress'

import appRoutes from './router.js'


// const errorLog = require('@util/errorLog');

const app = new Koa();
const router = new Router({ prefix: '/api' });
appRoutes(router);

if (process.env.NODE_ENV === 'development') app.use(cors({ credentials: true, origin: 'http://localhost:5173' }));


app.use(compress());

// app.use(async (ctx, next) => {
//     await next()
// 		ctx.set('Cache-Control', 'no-store, no-cache, must-revalidate')
// 	  ctx.set('Pragma', 'no-cache')
// 	  ctx.set('Expires', 0)
// });

app.use(bodyParser());
app.use(router.routes());
app.use(router.allowedMethods());

// app.on('error', (err, ctx) => errorLog(err, ctx));
app.proxy = true; // 如果有项目配置了 nginx 转发，这样设置可以在程序中，获取访问者的真是ip，而并不是 127.0.0.1

app.listen(8000, () => console.log(chalk.yellow('listen at 8000')));
