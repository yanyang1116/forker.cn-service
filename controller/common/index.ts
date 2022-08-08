import Router from 'koa-router';

import { login } from '@service/common/index';
import wrapRes from '@utils/responseFormat';
// TODO，这个包对声明文件会对 koa ctx 造成影响，我这里在 declarations.d.ts 里声明成了 any
import multer from '@koa/multer';

const upload = multer();

export default (router: Router) => {
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

	router.post('/common/upload', upload.single('file'), async (ctx, next) => {
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
	});
};
