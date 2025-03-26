const { client, criciuma } = require('../connections');
const { MessageMedia } = require('whatsapp-web.js');
const config = require('../../data/tigrebot.json');
const prompts = require('../../data/prompts.json');
const { site_publish } = require('../../utils');
const { saveLocal, savePrompts } = require('../../utils/handleFile');
const { sendMediaUrlToGroups, sendTextToGroups } = require('../../utils/sender');
const { getForecast } = require('../weather');
const { organizaFestinha } = require('../futebol/utils/functions');
const { falaAlgumaCoisa } = require('../jokes');
const { fetchGolacoTigrelog } = require('../quotes');
const { getNovidades } = require('../news');
const feriados = require('../../data/2024feriados.json');
const { default: axios } = require('axios');
const { log_erro, log_info, log_this } = require('../../utils/admin');
const { jogadorDoTigreAleatorio, publicaJogoAleatorio } = require('../futebol');

// api.get("/", (req, res) => res.status(200).send("dale tigre"));
// api.post("/", async (req, res) => {
//   console.log(req.body);
//   if (req.body && req.headers.authorization === process.env.API_TOKEN && req.body.destinatarios.length >= 1 && req.body.mensagem.length >= 1) {
//     await apiToWpp({ destinatarios: req.body.destinatarios, mensagem: req.body.mensagem });
//     return res.status(200).send("Mensagem enviada!");
//   }
//   return res.status(400).send({ message: "Sem permissões suficientes" })
// })

const canal = async (m) => {
  if (m.body.startsWith('/add')) return await addToPrompt(m);
  if (m.body.startsWith('/push')) return await pushToPrompt(m);
  if (m.body.startsWith('/promptdelete')) return await deletePrompt(m);
  if (m.body.startsWith('/audio')) return await falaAlgumaCoisa();
  if (m.body.startsWith('/bomdia')) return bomDiaComDestaque();
  if (m.body.startsWith('/atletadestaque')) return jogadorDoTigreAleatorio();
  if (m.body.startsWith('/jogodestaque')) return publicaJogoAleatorio();
  if (m.body.startsWith('/instaignore')) return instaIgnore(m);
  // return instagram(m);
};

const instaIgnore = (m) => {
  const ignoreURL = m.body.split(' ')[1];
  config.instagram.published.push(ignoreURL);
  saveLocal(config);
  return log_info(`O post com ID ${ignoreURL} foi adicionado na lista de ignore.`)
}

