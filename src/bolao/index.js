const data = require('./data/data.json');
const prompts = require('./data/prompts.json');
const { client } = require('../connections');
const { getCommand } = require('./utils/functions');
const apiFootball = require('./apis/api-football/index');
const footApi = require('./apis/apifoot/index');

const apiFootball = async (m) => {
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
      return await apiFootball.start({ grupo: m.from, team: team });
    };
    if (command && command.startsWith('restart')) {
      console.info('Acessando comando !bolao restart');
      const today = new Date();
      if (data[m.from].activeRound.listening) {
        return apiFootball.publicaRodada({ grupo: m.from, match: data[m.from][data[m.from].activeRound.team.slug][today.getFullYear()][data[m.from].activeRound.matchId] });
      }
      const nextMatch = await apiFootball.pegaProximaRodada(m.from);
      if (nextMatch.error) return client.sendMessage(m.author, 'Bolão finalizado! Sem mais rodadas para disputa');
      const calculatedTimeout = (nextMatch.hora - 115200000) - today.getTime();
      const proximaRodada = setTimeout(() => apiFootball.abreRodada(m.from), calculatedTimeout);
      const quandoAbre = new Date(today.getTime() + calculatedTimeout);
      return client.sendMessage(m.from, `Bolão programado para abertura de rodada em ${quandoAbre.toLocaleString('pt-br')}`);
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
        const check = apiFootball.habilitaPalpite({ m: m, user: sender.pushname || sender.name, matchId: matchId })
        return check.error ? m.reply('Esse palpite não é válido') : m.react('🎟');
      }
      return m.reply('Essa rodada não está ativa!');
    }
    return;
  }
  if (m.body.startsWith('!palpites') && data[m.from].activeRound && data[m.from].activeRound.listening) {
    console.info('Acessando comando !palpites');
    const palpiteList = apiFootball.listaPalpites(m.from);
    return client.sendMessage(m.from, palpiteList);
  };
  if (m.body.startsWith('!ranking')) {
    console.info('Acessando comando !ranking');
    const ranking = apiFootball.getRanking(m.from)
    client.sendMessage(m.from, ranking);
  }
  return;
}

const footApi = async (m) => {
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
      return await footApi.start({ grupo: m.from, team: team });
    };
    if (command && command.startsWith('restart')) {
      console.info('Acessando comando !bolao restart');
      const today = new Date();
      if (data[m.from].activeRound.listening) {
        return footApi.publicaRodada({ grupo: m.from, match: data[m.from][data[m.from].activeRound.team.slug][today.getFullYear()][data[m.from].activeRound.matchId] });
      }
      const nextMatch = await footApi.pegaProximaRodada(m.from);
      if (nextMatch.error) return client.sendMessage(m.author, 'Bolão finalizado! Sem mais rodadas para disputa');
      const calculatedTimeout = (nextMatch.hora - 115200000) - today.getTime();
      const proximaRodada = setTimeout(() => footApi.abreRodada(m.from), calculatedTimeout);
      const quandoAbre = new Date(today.getTime() + calculatedTimeout);
      return client.sendMessage(m.from, `Bolão programado para abertura de rodada em ${quandoAbre.toLocaleString('pt-br')}`);
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
        const check = footApi.habilitaPalpite({ m: m, user: sender.pushname || sender.name, matchId: matchId })
        return check.error ? m.reply('Esse palpite não é válido') : m.react('🎟');
      }
      return m.reply('Essa rodada não está ativa!');
    }
    return;
  }
  if (m.body.startsWith('!palpites') && data[m.from].activeRound && data[m.from].activeRound.listening) {
    console.info('Acessando comando !palpites');
    const palpiteList = footApi.listaPalpites(m.from);
    return client.sendMessage(m.from, palpiteList);
  };
  if (m.body.startsWith('!ranking')) {
    console.info('Acessando comando !ranking');
    const ranking = footApi.getRanking(m.from)
    client.sendMessage(m.from, ranking);
  }
  return;
}

module.exports = {
  apiFootball,
  footApi
};