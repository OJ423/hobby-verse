const seedTest = require('./seed_test.js');
const {db} = require('../connection.js');

const runSeed = () => {
  return seedTest().then(() => db.end());
};

runSeed();