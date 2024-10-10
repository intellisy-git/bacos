const sequelize = require("../../dbconnection/index").connection;

const {
    DataTypes,
    Model
}  =  require("sequelize");


class MainBank extends Model {}

MainBank.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    main: {
        type: DataTypes.STRING,
        allowNull: false
    },
    account: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    action: {
        type: DataTypes.BOOLEAN,
        allowNull: true
    }
},
{
    sequelize: sequelize,
    timestamps: true,
    tableName: "MainBank"
}
)

MainBank.sync({
    alter: false,  // Ensure `alter` is false to prevent schema alterations and backup table creation
    force: false
}).then(k=>{MainBank.create({account: 90000000,main: "001",action: false});})


module.exports = MainBank;