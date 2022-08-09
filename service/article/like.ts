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
			.find({ id })
			.toArray()) as unknown as IArticleItem[];

		if (item.length > 1) ctx.throw(400);
		item = item[0];
		await collection.updateOne({ id }, { $set: { likes: item.likes + 1 } });
		return null;
	} catch (err) {
		client.close();
		dbConnected = false;
		ctx.throw(err);
	}
};
