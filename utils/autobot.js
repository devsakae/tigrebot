const cron = require('node-cron');
const { bomDiaComDestaque } = require('../src/canal');
const { falaAlgumaCoisa } = require('../src/jokes');
const { jogadorDoTigreAleatorio, publicaJogoAleatorio } = require('../src/futebol');
const { log_info } = require('./admin');
const { abreRodada } = require('../src/bolao');
const { autoquiz } = require('../src/quiz');

const randomHour = () => Math.floor(Math.random() * 18 + 6);
const randomMinute = () => Math.floor(Math.random() * 59);

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

const meuQuiz = () => {
  const randomTime = randomMinute() + ' ' + randomHour() + ' * * *';
  console.info("Publicando quiz em cron-job de " + randomTime);
  if (cron.validate(randomTime)) {
    const rodaQuiz = cron.schedule(randomTime, async () => {
      log_info('Rodando meuQuiz()');
      setTimeout(() => rodaQuiz.stop(), 10000);
      await autoquiz();
      meuQuiz();
    }, {
      scheduled: true,
      timezone: 'America/Sao_Paulo'
    })
  }
}

module.exports = {
  bomDia,
  audio,
  atletaDestaque,
  jogosHistoricos,
  bolaoSystem,
  meuQuiz
}