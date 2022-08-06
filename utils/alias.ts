/**
 * @file
 * 处理 node 运行时的别名，这里【__dirname】是运行时目录
 * 其实就是【dist】为根目录
 */
import moduleAlias from 'module-alias';
import path from 'path';

export default () =>
	moduleAlias.addAliases({
		'@controller': path.join(__dirname, '../controller/'),
		'@middleware': path.join(__dirname, '../middleware/'),
		'@service': path.join(__dirname, '../service/'),
		'@utils': path.join(__dirname, '../utils/'),
		'@': path.join(__dirname, '../'),
	});
