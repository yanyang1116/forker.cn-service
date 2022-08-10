import Router from 'koa-router';

import {
	list,
	trashList,
	view,
	like,
	submit,
	status,
} from '@service/article/index';
import wrapRes from '@utils/responseFormat';

export default (router: Router) => {
	router.post('/article/view', async (ctx, next) => {
		let data: any = null;
		try {
			data = await view(ctx);
		} catch (err) {
			wrapRes.wrapFail(ctx, err);
			next();
			return;
		}
		wrapRes.wrapSuccess(ctx, data);
		next();
	});

	router.post('/article/like', async (ctx, next) => {
		let data: any = null;
		try {
			data = await like(ctx);
		} catch (err) {
			wrapRes.wrapFail(ctx, err);
			next();
			return;
		}
		wrapRes.wrapSuccess(ctx, data);
		next();
	});

	router.post('/article/status', async (ctx, next) => {
		let data: any = null;
		try {
			data = await status(ctx);
		} catch (err) {
			wrapRes.wrapFail(ctx, err);
			next();
			return;
		}
		wrapRes.wrapSuccess(ctx, data);
		next();
	});

	router.post('/article/submit', async (ctx, next) => {
		let data: any = null;
		try {
			data = await submit(ctx);
		} catch (err) {
			wrapRes.wrapFail(ctx, err);
			next();
			return;
		}
		wrapRes.wrapSuccess(ctx, data);
		next();
	});

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
