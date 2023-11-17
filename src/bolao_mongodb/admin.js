const config = require('./data/config.json');
const prompts = require('./data/prompts.json');
const { fetchWithParams } = require('../../utils/fetchApi');
const { client, bolao, mongoclient } = require('../connections');
const { forMatch, sendAdmin } = require('./utils/functions');

const { listaPalpites } = require('./user');

const sendAll = (msg) => config.groups.forEach((group) => client.sendMessage(group, '# TESTING # ' + msg));

const start = async (m) => {
  try {
    const season_leagues = await fetchWithParams({
      url: config.apifootball.url + '/leagues',
      host: config.apifootball.host,
      params: {
        team: config.apifootball.id,
        current: true,
      },
    });
    if (season_leagues.response.length < 1) throw new Error(prompts.errors.no_league);

    const database_leagues = await bolao
      .collection('fixtures_apifootball')
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
    if (team_leagues.length > 0) await bolao.collection('fixtures_apifootball').insertMany(team_leagues);
  } catch (err) {
    console.error(prompts.errors.no_data_fetched, '\n', err);
    return client.sendMessage(m.from, prompts.errors.no_data_fetched);
  } finally {
    await abreRodada(m);
    return sendAll(prompts.bolao.bolao_start);
  }
};

const abreRodada = async (m) => {
  const nextMatch = await pegaProximaRodada(m);
  if (nextMatch.error) return client.sendMessage(m.from, nextMatch.error);
  const today = new Date();
  const timeoutProgramado = (nextMatch.hora - today.getTime()) - (36 * 3600000)
  console.log('Publicando rodada teste em 10 segundos...');
  const publicacaoProgramada = setTimeout(() => publicaRodada(nextMatch), 10000);
  // const publicacaoProgramada = setTimeout(() => publicaRodada(nextMatch), timeoutProgramado);
  sendAll(`Abertura da próxima rodada: ${new Date(today.getTime() + (nextMatch.hora - today.getTime()) - (36 * 3600000))}`);
  return sendAdmin(`Agendamento de ${nextMatch.homeTeam} x ${nextMatch.awayTeam} (matchId ${nextMatch.id}) realizado.\n\nJogo ocorrerá em ${new Date(nextMatch.hora)} \nPublicação nos grupos em ${new Date(today.getTime() + (nextMatch.hora - today.getTime()) - (36 * 3600000))}`)
};

const pegaProximaRodada = async (m) => {
  try {
    const getNextMatches = await fetchWithParams({
      url: config.apifootball.url + '/fixtures',
      host: config.apifootball.host,
      params: {
        team: config.apifootball.id,
        next: 5,
      },
    });
    if (getNextMatches.response.length === 0) return { error: prompts.errors.no_round };
    let singleMatch;
    await getNextMatches.response.forEach((event, idx) => {
      const updatePack = {
        $set: {
          id: event.fixture.id,
          homeTeam: event.teams.home.name,
          awayTeam: event.teams.away.name,
          hora: Number(event.fixture.timestamp) * 1000,
          torneio: event.league.name,
          torneioId: event.league.id,
          estadio: event.fixture.venue.name,
          status: event.fixture.status,
          rodada: event.league.round.match(/\d+$/gi)[0],
          palpites: [],
        }
      };
      if (idx === 0) singleMatch = updatePack;
      mongoclient.db(m.from.split('@')[0]).collection('fixtures').updateOne({ id: event.fixture.id }, updatePack, { upsert: true });
    });
    return singleMatch;
  } catch (err) {
    console.error(prompts.errors.no_data_fetched, '\n', err);
    return { error: prompts.errors.no_data_fetched };
  }
};

const publicaRodada = (match) => {
  const texto = forMatch(match);
  () => clearTimeout(encerramentoProgramado);
  config.apifootball.listening = true;
  save(config);
  console.log('Encerrando rodada em 30 segundos...'); // TEST
  const encerramentoProgramado = setTimeout(() => encerraPalpite(), 30000); // TEST
  // const today = new Date();
  // const encerramentoProgramado = setTimeout(() => encerraPalpite(), (match.hora - today.getTime() - 600000));
  return sendAll(texto);
};

const encerraPalpite = () => {
  return console.log('Tempo encerrado!');
  // const today = new Date();
  // const encerramento = '⛔️⛔️ Tempo esgotado! ⛔️⛔️\n\n';
  // data[grupo].activeRound.listening = false;
  // writeData(data);
  // if (
  //   data[grupo][data[grupo].activeRound.team.slug][today.getFullYear()][
  //     data[grupo].activeRound.matchId
  //   ].palpites.length < 1
  // )
  //   return client.sendMessage(grupo, 'Ninguém palpitou nessa rodada!');
  // const listaDePalpites = listaPalpites(grupo);
  // client.sendMessage(grupo, encerramento + listaDePalpites);
  // const hours = 8; // Prazo (em horas) para buscar o resultado da partida após o encerramento dos palpites
  // const hoursInMs = hours * 3600000;
  // // const programaFechamento = setTimeout(() => fechaRodada(grupo), 5000) // TEST
  // const programaFechamento = setTimeout(() => fechaRodada({ grupo: grupo, tentativa: 1 }), hoursInMs);
  // const comunicaNovoModulo = setTimeout(
  //   () =>
  //     client.sendMessage(
  //       grupo,
  //       'Quer acompanhar a partida?\n\nDigite *!highlights* no grupo que eu publico os melhores momentos (pra quem não fala inglês)',
  //     ),
  //   10 * 60000,
  // );
};

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

