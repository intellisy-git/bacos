const clientModel = require("../../model/clients/index-mongo"); // Mongoose model

async function isClientAvailable(id) {
    try {
        // Use Mongoose's `findOne` method to fetch a client by ID
        let fetchUser = await clientModel.findOne({
            ids: id // Assuming `ids` is a field in your MongoDB document
        });
    
        // Return the fetched user or false if not found
        return fetchUser || false; 
    } catch (error) {
        console.log("Error fetching client:", error);
        return false; // Return false in case of an error
    }
}

module.exports = isClientAvailable;
