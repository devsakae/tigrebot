const prompts = require('./data/prompts.json');
const data = require('./data/data.json');
const { client } = require('../connections');
const { listaPalpites } = require('./user');
const { writeData } = require('./utils/fileHandler');
const { forMatch, sendAdmin } = require('./utils/functions');
const { fetchWithParams } = require('../../utils/fetchApi');

const start = (info) => {
  if (Object.hasOwn(data, info.grupo) && Object.hasOwn(data[info.grupo], 'activeRound')) return client.sendMessage(info.grupo, `Este grupo já tem um bolão ativo dos jogos de ${info.team.name}.`)
  if (!Object.hasOwn(data, info.grupo)) {
    data[info.grupo] = {
      activeRound: {
        team: info.team,
        started: new Date(),
      },
    };
    writeData(data);
  }
  abreRodada(info.grupo);
  return client.sendMessage(
    info.grupo,
    `Bolão de jogos do *${info.team.name}* iniciado.`,
  );
};

const pegaProximaRodada = async (grupo) => {
  try {
    const getNextMatches = await fetchWithParams({
      url: process.env.FOOTBALL_API_URL + '/fixtures',
      host: process.env.FOOTBALL_API_HOST,
      params: {
        team: data[grupo].activeRound.team.id,
        next: 3,
      },
    });
    if (getNextMatches.response.length < 1) return { error: true };
    const today = new Date();
    let singleMatch;
    getNextMatches.response.forEach((event, idx) => {
      const matchPack = {
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
      };
      if (idx === 0) singleMatch = matchPack;
      data[grupo][data[grupo].activeRound.team.slug][today.getFullYear()] = {
        ...data[grupo][data[grupo].activeRound.team.slug][today.getFullYear()],
        [event.fixture.id]: matchPack
      }
    });
    writeData(data);
    return singleMatch;
  } catch (err) {
    console.error(err);
    return { error: true };
  }
};

const verificaRodada = async (m) => {
  // Verifica se existe bolão cadastrado pro grupo
  if (!Object.hasOwn(data, m.from) || Object.hasOwn(data[m.from], 'activeRound')) return client.sendMessage(m.from, prompts.bolao.no_round);
  if (Object.hasOwn(data[m.from].activeRound, 'matchId')) {
    // Está escutando palpites? Publica rodada
    if (data[m.from].activeRound.listening) publicaRodada({ grupo: m.from, match: data[m.from][data[m.from].activeRound.team.slug][today.getFullYear()][data[m.from].activeRound.matchId] });
    // Não está escutando palpites? Fecha a rodada 
    else fechaRodada({ grupo: m.from, tentativa: 1 })
  }
  // Prepara publicação da próxima rodada
  const today = new Date();
  const nextMatch = await pegaProximaRodada(m.from);
  if (nextMatch.error) return client.sendMessage(m.author, 'Bolão finalizado! Sem mais rodadas para disputa');
  const calculatedTimeout = (nextMatch.hora - 115200000) - today.getTime();
  const proximaRodada = setTimeout(() => abreRodada(m.from), calculatedTimeout);
  const quandoAbre = new Date(today.getTime() + calculatedTimeout);
  return client.sendMessage(m.from, `Bolão programado para abertura de rodada em ${quandoAbre.toLocaleString('pt-br')}`);
}

const abreRodada = async (grupo) => {
  const nextMatch = await pegaProximaRodada(grupo);
  if (nextMatch.error) return client.sendMessage(grupo, prompts.bolao.no_round);
  data[grupo].activeRound = {
    ...data[grupo].activeRound,
    listening: true,
    matchId: nextMatch.id,
    palpiteiros: [],
  };
  writeData(data);
  const today = new Date();
  const timeoutProgramado = (nextMatch.hora - today.getTime()) - (36 * 3600000)
  const publicacaoProgramada = setTimeout(() => publicaRodada({ grupo: grupo, match: nextMatch }), timeoutProgramado);
  return sendAdmin(`Agendamento de ${nextMatch.homeTeam} x ${nextMatch.awayTeam} (matchId ${nextMatch.id}) realizado.\n\nJogo ocorrerá em ${new Date(nextMatch.hora)} \nPublicação no grupo em ${new Date(today.getTime() + timeoutProgramado)}`)
};

