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
    torneioId: config.bolao.nextMatch.torneioId,
    torneioSeason: config.bolao.nextMatch.torneioSeason,
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
    pontos: 0,
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

const getMongoPalpites = async () => {
  const matchId = JSON.stringify(config.bolao.nextMatch.id);
  const listaDePalpites = await Promise.all(Object.keys(config.grupos)
    .map(async (group) => {
      const lista = await mongoclient
        .db(group.split('@')[0])
        .collection(matchId)
        .find()
        .toArray();
      return { group, lista };
    }))
  return listaDePalpites;
}

const listaPalpites = async (matchId = config.bolao.nextMatch.id) => {
  if (!matchId) return 'Não foi possível buscar os palpites da rodada. Verifique com o admin.\n\nERROR: NO_MATCHID';
  const listaDePalpites = await getMongoPalpites();
  const organizado = listaDePalpites.map((item) => {
    let message = `Lista de palpites (partida id ${matchId})\n`;
    item.lista.forEach((palpite) => message += `\n▪️ ${palpite.homeScore} x ${palpite.awayScore} - ${palpite.userName}`)
    return { group: item.group, message }
  })
  return organizado;
};

const calculaRankingDaPartida = async (matchId = config.bolao.nextMatch.id) => {
  if (!matchId) return 'Não fio possível calcular o ranking da partida. Verifique com o admin.\n\nERROR: NO_MATCHID';

  const listaDePalpites = await getMongoPalpites();
  listaDePalpites.forEach((item) => {
    let ranking = [];
    // item = [{ group: '1234423@.g.us', list: [{ id: 34423432, userName: 'Rodrigo', homeScore: 0, awayScore: 2 }] }]
    item.lista.forEach((p) => {
      let pontos = 0;

    })
    ranking.sort((a, b) => a.pontos > b.pontos ? -1 : 1);
    console.log(ranking);
    return { group, ranking }
  })
  // let pontos = 0;
  //     if (p.resultado === resultado) pontos = 1;
  //     if (
  //       p.resultado === resultado &&
  //       (p.homeScore === homeScore || p.awayScore === awayScore)
  //     )
  //       pontos = 2;
  //     if (p.homeScore === homeScore && p.awayScore === awayScore) pontos = 3;
  //     const playerIdx = data[grupo][data[grupo].activeRound.team.slug].ranking.findIndex(
  //       (player) => player.id === p.userId,
  //     );
  //     playerIdx < 0
  //       ? data[grupo][data[grupo].activeRound.team.slug].ranking.push({
  //         id: p.userId,
  //         usuario: p.userName,
  //         pontos: pontos,
  //       })
  //       : (data[grupo][data[grupo].activeRound.team.slug].ranking[playerIdx].pontos += pontos);
  //     return { ...p, pontos: pontos };
}

const getRanking = async () => {
  return;
  // let response = `🏆🏆 *Ranking do Bolão* 🏆🏆\n`;

  data[grupo][data[grupo].activeRound.team.slug].ranking.forEach((pos, idx) => {
    if (idx === 3) response += '\n🔝 🔝 🔝 🔝 🔝 🔝 🔝 🔝 🔝 🔝';
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
  getMongoPalpites,
};
