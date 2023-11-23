const { client } = require('../src/connections');
const config = require('../data/tigrebot.json');

const groupSendText = async (text) => {
  Object.keys(config.grupo).forEach(async (grupo) => {
    const chat = await client.getChatById(grupo);
    chat.sendStateTyping();
    client.sendMessage(grupo, text)
  });
}

module.exports = {
  groupSendText,
}