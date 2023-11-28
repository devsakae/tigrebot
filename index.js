const cron = require('node-cron');
const { client, mongoclient } = require('./src/connections');
const prompts = require('./src/bolao/data/prompts.json');
const { quotes } = require('./src/quotes');
const { replyUser, falaPraEle, falaAlgumaCoisa } = require('./src/jokes');
const { help } = require('./utils/index');
const { jogounotigre } = require('./src/futebol');
const { canal, publicaQuotedMessage, bomDiaComDestaque, publicaMessage } = require('./src/canal');
const { bolao_mongodb } = require('./src/bolao_mongodb');
const { getMongoPalpites } = require('./src/bolao_mongodb/user');

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
    cron.schedule('40 6 * * *', () => {
      console.info('06h40min. Bom dia. Rodando o bomDia()...');
      bomDiaComDestaque()
    }, {
      scheduled: true,
      timezone: "America/Sao_Paulo"
    });
    cron.schedule('21 12 * * 0,3', () => {
      console.info('12h21min. Rodando /audio');
      
    }, {
      scheduled: true,
      timezone: "America/Sao_Paulo"
    })
  }
})();

client.on('message_reaction', async (m) => {
  if (m.reaction === '\u26BD') { // Unicode for ⚽️
    const message = await client.getMessageById(m.msgId._serialized);
    const reactions = await message.getReactions();
    if (reactions.find((rct) => rct.id === '\u26BD').senders.length > 2) {
      message.react('🏆')
      return message.reply('⚽️ Essa mensagem é um golaço!\n\nVocê ganhou o 🏆 prêmio MOTEL CLINIMAGEM oferecido por Tigrelino corporeixoum');
    }
    return;
  }
  if (m.reaction === '🤖' && m.senderId === process.env.BOT_OWNER) {
    console.info('Republicando mensagem');
    const message = await client.getMessageById(m.msgId._serialized);
    return await publicaMessage(message);
  }
})

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
    m.body.startsWith('!jogounotigre') ||
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
