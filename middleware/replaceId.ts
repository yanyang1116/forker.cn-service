/**
 * @file
 * 此中间件废弃，因为使用过程中发现，还是使用 mongo 的 _id 用于查询太麻烦了
 * 但是这个中间件对书写过程是值得一看的，算是一个备份吧
 */

/**
 * @file
 * 修改 response 每条数据的 _id -> id
 * 这个中间件，展示了如【何既拦截请求，又拦截返回】
 *
 * 关于返回拦截：
 * 目前只判断 Object 和 Array 对返回体
 * 可能【确实存在效率】的问题，但是通过这个中间件，摸一下返回体拦截也不错
 * 我的应用的使用场景【完全够用】了
 *
 * ↓↓↓ 请求拦截转化 id，这个太麻烦了、不实用，注释掉了，功能是可以用的，还是在具体的业务逻辑里取根据 id 查询吧
 * 关于请求拦截：
 * 只针对 query、body 中的对象、数组进行处理
 *
 * 其他关于 id 的逻辑自行在 service 中处理
 * 也就是说，这个应用内，都是用 _id 作为主键查询，但是对用户暴露、读写的时候是用的 id
 * 这个中间件就是转化对作用
 */
import type * as Koa from 'koa';

export default () =>
	async (
		ctx: Koa.ParameterizedContext<
			Koa.DefaultState,
			Koa.DefaultContext,
			IResponseBody<any>
		>,
		next: Koa.Next
	) => {
		// if (Object.keys(ctx.query).length) deep(ctx.query, true);
		// if (Object.keys(ctx.request.body).length) deep(ctx.request.body, true);

		// 这个中间件，展示了如何既拦截请求，又拦截返回
		await next();

		if (!ctx.response.body || typeof ctx.response.body.value !== 'object')
			return;

		function deep(value: any, reverse: boolean) {
			// 退出条件是，当前 value 不是 array 或者 object
			if (typeof value !== 'object') return;
			if (Array.isArray(value)) {
				// 数组继续 deep，mongo 的数据结构中，_id 不会存在数组上
				value.forEach((item) => {
					deep(item, reverse);
				});
			} else if (
				Object.prototype.toString.call(value) === '[object Object]' &&
				!reverse
			) {
				// 如果是对象，删除 _id，增加 id
				if (
					value._id &&
					value._id.constructor.name === 'ObjectId' &&
					(value.id === null || value.id == undefined)
				) {
					value.id = value._id;
					delete value._id;
				}
				Object.keys(value).forEach((key) => {
					deep(value[key], reverse);
				});
			} else if (
				Object.prototype.toString.call(value) === '[object Object]' &&
				reverse
			) {
				// 如果是对象，删除 _id，增加 id
				if (
					reverse &&
					value.id &&
					(value._id === null || value._id == undefined)
				) {
					value._id = value.id;
					delete value.id;
				}
				Object.keys(value).forEach((key) => {
					deep(value[key], reverse);
				});
			}
		}
		deep(ctx.response.body.value, false);
	};
