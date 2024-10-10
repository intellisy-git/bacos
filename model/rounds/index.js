const sequelize = require("../../dbconnection/index").connection;

const {
    DataTypes,
    Model
}  =  require("sequelize");


class RoundsModel extends Model {}

RoundsModel.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    roundId: {
        type: DataTypes.STRING,
    },
    multplier: {
        type: DataTypes.STRING,
        allowNull: false
    },
    seeds: {
        type: DataTypes.TEXT,
        allowNull: false
    }
},
{
    sequelize: sequelize,
    timestamps: true,
    tableName: "lastrounds"
}
)

RoundsModel.sync({});

module.exports = RoundsModel;