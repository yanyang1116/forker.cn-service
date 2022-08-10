import type * as Koa from 'koa';
import { MongoClient } from 'mongodb';

import baseConfig from '@config/base';

const url = baseConfig.mongoHost;
const client = new MongoClient(url);
const dbName = 'blog';
const collectionName = 'LIST';

let dbConnected = false;

export default async (ctx: Koa.ParameterizedContext) => {
	const { pageSize = 5, pageNum = 1 } = ctx.query;
	try {
		if (!dbConnected) {
			await client.connect();
			dbConnected = true;
		}
		const db = client.db(dbName);
		const collection = db.collection(collectionName);
		const total = (await collection.find({ status: { $ne: 2 } }).toArray())
			.length;
		// 这里就直接全量查了，TODO，如何做好分页查询优化，这个到时候问问钱老板
		const list = await collection
			.find({ status: { $ne: 2 } })
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
		client.close();
		dbConnected = false;
		ctx.throw(err);
	}
};
