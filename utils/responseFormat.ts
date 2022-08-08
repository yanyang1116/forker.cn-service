import type * as Koa from 'koa';

const wrapSuccess = (ctx: Koa.ParameterizedContext, data: any = null) => {
	ctx.status = 200;
	ctx.body = {
		value: data,
		success: true,
	};
};

const wrapFail = (ctx: Koa.ParameterizedContext, err: any) => {
	// 200，可交互对处理
	if (err.status === 200) {
		ctx.body = { message: err.message, success: false };
		ctx.status = 200;
		return;
	}

	// 直接抛出状态码的处理
	if (err.__proto__.status !== 500) {
		ctx.status = err.__proto__.status;
		return;
	}

	// 其他异常，这种就不需要让用户知道了，直接 err 把 stack 往下传，需要的话，可以记录 stack
	ctx.status = 500;

	// TODO，err log 其实还没做
	ctx.app.emit('error', err, ctx);
};

export default {
	wrapSuccess,
	wrapFail,
};
