const fs = require('fs');

function checkFolder() {
  return console.error('Verifique se você possui permissão de escrita em ./data')
}

function saveUpdates(data) {
  fs.writeFileSync('./src/canal/data/canal.json', JSON.stringify(data, null, 4), 'utf-8', (err) => err && checkFolder())
}

module.exports = {
  saveUpdates,
}