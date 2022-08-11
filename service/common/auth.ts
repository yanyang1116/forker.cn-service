/**
 * @file
 * 权限接口
 * 主要是为了配合 umi 对 auth，想试一下
 */
import type * as Koa from 'koa';
import { MongoClient } from 'mongodb';
import jwt from 'jsonwebtoken';
import secretInfo from '@config/secret';

import baseConfig from '@config/base';

const url = baseConfig.mongoHost;
const client = new MongoClient(url);
const dbName = 'blog';
const collectionName = 'USER';

let dbConnected = false;

export default async (ctx: Koa.ParameterizedContext) => {
	const token = ctx.request.header.authorization;

	!token ?? ctx.throw(400);

	let decoded;
	try {
		decoded = jwt.verify(token as string, secretInfo.value);
	} catch (err) {
		ctx.throw(400);
	}
	const _id = (decoded as any)._id;
	console.log(_id);
	debugger;
	let user: IUser | IUser[];
	try {
		if (!dbConnected) {
			await client.connect();
			dbConnected = true;
		}
		const db = client.db(dbName);
		const collection = db.collection(collectionName);
		user = (await collection.find({ _id }).toArray()) as unknown as IUser[];
		// 放心，这里 ctx.throw 是可以被下文捕捉到的，这里会 500
		if (user.length > 1) ctx.throw('数据重复');
		user = user[0];
	} catch (err) {
		client.close();
		dbConnected = false;
		ctx.throw(err);
	}

	let result: IAuth = {
		edit: false,
		view: true,
		delete: false,
		create: false,
	};

	user.admin &&
		(result = {
			edit: true,
			view: true,
			delete: true,
			create: true,
		});
	return result;
};
