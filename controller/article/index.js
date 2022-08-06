import {
	list,
} from '../../service/article/index.js'

import wrapRes from '../../../utils/responseFormat.js'

export default router => {
	router.get('/article/list', async (ctx, next) => {
		let data = null;
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
};
