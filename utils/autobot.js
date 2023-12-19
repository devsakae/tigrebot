const cron = require('node-cron');
const { bomDiaComDestaque } = require('../src/canal');
const { falaAlgumaCoisa } = require('../src/jokes');
const { jogadorDoTigreAleatorio, publicaJogoAleatorio } = require('../src/futebol');
const { atualizaSobreCriciuma } = require('../src/news');

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

const googleNewsCriciuma = (time) => {
  cron.schedule(time, async () => {
    const today = new Date();
    console.info('Rodando Google News Criciúma - ', today.toLocaleString('pt-br'));
    await atualizaSobreCriciuma();
  }, {
    scheduled: true,
    timezone: "America/Sao_Paulo"
  })
}

const jogosHistoricos = (time) => {
  cron.schedule(time, async () => {
    const today = new Date();
    console.info('Rodando Jogo de Hoje na História - ', today.toLocaleString('pt-br'));
    await publicaJogoAleatorio();
  }, {
    scheduled: true,
    timezone: "America/Sao_Paulo"
  })
}

module.exports = {
  bomDia,
  audio,
  atletaDestaque,
  googleNewsCriciuma,
  jogosHistoricos,
}