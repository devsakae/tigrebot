const cron = require('node-cron');
const { bomDiaComDestaque } = require('../src/canal');
const { falaAlgumaCoisa } = require('../src/jokes');
const { jogadorDoTigreAleatorio, publicaJogoAleatorio } = require('../src/futebol');
const { atualizaSobreCriciuma } = require('../src/news');
const { log_info } = require('./admin');
const { abreRodada } = require('../src/bolao');
const { quiz } = require('../src/quiz');

const bomDia = time => {
  cron.schedule(time, async () => {
    log_info('Rodando bomDiaComDestaque()')
    await bomDiaComDestaque();
  }, {
    scheduled: true,
    timezone: "America/Sao_Paulo"
  });
}

const audio = time => {
  cron.schedule(time, async () => {
    log_info('Rodando falaAlgumaCoisa()')
    await falaAlgumaCoisa();
  }, {
    scheduled: true,
    timezone: "America/Sao_Paulo"
  })
}

const atletaDestaque = time => {
  cron.schedule(time, async () => {
    log_info('Rodando jogadorDoTigreAleatorio()');
    await jogadorDoTigreAleatorio();
  }, {
    scheduled: true,
    timezone: "America/Sao_Paulo"
  })
}

const jogosHistoricos = (time) => {
  cron.schedule(time, async () => {
    log_info('Rodando publicaJogoAleatorio()');
    await publicaJogoAleatorio();
  }, {
    scheduled: true,
    timezone: "America/Sao_Paulo"
  })
}

const bolaoSystem = (time) => {
  cron.schedule(time, async () => {
    log_info('Rodando abreRodada()');
    await abreRodada();
  }, {
    scheduled: true,
    timezone: "America/Sao_Paulo"
  })
}

module.exports = {
  bomDia,
  audio,
  atletaDestaque,
  jogosHistoricos,
  bolaoSystem
}