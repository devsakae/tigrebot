const { fetchWithParams } = require('../../utils');
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

module.exports = {
  predictions,
};
