import type * as Koa from 'koa';
import { MongoClient } from 'mongodb';

import baseConfig from '@config/base';
import auth from '@/utils/auth';

const url = baseConfig.dockerMongohost;
const client = new MongoClient(url);
const dbName = 'blog';
const collectionName = 'LIST';

let dbConnected = false;

export default async (ctx: Koa.ParameterizedContext) => {
	const { id, status } = ctx.request.body;
	const token = ctx.request.header.authorization;

	!id && ctx.throw(400);
	!status && ctx.throw(400);
	let enable;

	try {
		enable = await auth(token as string);
	} catch (err) {
		ctx.throw(err);
	}

	if (!enable) ctx.throw(401);

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
		await collection.updateOne(
			{ id },
			{ $set: { status: Number(status), modifyTime: +new Date() } }
		);
		return null;
	} catch (err) {
		client.close();
		dbConnected = false;
		ctx.throw(err);
	}
};
