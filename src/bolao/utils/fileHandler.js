const fs = require('fs');

function checkFolder() {
  return console.error('Verifique se você possui permissão de escrita em ./data')
}

function writeData(data) {
  fs.writeFileSync('./src/bolao/data/data.json', JSON.stringify(data, null, 4), 'utf-8', (err) => err && checkFolder())
}

module.exports = {
  writeData,
}