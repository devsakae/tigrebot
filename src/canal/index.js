const { MessageMedia } = require('whatsapp-web.js');
const { client } = require('../connections');
const { fetchWithParams } = require('../../utils');
const data = require('./data/canal.json');
const { saveUpdates } = require('./utils/fileHandler');
const { canais } = require('../connections');

const canal = async (m) => {
  console.log('Entrou em canal')
  const command = m.body.split(' ')
  if (command[1] === 'criar') {
    const collections = await canais.listCollections().toArray();
    const collection = collections.find((col) => col.name === command[2]);
    if (collection) return client.sendMessage(m.from, 'Este canal já existe');
    console.log('colections', collections);
    // await canais.collection(command[2]).getColl().then((res) => {
    //   console.log(res);
    //   return client.sendMessage(m.from, 'Já existe o canal', command[2]);
    // })
    // const chanId = (await client.createChannel(command[2]))?.nid._serialized;
    // console.info(`Administrador criou o canal ${command[2]} (${chanId})`);
    // await canais.collection('0_conf').insertOne({ name: command[2], chanId: chanId });
    // return client.sendMessage(m.from, 'Canal criado! ID:' + chanId);
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

// Exclusivo da conta @criciumaoficial
const fetchInstagram = async () => {
  await fetchWithParams({
    url: process.env.INSTAGRAM130_API_URL,
    host: process.env.INSTAGRAM130_API_HOST,
    params: {
      username: 'criciumaoficial'
    }
  })
    .then((response) => {
      if (response[0].node.id === data.criciumaoficial.at(-1).id) return { updates: 0 }
      let instaUpdates = [];
      response.forEach(({ node }, idx) => {
        const instaPost = {
          id: node.id,
          link: node.shortcode,
          type: node.__typename,
          url: node.__typename === 'GraphVideo' ? node.video_url : node.display_url,
          caption: node.edge_media_to_caption.edges[0].node.text
        }
        instaUpdates.push(instaPost);
      })
      data.updates.push(instaUpdates);
      saveUpdates(data);
    })
    .catch((err) => console.error(err));
}

const getMediaFrom = async (user) => {
  return fetchWithParams({
    url: process.env.INSTAGRAM130_API_URL,
    host: process.env.INSTAGRAM130_API_HOST,
    params: {
      username: user
    }
  }).then((response) => {
    const mediaFile = response[0].node.__typename === 'GraphVideo' ? response[0].node.video_url : response[0].node.display_url;
    return { url: mediaFile, caption: response[0].node.edge_media_to_caption.edges[0].node.text }
  })
}

const instagram = async (m) => {
  const grupo = m.from;
  const user = m.body.split(' ')[1].trim();
  getMediaFrom(user).then(async (res) => {
    const media = await MessageMedia.fromUrl(res.url);
    client.sendMessage(grupo, media, { caption: res.caption })
  })
}

module.exports = {
  canal,
  instagram,
  getMediaFrom,
}