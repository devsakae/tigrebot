const { MessageMedia } = require('whatsapp-web.js');
const mongodb = require('mongodb');
const config = require('../../data/tigrebot.json');
const prompts = require('../../data/prompts.json');
const { client, criciuma } = require('../connections');
const { site_publish, fetchApi, log_erro, log_info, publicidade, postTweet, sendTextToGroups, sendMediaUrlToGroups } = require('../../utils');
const { variosAtletas, umAtleta, organizaFestinha, headToHead, formataJogo, jogoDestaqueDoDia, formataRodadaAoVivo } = require('./utils/functions');
const { default: axios } = require('axios');
const cron = require('node-cron');
const { setSubject } = require('../canal');

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
  let tweet = (config.tigrelino ? 'OMENAJE TIGRELINO P ATELTA -JOGADO DA CEMANA ' : 'Jogador do Tigre da semana: ')
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
  tweet += `${atl[0].nickname}!\n\nNascido em ${atl[0].birthday}, jogou ${total.jogos} partidas pelo Tigre, com aproveitamento de ${aproveitamento.toFixed(1)}%.\n\nSua última partida foi em ${jogos[0].ano}.\n\nQuer saber mais? Acesse nosso canal ${config.mysite}`
  let response = '';
  if (config.tigrelino) {
    response = `VOSE SABIA QESE *ATLLETA ${atl[0].nickname} JAJOGO NO* TIGRAUM EU SABIA EU Q TOCONTANO A ESTORIA DELI;`;;
    response += `\nELI TEN O TERIA ${calculaIdade(atl[0].birthday)} ANOS NAUM SEI O SACAI N BOTO SELE TA VIVO AINDA `
    response += `\n\n+ ELE FEIS ${total.jogos} JOGO PELO TIGRAUM FEIS ${aproveitamento.toFixed(2)}% DE 'aproveitamento' NAUM SEI O QE ISSO TAVA ISCRITO AKI O SACAI MANDOBOTA`
    if (clubes.length > 0) {
      response += `\n    BA ESE BIXO JAJOGO COM TRA GEMTE//// TO DI KRA JOGO CAS CAMIZA DOS TIME `
      clubes.forEach((c, i) => response += `${i === 0 ? '' : i === (clubes.length - 1) ? '....' : ', '}${c.toUpperCase()}${i === (clubes.length - 1) ? ' 🤬' : ''}`)
    }
    response += `\n\nBLS NO TIGRAUM ELE JOGO TD ISO AKI:`
    atl[0].jogos.forEach((jogo) => {
      response += `\n\n➤ *${jogo.torneio}* (${jogo.ano})`;
      response += `\n🏟 ${jogo.jogos} ${jogo.jogos > 1 ? 'JOGS' : 'PATIDA'} (${jogo.v}V/${jogo.e}E/${jogo.d}D) ⚽️ ${jogo.gols > 0 ? jogo.gols : 'SERO'} ${jogo.gols > 1 ? 'GOALS' : 'GOAL'}`
      if (!jogo.jogounotigre && jogo.clube) response += ` 👉 ${jogo.clube.toUpperCase()}`
    });
  } else {
    response = `Você sabia que esse atleta já jogou pelo Tigre? 🐯\n\nEpisódio dessa semana: *${atl[0].nickname}* (${atl[0].position})\n\n_${atl[0].name}_ nasceu em ${atl[0].birthday} (há ${calculaIdade(atl[0].birthday)} anos, portanto) e disputou ${total.jogos} partidas pelo Criciúma Esporte Clube, tendo um aproveitamento total de ${aproveitamento.toFixed(2)}%.`;
    response += `\n\nSua última partida pelo tricolor foi por ${jogos[0].torneio} de ${jogos[0].ano}, tendo ${atl[0].name} disputado ${jogos[0].jogos} jogos e conquistado ${jogos[0].v} vitórias, ${jogos[0].e} empates e ${jogos[0].d} derrotas (aproveitamento de ${(((Number(jogos[0].v) * 3) + Number(jogos[0].e)) / (Number(jogos[0].jogos) * 3) * 100).toFixed(2)}%.)`
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
  }
  response += `\n\nDados: meutimenarede.com.br\nScraped by @devsakae - ${config.devsakae}`
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
  return sendTextToGroups(texto);
}

