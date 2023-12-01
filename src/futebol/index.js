const { MessageMedia } = require('whatsapp-web.js');
const { fetchWithParams, fetchApi } = require('../../utils');
const data = require('../bolao/data/data.json');
const { client, criciuma } = require('../connections');
const { variosAtletas, umAtleta, organizaFestinha } = require('./utils/functions');
const { sendTextToGroups, sendTextToChannels, sendMediaUrlToChannels, sendMediaUrlToGroups } = require('../../utils/sender');
const { postTweet } = require('../../utils/twitter');

// const predictions = async (m) => {
//   const thisBolao = data[m.from];
//   if (!thisBolao) return { message: 'Nenhum bolão ativo no momento.' };
//   if (!thisBolao.activeRound.listening) return { message: 'Nenhuma rodada ativa no momento.' };
//   const nextMatch = thisBolao[thisBolao.activeRound.team.slug][today.getFullYear()][thisBolao.activeRound.matchId];
//   const today = new Date();
//   if (nextMatch && Object.hasOwn(nextMatch, 'predictions')) return { message: nextMatch.predictions };
//   try {
//     const getPredictions = await fetchWithParams({
//       url: process.env.FOOTBALL_API_URL + '/predictions',
//       host: process.env.FOOTBALL_API_HOST,
//       params: { fixture: thisBolao.activeRound.matchId },
//     });
//     const superStats = formatPredicts(getPredictions.response[0]);
//     thisBolao[thisBolao.activeRound.team][today.getFullYear()][
//       thisBolao.activeRound.matchId
//     ].predictions = superStats;
//     writeData(data);
//     return { message: superStats };
//   } catch (err) {
//     console.error(err);
//     return { error: true, message: err };
//   }
// };

// const atualizaRodada = async (m) => {
//   const rodada = m.body.split(' ')[1].trim();
//   if (!rodada || rodada.length < 1) return { message: 'Você precisa especificar qual rodada (ex.: !atualiza 24)' }
//   const changeMe = {
//     leagueId: 390,
//     seasonId: 49058
//   }
//   try {
//     const getRodada = await fetchApi({
//       url: process.env.FOOTAPI7_URL + '/tournament/' + changeMe.leagueId + '/season/' + changeMe.seasonId + '/matches/round/' + Number(rodada),
//       host: process.env.FOOTAPI7_HOST,
//     });
//     if (getRodada.events.length < 1) return { message: 'Nenhuma rodada encontrada na API. Favor verificar com admin' };
//     let response = `👁 Resultados da ${rodada}ª rodada da Série B 2023\n`;
//     getRodada.events.forEach((r) => {
//       if (r.status.code === 100) {
//         const matchDate = new Date(r.startTimestamp * 1000);
//         response += `\n[${matchDate.toLocaleDateString('pt-br')}] ${r.homeTeam.name} ${Number(r.homeScore.current)} x ${Number(r.awayScore.current)} ${r.awayTeam.name} 👉 (1ºT) ${Number(r.homeScore.period1)}-${Number(r.awayScore.period1)}, (2ºT) ${Number(r.homeScore.period1)}-${Number(r.awayScore.period1)}`
//       }
//     })
//     return { message: response };
//   } catch (err) {
//     console.error(err);
//     return { error: true, message: err };
//   }
// }

const calculaIdade = (date) => {
  const formattedDate = date.split('/');
  const birthdateTimeStamp = new Date(
    formattedDate[2],
    formattedDate[1],
    formattedDate[0],
  );
  const currentDate = new Date().getTime();
  const difference = currentDate - birthdateTimeStamp;
  const currentAge = Math.floor(difference / 31557600000);
  return currentAge;
};


const jogounotigre = async (m) => {
  const content = m.body.substring(m.body.indexOf(' ')).trim();
  const atletasDoTigre = await criciuma
    .collection('atletas')
    .find({
      $or: [
        { 'nickname': { $regex: content, $options: 'i' } },
        { 'name': { $regex: content, $options: 'i' } }
      ]
    })
    .toArray();
  if (atletasDoTigre.length > 1) return client.sendMessage(m.from, variosAtletas(content, atletasDoTigre))
  if (atletasDoTigre.length === 1) {
    const foto = await MessageMedia.fromUrl(atletasDoTigre[0].image);
    const caption = umAtleta(atletasDoTigre);
    return client.sendMessage(m.from, foto, { caption: caption });
  }
  return m.reply('Não que saiba ou tenha conhecimento.');
}