const bomDiaComDestaque = async () => {
  const today = new Date();
  // Inicia o bom dia
  // const legenda_greeting = prompts.saudacoes[Math.floor(Math.random() * prompts.saudacoes.length)];
  const legenda_greeting = config.tigrelino ? prompts.tigrelino.saudacoes[Math.floor(Math.random() * prompts.tigrelino.saudacoes.length)] : prompts.saudacoes[Math.floor(Math.random() * prompts.saudacoes.length)];
  let response = (config.tigrelino ? '🍺 ' : '👉 ') + legenda_greeting;
  let tweet = legenda_greeting

  // Hoje tem feriado no país? Magina!
  // const legenda_feriados = diasEspeciais();
  // if (legenda_feriados && !config.tigrelino) {
  //   response += '\n\n'
  //   response += legenda_feriados;
  // }

  const doty = await daysOfTheYear();
  if (doty && doty.length > 0) {
    const filteredDoty = doty.filter((days) => days.type === 'day')
    const chosen_doty = filteredDoty.data[Math.floor(Math.random() * filteredDoty.length)];
    const { name, excerpt } = chosen_doty;
    const translateThis = name + ' - ' + excerpt;
    const translated = await googleTranslate({ query: translateThis, source: 'en', target: 'pt-BR' }) || "(Falha na API do DOTY)"
    response += '\n\n';
    response += translated;
  }


  // Pega a previsão do tempo em Criciúma/SC para hoje
  const legenda_previsao = await getForecast()
  if (legenda_previsao) {
    tweet += '\n\n'
    tweet += legenda_previsao.short;
    response += '\n\n';
    response += legenda_previsao.long;
  }

  // await postTweet(tweet);
  tweet = '';

  // Busca as últimas notícias de Criciúma
  const legenda_news = await getNovidades();
  if (legenda_news) {
    response += '\n\n';
    response += legenda_news.long;
    tweet = legenda_news.short;
  }

  // Quarta, sexta ou domingo? Resultado da Timemania do dia anterior!
  if (today.getDay() === 0 || today.getDay() === 3 || today.getDay() === 5) {
    const legenda_timemania = await timemania();
    response += '\n\n'
    response += legenda_timemania
  }

  // Pega um golaço aleatório do fórum e adiciona na resposta
  // const legenda_forum = await fetchGolacoTigrelog();
  // if (legenda_forum) {
  //   response += '\n\n';
  //   response += legenda_forum;
  // }

  // Busca atletas aniversariando hoje
  const birthDate = ('0' + today.getDate()).slice(-2) + '/' + ('0' + (today.getMonth() + 1)).slice(-2)
  const aniversariantes = await criciuma
    .collection('atletas')
    .find({ 'birthday': { $regex: birthDate } })
    .toArray();
  // Encontrou aniversariante? 
  if (aniversariantes && aniversariantes.length > 0) {
    const jogaramNoTigre = aniversariantes.filter(j => j.jogos.some(jogo => jogo.jogounotigre));
    const legenda_aniversariantes = organizaFestinha(aniversariantes);
    // Adiciona foto e stats de atleta que jogou no Tigre
    if (jogaramNoTigre.length > 0) {
      const chosenOne = jogaramNoTigre[Math.floor(Math.random() * jogaramNoTigre.length)];
      const jogosPeloTigre = chosenOne.jogos.filter(jogo => jogo.jogounotigre);
      const totalJogos = jogosPeloTigre.reduce((acc, curr) => {
        acc.jogos += Number(curr.jogos);
        acc.gols += Number(curr.gols);
        acc.v += Number(curr.v);
        acc.e += Number(curr.e);
        acc.d += Number(curr.d);
        return acc;
      }, { jogos: 0, v: 0, e: 0, d: 0, gols: 0 })
      response = `_Hoje é aniversário de nascimento de ${chosenOne.name} (${chosenOne.position})._\n\nPelo Tigre, *${chosenOne.nickname}* disputou ${totalJogos.jogos} partidas (${totalJogos.v}V/${totalJogos.e}E/${totalJogos.d}D), marcou ${totalJogos.gols} gols e jogou a última partida com a camisa do Tigre por ${jogosPeloTigre[0].torneio} em ${jogosPeloTigre[0].ano}.\n\n${response}\n\n${legenda_aniversariantes}`;
      tweet += `\n\nAniversário de nascimento de ${chosenOne.nickname}, que jogou ${totalJogos.jogos} partidas, fez ${totalJogos.gols} gol(s) e venceu ${totalJogos.v} jogos.`;
      return await sendMediaUrlToGroups({ url: chosenOne.image, caption: response });
      // return await postTweet(tweet);
    }
    // Adiciona a lista de aniversariantes SEM atletas do Tigre
    response += '\n\n'
    response += legenda_aniversariantes
  }
  // Retorna bom dia, previsão e fórum (sem aniversariantes)
  // await postTweet(tweet);
  return await sendTextToGroups(response);
}

// const saveLocalInstagram = (update) => {
//   config.instagram.published.push(update.id);
//   config.instagram = {
//     ...config.instagram,
//     ...update
//   };
//   saveLocal(config);
// }

// let instaApiOption = 0;
// const instaApiList = ['insta30', 'insta243'];

// const instagramThis = async (user = 'criciumaoficial') => {
//   instaApiOption = instaApiOption === instaApiList.length ? 0 : instaApiOption;
//   log_info('Aguarde! Iniciando fetch no instagram de @' + user + ' com ' + instaApiList[instaApiOption])
//   try {
//     const post = instaApiList[instaApiOption] === 'insta30'
//       ? await instaApi30(user)
//       : await instaApi243(user);
//     instaApiOption += 1;
//     return await sendInstagramToGroups(post);
//   } catch (err) {
//     return log_erro(err);
//   }
// };

