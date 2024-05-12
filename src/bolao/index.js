const config = require('../../data/tigrebot.json');
const cron = require('node-cron');
const { client, mongoclient } = require('../connections');
const { saveLocal, fetchWithParams, site_publish } = require('../../utils');
const { forMatch } = require('./utils/functions');
const { log_info, log_erro, log_this } = require('../../utils/admin');
const { sendBolaoGroups } = require('../../utils/sender');

const prazoFechamentoRodadaEmMs = 15 * 60 * 1000;

const bolao = async (m) => {
  if (m.author === process.env.BOT_OWNER) {
    const today = new Date()
    if (m.body.startsWith('!bolao start')) {
      if (config.bolao.grupos.some((g) => g === m.from)
          && Object.keys(config.bolao.nextMatch) > 0
          && (new Date(config.bolao.nextMatch.fixture.timestamp * 1000) < today)) {
        log_info("Republicando rodada.");
        return publicaRodada();
      }
      return startBolao(m);
    } 
  }
  if (config.bolao.grupos.includes(m.from) && config.bolao.listening && m.hasQuotedMsg) {
    const isTopic = await m.getQuotedMessage();
    if (!isTopic.body.startsWith('BOLÃO ABERTO!')) return;
    const matchingRegex = isTopic.body.match(/\d+$/)[0];
    if (config.grupos[m.from].palpiteiros.includes(m.author)) return m.reply('Já palpitou pô, que que tá incomodando?');
    if (isTopic && isTopic.fromMe) {
      const sender = await m.getContact(m.author);
      if (Number(matchingRegex) === Number(config.bolao.nextMatch.fixture.id)) {
        const checkPalpite = await habilitaPalpite({ group: m.from.split('@')[0], m: m, user: sender.pushname || sender.name || sender.shortname, matchId: matchingRegex });
        return checkPalpite.error ? await m.reply(checkPalpite.error) : await m.react('🎟');
      }
      return await m.reply('Essa rodada não está ativa!');
    }
  }
  if (m.body.startsWith('!palpites')) {
    log_this('Enviando lista de palpites para ' + m.from);
    const listaCompleta = await listaPalpites();
    const listaDoGrupo = listaCompleta.find((g) => m.from.startsWith(g));
    return listaDoGrupo.length > 0 ? await m.reply(listaDoGrupo.message) : log_erro('Não encontrou grupo');
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
  return abreRodada();
}

const abreRodada = async () => {
  if (config.bolao.grupos.length < 1) return;
  try {
    const { response } = await fetchWithParams({
      url: config.bolao.url + '/fixtures',
      host: config.bolao.host,
      params: {
        team: config.bolao.id,
        next: '2'
      },
    });
    if (response.length === 0) throw new Error('Nenhuma rodada encontrada');
    config.bolao.nextMatch = response[0];
    saveLocal(config);
    return setTimeout(() => preparaProximaRodada(), 5000);
  } catch (err) {
    return log_erro(err);
  }
}

const preparaProximaRodada = async () => {
  log_this('Preparando próxima rodada');
  if (!config.bolao.nextMatch) return log_erro('Não existe nextMatch no config');
  if (config.bolao.nextMatch.fixture.status === "PST") return log_info("Partida do bolão adiada.");
  if ((config.bolao.nextMatch.fixture.timestamp - 111800000) <= new Date()) return publicaRodada();
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
  const gameday = forMatch(config.bolao.nextMatch);
  await Promise.all(config.bolao.grupos.map(async g => {
    await client.sendMessage(g, gameday)
  }))
  await site_publish(gameday);  
  const fechamento = new Date((config.bolao.nextMatch.fixture.timestamp * 1000) - prazoFechamentoRodadaEmMs);
  const fechaDate = `${fechamento.getMinutes()} ${fechamento.getHours()} ${fechamento.getDate()} ${fechamento.getMonth() + 1} *`;
  if (cron.validate(fechaDate)) {
    log_info('Preparando fechamento da rodada em ' + fechamento.toLocaleString('pt-br'));
    cron.schedule(fechaDate, async () => {
      fechaRodada();
    }, {
      scheduled: true,
      timezone: "America/Sao_Paulo"
    });
  }
}

const getMongoPalpites = async (matchId) => {
  const listaDePalpites = await Promise.all(Object.keys(config.grupos)
    .map(async (group) => {
      const lista = await mongoclient
        .db(group.split('@')[0])
        .collection(matchId)
        .find()
        .toArray();
      return { group, lista };
    }))
  return listaDePalpites;
}

const fechaRodada = async () => {
  config.bolao.listening = false;
  saveLocal(config);
  const pacoteDePalpites = await listaPalpites();
  await Promise.all(pacoteDePalpites.map(async (pdp) => await client.sendMessage(pdp.group + '@g.us', pdp.message)));
  const fechamento = new Date((config.bolao.nextMatch.fixture.timestamp * 1000) + (4 * 60 * 60 * 1000));
  const fechaDate = `${fechamento.getMinutes()} ${fechamento.getHours()} ${fechamento.getDate()} ${fechamento.getMonth() + 1} *`;
  if (cron.validate(fechaDate)) {
    log_info('Preparando cálculo de ranking para ser publicado em ' + fechamento.toLocaleString('pt-br'));
    cron.schedule(fechaDate, async () => {
      calculaRankingDaPartida();
    }, {
      scheduled: true,
      timezone: "America/Sao_Paulo"
    });
  }
}

const listaPalpites = async (matchId = config.bolao.nextMatch.fixture.id) => {
  if (!matchId) return 'Não foi possível buscar os palpites da rodada. Verifique com o admin.\n\nERROR: NO_MATCHID';
  const listaDePalpites = await getMongoPalpites(matchId);
  const organizado = listaDePalpites.map((item) => {
    let message = `Lista de palpites (partida id ${matchId})\n`;
    item.lista.forEach((palpite) => message += `\n▪️ ${palpite.homeScore} x ${palpite.awayScore} - ${palpite.userName}`)
    return { group: item.group, message }
  })
  return organizado;
};


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

const buscaResultado = async (tentativa = 1) => {
  log_info('Buscando resultado da última partida...');
  if (tentativa > 5) return { error: 'Erro ao buscar resultado da partida por 5 vezes. Verifique a API.' };
  const matchInfo = await fetchWithParams({
    url: config.bolao.url + '/fixtures',
    host: config.bolao.host,
    params: {
      id: config.bolao.nextMatch.fixture.id
    },
  });
  if (matchInfo || matchInfo.response[0].fixture.status.short === 'FT') {
    try {
      await bolao
        .collection('resultados')
        .insertOne({ [matchInfo.response[0].fixture.id]: matchInfo });
      // .updateOne({ "league.id": config.bolao.nextMatch.torneioId }, { $set: { [matchInfo.response[0].fixture.id]: matchInfo } }, { upsert: true });
    } catch (err) {
      console.error(err);
      return { error: prompts.errors.mongodb }
    } finally {
      return matchInfo;
    }
  }
  log_erro(prompts.errors.will_fetch_again + tentativa);
  const fetchAgain = setTimeout(() => buscaResultado(tentativa + 1), 30 * 60000);
  return { error: prompts.errors.will_fetch_again + tentativa }
}


const calculaRankingDaPartida = async (matchId = config.bolao.nextMatch.fixture.id) => {
  if (!matchId) return log_erro('Não foi possível calcular o ranking da partida. Verifique com o admin.\n\nERROR: NO_MATCHID');
  Object.keys(config.grupos).forEach((g) => g.palpiteiros = []);
  saveLocal(config);
  return await sendBolaoGroups("Calculando ranking - Etapa em desenvolvimento");

  const listaDePalpites = await getMongoPalpites();
  listaDePalpites.forEach((item) => {
    let ranking = [];
    // item = [{ group: '1234423@.g.us', list: [{ id: 34423432, userName: 'Rodrigo', homeScore: 0, awayScore: 2 }] }]
    item.lista.forEach((p) => {
      let pontos = 0;

    })
    ranking.sort((a, b) => a.pontos > b.pontos ? -1 : 1);
    console.log(ranking);
    return { group, ranking }
  })
  // let pontos = 0;
  //     if (p.resultado === resultado) pontos = 1;
  //     if (
  //       p.resultado === resultado &&
  //       (p.homeScore === homeScore || p.awayScore === awayScore)
  //     )
  //       pontos = 2;
  //     if (p.homeScore === homeScore && p.awayScore === awayScore) pontos = 3;
  //     const playerIdx = data[grupo][data[grupo].activeRound.team.slug].ranking.findIndex(
  //       (player) => player.id === p.userId,
  //     );
  //     playerIdx < 0
  //       ? data[grupo][data[grupo].activeRound.team.slug].ranking.push({
  //         id: p.userId,
  //         usuario: p.userName,
  //         pontos: pontos,
  //       })
  //       : (data[grupo][data[grupo].activeRound.team.slug].ranking[playerIdx].pontos += pontos);
  //     return { ...p, pontos: pontos };
}


module.exports = {
  bolao,
  abreRodada,
};