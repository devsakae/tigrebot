const { fetchWithParams, fetchApi } = require('../../utils');
const data = require('../bolao/data/data.json');

const predictions = async (m) => {
  const thisBolao = data[m.from];
  if (!thisBolao) return { message: 'Nenhum bolão ativo no momento.' };
  if (!thisBolao.activeRound.listening) return { message: 'Nenhuma rodada ativa no momento.' };
  const nextMatch = thisBolao[thisBolao.activeRound.team.slug][today.getFullYear()][thisBolao.activeRound.matchId];
  const today = new Date();
  if (nextMatch && Object.hasOwn(nextMatch, 'predictions')) return { message: nextMatch.predictions };
  try {
    const getPredictions = await fetchWithParams({
      url: process.env.FOOTBALL_API_URL + '/predictions',
      host: process.env.FOOTBALL_API_HOST,
      params: { fixture: thisBolao.activeRound.matchId },
    });
    const superStats = formatPredicts(getPredictions.response[0]);
    thisBolao[thisBolao.activeRound.team][today.getFullYear()][
      thisBolao.activeRound.matchId
    ].predictions = superStats;
    writeData(data);
    return { message: superStats };
  } catch (err) {
    console.error(err);
    return { error: true, message: err };
  }
};

const atualizaRodada = async (m) => {
  const rodada = m.body.split(' ')[1].trim();
  if (!rodada || rodada.length < 1) return { message: 'Você precisa especificar qual rodada (ex.: !atualiza 24)' }
  const changeMe = {
    leagueId: 390,
    seasonId: 49058
  }
  try {
    const getRodada = await fetchApi({
      url: process.env.FOOTAPI7_URL + '/tournament/' + changeMe.leagueId + '/season/' + changeMe.seasonId + '/matches/round/' + Number(rodada),
      host: process.env.FOOTAPI7_HOST,
    });
    if (getRodada.events.length < 1) return { message: 'Nenhuma rodada encontrada na API. Favor verificar com admin' };
    let response = `👁 Resultados da ${rodada}ª rodada da Série B 2023\n`;
    getRodada.events.forEach((r) => {
      if (r.status.code === 100) {
        const matchDate = new Date(r.startTimestamp * 1000);
        response += `\n[${matchDate.toLocaleDateString('pt-br')}] ${r.homeTeam.name} ${Number(r.homeScore.current)} x ${Number(r.awayScore.current)} ${r.awayTeam.name} 👉 (1ºT) ${Number(r.homeScore.period1)}-${Number(r.awayScore.period1)}, (2ºT) ${Number(r.homeScore.period1)}-${Number(r.awayScore.period1)}`
      }
    })
    return { message: response };
  } catch (err) {
    console.error(err);
    return { error: true, message: err};
  }
}

module.exports = {
  predictions,
  atualizaRodada,
};