// Publicação no whatsapp de conta do instagram
// const instaApi30 = async (user) => {
//   log_this('Buscando com INSTAAPI30');
//   return await fetchWithParams({
//     url: process.env.INSTAGRAM130_API_URL + '/account-feed',
//     host: process.env.INSTAGRAM130_API_HOST,
//     params: {
//       username: user,
//     },
//   })
//     .then(async (res) => {
//       if (!res || res.length === 0) throw Error('Não foi possível buscar nenhum post');
//       let response = res[0];
//       if (config.instagram.published.includes(response.node.id)) response = res.find((item) => !config.instagram.published.includes(item.node.id));
//       const update = {
//         date: new Date(),
//         id: response.node.id,
//         link: 'http://instagram.com/p/' + response.node.shortcode,
//         type: response.node.__typename,
//         url:
//           response.node.is_video
//             ? response.node.video_url
//             : response.node.display_url,
//         caption: response.node.edge_media_to_caption.edges[0].node.text,
//         owner: response.node.owner.username,
//       }
//       saveLocalInstagram(update);
//       return update;
//     })
//     .catch((err) => log_erro(err) );
// }

// const instaApi243 = async () => {
//   log_info('Buscando com INSTAAPI243...')
//   return await fetchApi({
//     url: 'https://instagram243.p.rapidapi.com/userposts/1752837621/10/%7Bend_cursor%7D', // @criciumaoficial
//     host: 'instagram243.p.rapidapi.com'
//   })
//     .then(({ data }) => {
//       let response = data.edges;
//       if (config.instagram.published.includes(response[0].node.id)) response = data.edges.find((item) => !config.instagram.published.includes(item.node.id));
//       const update = {
//         date: new Date(),
//         id: response.node.id,
//         link: 'http://instagram.com/p/' + response.node.shortcode,
//         type: response.node.__typename,
//         url:
//           response.node.is_video
//             ? response.node.video_url
//             : response.node.display_url,
//         caption: response.node.edge_media_to_caption.edges[0].node.text,
//         owner: response.node.owner.username,
//       }
//       saveLocalInstagram(update);
//       return update;
//     }).catch((err) => console.error(err));
// }

// const fetchInstaId = async (m) => {
//   const id = m.body.split(' ')[1].includes('instagram.com')
//     ? m.body.match(/(\w+)\/?$/)[1]
//     : m.body.split(' ')[1];
//   client.sendMessage(process.env.BOT_OWNER, 'Aguarde! Iniciando fetch do post', id);
//   const raw = await fetchWithParams({
//     url: "https://instagram191.p.rapidapi.com/v2/post/details-by-shortcode/",
//     host: "instagram191.p.rapidapi.com",
//     params: {
//       "shortcode": id
//     }
//   })
//   const data = raw.graphql.shortcode_media;
//   const update = {
//     date: new Date(),
//     id: data.id,
//     link: 'http://instagram.com/p/' + data.shortcode,
//     type: data.__typename,
//     url:
//       data.is_video
//         ? data.video_url
//         : data.display_url,
//     caption: data.edge_media_to_caption.edges[0].node.text,
//     owner: data.owner.username,
//   }
//   saveLocalInstagram(update)
//   // await sendInstagramToChannels(update);
//   return await sendInstagramToGroups(update);
// }

const publicaMessage = async (m) => {
  if (m.hasMedia) {
    const media = await m.downloadMedia()
    const message = new MessageMedia(
      media.mimetype,
      media.data.toString('base64')
    );
    for (grupo of Object.keys(config.grupos)) {
      await client.sendMessage(grupo, message, { caption: m.body })
    }
    return await site_publish(m.body);
  }
  await site_publish(m.body);
  return await sendTextToGroups(m.body);
}

const diasEspeciais = () => {
  const today = new Date();
  const todayComZero = ('0' + today.getDate()).slice(-2) + '/' + ('0' + (today.getMonth() + 1)).slice(-2)
  let response = '';
  response += feriados.nacional.find(f => f.data.startsWith(todayComZero))?.descricao || ''
  if (response && response.length > 0) response += '. \n';
  const fest = feriados.estadual.filter(f => f.data.startsWith(todayComZero))
  fest.length === 1
    ? response += `Hoje é ${fest[0].nome} no estado do(a) ${fest[0].uf}.`
    : fest.forEach(f => response += `No estado do(a) ${f.uf}, é ${f.nome}.`)
  // const fmun = feriados.municipal.filter(f => f.data.startsWith(todayComZero))
  // fmun.length > 0 && fmun.forEach((f, i) => response += `${i === (fmun.length - 1) && fmun.length > 1 ? ' e ' : i > 0 ? ', ' : '\nComemora(m) feriado municipal hoje a(s) cidade(s) de '}${f.municipio} (${f.uf})${i === (fmun.length - 1) ? '.' : ''}`)
  return response;
}

