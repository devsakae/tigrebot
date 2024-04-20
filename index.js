const config = require('./data/tigrebot.json')
const prompts = require('./data/prompts.json');
const { client, mongoclient } = require('./src/connections');
const publicacoes = require('./utils/autobot');
const { quotes, addQuote } = require('./src/quotes');
const { replyUser, falaPraEle } = require('./src/jokes');
const { saveLocal } = require('./utils/index');
const { jogounotigre, adversarios, partida, publicaJogoAleatorio, proximaPartida } = require('./src/futebol');
const { canal, publicaQuotedMessage, publicaMessage, bomDiaComDestaque } = require('./src/canal');
const { echoToGroups, echoToChannel } = require('./utils/sender');
const { bolao } = require('./src/bolao');
const { postTweet } = require('./utils/twitter');
const { log_this } = require('./utils/admin');
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
    publicacoes.bomDia("30 6 * * *") // Todos os dias às 6h30min
    publicacoes.audio('20 9 * * 3,6'); // Quartas e sábados às 9h20min
    publicacoes.atletaDestaque('20 9 * * 2,5') // Terças e sextas às 9h20min
    publicacoes.jogosHistoricos('45 13 * * *') // Todos os dias às 13h45min
    proximaPartida() // Publica sobre a partida do Tigre no dia do jogo às 8h00min
  }
})();

client.on('message', async (m) => {
  if (m.author === process.env.BOT_OWNER && m.body === '!bomdia') return await bomDiaComDestaque();
  if ((m.author === process.env.BOT_OWNER || m.from === process.env.BOT_OWNER) && (m.body.startsWith('!falapraele') || m.body.startsWith('/anuncieque') )) return await falaPraEle(m);
  if (m.author === process.env.BOT_OWNER && m.hasQuotedMsg && m.body === '!publicar') return await publicaQuotedMessage(m)

  // Módulo de administração de canal
  if ((m.from === process.env.BOT_OWNER || m.author === process.env.BOT_OWNER) && m.body.startsWith('/')) {
    console.info('Admin solicitou', m.body);
    return await canal(m);
  }

  // Módulo Futebol (usa: Api-Football e FootApi7)
  if (m.body.startsWith('!jogounotigre')) {
    console.info('Alguém pediu !jogounotigre');
    return await jogounotigre(m);
  }
  if (m.body.startsWith('!jogos')) {
    console.info('Alguém pediu !jogos');
    return await adversarios(m);
  }
  if (m.author === process.env.BOT_OWNER && (m.body.startsWith('!matchId') || m.body.startsWith('!matchid'))) {
    console.info('Admin pediu !matchid');
    return await partida(m);
  }
  if (m.author === process.env.BOT_OWNER && m.body.startsWith('!hojenahistoria')) {
    console.info('Admin pediu !hojenahistoria');
    return await publicaJogoAleatorio();
  }

  if (m.author === process.env.BOT_OWNER && m.body.startsWith('!echo')) {
    const echomsg = m.body.substring(m.body.split(' ')[0].length + 1)
    console.log('Echoing:\n', echomsg);
    await echoToChannel(echomsg);
    await postTweet(echomsg);
    return await echoToGroups(echomsg)
  }

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

  // Módulo Jokes (usa: RapidApi/Dad Jokes, Useless Fact Api)
  if (m.mentionedIds.includes(process.env.BOT_NUMBER)) {
    console.info('Alguém mencionou o bot no grupo');
    const chat = await m.getChat();
    chat.sendStateTyping();
    return await replyUser(m);
  }

  // Módulo Bolão refeito 2024
  // return await bolao(m);
});

client.on('message_reaction', async (m) => {
  // if (m && m.reaction === '❤️' && m.senderId === process.env.BOT_OWNER) {
  //   const msg = await client.getMessageById(m.msgId._serialized);
  //   console.log('Adding quote by heart')
  //   return await addQuote(msg);
  // }
  // if (m && m.reaction === '\u26BD') { // Unicode for ⚽️
  //   const message = await client.getMessageById(m.msgId._serialized);
  //   if (message) {
  //     const reactions = await message.getReactions();
  //     console.log('reactions:', reactions);
  //     console.log('reactions find.senders:', reactions.find((rct) => rct.id === '\u26BD').senders)
  //     if (reactions && reactions.find((rct) => rct.id === '\u26BD').senders.length > 2) {
  //       console.log('3 ou mais gols!')
  //       if (message.fromMe) return;
  //       await message.react('🏆')
  //       return await message.reply('⚽️ Essa mensagem é um golaço!\n\nVocê ganhou o 🏆 prêmio MOTEL CLINIMAGEM oferecido por Tigrelino corporeixoum!\n\nAh sim, também salvei ele no banco de dados de quotes... Dá um !quote aí (mentira, o Sakae ainda não codou essa parte');
  //     }
  //     return;
  //   }
  //   return;
  // }
  if (m && m.reaction === '🤖' && m.senderId === process.env.BOT_OWNER) {
    console.info('Republicando mensagem');
    const message = await client.getMessageById(m.msgId._serialized);
    if (message) return await publicaMessage(message);
    return;
  }
})

client.on('group_join', async (e) => {
  const newGroup = await e.getChat();
  log_this("Boas vindas a usuário no grupo " + newGroup.name);
  return await client.sendMessage(newGroup.id,_serialized, 'Olha, ele entrou no grupo mesmo');
})

client.on('group_leave', async (e) => {
  const newGroup = await e.getChat();
  log_this("Adeus a usuário no grupo " + newGroup.name);
  return await client.sendMessage(newGroup.id._serialized, 'Saiu porque viu o tamanho da minha pica');
})