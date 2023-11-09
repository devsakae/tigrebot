const { client, mongoclient } = require('./src/connections');
const prompts = require('./src/bolao/data/prompts.json');
const { bolao } = require('./src/bolao');
const { quotes } = require('./src/quotes');
const { replyUser } = require('./src/jokes');
const { narrador } = require('./src/narrador');
const { help } = require('./utils/index');
const { sendAdmin, getCommand } = require('./src/bolao/utils/functions');
const { predictions } = require('./src/futebol');
const { canal } = require('./src/canal');

(async () => {
  try {
    await mongoclient.connect();
    await mongoclient
      .db('tigrebot')
      .command({ ping: 1 })
      .then((response) => {
        if (response) console.log('\n✔ Conexão com MongoDB');
        if (!process.env.BOT_OWNER) return console.error(prompts.admin.no_owner);
        console.log(
          '✔ Telefone do administrador:',
          process.env.BOT_OWNER.slice(2, -5),
        );
      });
  } catch (err) {
    return console.error(err);
  } finally {
    console.log('\n' + prompts.admin.welcome);
  }
})();

client.on('message', async (m) => {

  // Módulo de administração de canal
  if (m.from === process.env.BOT_OWNER && m.body.startsWith('/canal')) return await canal(m);

  // // Help system
  // if (m.body === '!help') return m.reply(help());

  // // Módulo Quotes (usa: MongoDB)
  // if (
  //   m.body.startsWith('!quote') ||
  //   m.body.startsWith('!addquote') ||
  //   m.body.startsWith('!jogounotigre') ||
  //   m.body.startsWith('!autor') ||
  //   m.body.startsWith('!data') ||
  //   m.body.startsWith('!delquote')
  // ) 
  // await quotes(m);

  // // Módulo Predictions (usa: RapidApi/Football Api)
  // if (
  //   m.body.startsWith('!stats') &&
  //   (m.author === process.env.BOT_OWNER || m.from === process.env.BOT_OWNER)
  // ) {
  //   console.info('Admin pediu !stats');
  //   const getPredictions = await predictions(m);
  //   if (getPredictions.error) sendAdmin(getPredictions.message)
  //   return client.sendMessage(m.from, getPredictions.message);
  // }

  // // Módulo Jokes (usa: RapidApi/Dad Jokes, Useless Fact Api)
  // if (m.mentionedIds.includes(process.env.BOT_NUMBER) && !m.hasQuotedMsg) {
  //   console.log('Alguém mencionou o bot no grupo');
  //   const chat = await m.getChat();
  //   chat.sendStateTyping();
  //   return await replyUser(m);
  // };

  // // Módulo narrador de jogo
  // if (m.body.startsWith('!highlights')) {
  //   console.log('Alguém disse !highlights');
  //   return await narrador(m);
  // }

  // // Módulo Bolão (usa: RapidApi/Foot Api)
  // await bolao(m);
});