const publicaRodada = ({ grupo, match }) => {
  const today = new Date();
  const horaNow = today.getTime();
  const texto = forMatch(match);
  const limiteDeTempoParaPalpitesEmMinutos = 10; // Fazer configurável
  const limiteConvertidoEmMs = limiteDeTempoParaPalpitesEmMinutos * 60000;
  const timeoutInMs = match.hora - horaNow - limiteConvertidoEmMs;
  () => clearTimeout(encerramentoProgramado);
  const encerramentoProgramado = setTimeout(
    () => encerraPalpite(grupo),
    timeoutInMs,
  );
  sendAdmin(
    `Rodada aberta! Previsão de término em ${new Date(
      horaNow + timeoutInMs,
    ).toLocaleString('pt-br')}`,
  );
  // predictions();
  return client.sendMessage(grupo, texto);
};

const encerraPalpite = (grupo) => {
  const today = new Date();
  const encerramento = '⛔️⛔️ Tempo esgotado! ⛔️⛔️\n\n';
  data[grupo].activeRound.listening = false;
  writeData(data);
  if (
    data[grupo][data[grupo].activeRound.team.slug][today.getFullYear()][
      data[grupo].activeRound.matchId
    ].palpites.length < 1
  )
    return client.sendMessage(grupo, 'Ninguém palpitou nessa rodada!');
  const listaDePalpites = listaPalpites(grupo);
  client.sendMessage(grupo, encerramento + listaDePalpites);
  const hours = 8; // Prazo (em horas) para buscar o resultado da partida após o encerramento dos palpites
  const hoursInMs = hours * 3600000;
  // const programaFechamento = setTimeout(() => fechaRodada(grupo), 5000) // TEST
  const programaFechamento = setTimeout(() => fechaRodada({ grupo: grupo, tentativa: 1 }), hoursInMs);
  const comunicaNovoModulo = setTimeout(
    () =>
      client.sendMessage(
        grupo,
        'Quer acompanhar a partida?\n\nDigite *!highlights* no grupo que eu publico os melhores momentos (pra quem não fala inglês)',
      ),
    10 * 60000,
  );
};

const buscaResultado = async ({ grupo, tentativa }) => {
  const today = new Date();
  if (tentativa > 5) return client.sendMessage(process.env.BOT_OWNER, 'Erro ao buscar resultado da partida. Verifique a API.');
  const matchInfo = await fetchWithParams({
    url: process.env.FOOTBALL_API_URL + '/fixtures',
    host: process.env.FOOTBALL_API_HOST,
    params: {
      id: data[grupo].activeRound.matchId,
    },
  });
  if (!matchInfo || matchInfo.response[0].fixture.status.short !== 'FT') {
    console.error('Fetch não realizado, será feita a tentativa n.', tentativa);
    const fetchAgain = setTimeout(() => fechaRodada({ grupo: grupo, tentativa: tentativa + 1 }), 45 * 60000);
    if (tentativa === 1) return { error: true }
    return;
  }
  data[grupo][data[grupo].activeRound.team.slug][today.getFullYear()][data[grupo].activeRound.matchId].matchInfo = matchInfo;
  writeData(data);
  return matchInfo
}

