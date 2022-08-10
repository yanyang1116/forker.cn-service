/**
 * @file
 * 定义需要在应用内做转发的配置
 */

import dockerConfig from './docker';

export default {
	// 静态资源代理
	'/s/(.*)': {
		target: dockerConfig.nginxStaticServiceHost, // target host
		/**
		 * 把请求头（request header）的中的 Host 变成 target URL
		 * Tip: Set the option changeOrigin to true for name-based virtual hosted sites.
		 * https://github.com/chimurai/http-proxy-middleware#tldr
		 * ↑↑↑ 其实服务端变不变都无所谓，客户端有跨域的话，可能要变
		 */
		changeOrigin: true, // needed for virtual hosted sites
		pathRewrite: {
			'/s': '/', // rewrite path
		},
	},
};

let _corsOrigin: string[] = [];

if (process.env.NODE_ENV === 'development') {
	_corsOrigin = ['localhost:5173'];
} else {
	_corsOrigin = [];
}

export const corsOrigin = _corsOrigin;
