const config = require('../../data/tigrebot.json');
const prompts = require('../../data/prompts.json');
const { fetchWithParams, saveLocal, sendTextToGroups } = require('../../utils')
const { forMatch } = require('./utils');
const { client, db_bolao, mongoclient } = require('../connections');
const { listaPalpites } = require('./user');

const start = async (m) => {
  try {
    const season_leagues = await fetchWithParams({
      url: config.bolao.url + '/leagues',
      host: config.bolao.host,
      params: {
        team: config.bolao.id,
        current: true,
      },
    });
    if (season_leagues.response.length < 1) throw new Error(prompts.errors.no_league);
    const database_leagues = await db_bolao
      .collection('fixtures')
      .find()
      .project({ league: 1, seasons: 1 })
      .toArray();

    const team_leagues = season_leagues.response.filter(
      (item) =>
        !database_leagues.some(
          (db_item) =>
            db_item.league.id === item.league.id &&
            db_item.seasons[0].year === item.seasons[0].year,
        ),
    );
    if (team_leagues && team_leagues.length > 0) await bolao.collection('fixtures').insertMany(team_leagues);
  } catch (err) {
    console.error(prompts.errors.no_data_fetched, '\n', err);
    return await client.sendMessage(m.from, err);
  } finally {
    await client.sendMessage(m.from, prompts.bolao.start);
    return await abreRodada();
  }
};

const abreRodada = async () => {
  const nextMatch = await pesquisaProximaRodada();
  if (nextMatch) console.log('Encontrei nextMatch');
  // const nextMatch = await pegaProximaRodada();
  if (nextMatch.error) return sendTextToGroups(nextMatch.error);
  const today = new Date();
  console.log('Publicando rodada teste em 3 segundos...');
  const publicacaoProgramada = setTimeout(() => publicaRodada(), 3000);
  // const timeoutProgramado = (nextMatch.hora - today.getTime()) - (36 * 3600000)
  // const publicacaoProgramada = setTimeout(() => publicaRodada(), timeoutProgramado);
  return sendTextToGroups(`Próxima rodada será aberta em ${new Date(today.getTime() + (nextMatch.hora - today.getTime()) - (36 * 3600000))}`);
};

const pesquisaProximaRodada = async () => {
  const today = new Date();
  const getNextMatches = await bolao
    .collection('fixtures')
    .find({ next_matches: { $gte: 1 } })
    .toArray();
  if (getNextMatches.length > 0) {
    console.log('Tem nextmatch na database')
    const nextMatch = getNextMatches.find((m) => m.hora > today);
    console.log(nextMatch);
    return nextMatch;
  }
  console.log('Não tem nextmatch na database')
  return await pegaProximaRodada();
}

const pegaProximaRodada = async () => {
  try {
    const { response } = await fetchWithParams({
      url: config.bolao.url + '/fixtures',
      host: config.bolao.host,
      params: {
        team: config.bolao.id,
        next: 10,
      },
    });
    if (response.length === 0) throw new Error(prompts.errors.no_round);
    const responseTratada = response.map((item) => ({
      id: item.fixture.id,
      homeTeam: item.teams.home.name,
      awayTeam: item.teams.away.name,
      hora: Number(item.fixture.timestamp) * 1000,
      torneio: item.league.name,
      torneioId: item.league.id,
      torneioSeason: item.league.season,
      estadio: item.fixture.venue.name,
      status: item.fixture.status,
      rodada: item.league.round.match(/\d+$/gi)[0],
    }))
    // const updatePack = {
    //   id: response[0].fixture.id,
    //   homeTeam: response[0].teams.home.name,
    //   awayTeam: response[0].teams.away.name,
    //   hora: Number(response[0].fixture.timestamp) * 1000,
    //   torneio: response[0].league.name,
    //   torneioId: response[0].league.id,
    //   torneioSeason: response[0].league.season,
    //   estadio: response[0].fixture.venue.name,
    //   status: response[0].fixture.status,
    //   rodada: response[0].league.round.match(/\d+$/gi)[0],
    // }
    const forLeagues = responseTratada.map((item) => ({ id: item.id, hora: item.hora }));
    await bolao
      .collection('fixtures')
      .updateOne(
        { "league.id": response[0].league.id },
        { $set: { "next_matches": forLeagues } },
        { upsert: true }
      )
    await Promise.all(Object.keys(config.grupos).forEach(async (grupo) => {
      await mongoclient
        .db(grupo.split('@')[0])
        .collection('#fixtures')
        .insertMany(
          responseTratada,
          { upsert: true }
        )
    }))
    config.bolao.nextMatch = responseTratada[0];
    saveLocal(config);
    return responseTratada[0];
  } catch (err) {
    console.error(prompts.errors.no_data_fetched, '\n', err);
    return { error: prompts.errors.no_data_fetched };
  }
};

