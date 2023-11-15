const { client, mongoclient } = require('./src/connections');
const prompts = require('./src/bolao/data/prompts.json');
const { quotes } = require('./src/quotes');
const { replyUser } = require('./src/jokes');
const { bolao } = require('./src/bolao')
const { narrador } = require('./src/narrador');
const { help } = require('./utils/index');
const { sendAdmin } = require('./src/bolao/utils/functions');
const { predictions, atualizaRodada } = require('./src/futebol');
const { canal } = require('./src/canal');

(async () => {
  try {
    await mongoclient.connect();
    await mongoclient
      .db('tigrebot')
      .command({ ping: 1 })
      .then((response) => {
        if (response) console.info('\n✔ Conexão com MongoDB');
        if (!process.env.BOT_OWNER) return console.error(prompts.admin.no_owner);
        console.info(
          '✔ Telefone do administrador:',
          process.env.BOT_OWNER.slice(2, -5),
        );
      });
  } catch (err) {
    return console.error(err);
  } finally {
    console.info('\n' + prompts.admin.welcome);
  }
})();

client.on('message', async (m) => {
  // Módulo de administração de canal
  if (m.from === process.env.BOT_OWNER && m.body.startsWith('/')) return await canal(m);

  // Help system
  if (m.body === '!help') return m.reply(help());

  // Módulo Quotes (usa: MongoDB)
  if (
    m.body.startsWith('!quote') ||
    m.body.startsWith('!addquote') ||
    m.body.startsWith('!jogounotigre') ||
    m.body.startsWith('!autor') ||
    m.body.startsWith('!data') ||
    m.body.startsWith('!delquote')
  ) 
  await quotes(m);

  // Módulo Futebol (usa: Api-Football e FootApi7)
  if (m.author === process.env.BOT_OWNER || m.from === process.env.BOT_OWNER) {
    if (m.body.startsWith('!atualiza')) {
      console.info('Admin disse !atualiza');
      const getAtualizacao = await atualizaRodada(m);
      if (getAtualizacao.error) sendAdmin(getAtualizacao.message);
      return client.sendMessage(m.from, getAtualizacao.message);
    }
    if (m.body.startsWith('!stats')) {
      console.info('Admin disse !stats');
      const getPredictions = await predictions(m);
      if (getPredictions.error) sendAdmin(getPredictions.message)
      return client.sendMessage(m.from, getPredictions.message);
    }
  }

  // Módulo Jokes (usa: RapidApi/Dad Jokes, Useless Fact Api)
  if (m.mentionedIds.includes(process.env.BOT_NUMBER) && !m.hasQuotedMsg) {
    console.info('Alguém mencionou o bot no grupo');
    const chat = await m.getChat();
    chat.sendStateTyping();
    return await replyUser(m);
  };

  // // Módulo narrador de jogo
  // if (m.body.startsWith('!highlights')) {
  //   console.info('Alguém disse !highlights');
  //   return await narrador(m);
  // }

  // Módulo Bolão
  bolao(m) // (API-FOOTBALL - https://rapidapi.com/api-sports/api/api-football/)
  // (FootApi - https://rapidapi.com/fluis.lacasse/api/footapi7)
});
