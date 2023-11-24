const data = require('./data/data.json');
const config = require('../../data/tigrebot.json');
const { saveLocal } = require('../../utils')
const { writeData } = require('./utils/fileHandler');
const { mongoclient, client } = require('../connections');
const { sendAdmin } = require('./utils/functions');

const habilitaPalpite = async (info) => {
  const today = new Date();
  const regex = /\d+\s*[x]\s*\d+/i;
  if (!info.m.body.match(regex)) return { error: 'Palpite inválido' };
  const homeScore = info.m.body.match(regex)[0].match(/^\d+/i);
  const awayScore = info.m.body.match(regex)[0].match(/\d+$/i);
  const palpiPack = {
    date: today.toLocaleString('pt-br'),
    userId: info.m.author,
    userName: info.user,
    homeScore: Number(homeScore),
    awayScore: Number(awayScore),
    resultado:
      Number(homeScore) > Number(awayScore)
        ? 'V'
        : Number(homeScore) < Number(awayScore)
          ? 'D'
          : 'E',
    goal_diff: Number(homeScore) - Number(awayScore),
    goal_total: Number(homeScore) + Number(awayScore),
  };
  config.grupos[info.m.from].palpiteiros.push(info.m.author);
  saveLocal(config);
  try {
    mongoclient.db(info.group).collection(info.matchId).insertOne(palpiPack);
  } catch (err) {
    return { error: 'Erro na conexão com o MongoDB' };
  } finally {
    return { error: false };
  }
};

const listaPalpites = async () => {
  const matchId = JSON.stringify(config.bolao.nextMatch.id);
  try {
    Object.keys(config.grupos).forEach(async (group) => {
      let list = '📢 Lista de palpites registrados:\n';
      const palpitesNaDatabase = await mongoclient
        .db(group.split('@')[0])
        .collection(matchId)
        .find()
        .toArray();
      if (palpitesNaDatabase.length === 0) {
        list += '\nAbsolutamente nenhum 🦗   🦗       🦗';
        return client.sendMessage(group, list);
      }
      palpitesNaDatabase.forEach((p) => list += `\n▪ ${p.homeScore} x ${p.awayScore} - ${p.userName}`)
      return client.sendMessage(group, list)
    })
  } catch (err) {
    console.error(err);
    return sendAdmin(err);
  }
};

const getRanking = (grupo) => {
  data[grupo][data[grupo].activeRound.team.slug].ranking.sort((a, b) =>
    a.pontos < b.pontos ? 1 : a.pontos > b.pontos ? -1 : 0,
  );
  writeData(data);
  let response = `🏆🏆 *Ranking do Bolão* 🏆🏆\n`;
  data[grupo][data[grupo].activeRound.team.slug].ranking.forEach((pos, idx) => {
    if (idx === 3) response += '\n🔝 🔝 🔝 🔝 🔝 🔝 🔝 🔝 🔝 🔝 🔝 🔝';
    if (pos.pontos < 1)
      response += '\n\nCertificado de participação no bolão:\n';
    const medal =
      idx === 0
        ? '🥇 '
        : idx === 1
          ? '🥈 '
          : idx === 2
            ? '🥉 '
            : `${idx + 1}º - `;
    pos.pontos > 0
      ? (response += `\n${medal}${pos.usuario} [${pos.pontos} ponto${pos.pontos > 1 ? 's' : ''
        }]`)
      : (response += `\n🎗 ${pos.usuario}`);
  });
  return response;
};

module.exports = {
  habilitaPalpite,
  listaPalpites,
  getRanking,
};
