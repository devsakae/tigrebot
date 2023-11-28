const { client, criciuma } = require('../connections');
const config = require('../../data/tigrebot.json');
const prompts = require('../../data/prompts.json');
const { fetchWithParams, fetchApi } = require('../../utils');
const { saveLocal } = require('../../utils/handleFile');
const { sendInstagramToGroups, sendInstagramToChannels, sendMediaUrlToGroups, sendMediaUrlToChannels, sendTextToGroups, sendTextToChannels } = require('../../utils/sender');
const { getForecast } = require('../weather');
const { organizaFestinha } = require('../futebol/utils/functions');
const { MessageMedia } = require('whatsapp-web.js');
const { falaAlgumaCoisa } = require('../jokes');

const sendAdmin = (msg) => client.sendMessage(process.env.BOT_OWNER, msg);

const canal = async (m) => {
  if (m.body.startsWith('/audio')) return await falaAlgumaCoisa();
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
  if (m.body.startsWith('/bomdia')) return bomDiaComDestaque();
  return;
};

const bomDiaComDestaque = async () => {
  const today = new Date();
  const birthDate = today.toLocaleDateString('pt-br').substring(0, 5);
  const aniversariantes = await criciuma
    .collection('atletas')
    .find({ 'birthday': { $regex: birthDate } })
    .toArray();
  let legendaJogador;
  let legendaAniversariantes;
  let chosenOne;
  if (aniversariantes.length > 0) {
    const jogaramNoTigre = aniversariantes.filter((j) => j.jogos.some((jogo) => jogo.jogounotigre));
    chosenOne = jogaramNoTigre[Math.floor(Math.random() * jogaramNoTigre.length)];
    const jogosPeloTigre = chosenOne.jogos.filter((jogo) => jogo.jogounotigre);
    const totalJogos = jogosPeloTigre.reduce((acc, curr) => {
      acc.jogos += Number(curr.jogos);
      acc.gols += Number(curr.gols);
      return acc;
    }, { jogos: 0, v: 0, e: 0, d: 0, gols: 0 })
    legendaJogador = `_Hoje é aniversário de nascimento de ${chosenOne.name} (${chosenOne.position})._\n\nPelo Tigre, *${chosenOne.nickname}* disputou ${totalJogos.jogos} partidas e marcou ${totalJogos.gols} gols, com última partida válida por ${jogosPeloTigre[0].torneio} ${jogosPeloTigre[0].ano}.`
    legendaAniversariantes = '\n\n' + organizaFestinha(aniversariantes);
  }
  const legendaWeather = await getForecast();
  const legendaGreeting = prompts.saudacoes[Math.floor(Math.random() * prompts.saudacoes.length)];
  if (legendaJogador) {
    const thisCaption = legendaJogador + legendaGreeting + '\n\n' + legendaWeather + legendaAniversariantes;
    await sendMediaUrlToChannels({ url: chosenOne.image, caption: thisCaption });
    return await sendMediaUrlToGroups({ url: chosenOne.image, caption: thisCaption });
  }
  const thatCaption = legendaGreeting + '\n\n' + legendaWeather + legendaAniversariantes
  await sendTextToChannels(thatCaption)
  return await sendTextToGroups(thatCaption);
}

const saveLocalInstagram = (update) => {
  config.instagram.published.push(update.id);
  config.instagram = {
    ...config.instagram,
    ...update
  };
  saveLocal(config);
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
      saveLocalInstagram(update);
      return update;
    })
    .catch((err) => console.error(err));
}

const instaApi243 = async () => {
  try {
    const { data } = await fetchApi({
      url: 'https://instagram243.p.rapidapi.com/userposts/1752837621/4/%7Bend_cursor%7D', // @criciumaoficial
      host: 'instagram243.p.rapidapi.com'
    })
    const update = {
      date: new Date(),
      id: data.edges[0].node.id,
      link: 'http://instagram.com/p/' + data.edges[0].node.shortcode,
      type: data.edges[0].node.__typename,
      url:
        data.edges[0].node.is_video
          ? data.edges[0].node.video_url
          : data.edges[0].node.display_url,
      caption: data.edges[0].node.edge_media_to_caption.edges[0].node.text,
      owner: data.edges[0].node.owner.username,
    }
    saveLocalInstagram(update);
    return update;
  } catch (err) {
    return console.error(err)
  }
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
  bomDiaComDestaque,
  publicaQuotedMessage,
};
