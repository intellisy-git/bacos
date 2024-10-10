const sequelize = require("../../dbconnection/index").connection;
const crypto = require("crypto");

const {
    DataTypes,
    Model
}  =  require("sequelize");


class ClientsModel extends Model {}

ClientsModel.init({
    ids: {
        type: DataTypes.STRING,
        primaryKey: false,
    },
    username: {
        type: DataTypes.STRING,
        allowNull: false
    },
    image: {
        type: DataTypes.STRING,
        allowNull: false
    },
    phone: {
        type: DataTypes.STRING,
        allowNull: false
    },
    balance: {
        type: DataTypes.FLOAT(255,2),
        allowNull: false
    },
    
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    currencType: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: "RWF"
    },
    online: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: false
    },
    seed:{
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: crypto.randomBytes(20).toString("hex")
    },
    anyAction: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: false
    },
    useState: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: "random"
    }
},
{
    sequelize: sequelize,
    timestamps: true,
    tableName: "clients"
}
)

ClientsModel.sync(
    {
        alter: false,  // Ensure `alter` is false to prevent schema alterations and backup table creation
        force: false
    }
);

module.exports = ClientsModel;