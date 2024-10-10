let clientModel = require("../../model/clients");
async function isclientAvailable(id) {
    try {
        let fetchuser = await clientModel.findOne({
            where: {
                ids: id
            }
        });
    
        if(fetchuser) return fetchuser;
        return false;
    }catch(e){
        console.log(e);
        return false;
    }
}

module.exports = isclientAvailable;