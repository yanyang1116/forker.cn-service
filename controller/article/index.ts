import Router from 'koa-router';

import { list } from '@service/article/index';
import wrapRes from '@utils/responseFormat';

export default (router: Router) => {
	router.get('/article/list', async (ctx, next) => {
		let data: any = null;
		try {
			// data = await list(ctx);
			data = await list();
		} catch (err) {
			wrapRes.wrapFail(ctx, err);
			next();
			return;
		}
		wrapRes.wrapSuccess(ctx, data);
		next();
	});
};
