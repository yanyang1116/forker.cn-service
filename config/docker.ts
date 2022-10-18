/**
 * @file
 * docker 的相关配置
 */
export default {
	dbDockerName: 'db', // 这个 docker 是专门用来处理数据库和静态资源的，注意，这个 NG 要开，静态资源的代理才能生效
	nginxContentDir: '/usr/share/nginx/html/',
};
