const config = require('./data/tigrebot.json')
const prompts = require('./data/prompts.json');
const { client, mongoclient } = require('./src/connections');
const publicacoes = require('./utils/autobot');
const { quotes, addQuote } = require('./src/quotes');
const { replyUser, falaPraEle, falaAlgumaCoisa } = require('./src/jokes');
const { help, saveLocal } = require('./utils/index');
const { jogounotigre } = require('./src/futebol');
const { canal, publicaQuotedMessage, bomDiaComDestaque, publicaMessage } = require('./src/canal');
// const { bolao_mongodb } = require('./src/bolao_mongodb');
// const { getMongoPalpites } = require('./src/bolao_mongodb/user');

(async () => {
  try {
    if (!process.env.BOT_OWNER) throw Error(prompts.admin.no_owner);
    console.info('\n✔ Admin configurado');
    mongoclient.connect();
    mongoclient
      .db('tigrebot')
      .command({ ping: 1 })
      .then((response) => {
        if (!response) throw Error('❌ Conexão com MongoDB')
        console.info('✔ Conexão com MongoDB');
        console.info('\nConectando com o WhatsApp...')
      })
      .catch((err) => console.error(err));
  } catch (err) {
    return console.error(err);
  } finally {
    console.info('\n' + prompts.admin.welcome);

    // Programações automáticas
    publicacoes.bomDia('40 6 * * *') // Todos os dias às 06:40
    publicacoes.audio('12 11 * * 3,6'); // Quartas e sábados às 11:12
    publicacoes.atletaDestaque('10 10 * * 5') // Sexta às 10:10
  }
})();

client.on('message', async (m) => {
  if ((m.author === process.env.BOT_OWNER || m.from === process.env.BOT_OWNER) && (m.body.startsWith('!falapraele') || m.body.startsWith('/anuncieque') )) return await falaPraEle(m);
  if (m.author === process.env.BOT_OWNER && m.hasQuotedMsg && m.body === '!publicar') return await publicaQuotedMessage(m)

  // Módulo de administração de canal
  if ((m.from === process.env.BOT_OWNER || m.author === process.env.BOT_OWNER) && m.body.startsWith('/')) {
    console.info('Admin solicitou', m.body);
    return await canal(m);
  }

  // Help system
  if (m.body === '!help') {
    console.info('Alguém solicitou !help');
    const response = help();
    return m.reply(response);
  }

  // Módulo Futebol (usa: Api-Football e FootApi7)
  if (m.body.startsWith('!jogounotigre')) {
    console.info('Alguém pediu !jogounotigre')
    return await jogounotigre(m);
  }
  if (
    m.body.startsWith('!addquote') ||
    m.body.startsWith('!autor') ||
    m.body.startsWith('!data') ||
    m.body.startsWith('!delquote') ||
    m.body.startsWith('!quote')
  ) {
    // Módulo Quotes (usa: MongoDB)
    return await quotes(m);
  }

  // Módulo Jokes (usa: RapidApi/Dad Jokes, Useless Fact Api)
  if (m.mentionedIds.includes(process.env.BOT_NUMBER)) {
    console.info('Alguém mencionou o bot no grupo');
    const chat = await m.getChat();
    chat.sendStateTyping();
    return await replyUser(m);
  }

  // Módulo Bolão
  // bolao(m) // (API-FOOTBALL - https://rapidapi.com/api-sports/api/api-football/)
  // bolao_mongodb(m);
});

client.on('message_reaction', async (m) => {
  if (m && m.reaction === '❤️' && m.senderId === process.env.BOT_OWNER) {
    const msg = await client.getMessageById(m.msgId._serialized);
    return await addQuote(msg);
  }
  if (m && m.reaction === '\u26BD') { // Unicode for ⚽️
    const message = await client.getMessageById(m.msgId._serialized);
    if (message) {
      const reactions = await message.getReactions();
      if (reactions && reactions.find((rct) => rct.id === '\u26BD').senders.length > 2) {
        if (message.fromMe) return;
        await message.react('🏆')
        return await message.reply('⚽️ Essa mensagem é um golaço!\n\nVocê ganhou o 🏆 prêmio MOTEL CLINIMAGEM oferecido por Tigrelino corporeixoum!\n\nAh sim, também salvei ele no banco de dados de quotes... Dá um !quote aí');
      }
      return;
    }
    return;
  }
  if (m && m.reaction === '🤖' && m.senderId === process.env.BOT_OWNER) {
    console.info('Republicando mensagem');
    const message = await client.getMessageById(m.msgId._serialized);
    if (message) return await publicaMessage(message);
    return;
  }
})

client.on('group_join', async (e) => {
  const newGroup = await e.getChat();
  console.info('Colocando grupo', newGroup.name, 'na lista de envios')
  config.grupos[newGroup.id._serialized] = { palpiteiros: [] }
  saveLocal(config);
  return await client.sendMessage(process.env.BOT_OWNER, `Configurações do grupo ${newGroup.name} realizadas com sucesso!`)
})

client.on('group_update', async (e) => {
  const newGroup = await e.getChat();
  if (newGroup.isMuted || newGroup.isReadOnly) {
    console.info('Retirando grupo', newGroup.name, 'temporariamente dos envios')
    config.grupos = {
      ...Object.entries(config.grupos.filter(([key]) => key !== newGroup.id._serialized))
    }
    return saveLocal(config);
  }
  console.info('Colocando grupo', newGroup.name, 'na lista de envios')
  config.grupos[newGroup.id._serialized] = { palpiteiros: [] }
  return saveLocal(config);
})

client.on('group_leave', async (e) => {
  const newGroup = await e.getChat();
  console.info('Retirando grupo', newGroup.name, 'do cadastro')
  config.grupos = {
    ...Object.entries(config.grupos.filter(([key]) => key !== newGroup.id._serialized))
  }
  return saveLocal(config);
})