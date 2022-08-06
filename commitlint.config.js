module.exports = {
	extends: ['@commitlint/config-conventional'],
	rules: {
		'type-enum': [
			2,
			'always',
			[
				'feat',
				'fix',
				'doc',
				'style',
				'refactor',
				'test',
				'chore',
				'revert',
				'release',
			],
		],
	},
};
