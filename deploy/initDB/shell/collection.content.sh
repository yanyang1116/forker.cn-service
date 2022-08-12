// MongoDB Playground
// Use Ctrl+Space inside a snippet or a string literal to trigger completions.

const database = 'blog';
const collection = 'CONTENT';

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
         content: {
            bsonType : "string"
         }
      }
   }
  }
})

db[collection].insertOne( { id: "testId", content: "test" } )