const fechaRodada = async ({ grupo, tentativa }) => {
  if (!data[grupo].activeRound.listening) return client.sendMessage(grupo, 'A rodada já foi fechada');
  const matchInfo = await buscaResultado({ grupo: grupo, tentativa: tentativa })
  if (matchInfo.error) return client.sendMessage(
    grupo,
    'Erro ao buscar resultado final da partida ' + data[grupo].activeRound.matchId + '. Será feita nova busca em alguns minutos.'
  );
  let response;
  const today = new Date();
  const homeScore = Number(matchInfo.response[0].goals.home);
  const awayScore = Number(matchInfo.response[0].goals.away);
  const resultado =
    homeScore > awayScore ? 'V' : homeScore < awayScore ? 'D' : 'E';
  const rankingDaRodada = data[grupo][data[grupo].activeRound.team.slug][
    today.getFullYear()
  ][data[grupo].activeRound.matchId].palpites
    .map((p) => {
      let pontos = 0;
      if (p.resultado === resultado) pontos = 1;
      if (
        p.resultado === resultado &&
        (p.homeScore === homeScore || p.awayScore === awayScore)
      )
        pontos = 2;
      if (p.homeScore === homeScore && p.awayScore === awayScore) pontos = 3;
      const playerIdx = data[grupo][data[grupo].activeRound.team.slug].ranking.findIndex(
        (player) => player.id === p.userId,
      );
      playerIdx < 0
        ? data[grupo][data[grupo].activeRound.team.slug].ranking.push({
          id: p.userId,
          usuario: p.userName,
          pontos: pontos,
        })
        : (data[grupo][data[grupo].activeRound.team.slug].ranking[playerIdx].pontos += pontos);
      return { ...p, pontos: pontos };
    })
    .sort((a, b) => (a.pontos < b.pontos ? 1 : a.pontos > b.pontos ? -1 : 0));
  if (rankingDaRodada[0].pontos === 0) {
    response = 'Ninguém pontuou na última rodada!';
    data[grupo][data[grupo].activeRound.team.slug][today.getFullYear()][data[grupo].activeRound.matchId] = {
      ...data[grupo][data[grupo].activeRound.team.slug][today.getFullYear()][data[grupo].activeRound.matchId],
      ranking: response,
      palpites: rankingDaRodada,
    };
    writeData(data);
    return client.sendMessage(grupo, response);
  }
  response = `🏁🏁 Resultado do bolão da ${data[grupo][data[grupo].activeRound.team.slug][today.getFullYear()][data[grupo].activeRound.matchId].rodada}ª rodada 🏁🏁\n`;
  response += `\nPartida: ${matchInfo.response[0].teams.home.name} ${matchInfo.response[0].goals.home} x ${matchInfo.response[0].goals.away} ${matchInfo.response[0].teams.away.name}\n`;
  rankingDaRodada.forEach((pos, idx) => {
    const medal =
      idx === 0 ? '🥇 ' : idx === 1 ? '🥈 ' : idx === 2 ? '🥉 ' : '';
    pos.pontos > 0
      ? (response += `\n${medal}${pos.userName} fez ${pos.pontos} ponto(s) com o palpite ${pos.homeScore} x ${pos.awayScore} ${pos.data ? `em ${pos.data}` : ''}`)
      : (response += `\n${pos.userName} zerou com o palpite ${pos.homeScore} x ${pos.awayScore}`);
  });
  console.info('Abre próxima rodada em 1 hora');
  const preparaProximaRodada = setTimeout(() => abreRodada(grupo), 60000);
  data[grupo][data[grupo].activeRound.team.slug][today.getFullYear()][data[grupo].activeRound.matchId] = {
    ...data[grupo][data[grupo].activeRound.team.slug][today.getFullYear()][data[grupo].activeRound.matchId],
    ranking: response,
    palpites: rankingDaRodada,
  };
  data[grupo].activeRound = {
    ...data[grupo].activeRound,
    matchId: null,
    palpiteiros: []
  };
  writeData(data);
  return client.sendMessage(grupo, response);
};

module.exports = {
  start,
  abreRodada,
  verificaRodada,
  publicaRodada,
  fechaRodada,
  pegaProximaRodada,
};