const adversarios = async (m) => {
  const autor = await client.getContactById(m.author);
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
  if (response.length === 0) {
    const noMatchFoundAnswer = `Nenhum time encontrado! Digitou certo mesmo? É _${search}_ mesmo que fala?\n\nLembre-se, eu sou um bot e nunca erro, já você... É direto...\n\nps.: Ah sim, pode ser que o Criciúma nunca tenha jogado contra o ${search} também.`
    await site_publish(noMatchFoundAnswer, autor, m.body)
    return await m.reply(noMatchFoundAnswer);
  }
  if (response.length > 1) {
    let moreThanOne = `Encontrei mais de 1 ${search}. Qual você deseja? Use o comando correto:\n`
    response.map(t => moreThanOne += `\n‣ !jogos ${t.adversario} ${t.uf}`);
    return m.reply(moreThanOne);
  }
  const t = response[0];
  const aproveitamento = headToHead(t.resumo);
  const logo = await MessageMedia.fromUrl(t.logo);
  let texto = `Histórico completo de Criciúma 🐯 _vs_ ${t.adversario} (${t.uf})\n`;
  texto += `\n⚽️ Jogos: ${t.resumo.j}`;
  texto += `\n✅ Vencemos: ${t.resumo.v}`;
  texto += `\n⏺ Empatamos: ${t.resumo.e}`;
  texto += `\n❌ Perdemos: ${t.resumo.d}`;
  texto += `\n👉 Aproveitamento: ${aproveitamento}%`;
  if (t.jogos.length < 11) {
    texto += '\n\nListinha de jogos abaixo! Use *!matchid (id)-(jogo)* para ver mais sobre o jogo...';
    texto += `\n\nEu tenho ${t.jogos.length} jogo(s) cadastrado(s) no meu banco de dados. Segue a lista!\n`
    t.jogos.map((j, i) => texto += `\n[${i + 1}] ${j.homeTeam} ${j.homeScore} x ${j.awayScore} ${j.awayTeam}\n ${j.campeonato} ${j.date.substring(j.date.length - 4)}\n`)
    await site_publish(texto, autor, m.body);
    await client.sendMessage(m.from, logo, { caption: texto });
    return await m.reply('!matchid ' + t._id + '-x');
  }
  if (m.author === process.env.BOT_OWNER) {
    texto += '\n\nEsse admin é foda! Ele deixou todo mundo pesquisar sobre o jogo usando !matchid (mas tem que saber usar). Segue a lista de jogos:';
    if (t.jogos.length < 20) {
      t.jogos.map((j, i) => texto += `\n[${i + 1}] ${j.homeTeam} ${j.homeScore} x ${j.awayScore} ${j.awayTeam}\n ${j.campeonato} ${j.date.substring(j.date.length - 4)}\n`)
      await site_publish(texto);
      await client.sendMessage(m.from, logo, { caption: texto });
      return await m.reply("!matchid " + t._id + "-");
    }
    await site_publish(texto);
    await client.sendMessage(m.from, logo, { caption: texto });
    const partes = Math.floor(t.jogos.length / 20) + 1
    let auxi = 0;
    for (let i = 0; i < t.jogos.length; i + 20) {
      let textofull = `Parte ${auxi + 1}/${partes}\n`;
      t.jogos.splice(i, i + 20).map((j, id) => textofull += `\n[${id + 1}] ${j.homeTeam} ${j.homeScore} x ${j.awayScore} ${j.awayTeam}\n ${j.campeonato} ${j.date.substring(j.date.length - 4)}\n`)
      auxi += 20;
      await site_publish(textofull);
      await client.sendMessage(m.from, textofull);
    }
    return await m.reply('!matchid ' + t._id + '-x');
  }
  texto += `\n\nEu tenho ${t.jogos.length} jogos cadastrados, mas só o admin pode pedir para listá-los (eu sou muito caro e chique).\n`
  await site_publish(texto);
  return await client.sendMessage(m.from, logo, { caption: texto });
}

const partida = async (m) => {
  const query = m.body.substring(m.body.split(" ")[0].length).trim().split("-");
  const teamId = new mongodb.ObjectId(query[0]);
  const matchIdx = Number(query[1]) - 1
  const response = await criciuma
    .collection("jogos")
    .find({ _id: teamId }, { $projection: { "jogos": 1 } })
    .toArray();
  if (response.length === 0) return m.reply('Nenhuma partida encontrada com este ID. Digitou certo?');
  const texto = formataJogo(response[0].jogos[matchIdx]);
  await site_publish(texto);
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
    return log_erro(err);
  }
}

const publicaJogoAleatorio = async () => {
  const today = new Date();
  const response = await fetchJogosDe(today);
  if (response) {
    const texto = await jogoDestaqueDoDia({ jogo: response.match, time: response.team });
    return await sendTextToGroups(texto);
  }
  log_info('Nenhum jogo hoje!');
}

