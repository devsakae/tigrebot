const { log_erro, log_info, saveLocal } = require('../../utils');
const base = require('../../data/defendeai.json');
const { genAI, client } = require('../connections');
const { saveDefendeAi } = require('../../utils/handleFile');

const gemini = genAI.getGenerativeModel({
  model: "gemini-1.5-pro",
  systemInstruction: "Você é um bot que representa, de certa forma, a Ordem dos Advogados do Brasil. Mantenha sempre um tom sério e profissional, focado em ajudar advogados que precisam tirar dúvidas relacionadas ao exercício da profissão. Atenha-se sempre a resolver dúvidas, perguntas e informações que são feitas exclusivamente por advogados. Peça sempre para a pessoa se identificar no primeiro contato, incluindo o número da OAB. Para destacar com negrito, escreva a(s) frase(s) *desse jeito*. Sublinhado é _desse jeito_.",
});

const generationConfig = {
  temperature: 1.3,
  topP: 0.95,
  topK: 64,
  maxOutputTokens: 8192,
  responseMimeType: "text/plain",
};

const new_history = (type, prompt) => ({
    role: type,
    parts: [{ text: prompt }],
  });

const replyUser = async (m) => {
  // const thisprompt = m.body.replace(("@" + process.env.BOT_NUMBER).split(' ')[0],'');
  const thisprompt = m.body.substring(15);
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
  const modelHistory = new_history('model', result.response.text());
  const userHistory = new_history('user', prompt);
  config.gemini_history.push(modelHistory);
  config.gemini_history.push(userHistory);
  saveLocal(config);
  return result.response.text();
}

const defendeAi = async (m) => {
  if (base[m.author].nome === '') {
   await m.sendMessage(m.from, 'Olá, obrigado por testar o Defende AI. Verifiquei que você está utilizando o bot pela primeira vez.');
   const contato = await client.getContactById(m.author);
   const grava_nome = `Já salvei seu nome como *${contato.pushname}* aqui na minha agenda, mas também vou precisar do número da sua OAB. Você pode informar os dígitos e a UF de expedição (ex.: SC027116)?`;
   setTimeout(async () => await m.sendMessage(m.from, grava_nome), 1000);
   base[m.author] = {
    nome: contato.pushname || contato.name || contato.shortName,
    primeiro_contato: new Date()
   }
   saveDefendeAi(base);
  }
}

module.exports = {
  defendeAi,
  replyUser
}