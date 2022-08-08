/**
 * @file
 * 使用固定 value，相当于对称加密的鉴权方式
 * 有空可以做一下【非对称加密】的方式
 */
import type * as Koa from 'koa';
import jwt from 'jsonwebtoken';

import secretInfo from '@config/secret';
import authApis from '@config/authApis';

export default () => async (ctx: Koa.ParameterizedContext, next: Koa.Next) => {
	if (!authApis.includes(ctx.request.URL.pathname)) {
		return next();
	}
	const token = ctx.request.header.authorization;
	if (!token) {
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
