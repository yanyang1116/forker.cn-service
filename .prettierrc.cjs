/**
 * @file
 * 这个文件没多少内容，因为基本上保持默认就够用了
 * 还有关于段落的部分，会继承 .editorconfig 的配置，这里也不额外复写了
 * 取名 cjs 是为了避免 module 导出的时候，vscode 一直有告警
 */
module.exports = {
	// 使用单引号
	singleQuote: true,
	// 如果认为写了引号，保留
	quoteProps: 'preserve',
};
