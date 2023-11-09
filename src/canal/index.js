const { client } = require('../connections');
const data = require('./data/canal.json');
const { saveUpdates } = require('./utils/fileHandler');

const canal = async (m) => {
  const command = m.body.split(' ')
  if (command[1] === 'criar') {
    const chanId = (await client.createChannel(command[2]))?.nid._serialized;
    console.info(`Administrador criou o canal ${command[2]} (ID: ${chanId}`);
    data.canal = {
      id: chanId,
      name: command[2]
    }
    saveUpdates(data);
    return client.sendMessage(m.from, 'Canal criado! ID:' + chanId);
  }
  if (command[1] === 'marketing' && data.canal) {
    console.info('Editor solicitou mensagem de marketing no canal')
    const random = Math.floor(Math.random() * data.marketing.length);
    client.sendMessage(m.from, 'Publicando...')
    return client.sendMessage(data.canal.id, data.marketing[random]);
  }
  if (m.body.startsWith('/publicar')) {
    const msg = m.body.substring(9).trimStart();
    console.log('Você vai publicar no canal', data.canal.id, msg)
    const sentMsg = await client.sendMessage(data.canal.id, msg);
    console.log(sentMsg);
  }
  return;
}

module.exports = {
  canal
}