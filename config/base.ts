export default {
	mongoHost: 'mongodb://localhost:27017/',
	host:
		process.env.NODE_ENV === 'development' ? 'http://localhost:8899/' : '/',

	/**
	 * 关于向 docker 里写入内容，又两种思路
	 * 1. 通过 docker cp 命令，先写在本地然后移动
	 * 2. 容器里，生成一个监听，进行网络传输
	 *
	 * 读：
	 * 本地 10010 去访问 docker ng 镜像的 80 端口
	 * ng 镜像把容器内容给到
	 *
	 * 写：
	 * 用 docker cp 命令，现在本地临时写入文件夹，做文件夹移动
	 */
	staticDir:
		process.env.NODE_ENV === 'development'
			? 'http://localhost:10010/'
			: '/',
};
