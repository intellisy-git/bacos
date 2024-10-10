const multplierModel = require("../../model/rounds/index-mongo"); // Mongoose model

class GetMultipliers {

    async getMultis() {

        try {
            // Use Mongoose's `find` to fetch all documents
            let multipliers = await multplierModel.find({});
            
            // Slice to get only the first 31 items
            multipliers = multipliers.slice(0, 31);
        
            return {
                status: true,
                multipliers: multipliers
            };
        } catch (error) {
            console.log(error);
            return {
                status: false,
                multipliers: []
            };
        }

    }

}

module.exports = new GetMultipliers();
