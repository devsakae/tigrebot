const cron = require('node-cron');
const { bomDiaComDestaque } = require('../src/canal');
const { falaAlgumaCoisa } = require('../src/jokes');
const { jogadorDoTigreAleatorio } = require('../src/futebol');
const { publicaUltimaNoticia } = require('../src/news');

const bomDia = time => {
  cron.schedule(time, async () => {
    const today = new Date();
    console.info('Rodando BOM DIA - ', today.toLocaleString('pt-br'));
    await bomDiaComDestaque();
  }, {
    scheduled: true,
    timezone: "America/Sao_Paulo"
  });
}

const audio = time => {
  cron.schedule(time, async () => {
    const today = new Date();
    console.info('Rodando ÁUDIO - ', today.toLocaleString('pt-br'));
    await falaAlgumaCoisa();
  }, {
    scheduled: true,
    timezone: "America/Sao_Paulo"
  })
}

const atletaDestaque = time => {
  cron.schedule(time, async () => {
    const today = new Date();
    console.info('Rodando ATLETA DA SEMANA - ', today.toLocaleString('pt-br'));
    await jogadorDoTigreAleatorio();
  }, {
    scheduled: true,
    timezone: "America/Sao_Paulo"
  })
}

const atualiza = time => {
  cron.schedule(time, async () => {
    const today = new Date();
    console.info('Atualizando os grupos - ', today.toLocaleString('pt-br'));
    await publicaUltimaNoticia();
  }, {
    scheduled: true,
    timezone: "America/Sao_Paulo"
  })
}

module.exports = {
  bomDia,
  audio,
  atletaDestaque,
  atualiza,
}