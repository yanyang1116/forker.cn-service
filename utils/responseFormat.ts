const wrapSuccess = (ctx: any, data: any = null) => {
	ctx.status = 200;
	ctx.body = {
		value: data,
		success: true,
	};
};

const wrapFail = (ctx: any, err: any) => {
	let message = '';
	switch (err) {
		case 406:
			message = '请求内容类型不正确';
			break;

		case 400:
			message = '无效请求';
			break;

		default:
			message = '服务器繁忙，请稍后再试';
	}
	ctx.body = { message, success: false };
	ctx.status =
		typeof err === 'number' && (err as any).length === 3 ? err : 500;

	ctx.app.emit('error', err, ctx);
};

export default {
	wrapSuccess,
	wrapFail,
};
