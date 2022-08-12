const database = 'blog';

db = db.getSiblingDB(database);

db.createCollection('CONTENT', {
	validator: {
		$jsonSchema: {
			bsonType: 'object',
			required: ['id'],
			properties: {
				id: {
					bsonType: 'string',
					description: 'id must be a string and is required',
				},
				content: {
					bsonType: 'string',
				},
			},
		},
	},
});

db.createCollection('LIST', {
	validator: {
		$jsonSchema: {
			bsonType: 'object',
			required: ['id'],
			properties: {
				id: {
					bsonType: 'string',
					description: 'id must be a string and is required',
				},
				createTime: {
					bsonType: 'number',
				},
				modifyTime: {
					bsonType: 'number',
				},
				title: {
					bsonType: 'string',
				},
				abstract: {
					bsonType: 'string',
				},
				author: {
					bsonType: 'string',
				},
				original: {
					bsonType: 'bool',
				},
				tags: {
					bsonType: 'array',
				},
				status: {
					bsonType: 'number',
				},
				views: {
					bsonType: 'number',
				},
				likes: {
					bsonType: 'number',
				},
			},
		},
	},
});

db.createCollection('PV', {
	validator: {
		$jsonSchema: {
			bsonType: 'object',
			properties: {
				ip: {
					bsonType: 'string',
				},
				country: {
					bsonType: 'string',
				},
				province: {
					bsonType: 'string',
				},
				city: {
					bsonType: 'string',
				},
			},
		},
	},
});

db.createCollection('USER', {
	validator: {
		$jsonSchema: {
			bsonType: 'object',
			required: ['userName', 'password'],
			properties: {
				admin: {
					bsonType: 'bool',
				},
				userName: {
					bsonType: 'string',
					description: 'userName must be a string and is required',
				},
				password: {
					bsonType: 'string',
					description: 'password must be a string and is required',
				},
			},
		},
	},
});

db.USER.insertOne({ admin: true, userName: 'yy', password: '990990' });
db.USER.insertOne({ admin: false, userName: 'zyf', password: '990990' });

db.PV.insertOne({
	ip: 'test',
	country: 'test',
	province: 'test',
	city: 'test',
});

db.LIST.insertOne({
	id: 'test123123',
	title: '测试',
	abstract: '测试abstract',
	createTime: +new Date(),
	modifyTime: +new Date(),
	author: 'yy',
	original: true,
	tags: ['react', 'nodejs'],
	status: 0,
	views: 0,
	likes: 0,
});

db.CONTENT.insertOne({ id: 'testId', content: 'test' });
