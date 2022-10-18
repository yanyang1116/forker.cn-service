/**
 * @file
 * 断点续传
 * - 注意，这个完全依赖 docker 文件操作，没有依靠数据库
 * - 实际上是有点问题的，好的断点续传应该两者结合，同时要设计碎片失效机制
 * - 这里是碎片传递完，再做判断，可以拆多接口，传递前判断，暂时不管了
 * - 文件夹使用数据主 key，当所有数据完成后，服务端跑一份合成数据，还要根据类型保存合适的后缀名
 *
 * TODO 证明 node 服务是单线程，看看跑文件的时候，会不会阻塞
 */

import type * as Koa from 'koa';
import fs from 'fs-extra';
import path from 'path';
import { Buffer } from 'node:buffer';
import docker from '@config/docker';
import shell from 'shelljs';

import baseConfig from '@config/base';

export default async (ctx: Koa.ParameterizedContext) => {
	/**
	 * 使用 docker exec 命令，获取容器中文件状态
	 * 注意，执行命令行的时候 -ti 是不需要加的，不然会报 input is not YYT 错误
	 */
	const dockerExecFn = (command: string, grep?: boolean) => {
		const result = shell.exec(
			`docker exec ${docker.dbDockerName} sh -c "${command}"`
		);
		if (
			(result.code !== 0 && !grep) ||
			(result.code !== 0 && grep && result.code !== 1)
		) {
			// 放心，这里的错误信息被 catch 捕捉后，也会正确的 200 -> '文件处理失败'，这么传递下去
			ctx.throw(200, '文件处理执行失败');
		}
		const stdout = result.stdout.trim();
		const lineFlag = stdout.includes('\r') ? '\r' : '\n';
		return { stdout, lineFlag };
	};

	// 最外层文件是否存在
	const checkedOutDir = () => {
		/**
		 * 判断文件或文件夹是否存在
		 * find /home -name "test.txt"
		 */
		const findExecDocker = dockerExecFn(
			`find ${docker.nginxContentDir} -name "breakpoint_resume_temp"`
		);

		// 没有则创建
		if (!findExecDocker.stdout)
			dockerExecFn(
				`mkdir ${docker.nginxContentDir}breakpoint_resume_temp`
			);
	};

	// 获取碎片文件夹中，所有写入的 temp 文件组成的文件名数组，没有后缀
	const getSplitFileTempFileArr = () => {
		const statusExecDocker = dockerExecFn(
			`ls ${docker.nginxContentDir}breakpoint_resume_temp/${id}`
		);
		let statusStdoutArr = statusExecDocker.stdout.split(
			statusExecDocker.lineFlag
		);

		// 进入把写好的文件碎片信息传出去
		statusStdoutArr = statusStdoutArr.filter((item) =>
			item.endsWith('.temp')
		);
		statusStdoutArr = statusStdoutArr.map((item) =>
			item.replace('.temp', '')
		);
		return statusStdoutArr;
	};

	/**
	 * 碎片上传完成后端合并操作
	 * 优先看宿主机临时目录有没有相关文件，没有则从 docker 容器，移动文件到宿主机。之后在宿主机上做这些操作：
	 * 合并 -> 加后缀 -> 合并后的文件，复制到 docker 容器静态资源目录 -> 删除宿主机文件 -> 删除容器文件 -> 返回成功 (finished = true)
	 */
	const mergeFile = (dockerTempFileList: string[]) => {
		const locationPath = path.join(baseConfig.tempDir, './');
		// 检查宿主机文件是否完整
		const loseFiles = dockerTempFileList.filter(
			(name) =>
				!fs.pathExistsSync(path.join(locationPath, `./${name}.temp`))
		);

		// 从容器复制
		if (loseFiles.length) {
			loseFiles.forEach((name) => {
				if (
					shell.exec(
						`docker cp ${docker.dbDockerName}:${docker.nginxContentDir}breakpoint_resume_temp/${id}/${name}.temp ${locationPath}`
					).code !== 0
				) {
					// 放心，这里的错误信息被 catch 捕捉后，也会正确的 200 -> '文件处理失败'，这么传递下去
					ctx.throw(200, '文件处理执行失败');
				}
			});
		}
		let readable: fs.ReadStream;
		let writeable: fs.WriteStream;
		dockerTempFileList.forEach((name, index) => {
			if (!index) {
				readable = fs.createReadStream(
					path.join(locationPath, `./${name}.temp`)
				);
				return;
			}
			writeable = fs.createWriteStream(
				path.join(locationPath, `./${name}.temp`)
			);
			if (index == 1) {
				readable.on('close', function () {
					writeable.end();
				});
				readable.on('error', function () {
					writeable.end();
					ctx.throw(200, '文件处理意外终止');
				});
			}
			readable.pipe(writeable, {
				end: false,
			});
			// 只要 close，上面有个监听，会自动 end writeStream
			if (index + 1 === dockerTempFileList.length) readable.close();
		});
		// 直接从请求数据里，拿后缀，不从第一次记录下来的容器里拿，似乎也没太大问题，先这样吧，记录一笔
		const _suffix = suffix.startsWith('.') ? suffix.substr(1) : suffix;
		fs.renameSync(
			path.join(locationPath, `./${dockerTempFileList[0]}.temp`),
			path.join(locationPath, `./${id}.${_suffix}`)
		);
		// 移动到容器
		if (
			shell.exec(
				`docker cp ${path.join(locationPath, `./${id}.${_suffix}`)} ${
					docker.dbDockerName
				}:${docker.nginxContentDir}`
			).code !== 0
		) {
			// 放心，这里的错误信息被 catch 捕捉后，也会正确的 200 -> '文件处理失败'，这么传递下去
			ctx.throw(200, '文件处理执行失败');
		}
		// 删除宿主文件、删除容器文件
		dockerTempFileList.forEach((item) => {
			fs.removeSync(path.join(path.join(locationPath, `./${item}.temp`)));
		});
		fs.removeSync(path.join(locationPath, `./${id}.${_suffix}`));
		dockerExecFn(
			`rm -fr ${docker.nginxContentDir}breakpoint_resume_temp/${id}`
		);
	};

	if (ctx.method === 'GET') {
		const { id } = ctx.query;
		/**
		 * get 的时候，用 id 去找 docker 里的文件夹，返回数据
		 * TODO
		 * 这里其实是有问题的，作为一个断点续传服务，要考虑数据的舍弃
		 * 不然，一万个文件夹，很容易把 docker 的 IO 打爆
		 * 就算用数据库，如果没有舍弃，空间也会打爆
		 * 这里就不设计服务端的，毕竟不是专门写服务端
		 */
		if (!id) ctx.throw(400);

		checkedOutDir();

		/**
		 * 如果 nodejs 的管道命令，没有结果，会返回 1
		 * 这个和其他命令不太一样
		 * https://stackoverflow.com/questions/47784087/child-process-gives-command-failed-executing-grep
		 * 所以，这里如果一开始为空，code 为 1 也是没有关系的
		 * 搞了好久。。。备注下
		 *
		 * 只显示文件夹 ls -F | grep "/$"
		 */
		const lsExecDocker = dockerExecFn(
			`ls ${docker.nginxContentDir}breakpoint_resume_temp -F|grep "/$"`,
			true
		);
		const { stdout, lineFlag } = lsExecDocker;
		if (!stdout) return [];
		const stdoutArr = stdout.split(lineFlag);
		if (!stdoutArr.includes(`${id}/`)) return [];
		return getSplitFileTempFileArr();
	}
	/**
	 * post 专门的上传逻辑
	 * 1. 先用 id 索引文件夹，没有则创建并且创建 ${id}.json
	 * 2. 切片已经有则返回完成
	 * 3. 保存切片
	 * 4. 当所有切片都保存完成，合成文件、加上后缀名，移动到文件外，删除文件夹，返回所有都保存完成
	 */
	const { id, content, suffix, section } = ctx.request.body;
	let { sections } = ctx.request.body;
	try {
		sections = JSON.parse(sections);
	} catch (ctx) {
		ctx.throw(400);
	}
	if (
		!id ||
		!content ||
		!sections ||
		!suffix ||
		!Array.isArray(sections) ||
		!section ||
		!sections.includes(section) ||
		!sections.length
	) {
		ctx.throw(400);
	}

	checkedOutDir();

	// 没有，用 id 作为主键创建文件夹
	const findExecDocker = dockerExecFn(
		`find ${docker.nginxContentDir}breakpoint_resume_temp -name "${id}"`
	);
	if (!findExecDocker.stdout)
		dockerExecFn(
			`mkdir ${docker.nginxContentDir}breakpoint_resume_temp/${id}`
		);

	// 没有 ${id}.json，则创建
	const findRecordExecDocker = dockerExecFn(
		`find ${docker.nginxContentDir}breakpoint_resume_temp/${id} -name "${id}.json"`
	);

	// 宿主机写文件 cp 过去
	if (!findRecordExecDocker.stdout) {
		const locationPath = path.join(baseConfig.tempDir, `./${id}.json`);
		const c = JSON.stringify({ sections: sections, suffix: suffix });
		fs.writeFileSync(locationPath, c);
		if (
			shell.exec(
				`docker cp ${locationPath} ${docker.dbDockerName}:${docker.nginxContentDir}breakpoint_resume_temp/${id}`
			).code !== 0
		) {
			// 放心，这里的错误信息被 catch 捕捉后，也会正确的 200 -> '文件处理失败'，这么传递下去
			ctx.throw(200, '文件处理执行失败');
		}
	}

	/**
	 * 先看是否全部完成
	 * TODO
	 * 这里是通过客户端告知服务端断点续传的长度，没从 ${id}.json 里读
	 * 不过这样似乎也没啥问题，先这样
	 */
	const statusStdoutArr = getSplitFileTempFileArr();

	// 走到这个判断，一定是之前完成后的合并操作中断了
	if (statusStdoutArr.length === sections.length) {
		mergeFile(statusStdoutArr);
		const _suffix = suffix.startsWith('.') ? suffix.substr(1) : suffix;
		return { finished: true, url: `${baseConfig.host}s/${id}.${_suffix}` };
	}

	/**
	 * 如果已经有了，则直接返回
	 * TODO
	 * 因为是单接口，碎片其实已经走了网络请求传输，这个判断只是少了服务端的写文件动作
	 */
	if (statusStdoutArr.includes(section)) {
		return {
			finished: false,
			section,
		};
	}

	// 写文件，在宿主机写，然后走 copy
	const locationPath = path.join(baseConfig.tempDir, `./${section}.temp`);

	// TODO 看这里有可能会出错，这个TODO 验证完删除
	// TODO
	// TODO
	// TODO
	return content.arrayBuffer().then((res: ArrayBuffer) => {
		debugger;
		const _content = Buffer.from(res);
		console.log(_content, 7689);
		fs.writeFileSync(locationPath, _content);
		// 同步到容器
		if (
			shell.exec(
				`docker cp ${locationPath} ${docker.dbDockerName}:${docker.nginxContentDir}${id}`
			).code !== 0
		) {
			// 放心，这里的错误信息被 catch 捕捉后，也会正确的 200 -> '文件处理失败'，这么传递下去
			ctx.throw(200, '文件处理执行失败');
		}

		if (statusStdoutArr.length + 1 === sections.length)
			mergeFile(statusStdoutArr);

		return {
			finished: statusStdoutArr.length + 1 === sections.length,
			section,
		};
	});
};
