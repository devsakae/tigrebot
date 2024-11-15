const prompts = require('./data/prompts.json');
const config = require('./data/tigrebot.json');
const publicacoes = require('./utils/autobot');
const { client, mongoclient } = require('./src/connections');
const { quotes } = require('./src/quotes');
const { replyUser } = require('./src/jokes');
const { jogounotigre, adversarios, partida, publicaJogoAleatorio, proximaPartida, jogosAoVivo } = require('./src/futebol');
const { canal, publicaMessage } = require('./src/canal');
const { echoToGroups } = require('./utils/sender');
// const { postTweet } = require('./utils/twitter');
const { log_info } = require('./utils/admin');
const { quiz } = require('./src/quiz');
const { publicarComoTigrelino } = require('./src/tigrelino');
const { saveLocal } = require('./utils');
const { defendeAi } = require('./src/defendeai');
const { instagramscraperapi2 } = require('./src/instagram');
// const { futnatv } = require('./src/news');
let modoQuiz = false;
let grupoQuiz = '';

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
    // config.tigrelino = false;
    // await saveLocal(config);
    console.info('\n' + prompts.admin.welcome);
    // Programações automáticas
    publicacoes.bomDia('30 6 * * *');             // Todos os dias às 6h30min
    publicacoes.audio('20 9 * * 3,6');            // Quartas e sábados às 9h20min
    publicacoes.atletaDestaque('20 9 * * 2,5');   // Terças e sextas às 9h20min
    publicacoes.jogosHistoricos('45 13 * * *');   // Todos os dias às 13h45min
    publicacoes.meuQuiz()
    publicacoes.golacoTigrelog('0 11 * * *')      // Todos os dias às 11h00min
    // publicacoes.bolaoSystem('30 9 * * *');        // Todos os dias às 9h30min
    // publicacoes.bebeAteVirarTigrelino();
    proximaPartida()                              // Publica sobre a partida do Tigre no dia do jogo às 8h00min
  }
})();

client.on('message', async (m) => {

  // Módulo Quotes (usa: MongoDB)
  if (
    m.body.startsWith('!addquote') ||
    m.body.startsWith('!autor') ||
    m.body.startsWith('!data') ||
    m.body.startsWith('!delquote') ||
    m.body.startsWith('!quote')
  ) {
    return await quotes(m);
  }

  if (m.body.startsWith('!titulo')) {
    const group = await client.getChatById(m.from);
    await group.setSubject(m.body.substring(8));  
  }

  if (m.author === process.env.BOT_OWNER && m.body.startsWith('!echo')) {
    const echomsg = m.body.substring(m.body.split(' ')[0].length + 1)
    console.log('Echoing:\n', echomsg);
    return await echoToGroups(echomsg)
  }

  // Módulo Defende AI - Projeto com Silvano
  if (m.mentionedIds.includes(process.env.BOT_NUMBER)) {
    if (m.from === process.env.DEFENDE_AI) return await defendeAi(m);
    else {
      // Módulo Jokes (usa: RapidApi/Dad Jokes, Useless Fact Api)
      const chat = await m.getChat();
      log_info('Alguém mencionou o bot no grupo ' + chat.name);
      chat.sendStateTyping();
      return await replyUser(m);
    }
  }

  // Módulo de administração de canal
  if (m.from === process.env.BOT_OWNER || (m.author === process.env.BOT_OWNER && m.body.startsWith('/'))) {
    console.info('Admin solicitou', m.body);
    if (m.body.startsWith('!modotigrelino')) {
      log_info('Setting Tigrelino mode to *' + JSON.stringify(!config.tigrelino) + '*!')
      config.tigrelino = !config.tigrelino;
      saveLocal(config);
    }
    if (m.body.includes('instagram.com')) {
      return await instagramscraperapi2(m.body);
    }
    return await canal(m);
  }

  if ((m.author === process.env.BOT_OWNER) && m.body.startsWith('!jogosaovivo')) {
    const jogos = await jogosAoVivo();
    return await m.reply(jogos);
  }

  if (m.body.startsWith('!quiz')) {
    console.info('Alguém pediu !quiz');
    if (grupoQuiz === m.from && modoQuiz) return m.reply("Um quiz por hora, sossega o bumbum guloso aí");
    grupoQuiz = m.from;
    modoQuiz = true;
    setTimeout(() => grupoQuiz = '', (15 * 60 * 1000));
    setTimeout(() => modoQuiz = false, (60 * 60 * 1000));
    return await quiz(m);
  }
  
  // Módulo Futebol (usa: Api-Football e FootApi7)
  if (m.body.startsWith('!jogounotigre')) {
    console.info('Alguém pediu !jogounotigre');
    if (grupoQuiz === m.from) return m.reply("Durante o quiz é sacanagem né")
    return await jogounotigre(m);
  }
  if (m.body.startsWith('!jogos')) {
    console.info('Alguém pediu !jogos');
    return await adversarios(m);
  }
  if (m.body.toLowerCase().startsWith('!matchid')) {
    console.info('Admin pediu !matchid');
    return await partida(m);
  }
  if (m.author === process.env.BOT_OWNER && m.body.startsWith('!hojenahistoria')) {
    console.info('Admin pediu !hojenahistoria');
    return await publicaJogoAleatorio();
  }

});

client.on('message_reaction', async (m) => {
  if (m && m.reaction === '🤖' && m.senderId === process.env.BOT_OWNER) {
    log_info('Republicando mensagem via reaction');
    const message = await client.getMessageById(m.msgId._serialized);
    if (message) return await publicaMessage(message);
    return;
  }
  // if (m && m.reaction === '\u26BD') { // Unicode for ⚽️
  //   const originalMsg = await client.getMessageById(m.msgId._serialized);
  //   if (originalMsg.hasReaction) {
  //     const reactions = await originalMsg.getReactions();
  //     if (reactions[0].hasReactionByMe) return;
  //     if (reactions[0].aggregateEmoji === '\u26BD') {
  //       log_info('Meteram um golaço, vou meter também');
  //       await originalMsg.react('⚽️');
  //       return await originalMsg.reply('Caralho que golaço que tu meteu hein loco\n\nEntrou nos anais, NOS ANAIS da história do grupo');
  //     }
  //   }
  //   return;
  // }
})

client.on('group_join', async (e) => {
  if (e.recipientIds.includes(process.env.BOT_NUMBER)) return;
  await Promise.all(e.recipientIds.map(async (u) => {
    const user = await client.getContactById(u);
    const name = user.pushname || user.name || user.shortName;
    const helloMoto = prompts.boasvindas[Math.floor(Math.random() * prompts.boasvindas.length)].replace("${nome}", name);
    await log_info(`Saudando o usuário ${name} em grupo`);
    return await client.sendMessage(e.chatId, helloMoto);
}))
  return;
})

// client.on('group_leave', async (e) => {
//   const newGroup = await e.getChat();
//   log_this("Adeus a usuário no grupo " + newGroup.name);
//   return await client.sendMessage(newGroup.id._serialized, 'Saiu porque viu o tamanho da minha pica');
// })