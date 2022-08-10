/**
 * @file
 * 项目基础配置
 */

import path from 'path';

export default {
	// 数据库连接地址
	mongoHost: 'mongodb://localhost:27017/',

	// 应用的域名 host
	host:
		process.env.NODE_ENV === 'development' ? 'http://localhost:8899/' : '/',

	// 临时文件中转目录
	tempDir: path.join(__dirname, '../../.temp'), // 因为 dist 发布目录开始计算的
};
