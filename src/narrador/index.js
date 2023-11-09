const data = require('../bolao/data/data.json');
const { client } = require('../connections');
const { formatLance } = require('./utils/functions');
const { fetchWithParams } = require('../../utils/fetchApi');
const { sendAdmin } = require('../bolao/utils/functions');
const { writeData } = require('../bolao/utils/fileHandler');

let modoNarrador = false;
let matchEvents = [];

const publicaLance = async (m) => {
  const chat = await client.getChatById(m.from);
  await fetchWithParams({
    url: process.env.FOOTBALL_API_URL + '/fixtures',
    host: process.env.FOOTBALL_API_HOST,
    params: { id: data[m.from].activeRound.matchId },
  })
    .then(({ response }) => {
      if (response[0].fixture.status.short === 'NS') return sendAdmin('Partida não começou e já estou narrando');
      const { events } = response[0];
      if (events.length === matchEvents.length) return;
      const placar = `${response[0].teams.home.name} ${response[0].goals.home} x ${response[0].goals.away} ${response[0].teams.away.name}`;
      if (response[0].fixture.status.short === 'HT') chat.setSubject(`[Intervalo] ${placar}`);
      if (response[0].fixture.status.short === 'FT') {
        chat.setSubject(`[Final] ${placar}`)
        const today = new Date();
        data[m.from][data[m.from].activeRound.team.slug][today.getFullYear()][response[0].fixture.id].match = matchEvents;
        writeData(data);
        () => clearInterval();
        client.sendMessage(
          m.from,
          `[${response[0].fixture.status.elapsed}'] Fim de jogo!\n\nResultado final: ${placar}`,
        );
        matchEvents = [];
        return console.log('Partida finalizada');
      }
      const newEvents = matchEvents.length - events.length;
      matchEvents = events;
      let historico = '';
      if (newEvents < -1) {
        if (events.some((ev) => ev.type === 'Goal')) chat.setSubject(placar);
        events
          .slice(newEvents)
          .forEach((ev) => historico += `\n${formatLance(ev)}`);
        return client.sendMessage(m.from, historico);
      }
      let ultimoLance = formatLance(events.at(-1));
      if (events.at(-1).type === 'Goal') chat.setSubject(placar);
      return client.sendMessage(m.from, ultimoLance);
    })
    .catch((err) => console.error('ERRO:', err));
};

const narrador = async (m) => {
  const chat = await client.getChatById(m.from);
  if (modoNarrador) return;
  const today = new Date();
  const matchObj = data[m.from].activeRound.matchId;
  if (
    today.getTime() < matchObj.hora + (5 * 60000) ||
    today.getTime() > matchObj.hora + (110 * 60000)
  )
    return m.reply('Modo narrador só funciona *durante* a partida 😔');
  modoNarrador = true;
  const backToNormal = setTimeout(() => (modoNarrador = false), 24 * 3600000);
  let historico = 'Obrigado Tigrelino. Como sempre um Tigre profissional e experiente no comando da reportagem.\n\nResumo de';
  await fetchWithParams({
    url: process.env.FOOTBALL_API_URL + '/fixtures',
    host: process.env.FOOTBALL_API_HOST,
    params: { id: data[m.from].activeRound.matchId },
  })
  .then(({ response }) => {
      chat.setSubject(placar);
      const placar = ` ${response[0].teams.home.name} ${response[0].goals.home} x ${response[0].goals.away} ${response[0].teams.away.name}`;
      client.sendMessage(m.from, 'Informações do jogo de hoje com o nosso repórter especial...\n\nÉ com você, Tigrelino!');
      client.sendMessage(m.from, '🐯 DAI BLS OGE VAMO GANA +1SUBI TIGREEEEE\n\nEEEEEEEEEEE\n\n\n\n\n⇡ P SIMA DELIS');
      const { lineups, events } = response[0];
      lineups.forEach((team) => {
        let iscalasao = `🐯 A ISCALA SAO DO ${team.team.name.toUpperCase()} VENDE *${team.formation}* MUINTO TELIJENTE PARESE EU NO CM: `
        team.startXI[0].forEach(({ player }) => iscalasao += `${player.number} - ${player.name.toUpperCase()} (${player.pos}) `)
        client.sendMessage(m.from, iscalasao);
      })
      let historico = `Obrigado Tigrelino, um massacote profissional e deveras responsável na condução do microfone.\n\nAcompanhe aqui nesse canal os melhores momentos de ${placar} (${response[0].fixture.status.elapsed}' - ${response[0].fixture.status.long})`;
      if (events.length > 0) {
        historico += `Lances do jogo\n`;
        events.forEach((ev) => (historico += `\n${formatLance(ev)}`));
      }
      matchEvents = events;
    })
    .catch((err) => console.error(err));
  const pequenoAtraso = setTimeout(() => client.sendMessage(m.from, historico), 5000);
  const timerDeNarracao = setInterval(() => publicaLance(m), 60000);
  const apitoFinal = setTimeout(() => {
    console.info('Encerramento programado');
    client.sendMessage(m.from, 'Obrigado pela sua paciência! FIM');
    () => clearInterval(timerDeNarracao);
  }, 120 * 60000);
};

module.exports = {
  narrador,
};