const publicaRodada = () => {
  const texto = forMatch(config.bolao.nextMatch);
  () => clearTimeout(encerramentoProgramado);
  config.bolao.listening = true;
  saveLocal(config);
  console.log('Encerrando rodada em 25 segundos...'); // TEST
  const encerramentoProgramado = setTimeout(() => encerraPalpite(), 25000); // TEST
  // const today = new Date();
  // const deadline = config.bolao.nextMatch.hora - today.getTime() - 600000
  // const encerramentoProgramado = setTimeout(() => encerraPalpite(), deadline);
  return sendTextToGroups(texto);
};

const encerraPalpite = async () => {
  config.bolao.listening = false;
  saveLocal(config);
  await listaPalpites();
  const hours = 3;
  const hoursInMs = hours * 3600000;
  console.info('Fechando rodada em 3 segundos');
  const programaFechamento = setTimeout(() => fechaRodada(), 3000) // TEST
  // const programaFechamento = setTimeout(() => fechaRodada(), hoursInMs);
}

const fechaRodada = async () => {
  const matchInfo = await buscaResultado();
  if (matchInfo.error) return sendTextToGroups(matchInfo.error);
  console.log('fim por enquanto');
  // console.info('Abre próxima rodada em 1 hora');
  // const preparaProximaRodada = setTimeout(() => abreRodada(grupo), 60000);
}

const buscaResultado = async (tentativa = 1) => {
  console.info('Buscando resultado da partida, aguarde...')
  if (tentativa > 5) return { error: 'Erro ao buscar resultado da partida por 5 vezes. Verifique a API.' };
  const matchInfo = await fetchWithParams({
    url: config.bolao.url + '/fixtures',
    host: config.bolao.host,
    params: {
      id: config.bolao.nextMatch.id
    },
  });
  if (matchInfo || matchInfo.response[0].fixtures.status.short === 'FT') {
    try {
      await bolao
        .collection('resultados')
        .insertOne({ [matchInfo.response[0].fixture.id]: matchInfo });
      // .updateOne({ "league.id": config.bolao.nextMatch.torneioId }, { $set: { [matchInfo.response[0].fixture.id]: matchInfo } }, { upsert: true });
    } catch (err) {
      console.error(err);
      return { error: prompts.errors.mongodb }
    } finally {
      return matchInfo;
    }
  }
  console.error(prompts.errors.will_fetch_again + tentativa);
  const fetchAgain = setTimeout(() => fechaRodada(tentativa + 1), 20 * 60000);
  return { error: prompts.errors.will_fetch_again + tentativa }
}

// const verificaRodada = async (m) => {
//   // Verifica se existe bolão cadastrado pro grupo
//   if (!Object.hasOwn(data, m.from) || !Object.hasOwn(data[m.from], 'activeRound')) return client.sendMessage(m.from, prompts.bolao.no_round);
//   if (data[m.from].activeRound.matchId) {
//     console.log('Tem matchId')
//     // Está escutando palpites? Publica rodada
//     data[m.from].activeRound.listening
//       ? await publicaRodada({ grupo: m.from, match: data[m.from][data[m.from].activeRound.team.slug][today.getFullYear()][data[m.from].activeRound.matchId] })
//       : await fechaRodada({ grupo: m.from, tentativa: 1 });
//   }
//   console.log('Preparando publicação da próxima rodada')
//   // Prepara publicação da próxima rodada
//   const today = new Date();
//   const nextMatch = await pegaProximaRodada(m.from);
//   if (nextMatch.error) return client.sendMessage(m.author, 'Bolão finalizado! Sem mais rodadas para disputa');
//   const calculatedTimeout = (nextMatch.hora - 115200000) - today.getTime();
//   const proximaRodada = setTimeout(() => abreRodada(m.from), calculatedTimeout);
//   const quandoAbre = new Date(today.getTime() + calculatedTimeout);
//   sendAdmin(`Bolão programado para abertura de rodada em ${quandoAbre.toLocaleString('pt-br')}`);
//   return client.sendMessage(m.from, `Bolão programado para abertura de rodada em ${quandoAbre.toLocaleString('pt-br')}`);
// }

module.exports = {
  start,
};
