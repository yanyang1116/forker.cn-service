/**
 * @file
 * 修改每条数据的 _id -> id
 * 目前只判断 Object 和 Array 对返回体
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
		await next();
		if (!ctx.response.body || typeof ctx.response.body.value !== 'object')
			return;

		function deep(value: any) {
			// 退出条件是，当前 value 不是 array 或者 object
			if (typeof value !== 'object') return;
			if (Array.isArray(value)) {
				// 数组继续 deep，mongo 的数据结构中，_id 不会存在数组上
				value.forEach((item) => {
					deep(item);
				});
			} else if (
				Object.prototype.toString.call(value) === '[object Object]'
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
					deep(value[key]);
				});
			}
		}
		deep(ctx.response.body.value);
	};
