// MongoDB Playground
// Use Ctrl+Space inside a snippet or a string literal to trigger completions.

const database = 'blog';
const collection = 'PV';

// The current database to use.
use(database);

// Create a new collection.
// db.createCollection(collection);

// The prototype form to create a regular collection:
db.createCollection(collection, {
   validator: { $jsonSchema: {
      bsonType: "object",
      properties: {
         ip: {
            bsonType: "string"
         },
         country: {
            bsonType : "string"
         },
         province: {
            bsonType : "string"
         },
         city: {
            bsonType : "string"
         }
      }
   }
  }
})

db[collection].insertOne( { ip: "test", country: "test", province: "test", city: "test" } )

