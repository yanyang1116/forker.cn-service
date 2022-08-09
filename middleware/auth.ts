/**
 * @file
 * 主要是对于需要鉴权的接口，校验 jwt token 是否有效
 *
 * 使用固定'盐'，相当于对称加密的鉴权方式
 * 有空可以做一下【非对称加密】的方式
 */
import type * as Koa from 'koa';
import jwt from 'jsonwebtoken';

import secretInfo from '@config/secret';
import authApis from '@config/authApis';

export default () => async (ctx: Koa.ParameterizedContext, next: Koa.Next) => {
	if (!authApis.includes(ctx.request.URL.pathname)) {
		/**
		 * 这个表示中间件对请求拦截做完了 return next()
		 * ↑↑↑ 注意，这里一定要 return，不然不能 resolve 会报错的
		 *
		 * 如果是这样 await next() 则表示响应拦截
		 */
		return next();
	}
	const token = ctx.request.header.authorization;
	if (token === null || token === undefined) {
		ctx.status = 401;
		return;
	}
	let decoded;
	try {
		decoded = jwt.verify(token, secretInfo.value);
		/**
		 * TODO，这里其实可以放到内存位置，这样具体的业务逻辑里就不用再定位一次用户了
		 * 目前，就单纯解一下
		 */
	} catch (err) {
		ctx.status = 401;
		return;
	}
	return next();
};
