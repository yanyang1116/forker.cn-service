import type * as Koa from 'koa';
import { MongoClient } from 'mongodb';

const url = 'mongodb://localhost:27017/';
const client = new MongoClient(url);
const dbName = 'blog';
const collectionName = 'LIST';

export default async (ctx: Koa.ParameterizedContext) => {
	const { pageSize = 5, pageNum = 1 } = ctx.query;
	try {
		await client.connect();
		const db = client.db(dbName);
		const collection = db.collection(collectionName);
		const total =
			(await collection.find({ status: 2 }).toArray()).length ?? 0;
		// 这里就直接全量查了，TODO，如何做好分页查询优化，这个到时候问问钱老板
		const list = await collection
			.find({ status: 2 })
			.skip((pageSize as number) * ((pageNum as number) - 1))
			.limit(pageSize as number)
			.toArray();
		let nextPage = list.length === pageSize;
		return {
			list,
			total,
			nextPage,
		};
	} catch (err) {
		ctx.throw(err);
	}
};