const daysOfTheYear = async () => {
  return await axios({
    method: 'GET',
    url: 'https://www.daysoftheyear.com/api/v1/today/?timezone_offset=-3',
    headers: {
      'X-Api-Key': process.env.DOTY_API_KEY
    },
  }).then((res) => {
    if (res.data.code === 200) return res.data.data;
    else throw new Error({ data: [] })
  }).catch((err) => {
    console.error('Erro getting DOTY', err.data || err)
    return [];
  })

}

const googleTranslate = async (params) => {
  return await axios.get('https://translation.googleapis.com/language/translate/v2', {
    params: {
      key: GOOGLE_API_KEY,
      source: params.source,
      target: params.target,
      q: params.query,
    }
  }).then((res) => res.data?.data?.translations[0]?.translatedText)
    .catch((err) => err.data);
}


const timemania = async () => {
  const url = "https://loteriascaixa-api.herokuapp.com/api/timemania/latest";
  try {
    let response;
    const { data } = await axios.request({
      method: 'GET',
      url: url,
    });
    if (data.timeCoracao.startsWith('CRICI')) response = config.tigrelino ? 'OOOOOOO DEO TIGRAUM NA TIMANIA!!!!1🐯🐯' : 'Deu *TIGRE* 🟡⚫️⚪️ na Timemania!! 🐯 🐯 🐯'
    else response = config.tigrelino ? `NAUM DEO TIGRAUM DEO ${data.timeCoracao.toUpperCase()}` : `Time do coração na Timemania: ${data.timeCoracao}.`;
    response += `\n\n🍀 Concurso: ${data.concurso} em ${data.data}`;
    response += `\n📍 Sorteio: ${data.local}`;
    response += `\n📝 Dezenas: `
    data.dezenas.map((d, i) => response += `${i === 0 ? '' : ' - '}${d}`);
    if (data.acumulou && !config.tigrelino) response += `\n\nNinguém acertou as sete dezenas, e o prêmio estimado para o próximo concurso é de ${data.valorAcumuladoProximoConcurso.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' })}`;
    return response;
  } catch (err) {
    console.error("Error", err)
  }
}

const addToPrompt = async m => {
  // "/add keys" para ver as chaves cadastradas
  // "/add errors.teste Um teste" para adicionar a chave teste na chave errors.
  const msgArr = m.body.split(' ');
  const mykeys = msgArr[1];
  if (mykeys === "keys") return await client.sendMessage(m.from, JSON.stringify(Object.keys(prompts).slice(0, 3)));
  const promptkey = mykeys.split('.')[0]
  const newkey = mykeys.split('.')[1]
  const myprompt = m.body.substring(5 + mykeys.length).trim();
  prompts[promptkey] = {
    ...prompts[promptkey],
    [newkey]: myprompt
  }
  savePrompts(prompts);
  const newprompt = prompts[promptkey];
  return await client.sendMessage(m.from, 'Prompt adicionado:\n\n' + newprompt);
}

const pushToPrompt = async m => {
  // Uso: /push saudacoes.teste Isso é apenas um teste.
  const msgArr = m.body.split(' ');
  const mykey = msgArr[1];
  if (mykey === "keys") return await client.sendMessage(m.from, JSON.stringify(Object.keys(prompts).slice(3)));
  const myprompt = m.body.substring(6 + mykey.length).trim();
  prompts[mykey].push(myprompt)
  savePrompts(prompts);
  const newprompt = prompts[mykey].map((p, i) => i + " - " + p + "\n");
  return await client.sendMessage(m.from, 'Prompt adicionado:\n\n' + newprompt);
}

const deletePrompt = async m => {
  const raw = m.body.split(' ')[1].trim();
  const cmd = raw.split('.');
  prompts[cmd[0]] = prompts[cmd[0]].splice(cmd[1], 1);
  savePrompts(prompts);
  const newprompt = prompts[cmd[0]].map((p, i) => i + " - " + p + "\n");
  return await client.sendMessage(m.from, 'Novo prompt:\n\n' + newprompt);
}

const mudaTitulo = async m => {
  const group = await client.getChatById(m.from);
  await group.setSubject(m.body.substring(8));
}

module.exports = {
  canal,
  bomDiaComDestaque,
  publicaMessage,
  timemania,
  mudaTitulo,
};
