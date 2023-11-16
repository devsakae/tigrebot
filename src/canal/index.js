const { MessageMedia } = require('whatsapp-web.js');
const { client } = require('../connections');
const { fetchWithParams } = require('../../utils');
const data = require('./data/canal.json');
const { saveUpdates } = require('./utils/fileHandler');
const { canais } = require('../connections');

const canal = async (m) => {
  const command = m.body.split(' ')
  if (command[1] === 'criar' || command[2].toLowerCase() === 'config') {
    try {
      const collections = await canais.listCollections().toArray();
      const collection = collections.find((col) => col.name === command[2]);
      if (collection) return client.sendMessage(m.from, 'Este canal já existe ou é inválido');
      const chanId = (await client.createChannel(command[2]))?.nid._serialized;
      const canalCriado = { name: command[2], chanId: chanId };
      console.info(`Criação do canal ${command[2]} (${chanId})`);
      data.canais.push(canalCriado);
      saveUpdates(data);
      await canais.collection('config').insertOne(canalCriado);
      return client.sendMessage(m.from, 'Canal criado! ID: ' + chanId);
    } catch (err) {
      console.error(err);
      return client.sendMessage(process.env.BOT_OWNER, err);
    }
  }
  if (m.body.startsWith('/pub')) {
    const details = m.body.split(' ');
    const canal = data.canais.find((c) => c.name.toLowerCase() === details[1].toLowerCase());
    if (!canal) return client.sendMessage(m.from, 'Nenhum canal encontrado! Verifique o nome');
    const conteudo = details.splice(2).join(' ');
    console.log(conteudo);
    console.info('Publicando conteúdo no canal ', canal.name);
    return publicaConteudo({ canal, conteudo });
    // if (m.hasQuotedMsg) {
    //   console.info('Tem quoted message');
    //   const quotedm = await m.getQuotedMessage();
    //   if (quotedm.hasMedia) {
    //     const attachmentData = await quotedm.downloadMedia();
    //     client.sendMessage(data.canal.id, attachmentData, { caption: 'Here\'s your requested media.' });
    //   }
    //   if (quotedm.hasMedia && quotedm.type === 'audio') {
    //     const audio = await quotedm.downloadMedia();
    //     await client.sendMessage(data.canal.id, audio, { sendAudioAsVoice: true });
    //   }
    // }
  }
  return;
}

const publicaConteudo = ({ canal, conteudo }) => {
  console.info(`Publicando no canal *${canal.name}* o conteúdo abaixo:\n\n` + conteudo);
  return client.sendMessage(canal.chanId, conteudo);
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