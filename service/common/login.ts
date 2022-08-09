/**
 * @file
 * 登录 jwt 的签发和认证还是通过 _id 找用户会更合理
 * 唯一性，数据库帮忙保证了
 */
import type * as Koa from 'koa';
import { MongoClient } from 'mongodb';
import jwt from 'jsonwebtoken';
import secretInfo from '@config/secret';

const url = 'mongodb://localhost:27017/';
const client = new MongoClient(url);
const dbName = 'blog';
const collectionName = 'USER';

let dbConnected = false;

export default async (ctx: Koa.ParameterizedContext) => {
	let { userName = '', password = '' } = ctx.request.body;
	userName = userName.trim();
	password = password.trim();

	if (!userName || !password) {
		ctx.throw(200, '用户名或账号不能为空');
	}
	let user: IUser;

	try {
		if (!dbConnected) {
			await client.connect();
			dbConnected = true;
		}
		const db = client.db(dbName);
		const collection = db.collection(collectionName);
		user = (
			await collection.find({ userName }).toArray()
		)[0] as unknown as IUser;
	} catch (err) {
		client.close();
		dbConnected = false;
		ctx.throw(err);
	}
	if (!user || user.password !== password) ctx.throw(200, '用户信息不正确');

	/**
	 * TODO，这个地方用的是一个 value 加密的
	 * 实际上也就是对称加密
	 * 如果用非对称加密的话，安全性会更好
	 */
	const token = jwt.sign(
		{
			_id: user._id.toString(),
		},
		secretInfo.value,
		{ expiresIn: secretInfo.time }
	);
	return token;
};
