const prompts = require('./data/prompts.json');
const { start, verificaRodada } = require('./admin');
const { client } = require('../connections');
const { getRanking, habilitaPalpite, listaPalpites } = require('./user');

const bolao_mongodb = async (m) => {
  if (m.from === process.env.BOT_OWNER) {
    if (m.body.startsWith('!start bolao')) {
      console.info('Acessando comando !start bolao');
      return await start(m);
    };
    if (m.body.startsWith('!restart bolao')) {
      console.info('Acessando comando !restart bolao');
      return verificaRodada(m);
    }
    return;
  }
  if (m.hasQuotedMsg) {
    const isTopic = await m.getQuotedMessage();
    const matchingRegex = isTopic.body.match(/\d+$/);
    if (isTopic && isTopic.fromMe && matchingRegex) {
      const sender = await m.getContact(m.from);
      const collection = m.to.split('@')[0];
      const matchId = matchingRegex[0].split(':')[1].trim();
      if (data[m.from].activeRound.matchId === Number(matchId)) {
        if (data[m.from].activeRound.palpiteiros.some((p) => p === m.author)) return m.reply('Já palpitou pô')
        const check = habilitaPalpite({ m: m, user: sender.pushname || sender.name, matchId: matchId })
        return check.error ? m.reply('Esse palpite não é válido') : m.react('🎟');
      }
      return m.reply('Essa rodada não está ativa!');
    }
    return;
  }
  // if (m.body.startsWith('!palpites') && data[m.from].activeRound && data[m.from].activeRound.listening) {
  //   console.info('Acessando comando !palpites');
  //   const palpiteList = listaPalpites(m.from);
  //   return client.sendMessage(m.from, palpiteList);
  // };
  // if (m.body.startsWith('!ranking')) {
  //   console.info('Acessando comando !ranking');
  //   const ranking = getRanking(m.from)
  //   client.sendMessage(m.from, ranking);
  // }
  return;
}

module.exports = {
  bolao_mongodb,
};