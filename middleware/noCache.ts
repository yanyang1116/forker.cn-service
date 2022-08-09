/**
 * @file
 * koa 代理拦截
 */
/**
 * 这个是代理的配置 demo
 */
// const options = {
// 	targets: {
// 		'/user': {
// 			// this is option of http-proxy-middleware
// 			target: 'http://localhost:3000', // target host
// 			changeOrigin: true, // needed for virtual hosted sites
// 		},
// 		'/user/:id': {
// 			target: 'http://localhost:3001',
// 			changeOrigin: true,
// 		},
// 		// (.*) means anything
// 		'/api/(.*)': {
// 			target: 'http://10.94.123.123:1234',
// 			changeOrigin: true,
// 			pathRewrite: {
// 				'/passager/xx': '/mPassenger/ee', // rewrite path
// 			},
// 		},
// 	},
// };

export default (
		options: {
			[props: string]: httpProxy.ServerOptions;
		} = {}
	) =>
	async (ctx: Koa.ParameterizedContext, next: Koa.Next) => {
		const { path } = ctx;
		for (let route of Object.keys(options)) {
			if (pathToRegexp(route).test(path)) {
				return k2c(createProxyMiddleware(options[route]))(ctx, next);
			}
		}
		return next();
	};
