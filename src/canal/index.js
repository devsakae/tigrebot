const { MessageMedia } = require('whatsapp-web.js');
const { client, canais } = require('../connections');
const { fetchWithParams } = require('../../utils');
const data = require('./data/canal.json');
const config = require('../bolao_mongodb/data/config.json');
const { saveUpdates } = require('./utils/fileHandler');

const sendAdmin = (msg) => client.sendMessage(process.env.BOT_OWNER, msg);

const sendMessage = (msg) => {
  Object.keys(config.groups).forEach((grupo) => client.sendMessage(grupo, msg));
};

const sendMessageMedia = async (media) => {
  const messageMedia = await MessageMedia.fromUrl(media.url);
  Object.keys(config.groups).forEach(
    async (grupo) =>
      await client.sendMessage(grupo, messageMedia, {
        caption: media.caption + '\n\n📷 Postagem original: ' + media.link + '\nCapturado e enviado até você por TigreBot - http://tigrebot.devsakae.tech',
      }),
  );
  Object.keys(data.canais).forEach(
    async (canal) =>
      await client.sendMessage(canal, messageMedia, {
        caption: media.caption,
      }),
  );
};

const canal = async (m) => {
  if (m.body.startsWith('/help')) {
    return client.sendMessage(
      m.from,
      'Comandos já configurados no bot:\n\n */canal criar <nome>*\n_Crio um canal de nome <nome> e devolvo com o ID, salvando no banco de dados_\n\n */insta <username>*\n _Publico no <canal> o último post de <username> no Instagram.com_\n\n */pub <canal> <conteúdo>*\n _Publico no <canal> (nome) o texto <conteúdo>_',
    );
  }
  if (m.body.startsWith('/insta')) return instagramThis(m.body.split(' ')[1] || 'criciumaoficial');
  if (m.body.startsWith('/canal')) {
    const command = m.body.split(' ');
    if (command && command[1] === 'criar' && command.length > 1) {
      try {
        const collections = await canais.listCollections().toArray();
        const collection = collections.find((col) => col.name === command[2]);
        if (collection)
          return client.sendMessage(
            m.from,
            'Este canal já existe ou é inválido',
          );
        const chanId = (await client.createChannel(command[2]))?.nid._serialized;
        const canalCriado = { name: command[2], chanId: chanId };
        console.info(`Criação do canal ${command[2]} (${chanId})`);
        data.canais = { [chanId]: command[2], ...data.canais }
        saveUpdates(data);
        await canais.collection('config').insertOne(canalCriado);
        return client.sendMessage(m.from, 'Canal criado! ID: ' + chanId);
      } catch (err) {
        console.error(err);
        sendAdmin(err);
      }
    }
  }
  return;
};

const instagramThis = async (user) => {
  try {
    fetchInstagram(user).then((post) => sendMessageMedia(post));
  } catch (err) {
    return sendAdmin(err);
  }
};

// Publicação no whatsapp de conta do instagram
const fetchInstagram = async (user) => {
  return await fetchWithParams({
    url: process.env.INSTAGRAM130_API_URL + '/account-feed',
    host: process.env.INSTAGRAM130_API_HOST,
    params: {
      username: user,
    },
  })
    .then(async (response) => {
      if (response.length === 0) throw Error('Não foi possível buscar nenhum post');
      const update = {
        date: new Date(),
        id: response[0].node.id,
        link: 'http://instagram.com/p/' + response[0].node.shortcode,
        type: response[0].node.__typename,
        url:
          response[0].node.__typename === 'GraphVideo'
            ? response[0].node.video_url
            : response[0].node.display_url,
        caption: response[0].node.edge_media_to_caption.edges[0].node.text,
      }
      await canais.collection('instagram').insertOne(update)
      return update;
    })
    .catch((err) => console.error(err));
};

module.exports = {
  canal,
  instagramThis,
};
