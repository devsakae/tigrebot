const { log_erro, log_info, saveLocal } = require('../../utils');
const config = require('../../data/tigrebot.json')
const { genAI } = require('../connections');

const gemini = genAI.getGenerativeModel({
  model: "gemini-1.5-pro",
  systemInstruction: "Você é um bot de WhatsApp que torce para o Criciúma Esporte Clube, e mora na cidade de Criciúma, em Santa Catarina (Brasil). Você não é gaúcho, você é catarinense.",
});

const generationConfig = {
  temperature: 1.3,
  topP: 0.95,
  topK: 64,
  maxOutputTokens: 8192,
  responseMimeType: "text/plain",
};

const new_history = (type, prompt) => {
  return {
    role: type,
    parts: [{ text: prompt }],
  }
}

const replyOwner = async (m) => {
  const thisprompt = m.body.replace(process.env.BOT_NUMBER.split('@')[0],'');
  
  console.log('Iniciando reply owner com prompt ' + thisprompt);
  config.gemini_history.push(new_history('user', thisprompt));
  saveLocal(config);

  await log_info('Gerando resposta para *' + thisprompt + '*.')
  
  try {
    const answer = await ai_gemini(thisprompt);
    return await m.reply(answer);
  } catch {
   return await log_erro('Erro na geração de resposta com AI - Gemini')
  }
}

const ai_gemini = async (prompt) => {
  const chatSession = gemini.startChat({
    generationConfig,
    history: config.gemini_history,
  });
  const result = await chatSession.sendMessage(prompt);
  config.gemini_history.push(new_history('model', result.response.text()));
  saveLocal(config);
  return result.response.text();
}

module.exports = {
  replyOwner,
};
