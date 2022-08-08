import type * as Koa from 'koa';
import fs from 'fs';
import pathConfig from '@config/path';
import path from 'path';
import baseConfig from '@config/base';
import crypto from 'crypto';

export default async (ctx: Koa.ParameterizedContext) => {
	// 这里 Koa ctx 没有 file 这个对象，是 multer 定义的
	const { file } = ctx;
	if (!file) throw new Error('400');
	let md5, suffix;
	try {
		const { buffer } = ctx?.file;
		const hash = crypto.createHash('md5');
		const { originalname } = ctx?.file;
		suffix = originalname.substring(originalname.lastIndexOf('.'));
		hash.update(buffer, 'utf8');
		md5 = hash.digest('hex');
		md5 = md5.substr(0, 12);
		fs.writeFileSync(
			path.join(pathConfig.staticDir, `./${md5}${suffix}`),
			buffer
		);
	} catch (err) {
		throw new Error(err);
	}
	return `${baseConfig.host}s/${md5}${suffix}`;
};
