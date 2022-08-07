import Router from 'koa-router';

import { list, trashList } from '@service/article/index';
import wrapRes from '@utils/responseFormat';

export default (router: Router) => {
	router.get('/article/list', async (ctx, next) => {
		let data: any = null;
		try {
			data = await list(ctx);
		} catch (err) {
			wrapRes.wrapFail(ctx, err);
			next();
			return;
		}
		wrapRes.wrapSuccess(ctx, data);
		next();
	});

	router.get('/article/trashList', async (ctx, next) => {
		let data: any = null;
		try {
			data = await trashList(ctx);
		} catch (err) {
			wrapRes.wrapFail(ctx, err);
			next();
			return;
		}
		wrapRes.wrapSuccess(ctx, data);
		next();
	});
};
