import type * as Koa from 'koa';
import { MongoClient } from 'mongodb';

/**
 * 注意，这里只能用 nanoid v3 版本
 * https://github.com/ai/nanoid/issues/365
 */
import { customAlphabet } from 'nanoid';

import baseConfig from '@config/base';
import { EnumArticleStatus } from '@typing/enum';

const url = baseConfig.mongoHost;
const client = new MongoClient(url);
const dbName = 'blog';
const collectionName = 'CONTENT';
const listCollectionName = 'LIST';
const nanoid = customAlphabet('1234567890', 9);

let dbConnected = false;

export default async (ctx: Koa.ParameterizedContext) => {
	let { id, content, title, abstract, author, original, tags } =
		ctx.request.body;
	const create = !id;
	if (create) id = nanoid();

	try {
		if (!dbConnected) {
			await client.connect();
			dbConnected = true;
		}
		const db = client.db(dbName);
		const collection = db.collection(collectionName);
		const listCollection = db.collection(listCollectionName);
		const current = +new Date();

		if (create) {
			await collection.insertOne({ id, content });
			if (original === 'false') {
				original = false;
			} else {
				original = true;
				author = 'yy';
			}
			title = !title ? '未命名' : title;
			if (!abstract) abstract = content.substring(0, 30);
			tags = !tags ? [] : JSON.parse(tags);
			// 因为 body 是 any，这个类型限制的不是很完美，不过问题也不大
			const insertObj: IArticleItem = {
				title,
				abstract,
				author,
				original,
				tags,
				id,
				status: EnumArticleStatus.Draft,
				views: 0,
				likes: 0,
				createTime: current,
				modifyTime: current,
			};
			await listCollection.insertOne(insertObj);
		} else {
			await collection.updateOne({ id }, { $set: { content } });
			const insertObj: Partial<IArticleItem> = {
				modifyTime: current,
			};
			if (original) {
				if (original === 'false') {
					original = false;
				} else {
					original = true;
					author = 'yy';
				}
				insertObj.original = original;
				insertObj.author = author;
			}
			title && (insertObj.title = title);
			tags && (insertObj.tags = JSON.parse(tags));
			if (abstract) {
				insertObj.abstract = abstract;
			} else {
				insertObj.abstract = content.substring(0, 30);
			}
			await listCollection.updateOne({ id }, { $set: insertObj });
		}
		return {
			id,
		};
	} catch (err) {
		client.close();
		dbConnected = false;
		ctx.throw(err);
	}
};
