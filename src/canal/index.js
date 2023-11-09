const { client } = require('../connections');
const data = require('./data/canal.json');
const { saveUpdates } = require('./utils/fileHandler');

const canal = async (m) => {
  const command = m.body.split(' ')
  if (command[1] === 'criar') {
    if (data.canal) return client.sendMessage(m.from, 'Você já tem um canal criado');
    const chanId = (await client.createChannel(command[2]))?.nid._serialized;
    console.info(`Administrador criou o canal ${command[2]} (${chanId})`);
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
    return client.sendMessage(data.canal.id, data.marketing[random]);
  }
  if (m.body.startsWith('/publicar')) {
    if (m.hasQuotedMsg) {
      console.info('Tem quoted message');;
      const quotedm = await m.getQuotedMessage();
      if (quotedm.hasMedia) {
        const attachmentData = await quotedm.downloadMedia();
        client.sendMessage(data.canal.id, attachmentData, { caption: 'Here\'s your requested media.' });
      }
      if (quotedm.hasMedia && quotedm.type === 'audio') {
        const audio = await quotedm.downloadMedia();
        await client.sendMessage(data.canal.id, audio, { sendAudioAsVoice: true });
      }
    }
    const msg = m.body.substring(9).trimStart();
    console.log('Você vai publicar no canal', data.canal.id, msg)
    data.updates.push({
      data: new Date(),
      msg: msg,
    });
    saveUpdates(data);
    client.sendMessage(m.from, 'Enviando...');
    return await client.sendMessage(data.canal.id, msg);
  }

  return;
}

module.exports = {
  canal
}