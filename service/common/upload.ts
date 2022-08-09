import type * as Koa from 'koa';
import pathConfig from '@config/path';
import docker from '@config/docker';
import path from 'path';
import shell from 'shelljs';
import baseConfig from '@config/base';
import crypto from 'crypto';
import fs from 'fs-extra';

export default async (ctx: Koa.ParameterizedContext) => {
	// 这里 Koa ctx 没有 file 这个对象，是 multer 定义的
	const { file } = ctx;
	file ?? ctx.throw(400);

	let md5, suffix;
	try {
		const { buffer } = ctx?.file;
		const hash = crypto.createHash('md5');
		const { originalname } = ctx?.file;
		suffix = originalname.substring(originalname.lastIndexOf('.'));
		hash.update(buffer, 'utf8');
		md5 = hash.digest('hex');
		md5 = md5.substr(0, 12);

		const locationPath = path.join(pathConfig.temp, `./${md5}${suffix}`);
		fs.mkdirsSync(pathConfig.temp);
		fs.writeFileSync(locationPath, buffer);
		if (
			shell.exec(
				`docker cp ${locationPath} ${docker.nginxName}:${docker.nginxContentDir}`
			).code !== 0
		) {
			shell.echo('Error: Git commit failed');
			ctx.throw(200, '文件处理执行失败');
		}
	} catch (err) {
		ctx.throw(err);
	}
	return `${baseConfig.host}s/${md5}${suffix}`;
};
