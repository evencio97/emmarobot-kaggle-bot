import { Transaction } from "sequelize";
import { sequelize } from "../helpers/database";
import { BabyName } from "../models/BabyName";


const handleRollback = async (t: Transaction) => {
  try {
    await t.rollback();
  } catch (error) {}
}

const loadFile = async (filePath:string) => {
  let t: Transaction;
  try {
    // Start transaction
    t = await sequelize.transaction();
    // Load file in db
    filePath = (__dirname.slice(0, __dirname.indexOf("kaggle-bot") + 11) + filePath).replace(/\\/g, "/");
    await sequelize.query(`TRUNCATE TABLE kaggle_bot.baby_name;`, { transaction: t });
    await sequelize.query(
      `LOAD DATA LOCAL INFILE '${filePath}'
        INTO TABLE kaggle_bot.baby_name
        FIELDS TERMINATED BY ','
        ENCLOSED BY '"'
        LINES TERMINATED BY '\n'
        IGNORE 1 LINES
        (@col1, @col2, @col3, @col4) set year=@col1, name=@col2, sex=@col3, number=@col4;`
    );
    // 
    const result = await BabyName.count({ col: "id", transaction: t });
    // Commit transaction
    await t.commit();
    return result;
  } catch (error) {
    console.error(error);
    // Rollback transaction
    await handleRollback(t);
    
    throw error;
  }
}

const getBatch = async () => BabyName.findAll({
  where: {synchronized: 0},
  order: [["year", "ASC"], ["name", "ASC"]],
  limit: 100
});

const markBatch = async (ids: number[]) => sequelize.query(
  `UPDATE kaggle_bot.baby_name SET synchronized=1 WHERE id IN (${ids.join(",")})`
);

export default {
  loadFile, getBatch, markBatch
}