const { default: axios } = require('axios');
const config = require('../../data/tigrebot.json');
const prompts = require('../../data/prompts.json');
const { client } = require('../connections');
const { fetchApi } = require('../../utils/fetchApi');
const { MessageMedia } = require('whatsapp-web.js');
const encodedParams = new URLSearchParams();

let jokeLimit = false;

const replyUser = async (m) => {
  if (m.body.endsWith('?')) {
    const random = Math.floor(Math.random() * prompts.oraculo.length);
    return m.reply(prompts.oraculo[random]);
  }
  if (m.body.match(/piada/gi) && !jokeLimit) {
    jokeLimit = true;
    const joke = await getJokes();
    m.reply(joke.setup);
    const punchline = setTimeout(() => client.sendMessage(m.from, joke.punchline), 6000);
    const liberaNovaJoke = setTimeout(() => jokeLimit = false, 5400000);
    return;
  };
  const uselessFact = await getUselessFact();
  return m.reply(uselessFact);
}

const getUselessFact = async () => {
  try {
    const uselessFact = await axios.request({
      method: 'GET',
      url: 'https://uselessfacts.jsph.pl/api/v2/facts/random',
    });
    return uselessFact.data.text;
  } catch (err) {
    console.error(err)
    return client.sendMessage(process.env.BOT_OWNER, err);
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
    console.error(err)
    return client.sendMessage(process.env.BOT_OWNER, err);
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
  const pack = ['mastella.mp3', 'zecalo.mp3', 'aa1.mp3', 'aa2.mp3', 'aa3.mp3', 'argel.mp3', 'tencatti.mp3', 'dmmonho.mp3', 'everton.mp3'];
  const audio = await MessageMedia.fromFilePath('./data/audios/' + pack[Math.floor(Math.random() * pack.length)])
  await Promise.all(Object.keys(config.canais).map( async chan => {
    const chat = await client.getChatById(chan);
    await chat.sendMessage(audio, { sendAudioAsVoice: true });
  }))
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