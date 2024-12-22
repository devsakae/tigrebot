const config = require('../data/tigrebot.json');
const cron = require('node-cron');
const { bomDiaComDestaque } = require('../src/canal');
const { falaAlgumaCoisa, sextamosEnfim } = require('../src/jokes');
const { jogadorDoTigreAleatorio, publicaJogoAleatorio } = require('../src/futebol');
const { log_info, log_this } = require('./admin');
const { abreRodada } = require('../src/bolao');
const { autoquiz } = require('../src/quiz');
const { saveLocal } = require('./handleFile');
const { publicaGolacoAleatorio } = require('../src/quotes');
const { sendTextToGroups } = require('./sender');

let firstTime = true;

const bebeAteVirarTigrelino = () => {
  const bebiSimEstouVivendo = cron.schedule("5 9 * * 5", () => {
    config.tigrelino = true;
    saveLocal(config);
    log_this("VIRANO TIGRELINO SO POROGE");
    return sendTextToGroups("BORA RASA SO POROGE")
  }, {
    scheduled: true,
    timezone: "America/Sao_Paulo"
  })
   cron.schedule("1 0 * * 6", () => {
    bebiSimEstouVivendo.stop()
    config.tigrelino = false;
    saveLocal(config);
    log_this("Destigrelinizando");
    return sendTextToGroups("Sinto que fui abalroado por um veículo de considerável tamanho e velocidade 🥴")
  }, {
    scheduled: true,
    timezone: "America/Sao_Paulo"
  });
  cron.schedule("59 23 * * 5", () => {
    bebiSimEstouVivendo.stop()
    config.tigrelino = false;
    saveLocal(config);
    return log_this("NUNCA MAIS EU VOU BEBER");
  }, {
    scheduled: true,
    timezone: "America/Sao_Paulo"
  });

}

const randomHourTomorrow = () => {
  const now = new Date();
  const randomTimeTomorrow = (Math.floor(Math.random() * 59)) + ' ' + (Math.floor(Math.random() * 15) + 6) + ' ' + (now.getDate() + 1) + ' ' + (now.getMonth() + 1) + ' *';
  if (cron.validate(randomTimeTomorrow)) return randomTimeTomorrow;
  return console.error('Horario nao validado');
  /* return randomHourTomorrow(); */
}

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
  const randomTime = randomHourTomorrow();
  if (firstTime) {
    console.info("Publicando quiz em cron-job para " + randomTime) 
    firstTime = false;
  }
  else log_info("Publicando quiz em cron-job para " + randomTime);
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

const golacoTigrelog = (time) => {
  cron.schedule(time, async () => {
    log_info('Rodando golacoTigrelog()');
    await publicaGolacoAleatorio();
  }, {
    scheduled: true,
    timezone: "America/Sao_Paulo"
  })
}

const sextouuuuu = () => {
  cron.schedule("0 9 * * 5", async () => {
    log_info('Sextou maluco');
    await sextamosEnfim();
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
  bolaoSystem,
  meuQuiz,
  bebeAteVirarTigrelino,
  golacoTigrelog,
  sextouuuuu
}