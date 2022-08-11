import { MongoClient, ObjectId } from 'mongodb';
import jwt from 'jsonwebtoken';

import secretInfo from '@config/secret';
import baseConfig from '@config/base';

const url = baseConfig.mongoHost;
const client = new MongoClient(url);
const dbName = 'blog';
const collectionName = 'USER';

let dbConnected = false;

/**
 * @file
 * 权限目前：view、created、edit、delete
 * 目前其实就是超管和非超管，不准备做细了
 *
 * 然后 view 都是可以看的，就不限制了
 * created、edit、delete -> 超管可以，非超管不行
 *
 * TODO 用户的登录状态，可能可以放在 redis
 * 这样就不用每次都解了，现在先这样吧
 */
export default async (token: string) => {
	let decoded;
	try {
		decoded = jwt.verify(token as string, secretInfo.value);
	} catch (err) {
		throw 400;
	}
	const _id = (decoded as any)._id;
	let user: IUser | IUser[];
	try {
		if (!dbConnected) {
			await client.connect();
			dbConnected = true;
		}
		const db = client.db(dbName);
		const collection = db.collection(collectionName);
		user = (await collection
			.find({ _id: new ObjectId(_id) })
			.toArray()) as unknown as IUser[];
		if (user.length > 1) throw '数据重复';
		user = user[0];
		if (!user) throw 400;
	} catch (err) {
		client.close();
		dbConnected = false;
		throw err;
	}
	if (user.admin) {
		return true;
	} else {
		return false;
	}
};