// const buscaResultado = async ({ grupo, tentativa }) => {
//   const today = new Date();
//   if (tentativa > 5) return client.sendMessage(process.env.BOT_OWNER, 'Erro ao buscar resultado da partida. Verifique a API.');
//   const matchInfo = await fetchWithParams({
//     url: process.env.FOOTBALL_API_URL + '/fixtures',
//     host: process.env.FOOTBALL_API_HOST,
//     params: {
//       id: data[grupo].activeRound.matchId,
//     },
//   });
//   if (!matchInfo || matchInfo.response[0].fixture.status.short !== 'FT') {
//     console.error('Fetch não realizado, será feita a tentativa n.', tentativa);
//     const fetchAgain = setTimeout(() => fechaRodada({ grupo: grupo, tentativa: tentativa + 1 }), 45 * 60000);
//     if (tentativa === 1) return { error: true }
//     return;
//   }
//   data[grupo][data[grupo].activeRound.team.slug][today.getFullYear()][data[grupo].activeRound.matchId].matchInfo = matchInfo;
//   writeData(data);
//   return matchInfo
// }

// const fechaRodada = async ({ grupo, tentativa }) => {
//   const matchInfo = await buscaResultado({ grupo: grupo, tentativa: tentativa })
//   if (matchInfo.error) return client.sendMessage(
//     grupo,
//     'Erro ao buscar resultado final da partida ' + data[grupo].activeRound.matchId + '. Será feita nova busca em alguns minutos.'
//   );
//   let response;
//   const today = new Date();
//   const homeScore = Number(matchInfo.response[0].goals.home);
//   const awayScore = Number(matchInfo.response[0].goals.away);
//   const resultado =
//     homeScore > awayScore ? 'V' : homeScore < awayScore ? 'D' : 'E';
//   const rankingDaRodada = data[grupo][data[grupo].activeRound.team.slug][
//     today.getFullYear()
//   ][data[grupo].activeRound.matchId].palpites
//     .map((p) => {
//       let pontos = 0;
//       if (p.resultado === resultado) pontos = 1;
//       if (
//         p.resultado === resultado &&
//         (p.homeScore === homeScore || p.awayScore === awayScore)
//       )
//         pontos = 2;
//       if (p.homeScore === homeScore && p.awayScore === awayScore) pontos = 3;
//       const playerIdx = data[grupo][data[grupo].activeRound.team.slug].ranking.findIndex(
//         (player) => player.id === p.userId,
//       );
//       playerIdx < 0
//         ? data[grupo][data[grupo].activeRound.team.slug].ranking.push({
//           id: p.userId,
//           usuario: p.userName,
//           pontos: pontos,
//         })
//         : (data[grupo][data[grupo].activeRound.team.slug].ranking[playerIdx].pontos += pontos);
//       return { ...p, pontos: pontos };
//     })
//     .sort((a, b) => (a.pontos < b.pontos ? 1 : a.pontos > b.pontos ? -1 : 0));
//   if (rankingDaRodada[0].pontos === 0) {
//     response = 'Ninguém pontuou na última rodada!';
//     data[grupo][data[grupo].activeRound.team.slug][today.getFullYear()][data[grupo].activeRound.matchId] = {
//       ...data[grupo][data[grupo].activeRound.team.slug][today.getFullYear()][data[grupo].activeRound.matchId],
//       ranking: response,
//       palpites: rankingDaRodada,
//     };
//     writeData(data);
//     return client.sendMessage(grupo, response);
//   }
//   response = `🏁🏁 Resultado do bolão da ${data[grupo][data[grupo].activeRound.team.slug][today.getFullYear()][data[grupo].activeRound.matchId].rodada}ª rodada 🏁🏁\n`;
//   response += `\nPartida: ${matchInfo.response[0].teams.home.name} ${matchInfo.response[0].goals.home} x ${matchInfo.response[0].goals.away} ${matchInfo.response[0].teams.away.name}\n`;
//   rankingDaRodada.forEach((pos, idx) => {
//     const medal =
//       idx === 0 ? '🥇 ' : idx === 1 ? '🥈 ' : idx === 2 ? '🥉 ' : '';
//     pos.pontos > 0
//       ? (response += `\n${medal}${pos.userName} fez ${pos.pontos} ponto(s) com o palpite ${pos.homeScore} x ${pos.awayScore} ${pos.data ? `em ${pos.data}` : ''}`)
//       : (response += `\n${pos.userName} zerou com o palpite ${pos.homeScore} x ${pos.awayScore}`);
//   });
//   console.info('Abre próxima rodada em 1 hora');
//   const preparaProximaRodada = setTimeout(() => abreRodada(grupo), 60000);
//   data[grupo][data[grupo].activeRound.team.slug][today.getFullYear()][data[grupo].activeRound.matchId] = {
//     ...data[grupo][data[grupo].activeRound.team.slug][today.getFullYear()][data[grupo].activeRound.matchId],
//     ranking: response,
//     palpites: rankingDaRodada,
//   };
//   data[grupo].activeRound = {
//     ...data[grupo].activeRound,
//     matchId: null,
//     palpiteiros: []
//   };
//   writeData(data);
//   return client.sendMessage(grupo, response);
// };

module.exports = {
  start,
  // abreRodada,
  // verificaRodada,
  // publicaRodada,
  // fechaRodada,
  // pegaProximaRodada,
};