const jogadorDoTigreAleatorio = async () => {
  let tweet = 'Jogador do Tigre da semana: '
  const atl = await criciuma
    .collection('atletas')
    .aggregate([{ $match: { "jogos.jogounotigre": true } }, { $sample: { size: 1 } }])
    .toArray();
  const jogos = atl[0].jogos.filter(j => j.jogounotigre);
  const allClubs = atl[0].jogos.filter(j => !j.jogounotigre).reduce((acc, curr) => {
    acc.push(curr.clube)
    return acc;
  }, [])
  const clubes = [...new Set(allClubs)]
  const total = jogos.reduce((acc, curr) => {
    acc.jogos += Number(curr.jogos);
    acc.gols += Number(curr.gols);
    acc.v += Number(curr.v);
    acc.e += Number(curr.e);
    acc.d += Number(curr.d);
    return acc;
  }, { jogos: 0, gols: 0, v: 0, e: 0, d: 0 });
  const aproveitamento = (((total.v * 3) + (total.e)) / (total.jogos * 3)) * 100
  tweet += `${atl[0].nickname}!\n\nNascido em ${atl[0].birthday}, jogou ${total.jogos} partidas pelo Tigre, com aproveitamento de ${aproveitamento.toFixed(1)}%.\n\nSua última partida foi em ${jogos[0].ano}.\n\nQuer saber mais? Acesse nosso canal devsakae.tech/tigrebot`
  let response = `Você sabia que esse atleta já jogou pelo Tigre? 🐯\n\nEpisódio dessa semana: *${atl[0].nickname}* (${atl[0].position})\n\n_${atl[0].name}_ nasceu em ${atl[0].birthday} (há ${calculaIdade(atl[0].birthday)} anos, portanto) e disputou ${total.jogos} partidas pelo Criciúma Esporte Clube, tendo um aproveitamento total de ${aproveitamento.toFixed(2)}%.`;
  response += `\n\nSua última partida pelo tricolor foi por ${jogos[0].torneio} de ${jogos[0].ano}, tendo ${atl[0].nickname} disputado ${jogos[0].jogos} jogos e conquistado ${jogos[0].v} vitórias, ${jogos[0].e} empates e ${jogos[0].d} derrotas (aproveitamento de ${(((Number(jogos[0].v) * 3) + Number(jogos[0].e)) / (Number(jogos[0].jogos) * 3) * 100).toFixed(2)}%.)`
  if (clubes.length > 0) {
    response += `\n\nAlém do nosso glorioso tricolor, ${atl[0].nickname} também jogou por `
    clubes.forEach((c, i) => response += `${i === 0 ? '' : i === (clubes.length - 1) ? ' e ' : ', '}${c}${i === (clubes.length - 1) ? '.' : ''}`)
  }
  response += `\n\nHistórico completo:`
  atl[0].jogos.forEach((jogo) => {
    response += `\n\n➤ *${jogo.torneio}* (${jogo.ano})`;
    response += `\n🏟 ${jogo.jogos} ${jogo.jogos > 1 ? 'jogos' : 'jogo'} (${jogo.v}V/${jogo.e}E/${jogo.d}D) ⚽️ ${jogo.gols > 0 ? jogo.gols : 'Nenhum'} ${jogo.gols > 1 ? 'gols' : 'gol'}`
    if (!jogo.jogounotigre && jogo.clube) response += ` 👉 ${jogo.clube}`
  });
  response += '\n\nDados: meutimenarede.com.br\nScraped by @devsakae - tigrebot.devsakae.tech'
  // await postTweet(tweet);
  await sendMediaUrlToChannels({ url: atl[0].image, caption: response });
  return await sendMediaUrlToGroups({ url: atl[0].image, caption: response });
}

const aniversariantesDoDia = async (date) => {
  const today = new Date();
  const birthDate = date || today.toLocaleDateString('pt-br').substring(0, 5);
  const aniversariantes = await criciuma
    .collection('atletas')
    .find({ 'birthday': { $regex: birthDate } })
    .toArray();
  if (aniversariantes.length === 0) return;
  const texto = organizaFestinha(aniversariantes);
  sendTextToChannels(texto);
  return sendTextToGroups(texto);
}

// const fetchRandomMatch = async () => {
//   const matches = await fetchApi({
//     url: 'https://footapi7.p.rapidapi.com/api/team/1984/standings/seasons',
//     host: 'footapi7.p.rapidapi.com'
//   });
//   const randomSeasons = matches[Math.floor(Math.random() * matches.tournamentSeasons.length)].seasons;
//   console.log(randomSeasons);
//   const randomTournamentId = randomSeasons[Math.floor(Math.random() * randomSeasons.length)].id
//   console.log(randomTournamentId);
// }

module.exports = {
  // predictions,
  // atualizaRodada,
  jogounotigre,
  aniversariantesDoDia,
  jogadorDoTigreAleatorio,
};
