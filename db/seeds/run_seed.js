const seedTest = require('./seed_test.js');
const {db} = require('../connection.js');
const devData = require('../data/test-data/index.js')

const runSeed = () => {
  return seedTest(devData).then(() => db.end());
};

runSeed();