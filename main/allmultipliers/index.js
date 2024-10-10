const multplierModel = require("../../model/rounds/index");

class GetMultipliers {

    async getMultis() {

        try {
            
        let multipliers = await multplierModel.findAll({});
        multipliers = await multipliers.slice(0,31);
        
        return await {
            status: true,
            multipliers: multipliers
        }
        }
        catch(error) {
            console.log(error);
            return {
                status: false,
                multipliers: []
            }
        }


    }


}

module.exports = new GetMultipliers();


