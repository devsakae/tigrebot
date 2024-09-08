const { default: axios } = require('axios');
const config = require('../../data/tigrebot.json');
const prompts = require('../../data/prompts.json');
const { client } = require('../connections');
const { fetchApi } = require('../../utils/fetchApi');
const { MessageMedia } = require('whatsapp-web.js');
const { respondeEAtualiza } = require('../news');
const { site_publish_reply } = require('../../utils/mongo');
const { log_erro } = require('../../utils/admin');
const encodedParams = new URLSearchParams();
const fs = require('fs');
const { replyOwner } = require('../gemini');

const pack = fs.readdirSync(process.cwd() + '/data/audios/');

let jokeLimit = false;

const replyUser = async (m) => {
  if (m.author === process.env.BOT_OWNER) {
    return await replyOwner(m);
  }

  const autor = await client.getContactById(m.author);
  if (m.body.endsWith('?')) {
    const wantNews = m.body.match(/novidades d[eao].*/gi);
    if (wantNews) {
      const query = wantNews[0].split('?')[0].substring(12).trim();
      const response = await respondeEAtualiza(query);
      await site_publish_reply(response, autor.pushname, wantNews)
      return await m.reply(response);
    }
    const random = Math.floor(Math.random() * prompts.oraculo.length);
    const resposta = (config.tigrelino ? prompts.tigrelino.oraculo[random] : prompts.oraculo[random]);
    await site_publish_reply(resposta, autor.pushname, m.body)
    return await m.reply(resposta);
  }
  if (m.body.match(/piada/gi) && !jokeLimit) {
    jokeLimit = true;
    const joke = await getJokes();
    await site_publish_reply(joke.setup, autor.pushname, m.body);
    await m.reply(joke.setup);
    setTimeout(async () => {
      await site_publish_reply(joke.punchline, autor.pushname, m.body);
      await m.reply(joke.punchline);
    }, 6000);
    return setTimeout(() => jokeLimit = false, 5400000);
  };
  const uselessFact = await getUselessFact();
  await site_publish_reply(uselessFact, autor.pushname, m.body)
  return await m.reply(uselessFact);
}

const getUselessFact = async () => {
  try {
    const uselessFact = await axios.request({
      method: 'GET',
      url: 'https://uselessfacts.jsph.pl/api/v2/facts/random',
    });
    return uselessFact.data.text;
  } catch (err) {
    return log_erro(err);
  }
};

const getJokes = async () => {
  try {
    const joke = await fetchApi({
      url: 'https://dad-jokes.p.rapidapi.com/random/joke',
      host: 'dad-jokes.p.rapidapi.com',
    });
    return joke.body[0];
  } catch (err) {
    return log_erro(err)
  }
}

const falaPraEle = async (m) => {
  if (m.body.length < 12) return;
  const text = m.body.substring(11).trimStart();
  let chat;
  if (m.body.startsWith('!falapraele')) {
    chat = await client.getChatById(m.from);
    chat.sendStateRecording();
  }
  encodedParams.set('voice_code', 'pt-BR-3');
  encodedParams.set('text', text);
  encodedParams.set('speed', '1.00');
  encodedParams.set('pitch', '1.00');
  encodedParams.set('output_type', 'base64');
  const options = {
    method: 'POST',
    url: 'https://cloudlabs-text-to-speech.p.rapidapi.com/synthesize',
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
      'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
      'X-RapidAPI-Host': 'cloudlabs-text-to-speech.p.rapidapi.com'
    },
    data: encodedParams,
  };
  try {
    const response = await axios.request(options);
    const audioPack = new MessageMedia('audio/mp3', response.data.result.audio_base64)
    if (m.body.startsWith('/anuncieque')) {
      return Promise.all(Object.keys(config.grupos).map(async (grupo) => {
        chat = await client.getChatById(grupo);
        await chat.sendMessage(audioPack, { sendAudioAsVoice: true });
      }));
    }
    return await chat.sendMessage(audioPack, { sendAudioAsVoice: true });
  } catch (err) {
    return console.error(err);
  }
}

const falaAlgumaCoisa = async () => {
  const audio = await MessageMedia.fromFilePath('./data/audios/' + pack[Math.floor(Math.random() * pack.length)])
  return await Promise.all(Object.keys(config.grupos).map(async grupo => {
    const chat = await client.getChatById(grupo);
    await chat.sendMessage(audio, { sendAudioAsVoice: true });
  }))
}

module.exports = {
  replyUser,
  getUselessFact,
  getJokes,
  falaPraEle,
  falaAlgumaCoisa,
}