const data = require('./data/data.json');
const prompts = require('./data/prompts.json');
const { client } = require('../connections');
const { getCommand } = require('./utils/functions');
const { start, abreRodada, pegaProximaRodada, publicaRodada, verificaRodada } = require('./admin');
const { getRanking, habilitaPalpite, listaPalpites } = require('./user');

const bolao = async (m) => {
  if (m.author === process.env.BOT_OWNER && m.body.startsWith('!bolao')) {
    const command = getCommand(m.body);
    const grupo = m.from.split('@')[0];
    if (command && command.startsWith('start')) {
      console.info('Acessando comando !bolao start');
      const searchedTeam = new RegExp(command.substring(5).trimStart(), "gi");
      const team = data.teams.find((team) => team.name.match(searchedTeam) || team.slug.match(searchedTeam));
      if (!team) {
        let teamList = prompts.bolao.no_team
        data.teams.forEach((t) => teamList += `\n▪ ${t.name}`)
        return m.reply(teamList);
      }
      if (data[grupo] && data[grupo][team.slug]) return m.reply(prompts.bolao.active_bolao);
      return await start({ grupo: m.from, team: team });
    };
    if (command && command.startsWith('restart')) {
      console.info('Acessando comando !bolao restart');
      return verificaRodada(m);
    }
    return;
  }
  if (!Object.keys(data).some((key) => key === m.from)) return;
  if (m.hasQuotedMsg && Object.hasOwn(data[m.from], 'activeRound') && data[m.from].activeRound.listening) {
    const isTopic = await m.getQuotedMessage();
    const matchingRegex = isTopic.body.match(/partida:\s\d+/);
    if (isTopic && isTopic.fromMe && matchingRegex) {
      const sender = await m.getContact(m.from);
      const matchId = matchingRegex[0].split(':')[1].trim();
      if (data[m.from].activeRound.matchId === Number(matchId)
        && data[m.from].activeRound.listening) {
        if (data[m.from].activeRound.palpiteiros.some((p) => p === m.author)) return m.reply('Já palpitou pô')
        const check = habilitaPalpite({ m: m, user: sender.pushname || sender.name, matchId: matchId })
        return check.error ? m.reply('Esse palpite não é válido') : m.react('🎟');
      }
      return m.reply('Essa rodada não está ativa!');
    }
    return;
  }
  if (m.body.startsWith('!palpites') && data[m.from].activeRound && data[m.from].activeRound.listening) {
    console.info('Acessando comando !palpites');
    const palpiteList = listaPalpites(m.from);
    return client.sendMessage(m.from, palpiteList);
  };
  if (m.body.startsWith('!ranking')) {
    console.info('Acessando comando !ranking');
    const ranking = getRanking(m.from)
    client.sendMessage(m.from, ranking);
  }
  return;
}

module.exports = {
  bolao,
};