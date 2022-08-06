import Router from 'koa-router';
import article from './article/index';

export default (router: Router) => {
	article(router);
};
