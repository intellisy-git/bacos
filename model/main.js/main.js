const sequelize = require("../../dbconnection/index").connection;

const {
    DataTypes,
    Model
}  =  require("sequelize");


class MainPilot extends Model {}

MainPilot.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    code: {
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: "P001",
    },
    flying: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: false
    }
},
{
    sequelize: sequelize,
    timestamps: true,
    tableName: "MainPilot"
}
)

MainPilot.sync({force: true}).then(k=>{MainPilot.create({flying: true});})


module.exports = MainPilot;