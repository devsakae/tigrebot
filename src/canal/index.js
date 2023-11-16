const { MessageMedia } = require('whatsapp-web.js');
const { client, canais, tigrebot } = require('../connections');
const { fetchWithParams } = require('../../utils');
const data = require('./data/canal.json');
const bolaodata = require('../bolao/data/data.json');
const { saveUpdates } = require('./utils/fileHandler');

const grupos = Object.keys(bolaodata).filter((key) => key.endsWith('.us'));

const canal = async (m) => {
  if (m.body.startsWith('/help')) {
    return client.sendMessage(
      m.from,
      'Comandos já configurados no bot:\n\n */canal criar <nome>*\n_Crio um canal de nome <nome> e devolvo com o ID, salvando no banco de dados_\n\n */insta <username>*\n _Publico no <canal> o último post de <username> no Instagram.com_\n\n */pub <canal> <conteúdo>*\n _Publico no <canal> (nome) o texto <conteúdo>_',
    );
  }
  if (m.body.startsWith('/dbinsta')) return await fetchMongoInstagram();
  if (m.body.startsWith('/insta')) {
    const insta_account = m.body.split(' ')[1];
    const instaPosts = await fetchInstagram(insta_account);
    if (instaPosts.length > 0) {
      grupos.forEach((grupo) => {
        publicaMidiaFromUrl({
          canal: {
            name: '<Grupo> TigreLOG',
            chanId: grupo
          },
          conteudo: instaPosts[0],
        });
      });
      data.canais.forEach((canal) => {
        publicaMidiaFromUrl({
          canal: canal,
          conteudo: instaPosts[0],
        });
      });
      return;
    }
    return await fetchMongoInstagram();
  }

  if (m.body.startsWith('/pub')) {
    if (m.hasQuotedMsg) {
      const quotedm = await m.getQuotedMessage();
      console.log(quotedm);
      if (quotedm.hasMedia) {
        const attachmentData = await quotedm.downloadMedia();
        return client.sendMessage(data.canais[0].chanId, attachmentData, { caption: quotedm.caption });
      }
      if (quotedm.hasMedia && quotedm.type === 'audio') {
        const audio = await quotedm.downloadMedia();
        return await client.sendMessage(data.canais[0].chanId, audio, { sendAudioAsVoice: true });
      }
    }
    const details = m.body.split(' ');
    const canal = data.canais.find(
      (c) => c.name.toLowerCase() === details[1].toLowerCase(),
    );
    if (!canal)
      return client.sendMessage(
        m.from,
        'Nenhum canal encontrado! Verifique o nome',
      );
    const conteudo = details.splice(2).join(' ');
    return publicaConteudo({ canal, conteudo });
  }

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
        const chanId = (await client.createChannel(command[2]))?.nid
          ._serialized;
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
  }
  return;
};

const publicaMidiaFromUrl = async ({ canal, conteudo }) => {
  console.info(`Publicando no canal *${canal.name}* MÍDIA`);
  const media = await MessageMedia.fromUrl(conteudo.url);
  client.sendMessage(canal.chanId, media, { caption: conteudo.caption });
};

const publicaConteudo = async ({ canal, conteudo }) => {
  console.info(
    `Publicando no canal *${canal.name}* o conteúdo abaixo:\n\n` + conteudo,
  );
  await canais.collection(canal).insertOne({ date: new Date(), conteudo });
  return client.sendMessage(canal.chanId, conteudo);
};

const fetchMongoInstagram = async () => {
  tigrebot
    .collection('instagram_criciumaoficial')
    .find()
    .toArray()
    .then((posts) => {
      if (posts.length === 0) return m.reply('Zero posts na database');
      grupos.forEach((grupo) => {
        publicaMidiaFromUrl({
          canal: {
            name: '<Grupo> TigreLOG',
            chanId: grupo
          },
          conteudo: posts[0],
        });
      })
    })
}

// Publicação no whatsapp de conta do instagram
const fetchInstagram = async (user) => {
  return await fetchWithParams({
    url: process.env.INSTAGRAM130_API_URL,
    host: process.env.INSTAGRAM130_API_HOST,
    params: {
      username: user,
    },
  })
    .then(async (response) => {
      if (response.length < 1) return { error: true };
      let instaUpdates = [];
      response.forEach(({ node }) => {
        const instaPost = {
          id: node.id,
          link: node.shortcode,
          type: node.__typename,
          url:
            node.__typename === 'GraphVideo'
              ? node.video_url
              : node.display_url,
          caption: node.edge_media_to_caption.edges[0].node.text,
        };
        instaUpdates.push(instaPost);
      });
      console.log('Insta updates length', instaUpdates.length);
      const latestDbPost = await tigrebot
        .collection('instagram_criciumaoficial')
        .findOne();
      if (latestDbPost && latestDbPost.id === instaUpdates[0].id) return [];
      console.log('Latestdbposts length', latestDbPost.length);
      await tigrebot
        .collection('instagram_criciumaoficial')
        .insertMany(instaUpdates);
      return instaUpdates;
    })
    .catch((err) => console.error(err));
};

const getMediaFrom = async (user) => {
  return fetchWithParams({
    url: process.env.INSTAGRAM130_API_URL,
    host: process.env.INSTAGRAM130_API_HOST,
    params: {
      username: user,
    },
  }).then((response) => {
    const mediaFile =
      response[0].node.__typename === 'GraphVideo'
        ? response[0].node.video_url
        : response[0].node.display_url;
    return {
      url: mediaFile,
      caption: response[0].node.edge_media_to_caption.edges[0].node.text,
    };
  });
};

const instagram = async (m) => {
  const grupo = m.from;
  const user = m.body.split(' ')[1].trim();
  getMediaFrom(user).then(async (res) => {
    const media = await MessageMedia.fromUrl(res.url);
    client.sendMessage(grupo, media, { caption: res.caption });
  });
};

module.exports = {
  canal,
  instagram,
  getMediaFrom,
};
