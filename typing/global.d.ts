/**
 * @file
 * 单纯的 declare 也是可以将类型定义声明到全局
 * 但是，如果不是 declare 开头，就不能起作用
 *
 * 就像我这里要使用 import EnumArticleStatus 就不行
 *
 * 所以这里使用 declare global 来处理
 */

import type * as httpProxy from 'http-proxy';
import { InferIdType } from 'mongodb';
import { EnumArticleStatus } from './common';

declare global {
	type IResponseBody<T> =
		| undefined
		| {
				value: T;
				success: boolean;
		  };
	interface IReqProxyOptions {
		[props: string]: httpProxy.ServerOptions;
	}
	interface IUser {
		_id: InferIdType<string>;
		userName: string;
		password: string;
		admin: boolean;
	}

	interface IArticleItem {
		id: string;
		_id: InferIdType<string>;
		title: string;
		abstract: string;
		createTime: number;
		modifyTime: number;
		author: string;
		original: boolean;
		tags: string[];
		status: EnumArticleStatus;
		views: number;
		likes: number;
	}
}
