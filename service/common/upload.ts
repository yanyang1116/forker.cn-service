import type * as Koa from 'koa';

export default async (ctx: Koa.ParameterizedContext) => {
	console.log('ctx.request.body', ctx.request.body);
	return null;
};
