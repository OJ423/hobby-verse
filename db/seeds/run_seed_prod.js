const seedProduction = require('./seed_production.js');
const {db} = require('../connection.js');


const runSeedProd = () => {
  return seedProduction().then(() => db.end());
};

runSeedProd();