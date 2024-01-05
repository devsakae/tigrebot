const { MessageMedia } = require('whatsapp-web.js');
const { fetchWithParams, fetchApi } = require('../../utils');
const data = require('../bolao/data/data.json');
const mongodb = require('mongodb');
const { client, criciuma } = require('../connections');
const { variosAtletas, umAtleta, organizaFestinha, headToHead, formataJogo, jogoDeHoje, jogoDestaqueDoDia } = require('./utils/functions');
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
    response += `\n\nAlém do nosso glorioso tricolor, ${atl[0].nickname} também jogou contra o Criciúma vestindo a(s) camisa(s) de `
    clubes.forEach((c, i) => response += `${i === 0 ? '' : i === (clubes.length - 1) ? ' e ' : ', '}${c}${i === (clubes.length - 1) ? '.' : ''}`)
  }
  response += `\n\nHistórico completo:`
  atl[0].jogos.forEach((jogo) => {
    response += `\n\n➤ *${jogo.torneio}* (${jogo.ano})`;
    response += `\n🏟 ${jogo.jogos} ${jogo.jogos > 1 ? 'jogos' : 'jogo'} (${jogo.v}V/${jogo.e}E/${jogo.d}D) ⚽️ ${jogo.gols > 0 ? jogo.gols : 'Nenhum'} ${jogo.gols > 1 ? 'gols' : 'gol'}`
    if (!jogo.jogounotigre && jogo.clube) response += ` 👉 ${jogo.clube}`
  });
  response += '\n\nDados: meutimenarede.com.br\nScraped by @devsakae - tigrebot.devsakae.tech'
  
  await postTweet(tweet);
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

const adversarios = async (m) => {
  const search = m.body.substring(m.body.split(" ")[0].length).trim()
  const findCom = search.substring(search.length - 2).match(/[A-Z]{2}/)
    ? {
      $and: [
        { 'adversario': { $regex: search.substring(0, search.length - 2).trim(), $options: 'i' } },
        { 'uf': { $regex: search.substring(search.length - 2).match(/[A-Z]{2}/)[0], $options: 'i' } }
      ]
    }
    : { 'adversario': { $regex: search, $options: 'i' } };
  const response = await criciuma
    .collection('jogos')
    .find(findCom)
    .toArray();
  if (response.length === 0) return m.reply(`Nenhum time encontrado! Digitou certo mesmo? É _${search}_ mesmo que fala?\n\nLembre-se, eu sou um bot e nunca erro, já você... É direto...\n\nps.: Ah sim, pode ser que o Criciúma nunca tenha jogado contra o ${search} também.`);
  if (response.length > 1) {
    let moreThanOne = `Encontrei mais de 1 ${search}. Qual você deseja? Use o comando correto:\n`
    response.map(t => moreThanOne += `\n‣ !jogos ${t.adversario} ${t.uf}`);
    return m.reply(moreThanOne);
  }
  const t = response[0];
  const aproveitamento = headToHead(t.resumo);
  let texto = `Histórico completo de Criciúma 🐯 _vs_ ${t.adversario} (${t.uf})\n`;
  texto += `\n⚽️ Jogos: ${t.resumo.j}`;
  texto += `\n✅ Vencemos: ${t.resumo.v}`;
  texto += `\n⏺ Empatamos: ${t.resumo.e}`;
  texto += `\n❌ Perdemos: ${t.resumo.d}`;
  texto += `\n👉 Aproveitamento: ${aproveitamento}%`;
  texto += `\n\nEu tenho ${t.jogos.length} jogos cadastrados (divididos em lotes de 20):\n`
  const logo = await MessageMedia.fromUrl(t.logo);
  if (t.jogos.length < 20) {
    t.jogos.map((j, i) => texto += `\n∙ ${j.homeTeam} ${j.homeScore} x ${j.awayScore} ${j.awayTeam}\n ${j.campeonato} ${j.date.substring(j.date.length - 4)}\n ${t._id}-${i}\n`)
    return await client.sendMessage(m.from, logo, { caption: texto });
  }
  await client.sendMessage(m.from, logo, { caption: texto });
  const partes = Math.floor(t.jogos.length / 20) + 1
  let auxi = 0;
  for (let i = 0; i < t.jogos.length; i + 20) {
    let textofull = `Parte ${(auxi / 20) + 1}/${partes}\n`;
    t.jogos.splice(i, i + 20).map((j, id) => textofull += `\n∙ ${j.homeTeam} ${j.homeScore} x ${j.awayScore} ${j.awayTeam}\n ${j.campeonato} ${j.date.substring(j.date.length - 4)}\n ${t._id}-${id + auxi + 1}\n`)
    auxi += 20;
    await client.sendMessage(m.from, textofull);
  }
  return;
}

const partida = async (m) => {
  const query = m.body.substring(m.body.split(" ")[0].length).trim().split("-");
  const teamId = new mongodb.ObjectId(query[0]);
  const matchIdx = Number(query[1]) - 1
  const response = await criciuma
    .collection("jogos")
    .find({ _id: teamId }, { $projection: { "jogos": 1 } })
    .toArray();
  const texto = formataJogo(response[0].jogos[matchIdx]);
  return await client.sendMessage(m.from, texto);
}

const fetchJogosDe = async (data) => {
  const today = new Date();
  const thisDay = ('0' + today.getDate()).slice(-2) + '/' + ('0' + (today.getMonth() + 1)).slice(-2)
  try {
    const response = await criciuma
      .collection('jogos')
      .find({ "jogos.date": { $regex: thisDay, $options: "i" } })
      .toArray();
    if (response.length === 0) throw new Error('Nenhum time encontrado');
    const team = response[Math.floor(Math.random() * response.length)];
    let match = team.jogos.filter(m => m.date.includes(thisDay));
    match = match.length > 1 ? match[Math.floor(Math.random() * match.length)] : match[0];
    return { match, team };
  } catch (err) {
    console.error(err);
    return;
  }
}

const publicaJogoAleatorio = async () => {
  const today = new Date();
  const response = await fetchJogosDe(today);
  if (response) {
    const texto = await jogoDestaqueDoDia({ jogo: response.match, time: response.team });
    await sendTextToChannels(texto);
    return await sendTextToGroups(texto);
  }
  console.info('Nenhum jogo hoje!');
}

const jogoDeHojeNaHistoria = async () => {
  const today = new Date();
  const response = await fetchJogosDe(today);
  if (response) {
    const texto = await jogoDestaqueDoDia({ jogo: response.match, time: response.team });
    return texto
  }
  return '';
}

module.exports = {
  jogounotigre,
  aniversariantesDoDia,
  jogadorDoTigreAleatorio,
  adversarios,
  partida,
  publicaJogoAleatorio,
  jogoDeHojeNaHistoria,
};
