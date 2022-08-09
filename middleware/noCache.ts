/**
 * @file
 * 去除缓存，这个可以暂时不用
 * TODO，可以看一下，是否以 ng 为主要收口 —— 应该不是，ng 只是转发过来，具体还是以我的内容为主
 */

import type * as Koa from 'koa';

export default () => async (ctx: Koa.ParameterizedContext, next: Koa.Next) => {
	await next();
	ctx.set('Cache-Control', 'no-store, no-cache, must-revalidate');
	ctx.set('Pragma', 'no-cache');
	ctx.set('Expires', '0');
};
