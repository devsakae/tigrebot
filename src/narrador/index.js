const data = require('../bolao/data/data.json');
const { client } = require('../connections');
const { formatLance } = require('./utils/functions');
const { fetchWithParams } = require('../../utils/fetchApi');
const { sendAdmin } = require('../bolao/utils/functions');
const { writeData } = require('../bolao/utils/fileHandler');

let modoNarrador = false;
// let matchEvents = [];
const grupos = Object.keys(data).filter((key) => key.endsWith('.us'));

const narraPraTodos = (evento) => {
  grupos.forEach((grupo) => client.sendMessage(grupo, evento))
}

const delay = ({ message, delay }) => {
  grupos.forEach(async (grupo) => {
    const chat = await client.getChatById(grupo);
    chat.sendStateTyping();
    setTimeout(() => client.sendMessage(grupo, message), delay * 1000);
  });
}

const handleNarracao = async (m) => {
  const timerDeNarracao = setInterval(() => publicaLance(m), 90000);
  const apitoFinal = setTimeout(() => {
    console.info('Encerramento programado');
    narraPraTodos('Fim da narração (período de teste)');
    clearInterval(timerDeNarracao);
  }, 120 * 60000);
}

const getLances = async () => {
  const lances = await fetchWithParams({
    url: process.env.FOOTBALL_API_URL + '/fixtures',
    host: process.env.FOOTBALL_API_HOST,
    params: { id: data[grupos[0]].activeRound.matchId },
  });
  return lances.response[0];
}

const publicaLance = async (m) => {
  const chat = await client.getChatById(m.from);
  const response = await getLances();
  if (response.fixture.status.short === 'NS') return sendAdmin('Partida não começou e já estou narrando');
  const { events } = response;
  if (events.length === matchEvents.length) return;
  const placar = `${response.teams.home.name} ${response.goals.home} x ${response.goals.away} ${response.teams.away.name}`;
  if (response.fixture.status.short === 'HT') chat.setSubject(`[Intervalo] ${placar}`);
  if (response.fixture.status.short === 'FT') {
    () => clearInterval();
    narraPraTodos(`[${response.fixture.status.elapsed}'] Fim de jogo!\n\nResultado final: ${placar}`);
    chat.setSubject(`[Final] ${placar}`)
    const today = new Date();
    data[m.from][data[m.from].activeRound.team.slug][today.getFullYear()][response.fixture.id].match = matchEvents;
    writeData(data);
    matchEvents = [];
    return console.info('Partida finalizada e eventos salvos na database');
  }
  const newEvents = matchEvents.length - events.length;
  matchEvents = events;
  let historico = '';
  if (newEvents < -1) {
    if (events.some((ev) => ev.type === 'Goal')) chat.setSubject(placar);
    events
      .slice(newEvents)
      .forEach((ev) => historico += `\n${formatLance(ev)}`);
    return narraPraTodos(historico);
  }
  let ultimoLance = formatLance(events.at(-1));
  if (events.at(-1).type === 'Goal') chat.setSubject(placar);
  return narraPraTodos(ultimoLance);
};

const mudatopico = (topico) => {
  grupos.forEach(async (grupo) => {
    const chat = await client.getChatById(grupo);
    await chat.setSubject(topico);
  });
}

const narrador = async (m) => {
  // Verifica se já tem narração em andamento
  if (modoNarrador) return () => clearInterval();
  modoNarrador = true;
  const backToNormal = setTimeout(() => modoNarrador = false, 24 * 3600000);
  const response = await getLances();
  const placar = ` ${response.teams.home.name} ${response.goals.home} x ${response.goals.away} ${response.teams.away.name}`;
  mudatopico(placar);
  narraPraTodos('🎤 Modo narrador ativado 🎤')
  narraPraTodos('Informações do jogo de hoje com o nosso repórter especial...\n\nÉ com você, Tigrelino!');
  delay({ message: `🐯 DAI BLS OGE VAMO GANA +1SUBI TIGREEEEE\n\nEEEEEEEEEEE\n\n\n\n\n⇡ P SIMA DELIS`, delay: 2 });
  const { lineups, events } = response;
  lineups.forEach((team) => {
    let iscalasao = `🐯 A ISCALA SAO DO ${team.team.name.toUpperCase()} VENDE *${team.formation}* (MUINTO TELIJENTE PARESE EU NO CM):\n`
    team.startXI.forEach(({ player }) => iscalasao += `\n${player.number} - ${player.name.toUpperCase()} (${player.pos})`);
    iscalasao += `\n\nOS Q PODE OU PODE NAO ENTRA:\b`
    team.substitutes.forEach(({ player }) => iscalasao += `\n${player.number} - ${player.name.toUpperCase()} (${player.pos})`)
    delay({ message: iscalasao, delay: 4 });
  })
  let historico = `Tigrelino como sempre dando um show na condução do microfone. Tira o olho, Tabelando!\n\nBora acompanhar ${placar} (${response.fixture.status.elapsed}' - ${response.fixture.status.long})`;
  if (events.length > 0) {
    historico += `\n\nLances do jogo até o momento:\n`;
    events.forEach((ev) => historico += `\n${formatLance(ev)}`);
  }
  delay({ message: historico, delay: 30 })
  matchEvents = events;
  handleNarracao();
};

module.exports = {
  narrador,
};
