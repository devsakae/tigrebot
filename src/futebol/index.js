const { MessageMedia } = require('whatsapp-web.js');
const { fetchWithParams, fetchApi } = require('../../utils');
const data = require('../bolao/data/data.json');
const { client, canais } = require('../connections');
const { variosAtletas, umAtleta, organizaFestinha } = require('./utils/functions');
const { groupSendText } = require('../../utils/sender');

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
    return { error: true, message: err };
  }
}

const jogounotigre = async (m) => {
  const content = m.body.substring(m.body.indexOf(' ')).trim();
  const atletasDoTigre = await canais
    .collection('atletas')
    .find({
      $or: [
        { 'nickname': { $regex: content, $options: 'i' } },
        { 'name': { $regex: content, $options: 'i' } }
      ]
    })
    .toArray();
  if (atletasDoTigre.length > 1) return client.sendMessage(m.from, variosAtletas(atletasDoTigre))
  if (atletasDoTigre.length === 1) {
    const foto = await MessageMedia.fromUrl(atletasDoTigre[0].image);
    const caption = umAtleta(atletasDoTigre);
    return client.sendMessage(m.from, foto, { caption: caption });
  }
  return m.reply('Não que saiba ou tenha conhecimento...');
}

const aniversariantesDoDia = async (date) => {
  const today = new Date();
  const birthDate = date || today.toLocaleDateString('pt-br').substring(0, 5);
  console.log('Procurando atletas com aniversário em', birthDate);
  const aniversariantes = await canais
    .collection('atletas')
    .find({ 'birthday': { $regex: birthDate }})
    .toArray();
  if (aniversariantes.length === 0) return;
  const texto = organizaFestinha(aniversariantes);
  return groupSendText(texto);
}

module.exports = {
  predictions,
  atualizaRodada,
  jogounotigre,
  aniversariantesDoDia,
};
