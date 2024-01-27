const config = require('../../data/tigrebot.json');
const cron = require('node-cron');
const { client } = require('../connections');
const { saveLocal, fetchWithParams } = require('../../utils');
const { forMatch } = require('./utils/functions');

const bolao = async (m) => {
  if (m.from === process.env.BOT_OWNER && m.body.startsWith('!bolao start')) return startBolao(m);
  // if (m.hasQuotedMsg && config.bolao.listening) {
  //   const isTopic = await m.getQuotedMessage();
  //   const matchingRegex = isTopic.body.match(/\d+$/)[0];
  //   if (config.grupos[m.from].palpiteiros.includes(m.author)) return m.reply('Já palpitou pô, que que tá incomodando?');
  //   if (isTopic && isTopic.fromMe) {
  //     const sender = await m.getContact(m.author);
  //     if (Number(matchingRegex) === Number(config.bolao.nextMatch.id)) {
  //       const checkPalpite = habilitaPalpite({ group: m.from.split('@')[0], m: m, user: sender.pushname || sender.name || sender.shortname, matchId: matchingRegex });
  //       return checkPalpite.error ? m.reply(checkPalpite.error) : m.react('🎟');
  //     }
  //     return m.reply('Essa rodada não está ativa!');
  //   }
  //   return;
  // }
  return;
}

const startBolao = async m => {
  if (!config.bolao.grupos.some(m.from)) {
    config.bolao.grupos.push(m.from);
    saveLocal(config);
    const grupo = await m.getChat();
    return m.reply('Bolão ativado para o grupo *' + grupo.name + '*.')
  }
  return m.reply('Este grupo já está como ativo no sistema de bolão!');
}

const abreRodada = async () => {
  if (config.bolao.grupos.length < 1) return;
  const today = new Date()
  if (config.bolao.nextMatch && (new Date(config.bolao.nextMatch.fixture.timestamp * 1000) < today)) return;
  try {
    const { response } = await fetchWithParams({
      url: config.bolao.url + '/fixtures',
      host: config.bolao.host,
      params: {
        season: today.getFullYear(),
        team: config.bolao.id,
      },
    });
    if (response.length === 0) throw new Error('Nenhuma rodada encontrada');
    config.bolao.nextMatch = response[0];
    saveLocal(config);
    return await preparaProximaRodada();
  } catch (err) {
    console.error(err);
    return client.sendMessage(process.env.BOT_OWNER, 'Erro: ' + err)
  }
}

const preparaProximaRodada = async () => {
  if (!config.bolao.nextMatch) return client.sendMessage(process.env.BOT_OWNER, 'Houve um erro ao prepara a próxima rodada (no config.bolao.nextMatch)');
  const matchDate = new Date(config.bolao.nextMatch.fixture.timestamp * 1000);
  const publishDate = '0 19 ' + (matchDate.getDate() - 1) + ' ' + (matchDate.getMonth() + 1) + ' *';
  if (cron.validate(publishDate)) {
    cron.schedule(publishDate, async () => {
      publicaRodada();
    }, {
      scheduled: true,
      timezone: "America/Sao_Paulo"
    });
  }
}

const publicaRodada = async () => {
  config.bolao.listening = true;
  saveLocal(config);
  await Promise.all(config.bolao.grupos.map(async g => {
    await client.sendMessage(g, forMatch(config.bolao.nextMatch))
  }))
}

module.exports = {
  bolao,
  abreRodada,
};