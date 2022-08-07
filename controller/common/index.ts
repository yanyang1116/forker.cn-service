import Router from 'koa-router';

import { login } from '@service/common/index';
import wrapRes from '@utils/responseFormat';

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
};
