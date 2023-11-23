const config = require('../../data/tigrebot.json');
const { start, verificaRodada } = require('./admin');
const { client } = require('../connections');
const { getRanking, habilitaPalpite, listaPalpites } = require('./user');

const bolao_mongodb = async (m) => {
  if (m.from === process.env.BOT_OWNER) {
    if (m.body === '!teste') return client.sendMessage(m.from, 'Testado.');
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
  if (m.hasQuotedMsg && config.bolao.listening) {
    const isTopic = await m.getQuotedMessage();
    const matchingRegex = isTopic.body.match(/\d+$/)[0];
    if (config.grupos[m.from].palpiteiros.includes(m.author)) return m.reply('Já palpitou pô, que que tá incomodando?');
    if (isTopic && isTopic.fromMe) {
      const sender = await m.getContact(m.author);
      if (Number(matchingRegex) === Number(config.bolao.nextMatch)) {
        const checkPalpite = habilitaPalpite({ group: m.from.split('@')[0], m: m, user: sender.pushname || sender.name || sender.shortname, matchId: matchingRegex });
        return checkPalpite.error ? m.reply(checkPalpite.error) : m.react('🎟');
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