import { Sequelize } from 'sequelize';
import fs from 'fs';


const sequelize = new Sequelize(
  process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD,
  {
    port: 3306,
    dialect: "mysql",
    logging: false,
    benchmark: true,
    define: { charset: 'utf8', timestamps: false },
    dialectOptions: {
      infileStreamFactory: (path: string) => fs.createReadStream(path),
    }
  }
);

(async () => {
  await sequelize.authenticate();
  console.log("DATABASE CONNECTED");
})();

export { sequelize };