const Sequalize = require("sequelize");
const webdata = require("../webdata/info.json");

const instance = new Sequalize(webdata.dbname, webdata.dbuser, webdata.dbpass, {
  host: webdata.host,
  dialect: webdata.dialect,
  logging: false,
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
});

async function VerifyConnection() {
  await instance
    .authenticate()
    .then((successfully) =>
      console.log(
        `database [${webdata.dbname}] <-> on-host [${webdata.host}] <-> activated...`
      )
    )
    .catch((Error) => {
      throw (`AN ERRORS OCCURED!\n`, Error);
    });
}

module.exports = {
  connection: instance,
  configDb: VerifyConnection,
};



// const Sequalize = require("sequelize");
// const webdata = require("../webdata/info.json");

// const instance = new Sequalize({
//   dialect: 'sqlite',
//   storage: './database/database.sqlite',
//   logging: false
// });

// async function VerifyConnection() {
//   await instance
//     .authenticate()
//     .then((successfully) =>
//       console.log(
//         `database [${webdata.dbname}] <-> on-host [${webdata.host}] <-> activated...`
//       )
//     )
//     .catch((Error) => {
//       throw (`AN ERRORS OCCURED!\n`, Error);
//     });
// }

// module.exports = {
//   connection: instance,
//   configDb: VerifyConnection,
// };