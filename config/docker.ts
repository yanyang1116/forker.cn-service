/**
 * @file
 * docker 的相关配置
 */
import base from './base';
export default {
	dbDockerName: 'db', // 这个 docker 是专门用来处理数据库和静态资源的
	nginxContentDir: '/usr/share/nginx/html/',
};
