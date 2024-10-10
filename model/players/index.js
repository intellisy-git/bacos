const sequelize = require("../../dbconnection/index").connection;

const {
    DataTypes,
    Model
}  =  require("sequelize");


class Players extends Model {}

Players.init({
    playerId: {
     type: DataTypes.STRING,
     allowNull: false
    },
    socketId: {
         type: DataTypes.TEXT,
         allowNull: false
     },
     roundId: {
         type: DataTypes.TEXT,
         allowNull: false
     },
     CashOutNumber: {
         type: DataTypes.FLOAT(10,2),
         allowNull: false
     },
     btnid: {
         type: DataTypes.INTEGER,
         allowNull: false
     },
     amount: {
         type: DataTypes.STRING,
         allowNull: false
     },
     wonamount: {
         type: DataTypes.FLOAT(17,2),
         allowNull: true,
         defaultValue: 0.00
     },
     isAutocashout: {
         type: DataTypes.BOOLEAN,
         allowNull: false,
     },
     won: {
         type: DataTypes.BOOLEAN,
         allowNull: true,
         defaultValue: false
     },
     seed: {
         type: DataTypes.STRING,
         allowNull: false
     },
     playername: {
         type: DataTypes.STRING,
         allowNull: false
     },
     playerimage: {
         type: DataTypes.STRING,
         allowNull: false
     },
     betid: {
         type: DataTypes.STRING,
         allowNull: false
     }
 },
{
    sequelize: sequelize,
    timestamps: true,
    tableName: "Players"
}
)

Players.sync({
    alter: false,  // Ensure `alter` is false to prevent schema alterations and backup table creation
    force: false
});

module.exports = Players;