const { client, criciuma } = require('../connections');
const config = require('../../data/tigrebot.json')
const { fetchWithParams } = require('../../utils');
const { saveLocal } = require('../../utils/handleFile');
const { sendInstagramToGroups, sendInstagramToChannels, sendMediaUrlToGroups, sendMediaUrlToChannels, sendTextToGroups, sendTextToChannels } = require('../../utils/sender');
const { getWeather } = require('../weather');
const { organizaFestinha } = require('../futebol/utils/functions');
const { MessageMedia } = require('whatsapp-web.js');

const sendAdmin = (msg) => client.sendMessage(process.env.BOT_OWNER, msg);

const canal = async (m) => {
  if (m.body.startsWith('/help')) {
    return client.sendMessage(
      m.from,
      'Comandos já configurados no bot:\n\n */canal criar <nome>*\n_Crio um canal de nome <nome> e devolvo com o ID, salvando no banco de dados_\n\n */insta <username>*\n _Publico no <canal> o último post de <username> no Instagram.com_\n\n */pub <canal> <conteúdo>*\n _Publico no <canal> (nome) o texto <conteúdo>_',
    );
  }
  if (m.body.startsWith('/insta')) return instagramThis(m.body.split(' ')[1]);
  if (m.body.startsWith('/canal')) {
    const command = m.body.split(' ');
    if (command && command[1] === 'criar' && command.length > 1) {
      if (Object.keys(config.canais).includes(command[2])) return client.sendMessage(m.from, 'Este canal já existe ou é inválido');
      const chanId = (await client.createChannel(command[2]))?.nid._serialized;
      console.info(`Canal ${command[2]} criado com id ${chanId}`);
      config.canais = { [chanId]: command[2], ...config.canais }
      saveLocal(config);
      return client.sendMessage(m.from, 'Canal criado! ID: ' + chanId);
    }
  }
  if (m.body.startsWith('/bomdia')) return bomDia();
  return;
};

const bomDia = async () => {
  const today = new Date();
  const weather = await getWeather();
  const birthDate = today.toLocaleDateString('pt-br').substring(0, 5);
  const aniversariantes = await criciuma
    .collection('atletas')
    .find({ 'birthday': { $regex: birthDate } })
    .toArray();
  if (aniversariantes.length === 0) return sendMediaUrlToChannels(weather);
  const texto = organizaFestinha(aniversariantes);
  const mensagem = weather.caption + '\n\n' + texto;
  await sendMediaUrlToGroups({ url: weather.url, caption: mensagem });
  return await sendMediaUrlToChannels({ url: weather.url, caption: mensagem })
}

const bomFind = async () => {
  const today = new Date();
  const weather = await getWeather();
  const birthDate = today.toLocaleDateString('pt-br').substring(0, 5);
  const aniversariantes = await criciuma
    .collection('atletas')
    .find({ 'birthday': { $regex: birthDate } })
    .toArray();
  if (aniversariantes.length === 0) return sendMediaUrlToChannels(weather);
  const texto = organizaFestinha(aniversariantes);
  const mensagem = weather.caption + '\n\n' + texto;
  await sendMediaUrlToGroups({ url: weather.url, caption: mensagem });
  return await sendMediaUrlToChannels({ url: weather.url, caption: mensagem })
}


const instagramThis = async (user = 'criciumaoficial') => {
  try {
    client.sendMessage(process.env.BOT_OWNER, 'Ok, iniciando fetch no instagram de @' + user)
    await fetchInstagram(user).then(async (post) => {
      await sendInstagramToGroups(post);
      return await sendInstagramToChannels(post);
    });
  } catch (err) {
    return sendAdmin(err);
  }
};

// Publicação no whatsapp de conta do instagram
const fetchInstagram = async (user) => {
  console.info('Fetching...')
  return await fetchWithParams({
    url: process.env.INSTAGRAM130_API_URL + '/account-feed',
    host: process.env.INSTAGRAM130_API_HOST,
    params: {
      username: user,
    },
  })
    .then(async (res) => {
      console.info('Fetched!')
      if (res.length === 0) throw Error('Não foi possível buscar nenhum post');
      let response = res[0];
      if (config.instagram.published.includes(response.node.id)) response = res.find((item) => !config.instagram.published.includes(item.node.id));
      const update = {
        date: new Date(),
        id: response.node.id,
        link: 'http://instagram.com/p/' + response.node.shortcode,
        type: response.node.__typename,
        url:
          response.node.is_video
            ? response.node.video_url
            : response.node.display_url,
        caption: response.node.edge_media_to_caption.edges[0].node.text,
        owner: response.node.owner.username,
      }
      config.instagram.published.push(update.id);
      config.instagram = {
        ...config.instagram,
        ...update
      };
      saveLocal(config);
      return update;
    })
    .catch((err) => console.error(err));
}

const publicaQuotedMessage = async (m) => {
  const raw = await m.getQuotedMessage();
  if (raw.hasMedia) {
    const media = await raw.downloadMedia();
    if (media) {
      const contentComMedia = new MessageMedia(
        media.mimetype,
        media.data.toString('base64')
      );
      for (grupo of Object.keys(config.grupos)) {
        await client.sendMessage(grupo, contentComMedia, { caption: raw.body });
      }
      for (canal of Object.keys(config.canais)) {
        await client.sendMessage(canal, contentComMedia, { caption: raw.body })
      }
    }
  }
  await sendTextToGroups(raw.body);
  return await sendTextToChannels(raw.body);
}

module.exports = {
  canal,
  instagramThis,
  bomDia,
  bomFind,
  publicaQuotedMessage,
};
