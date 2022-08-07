import Router from 'koa-router';
import article from './article/index';
import common from './common/index';

export default (router: Router) => {
	article(router);
	common(router);
};
