const config = require('../../data/tigrebot.json');
const prompts = require('../../data/prompts.json');
const { fetchWithParams, saveLocal, sendTextToGroups } = require('../../utils')
const { forMatch, sendAdmin } = require('./utils');
const { client, bolao } = require('../connections');
const { listaPalpites } = require('./user');
const { calculaRanking } = require('../bolao/utils/functions');

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
    const database_leagues = await bolao
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
    return client.sendMessage(m.from, prompts.errors.no_data_fetched);
  } finally {
    sendTextToGroups(prompts.bolao.start);
    return await abreRodada();
  }
};

const abreRodada = async () => {
  const nextMatch = await pegaProximaRodada();
  if (nextMatch.error) return sendTextToGroups(nextMatch.error);
  const today = new Date();
  console.log('Publicando rodada teste em 3 segundos...');
  const publicacaoProgramada = setTimeout(() => publicaRodada(), 3000);
  const timeoutProgramado = (nextMatch.hora - today.getTime()) - (36 * 3600000)
  // const publicacaoProgramada = setTimeout(() => publicaRodada(), timeoutProgramado);
  return sendTextToGroups(`Próxima rodada será aberta em ${new Date(today.getTime() + (nextMatch.hora - today.getTime()) - (36 * 3600000))}`);
};

const pegaProximaRodada = async () => {
  try {
    const { response } = await fetchWithParams({
      url: config.bolao.url + '/fixtures',
      host: config.bolao.host,
      params: {
        team: config.bolao.id,
        next: 2,
      },
    });
    if (response.length === 0) return { error: prompts.errors.no_round };
    const updatePack = {
      id: response[0].fixture.id,
      homeTeam: response[0].teams.home.name,
      awayTeam: response[0].teams.away.name,
      hora: Number(response[0].fixture.timestamp) * 1000,
      torneio: response[0].league.name,
      torneioId: response[0].league.id,
      torneioSeason: response[0].league.season,
      estadio: response[0].fixture.venue.name,
      status: response[0].fixture.status,
      rodada: response[0].league.round.match(/\d+$/gi)[0],
    }
    await bolao
      .collection('fixtures')
      .updateOne(
        { "league.id": response[0].league.id },
        {
          $push:
            { "next_matches": updatePack }
        }
      )
    config.bolao.nextMatch = updatePack;
    saveLocal(config);
    return updatePack;
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
  console.log('Start fetching palpites')
  await listaPalpites();  
  return console.log('End fetching palpites');
  // const programaFechamento = setTimeout(() => fechaRodada(), 25000) // TEST
  // const hours = 3;
  // const hoursInMs = hours * 3600000;
  // const programaFechamento = setTimeout(() => fechaRodada(), hoursInMs);
}

const fechaRodada = async () => {
  const matchInfo = await buscaResultado();
  if (matchInfo.error) return sendTextToGroups(matchInfo.error);
  console.log('fim por enquanto');
  // Object.keys(config.grupos).forEach((grupo) => calculaRanking(matchInfo, grupo));

  // console.info('Abre próxima rodada em 1 hora');
  // const preparaProximaRodada = setTimeout(() => abreRodada(grupo), 60000);
  // data[grupo][data[grupo].activeRound.team.slug][today.getFullYear()][data[grupo].activeRound.matchId] = {
  //   ...data[grupo][data[grupo].activeRound.team.slug][today.getFullYear()][data[grupo].activeRound.matchId],
  //   ranking: response,
  //   palpites: rankingDaRodada,
  // };
  // data[grupo].activeRound = {
  //   ...data[grupo].activeRound,
  //   matchId: null,
  //   palpiteiros: []
  // };
  // writeData(data);
  // return client.sendMessage(grupo, response);
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
        .collection('fixtures')
        .updateOne({ "league.id": config.bolao.nextMatch.torneioId }, { $set: { [matchInfo.response[0].fixture.id]: matchInfo } }, { upsert: true });
    } catch (err) {
      console.error(err);
      return { error: prompts.errors.mongodb }
    } finally {
      return matchInfo
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
