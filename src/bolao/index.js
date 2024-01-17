const config = require('../../data/tigrebot.json');
const { client } = require('../connections');
const { habilitaPalpite, listaPalpites } = require('./user');

const bolao = async (m) => {
  // if ((m.author === process.env.BOT_OWNER || m.from === process.env.BOT_OWNER) && m.body.startsWith("!bolao")) {
  //   const msg = m.body.split(" ")
  //   if (msg[1].startsWith("start")) {

  //   }
  // }
  if (m.hasQuotedMsg && config.bolao.listening) {
    const isTopic = await m.getQuotedMessage();
    if (!isTopic.fromMe) return;
    const matchingRegex = isTopic.body.match(/\d+$/)[0];
    if (config.grupos[m.from].palpiteiros.includes(m.author)) return m.reply('Já palpitou pô, que que tá incomodando?');
    if (isTopic) {
      const sender = await m.getContact(m.author);
      if (Number(matchingRegex) === Number(config.bolao.nextMatch.id)) {
        const checkPalpite = habilitaPalpite({ group: m.from.split('@')[0], m: m, user: sender.pushname || sender.name || sender.shortname, matchId: matchingRegex });
        return checkPalpite.error ? m.reply(checkPalpite.error) : m.react('🎟');
      }
      return m.reply('Essa rodada não está ativa!');
    }
    return;
  }
  if (m.body.startsWith('!palpites')) {
    console.info('Acessando comando !palpites');
    const palpiteList = await listaPalpites();
    palpiteList.forEach((pl) => client.sendMessage(pl.group, pl.message));
    return;
  };
  // if (m.body.startsWith('!ranking')) {
  //   console.info('Acessando comando !ranking');
  //   const ranking = getRanking(m.from)
  //   client.sendMessage(m.from, ranking);
  // }
  return;
}

module.exports = {
  bolao,
};