const fetchProximasPartidas = async () => {
  try {
    const { data } = await axios.request({
      method: 'GET',
      url: "https://footapi7.p.rapidapi.com/api/team/1984/matches/next/0",
      headers: {
        'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
        'X-RapidAPI-Host': "footapi7.p.rapidapi.com",
      },
    });
    if (data.events.length === 0) throw new Error('Nenhuma partida programada');
    return data.events;
  }
  catch (err) {
    log_erro(err);
    return '';
  }
}

const fetchMatchById = async id => {
  try {
    const { data } = await axios.request({
      method: 'GET',
      url: "https://footapi7.p.rapidapi.com/api/match/" + id,
      headers: {
        'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
        'X-RapidAPI-Host': "footapi7.p.rapidapi.com",
      },
    });
    if (data.event) return data.event;
    throw new Error('Nenhuma partida programada');
  }
  catch (err) {
    log_erro(err);
    return '';
  }
}

const proximaPartida = async () => {
  const res = await fetchProximasPartidas();
  let response = '';
  if (res.length > 0) {
    const match = await fetchMatchById(res[0].id);
    const dataehora = new Date(res[0].startTimestamp * 1000)
    const horadojogo = dataehora.toLocaleString('pt-br', {
      month: "long",
      day: "numeric",
      weekday: "long",
      hour: "numeric",
      minute: "numeric"
    });
    response += prompts.proximojogo[Math.floor(Math.random() * prompts.proximojogo.length)];
    response += '\n';
    response += `\n⚽️ ${res[0].homeTeam.name} x ${res[0].awayTeam.name}`;
    response += `\n🏆 ${res[0].season.name}`;
    response += `\n🗓 ${horadojogo.charAt(0).toUpperCase() + horadojogo.substring(1)}`;
    if (match) response += `\n🏟 ${match.homeTeam.venue.stadium.name} (${match.homeTeam.venue.stadium.capacity} pessoas)`;
    // const schedmatch = `${dataehora.getMinutes()} ${dataehora.getHours()} ${dataehora.getDate()} ${(dataehora.getMonth() + 1)} *`;
    // if (cron.validate(schedmatch)) {
    //   const matchStart = cron.schedule(schedmatch, () => {
    //     jogoTigrelog(res[0]);
    //   }, {
    //     scheduled: true,
    //     timezone: "America/Sao_Paulo"
    //   });
    // }
    const schedstart = '0 8 ' + dataehora.getDate() + ' ' + (dataehora.getMonth() + 1) + ' *';
    const schedstop = '15 8 ' + dataehora.getDate() + ' ' + (dataehora.getMonth() + 1) + ' *';
    if (cron.validate(schedstart)) {
      const task = cron.schedule(schedstart, async () => {
        await sendTextToGroups(response);
        await setSubject({ from: '554896059196-1392584319@g.us', body: `!titulo [${dataehora.toTimeString().substring(0,5)}] ${res[0].homeTeam.name} x ${res[0].awayTeam.name}` })
      }, {
        scheduled: true,
        timezone: "America/Sao_Paulo"
      });
      cron.schedule(schedstop, () => {
        task.stop();
        proximaPartida();
      }, {
        scheduled: true,
        timezone: "America/Sao_Paulo"
      });
    }
  }
}

const jogoTigrelog = async (jogo) => {
  const tigrelog = await client.getChatById('554896059196-1392584319@g.us');
  setTimeout(() => {
    tigrelog.setSubject(`[1ºT] ${jogo.homeTeam.name} x ${jogo.awayTeam.name}`);
  }, 10000)
  const modoLive = setInterval(async () => {
    const rodada = await jogosAoVivo();
    await client.sendMessage('554896059196-1392584319@g.us', rodada);
  }, 25 * 60 * 1000);
  setTimeout(() => {
    clearInterval(modoLive);
  }, 80 * 60 * 1000)
  return;
}

const jogosAoVivo = async () => {
  try {
    const getRodada = await fetchApi({
      url: process.env.FOOTAPI7_URL + '/matches/live',
      host: process.env.FOOTAPI7_HOST,
    });
    const liveMatches = await getRodada.events.filter((e) => e.status.type === 'inprogress').filter((e) => e.tournament.name.includes('Brasil'));
    if (liveMatches.length == 0) return 'Nenhum jogo ao vivo no momento!';
    let response = `🎙 Rádio TigreLOG faz pra você agora o GIRO DA RODADA, RODAAAAAAAA\n`;
    liveMatches.forEach((lm) => response += formataRodadaAoVivo(lm));
    return response + "\n\n" + publicidade();
  } catch (err) {
    log_erro(err);
    return err;
  }
}

module.exports = {
  jogounotigre,
  proximaPartida,
  aniversariantesDoDia,
  jogadorDoTigreAleatorio,
  adversarios,
  partida,
  publicaJogoAleatorio,
  proximaPartida,
  jogosAoVivo,
};