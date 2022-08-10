// MongoDB Playground
// Use Ctrl+Space inside a snippet or a string literal to trigger completions.

const database = 'blog';
const collection = 'LIST';

// The current database to use.
use(database);

// Create a new collection.
// db.createCollection(collection);

// The prototype form to create a regular collection:
db.createCollection(collection, {
   validator: { $jsonSchema: {
      bsonType: "object",
      required: ['id'],
      properties: {
         id: {
            bsonType: "string",
            description: "id must be a string and is required"
         },
         createTime: {
            bsonType: "timestamp",
         },
         modifyTime: {
            bsonType: "timestamp",
         },
         title: {
           bsonType: "string",
         },
         abstract: {
           bsonType: "string",
         },
         author: {
           bsonType: "string",
         },
         original: {
           bsonType: "bool",
         },
         tags: {
           bsonType: "array",
         },
         status: {
           bsonType: "number",
         },
         views: {
           bsonType: "number",
         },
         likes: {
           bsonType: "number",
         }
      }
   }
  }
})

db[collection].insertOne({
  id: "test123123",
  title: "测试",
  abstract: "测试abstract",
  createTime: new Timestamp(),
  modifyTime: new Timestamp(),
  author: "yy",
  original: true,
  tags: [
    "react",
    "nodejs"
  ],
  status: 0,
  views: 0,
  likes: 0
})



