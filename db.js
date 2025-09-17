const { MongoClient } = require("mongodb");
let dbConnection;
module.exports = {
    connectToDb: async (cb) => {
        try {
            const client = await MongoClient.connect("mongodb://localhost:27017/School");
            dbConnection = client.db();
            console.log("database connection success");
            return cb(null);
        } catch (error) {
            console.error("Failed to connect to database", error);
            return cb(error);
        }
    },
    getDb: () => dbConnection,
};
