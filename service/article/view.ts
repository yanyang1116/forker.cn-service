import type * as Koa from 'koa';
import { MongoClient } from 'mongodb';

const url = 'mongodb://localhost:27017/';
const client = new MongoClient(url);
const dbName = 'blog';
const collectionName = 'LIST';

let dbConnected = false;

export default async (ctx: Koa.ParameterizedContext) => {
	const { id } = ctx.request.body;
	id ?? ctx.throw(400);

	try {
		if (!dbConnected) {
			await client.connect();
			dbConnected = true;
		}
		const db = client.db(dbName);
		const collection = db.collection(collectionName);

		let item: IArticleItem[] | IArticleItem = (await collection
			.find({ _id: id })
			.toArray()) as IArticleItem[];

		if (item.length > 1) ctx.throw(200, '查询到多条数据');
		console.log(item, 123123);
		debugger;
		item = item[0];
		await collection.updateOne(
			{ title: '测试' },
			{ $set: { views: item.views + 1 } }
		);
		// console.log(item, 123123);
		// debugger;
		return null;
	} catch (err) {
		client.close();
		dbConnected = false;
		ctx.throw(err);
	}
};
