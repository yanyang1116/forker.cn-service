import Router from 'koa-router';

import { login, upload, pv, auth } from '@service/common/index';
import wrapRes from '@utils/responseFormat';
// @koa/multer 包的申明文件有 Koa 有冲突，我这里在 declarations.d.ts 里单独声明了，至于是否可以修复，之后可以研究 TODO
import multer from '@koa/multer';

const uploader = multer();

export default (router: Router) => {
	router.post('/common/pv', async (ctx, next) => {
		let data: any = null;
		try {
			data = await pv(ctx);
		} catch (err) {
			wrapRes.wrapFail(ctx, err);
			next();
			return;
		}
		wrapRes.wrapSuccess(ctx, data);
		next();
	});

	router.post('/common/login', async (ctx, next) => {
		let data: any = null;
		try {
			data = await login(ctx);
		} catch (err) {
			wrapRes.wrapFail(ctx, err);
			next();
			return;
		}
		wrapRes.wrapSuccess(ctx, data);
		next();
	});

	router.get('/common/auth', async (ctx, next) => {
		let data: any = null;
		try {
			data = await auth(ctx);
		} catch (err) {
			wrapRes.wrapFail(ctx, err);
			next();
			return;
		}
		wrapRes.wrapSuccess(ctx, data);
		next();
	});

	// upload 使用 multer 的重载方式和别的不同
	router.post(
		'/common/upload',
		uploader.single('file'),
		async (ctx, next) => {
			let data: any = null;
			try {
				data = await upload(ctx);
			} catch (err) {
				wrapRes.wrapFail(ctx, err);
				next();
				return;
			}
			wrapRes.wrapSuccess(ctx, data);
			next();
		}
	);
};
