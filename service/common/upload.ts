/**
 * @file
 * 文件上传，这里文件是通过 cp 放到 docker 容器中的
 * TODO 而且，这里用的是同步写法，后期有空可以改下
 */

import type * as Koa from 'koa';
import docker from '@config/docker';
import path from 'path';
import shell from 'shelljs';
import baseConfig from '@config/base';
import crypto from 'crypto';
import fs from 'fs-extra';

export default async (ctx: Koa.ParameterizedContext) => {
	// 这里 Koa router ctx 没有 file 这个对象，是 multer 定义的
	const { file } = ctx;
	file ?? ctx.throw(400);

	let md5, suffix;
	try {
		const { buffer } = ctx.file;
		const hash = crypto.createHash('md5');
		const { originalname } = ctx.file;
		suffix = originalname.substring(originalname.lastIndexOf('.'));
		hash.update(buffer, 'utf8');
		md5 = hash.digest('hex');
		md5 = md5.substr(0, 12);

		const locationPath = path.join(baseConfig.tempDir, `./${md5}${suffix}`);
		fs.mkdirsSync(baseConfig.tempDir);
		fs.writeFileSync(locationPath, buffer);
		if (
			shell.exec(
				`docker cp ${locationPath} ${docker.nginxName}:${docker.nginxContentDir}`
			).code !== 0
		) {
			// 放心，这里的错误信息被 catch 捕捉后，也会正确的 200 -> '文件处理失败'，这么传递下去
			ctx.throw(200, '文件处理执行失败');
		}
	} catch (err) {
		ctx.throw(err);
	}
	return `${baseConfig.host}s/${md5}${suffix}`;
};
