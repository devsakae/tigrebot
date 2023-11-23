const { client, mongoclient } = require('./src/connections');
const prompts = require('./src/bolao/data/prompts.json');
const { quotes } = require('./src/quotes');
const { replyUser } = require('./src/jokes');
const { bolao } = require('./src/bolao');
const { narrador } = require('./src/narrador');
const { help } = require('./utils/index');
const { sendAdmin } = require('./src/bolao/utils/functions');
const { predictions, atualizaRodada, jogounotigre, aniversariantesDoDia } = require('./src/futebol');
const { canal, bomDia } = require('./src/canal');
const { bolao_mongodb } = require('./src/bolao_mongodb');
const { clima } = require('./src/weather');
const cron = require('node-cron');

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
    cron.schedule('39 6 * * *', () => {
      console.info('06h39min. Bom dia. Rodando o bomDia()...');
      bomDia()
    }, {
      scheduled: true,
      timezone: "America/Sao_Paulo"
    })
  }
})();

client.on('message', async (m) => {
  // Módulo de administração de canal
  if (m.from === process.env.BOT_OWNER && m.body.startsWith('/')) {
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
  // if (m.body.startsWith('!resultadosdarodada')) {
  //   console.info('Alguém disse !resultadosdarodada');
  //   const getAtualizacao = await atualizaRodada(m);
  //   if (getAtualizacao.error) sendAdmin(getAtualizacao.message);
  //   return client.sendMessage(m.from, getAtualizacao.message);
  // }
  // if (
  //   (m.author === process.env.BOT_OWNER || m.from === process.env.BOT_OWNER) &&
  //   m.body.startsWith('!stats')
  // ) {
  //   console.info('Admin disse !stats');
  //   const getPredictions = await predictions(m);
  //   if (getPredictions.error) sendAdmin(getPredictions.message);
  //   return client.sendMessage(m.from, getPredictions.message);
  // }
  if (m.body.startsWith('!jogounotigre')) {
    console.info('Alguém pediu !jogounotigre')
    return await jogounotigre(m);
  }
  if (m.body.startsWith('!aniversariantes')) {
    console.info('Alguém pediu !aniversariantes');
    return await aniversariantesDoDia(m.body.substring(16).trim());
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
  bolao_mongodb(m);
});
