const fs = require('fs.promises')

exports.endpointsConvert = async () => {
  try {
    const rawData = await fs.readFile(`${__dirname}/../endpoints.json`, 'utf8')
    const endpoints = JSON.parse(rawData)
    return endpoints
  }
  catch(err) {
    throw err
  }
}