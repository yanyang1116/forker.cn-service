import type * as Koa from 'koa';
import { MongoClient } from 'mongodb';

import baseConfig from '@config/base';

const url = baseConfig.dockerMongohost;
const client = new MongoClient(url);
const dbName = 'blog';
const collectionName = 'LIST';

let dbConnected = false;

export default async (ctx: Koa.ParameterizedContext) => {
	let { pageSize = 5, pageNum = 1 } = ctx.query;
	pageSize = Number(pageSize);
	pageNum = Number(pageNum);

	try {
		if (!dbConnected) {
			await client.connect();
			dbConnected = true;
		}
		const db = client.db(dbName);
		const collection = db.collection(collectionName);
		const total = (await collection.find({ status: { $ne: 2 } }).toArray())
			.length;
		const list = await collection
			.find({ status: { $ne: 2 } })
			.skip(pageSize * (pageNum - 1))
			.limit(pageSize)
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
