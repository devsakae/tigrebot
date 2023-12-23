const cron = require('node-cron');
const { bomDiaComDestaque } = require('../src/canal');
const { falaAlgumaCoisa } = require('../src/jokes');
const { jogadorDoTigreAleatorio, publicaJogoAleatorio } = require('../src/futebol');
const { atualizaSobreCriciuma } = require('../src/news');

const sortingNumbers = (start, finish) => (Math.floor(Math.random() * (finish - start + 1) + start)).toString();
const cedo = () => sortingNumbers(2, 32).concat(" ").concat(sortingNumbers(5, 7)).concat(" ");
const manha = () => sortingNumbers(12, 52).concat(" ").concat(sortingNumbers(8, 10)).concat(" ");
const tarde = () => sortingNumbers(15, 59).concat(" ").concat(sortingNumbers(14, 16)).concat(" ");
const noite  = () => sortingNumbers(4, 46).concat(" ").concat(sortingNumbers(18, 20)).concat(" ");

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
  cedo,
  manha,
  tarde,
  noite,
}