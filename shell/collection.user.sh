// MongoDB Playground
// Use Ctrl+Space inside a snippet or a string literal to trigger completions.

const database = 'blog';
const collection = 'USER';

// The current database to use.
use(database);

// Create a new collection.
// db.createCollection(collection);

// The prototype form to create a regular collection:
db.createCollection(collection, {
   validator: { $jsonSchema: {
      bsonType: "object",
      properties: {
         admin: {
            bsonType: "bool"
         },
         userName: {
            bsonType : "string"
         },
         password: {
            bsonType : "string"
         }
      }
   }
  }
})

db[collection].insertOne( { admin: true, userName: "yy", password: "990990" } )

