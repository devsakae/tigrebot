const fs = require('fs');

function checkFolder() {
  return console.error('Verifique se você possui permissão de escrita em ./data')
}

function saveLocal(data) {
  fs.writeFileSync('./data/tigrebot.json', JSON.stringify(data, null, 4), 'utf-8', (err) => err && checkFolder())
}

function savePrompts(data) {
  fs.writeFileSync('./data/prompts.json', JSON.stringify(data, null, 4), 'utf-8', (err) => err && checkFolder())
}

function saveDefendeAi(data) {
  fs.writeFileSync('./data/defendeai.json', JSON.stringify(data, null, 4), 'utf-8', (err) => err && checkFolder())
}

module.exports = {
  saveLocal,
  savePrompts,
  saveDefendeAi
}