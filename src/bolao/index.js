const config = require('../../data/tigrebot.json');
const cron = require('node-cron');
const { client, mongoclient } = require('../connections');
const { saveLocal, fetchWithParams } = require('../../utils');
const { forMatch, sendAdmin } = require('./utils/functions');
const { log_info, log_erro, log_this } = require('../../utils/admin');

const bolao = async (m) => {
  if (m.author === process.env.BOT_OWNER) {
    if (m.body.startsWith('!bolao start')) return startBolao(m);
  }
  if (config.bolao.grupos.includes(m.from) && config.bolao.listening && m.hasQuotedMsg) {
    const isTopic = await m.getQuotedMessage();
    if (!isTopic.body.startsWith('BOLÃO ABERTO!')) return;
    const matchingRegex = isTopic.body.match(/\d+$/)[0];
    if (config.grupos[m.from].palpiteiros.includes(m.author)) return m.reply('Já palpitou pô, que que tá incomodando?');
    if (isTopic && isTopic.fromMe) {
      const sender = await m.getContact(m.author);
      if (Number(matchingRegex) === Number(config.bolao.nextMatch.fixture.id)) {
        const checkPalpite = habilitaPalpite({ group: m.from.split('@')[0], m: m, user: sender.pushname || sender.name || sender.shortname, matchId: matchingRegex });
        return checkPalpite.error ? await m.reply(checkPalpite.error) : await m.react('🎟');
      }
      return await m.reply('Essa rodada não está ativa!');
    }
    return;
  }
  return;
}

const startBolao = async m => {
  log_info('Entrou em startBolao');
  if (!config.bolao.grupos.some((item) => item === m.from)) {
    config.bolao.grupos.push(m.from);
    saveLocal(config);
    const grupo = await m.getChat();
    log_info('Ativando bolão no grupo ' + grupo.name);
    return m.reply('Bolão ativado para o grupo *' + grupo.name + '*.')
  }
  return m.reply('Este grupo já está como ativo no sistema de bolão!');
}

const abreRodada = async () => {
  if (config.bolao.grupos.length < 1) return;
  const today = new Date()
  if (config.bolao.nextMatch && (new Date(config.bolao.nextMatch.fixture.timestamp * 1000) < today)) return console.info("Já existe partida pronta para ser anunciada.");
  try {
    const { response } = await fetchWithParams({
      url: config.bolao.url + '/fixtures',
      host: config.bolao.host,
      params: {
        season: today.getFullYear(),
        team: config.bolao.id,
        next: '2'
      },
    });
    if (response.length === 0) throw new Error('Nenhuma rodada encontrada');
    config.bolao.nextMatch = response[0];
    saveLocal(config);
    log_this('Rodada preparada!')
    return await preparaProximaRodada();
  } catch (err) {
    log_erro(err);
    return sendAdmin(err);
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

const habilitaPalpite = async (info) => {
  const today = new Date();
  const regex = /\d+\s*[x]\s*\d+/i;
  if (!info.m.body.match(regex)) return { error: 'Palpite inválido' };
  const homeScore = info.m.body.match(regex)[0].match(/^\d+/i);
  const awayScore = info.m.body.match(regex)[0].match(/\d+$/i);
  const palpiPack = {
    torneioId: config.bolao.nextMatch.fixture.id,
    date: today.toLocaleString('pt-br'),
    userId: info.m.author,
    userName: info.user,
    homeScore: Number(homeScore),
    awayScore: Number(awayScore),
    resultado:
      Number(homeScore) > Number(awayScore)
        ? 'V'
        : Number(homeScore) < Number(awayScore)
          ? 'D'
          : 'E',
    goal_diff: Number(homeScore) - Number(awayScore),
    goal_total: Number(homeScore) + Number(awayScore),
    pontos: 0,
  };
  config.grupos[info.m.from].palpiteiros.push(info.m.author);
  saveLocal(config);
  try {
    await mongoclient.db(info.group).collection(info.matchId).insertOne(palpiPack);
  } catch (err) {
    return { error: 'Erro na conexão com o MongoDB' };
  } finally {
    return { error: false };
  }
};

module.exports = {
  bolao,
  abreRodada,
};