import type * as Koa from 'koa';

const wrapSuccess = (ctx: Koa.ParameterizedContext, data: any = null) => {
	ctx.status = 200;
	ctx.body = {
		value: data,
		success: true,
	};
};

const wrapFail = (ctx: Koa.ParameterizedContext, err: Error) => {
	if (!err.message) {
		ctx.status = 500;
		return;
	}
	const _err = Number(err.message);
	let message = '';

	switch (_err) {
		case 406:
			message = '请求内容类型不正确';
			break;

		case 400:
			message = '无效请求';
			break;

		case 500:
			message = '服务器繁忙，请稍后再试';
			break;

		default:
			message = err.message;
	}
	ctx.body = { message, success: false };
	ctx.status = 200;
	ctx.app.emit('error', err, ctx);
};

export default {
	wrapSuccess,
	wrapFail,
};
