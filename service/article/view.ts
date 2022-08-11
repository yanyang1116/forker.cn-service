import type * as Koa from 'koa';
import { MongoClient } from 'mongodb';

import baseConfig from '@config/base';

const url = baseConfig.mongoHost;
const client = new MongoClient(url);
const dbName = 'blog';
const collectionName = 'LIST';

let dbConnected = false;

export default async (ctx: Koa.ParameterizedContext) => {
	const { id } = ctx.request.body;
	!id && ctx.throw(400);

	try {
		if (!dbConnected) {
			await client.connect();
			dbConnected = true;
		}
		const db = client.db(dbName);
		const collection = db.collection(collectionName);

		let item: IArticleItem[] | IArticleItem = (await collection
			.find({ id })
			.toArray()) as unknown as IArticleItem[];

		if (item.length > 1) ctx.throw('数据重复');
		item = item[0];
		await collection.updateOne({ id }, { $set: { views: item.views + 1 } });
		return null;
	} catch (err) {
		client.close();
		dbConnected = false;
		ctx.throw(err);
	}
};
