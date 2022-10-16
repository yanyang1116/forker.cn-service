/**
 * @file
 * 断点续传
 * 1. 不用数据库操作了
 * 2. 文件夹使用数据的主 key
 * 3. 文件夹里面，是切片数据，同时要存一份文件所有切片的 MD5 检验文件
 * 4. 当所有数据完成后，服务端跑一份合成数据，还要根据类型保存合适的后缀名
 *
 * TODO 证明 node 服务是单线程，看看跑文件的时候，会不会阻塞
 */

import type * as Koa from 'koa';
import path from 'path';
import { MongoClient } from 'mongodb';
import docker from '@config/docker';
import shell from 'shelljs';
import https from 'https';

import baseConfig from '@config/base';

const url = baseConfig.dockerMongohost;
const client = new MongoClient(url);
const dbName = 'blog';
const collectionName = 'PV';

let dbConnected = false;

export default async (ctx: Koa.ParameterizedContext) => {
	if (ctx.method === 'GET') {
		const { id } = ctx.query;
		/**
		 * get 的时候，用 id 去找 docker 里的文件夹，返回数据
		 * TODO
		 * 这里其实是有问题的，作为一个断点续传服务，要考虑数据的舍弃
		 * 不然一万个文件夹，很容易把 docker 的 IO 打爆
		 * 就算用数据库，如果没有舍弃，空间也会打爆的
		 * 这里就不设计服务端的，舍弃了，毕竟不是专门写服务端的
		 */
		if (!id) ctx.throw(400);
		/**
		 * 使用 docker exec 命令，获取容器中文件状态
		 * 注意，执行命令行的时候 -ti 是不需要加的，不然会报 input is not YYT 错误
		 *
		 * 判断文件或文件夹是否存在
		 * find /home -name "test.txt"
		 */
		const findExecDocker = shell.exec(
			`docker exec ${docker.dbDockerName} sh -c "find ${docker.nginxContentDir} -name "breakpoint_resume_temp""`
		);
		if (findExecDocker.code !== 0) {
			// 放心，这里的错误信息被 catch 捕捉后，也会正确的 200 -> '文件处理失败'，这么传递下去
			ctx.throw(200, '文件处理执行失败');
		}

		// 没有则创建
		if (findExecDocker.stdout.trim() === '') {
			const createDirExecDocker = shell.exec(
				`docker exec ${docker.dbDockerName} sh -c "mkdir ${docker.nginxContentDir}breakpoint_resume_temp"`
			);
			if (createDirExecDocker.code !== 0) {
				// 放心，这里的错误信息被 catch 捕捉后，也会正确的 200 -> '文件处理失败'，这么传递下去
				ctx.throw(200, '文件处理执行失败');
			}
		}

		/**
		 * 如果 nodejs 的管道命令，没有结果，会返回 1
		 * 这个和其他命令不太一样
		 * https://stackoverflow.com/questions/47784087/child-process-gives-command-failed-executing-grep
		 * 所以，这里如果一开始为空，code 为 1 也是没有关系的
		 * 搞了好久。。。备注下
		 *
		 * 只显示文件夹 ls -F | grep "/$"
		 */
		const execDocker = shell.exec(
			// `docker exec ${docker.dbDockerName} sh -c "ls ${docker.nginxContentDir}breakpoint_resume_temp -F|grep "/$""`
			`docker exec ${docker.dbDockerName} sh -c "ls ${docker.nginxContentDir} -F|grep "/$""`
		);

		if (execDocker.code !== 0 && execDocker.code !== 1) {
			// 放心，这里的错误信息被 catch 捕捉后，也会正确的 200 -> '文件处理失败'，这么传递下去
			ctx.throw(200, '文件处理执行失败');
		}
		if (execDocker.code === 1) return [];
		const stdout = execDocker.stdout.trim();
		if (!stdout) return [];
		const flag = stdout.includes('\r') ? '\r' : '\n';
		const stdoutArr = stdout.split(flag);
		if (!stdoutArr.includes(`${id}/`)) return [];

		const statusExecDocker = shell.exec(
			`docker exec ${docker.dbDockerName} sh -c "ls ${docker.nginxContentDir}breakpoint_resume_temp/${id}"`
		);
		if (statusExecDocker.code !== 0) {
			// 放心，这里的错误信息被 catch 捕捉后，也会正确的 200 -> '文件处理失败'，这么传递下去
			ctx.throw(200, '文件处理执行失败');
		}
		const statusStdout = statusExecDocker.stdout.trim();
		const statusFlag = statusStdout.includes('\r') ? '\r' : '\n';
		let statusStdoutArr = statusStdout.split(statusFlag);

		// 进入把写好的文件碎片信息传出去
		statusStdoutArr = statusStdoutArr.filter((item) =>
			item.endsWith('.temp')
		);
		statusStdoutArr = statusStdoutArr.map((item) =>
			item.replace('.temp', '')
		);
		return statusStdoutArr;
	}
};
