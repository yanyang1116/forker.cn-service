import jwt from 'jsonwebtoken';
import secretInfo from '@config/secret';

/**
 * @file
 * 权限目前：view、created、edit、delete
 * 目前其实就是超管和非超管，不准备做细了
 *
 * 然后 view 都是可以看的，就不限制了
 * created、edit、delete -> 超管可以，非超管不行
 *
 * TODO 用户的登录状态，可能可以放在 redis
 * 这样就不用每次都解了，现在先这样吧
 */
import moduleAlias from 'module-alias';
import path from 'path';

export default (token: string) => async () => {
	let decoded;
	try {
		decoded = jwt.verify(token, secretInfo.value);
	} catch (err) {
		throw 401;
	}
};
