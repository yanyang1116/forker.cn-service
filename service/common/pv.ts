/**
 * @file
 * 记录 pv，这个接口一切从简
 * 值得注意的是，获取用户真实 ip 要配合入口文件的 app.proxy
 *
 * 另外，因为 koa 的设计原因，这里使用 https 模块的回调的时候，要返回 promise 才能配合整个框架一起使用
 */

import type * as Koa from 'koa';
import { MongoClient } from 'mongodb';
import shell from 'shelljs';
import https from 'https';

import baseConfig from '@config/base';

const url = baseConfig.dockerMongohost;
const client = new MongoClient(url);
const dbName = 'blog';
const collectionName = 'PV';

let dbConnected = false;

export default async (ctx: Koa.ParameterizedContext) => {
	// TODO，调试的时候，这个 ip 是 ::ffff:127.0.0.1 这个是正确的，不过到时候上线之后验一下
	let ip: string;
	if (process.env.NODE_ENV === 'development') {
		const result = shell.exec(`curl cip.cc`);
		if (result.code !== 0) {
			ctx.throw(400);
		}
		const start = result.stdout.indexOf('/www.cip.cc/') + 12;
		ip = result.stdout.substr(start).trim();
	} else {
		ip = ctx.request.ip;
		!ip ?? ctx.throw(400);
	}
	return new Promise((resolve, reject) => {
		https
			.get(
				`https://so.toutiao.com/2/wap/search/extra/ip_query?ip=${ip}`,
				(res) => {
					const { statusCode } = res;
					if (statusCode !== 200) {
						reject(400);
						return;
					}
					let rawData:
						| {
								Country: string;
								City: string;
								ip: string;
								Province: string;
						  }
						| string = '';
					res.on('data', (chunk) => (rawData += chunk));
					res.on('end', async () => {
						try {
							rawData = JSON.parse(rawData as unknown as string);
							if (!dbConnected) {
								await client.connect();
								dbConnected = true;
							}
							rawData = (rawData as any).data;
							const db = client.db(dbName);
							const collection = db.collection(collectionName);
							// 记一下这个 Exclude 的使用
							const {
								Country = '',
								Province = '',
								City = '',
							} = rawData as Exclude<typeof rawData, string>;
							await collection.insertOne({
								ip,
								country: Country,
								province: Province,
								city: City,
							});
							resolve(null);
						} catch (err) {
							reject(400);
						}
					});
				}
			)
			.on('error', () => {
				reject(400);
			});
	})
		.catch(() => {
			client.close();
			dbConnected = false;
			ctx.throw(400);
		})
		.then(() => {
			return null;
		});
};
