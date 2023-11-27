const { default: axios } = require('axios');
const { client } = require('../connections');
const { fetchApi } = require('../../utils/fetchApi');
const { MessageMedia } = require('whatsapp-web.js');
const encodedParams = new URLSearchParams();

const oraculo = [
  'Sim. Definitivamente sim.',
  'É claro que não 👎',
  'Por óbvio, a resposta é um retumbante SIM',
  'Jamais!!! Tá maluco?? 🤬',
  'Hummmm... Pode ser...',
  'Claro claro, vai na frente que o Bot já vai 😆',
  'Depende, sua mãe gosta?',
  'Pode ser, quanto você me paga?',
  'Fechado! TMJ #sqn',
  'Boh se não',
  'Não me sinto confortável em responder assim com essa grosseria toda',
  'Que pergunta cretina. Não vou responder essa PIADA 😣',
  '42.',
  'Putz olha essa pergunta... Calaboca...',
  'Só se tua mãe quiser',
  'Dependendo do quanto pagar, é lógico',
  'Nem que me pagassem 1 milhão',
  'Puta merda, olha essa pergunta... Me tira do grupo admin'
]
let jokeLimit = false;

const replyUser = async (m) => {
  if (m.body.endsWith('?')) {
    const random = Math.floor(Math.random() * oraculo.length);
    return m.reply(oraculo[random]);
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
  console.log('entering fala pra ele...');
  if (m.body.length < 12) return;
  const text = m.body.substring(11).trimStart();
  console.log('Reproduzindo em áudio:', text);
  const chat = await client.getChatById(m.from);
  chat.sendStateRecording();
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
    // const beduTest = 'https://storage.googleapis.com/cloudlabs-tts.appspot.com/audio/audio-4ebffb695feb7f0ab03de23692493085.mp3';
    const response = await axios.request(options);
    console.log(response.data);
    const audioPack = new MessageMedia('audio/mp3', response.data.result.audio_base64)
    return await chat.sendMessage(audioPack, { sendAudioAsVoice: true });
  } catch (err) {
    return console.error(err);
  }
}

module.exports = {
  replyUser,
  getUselessFact,
  getJokes,
  falaPraEle,
}