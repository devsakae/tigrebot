const { log_erro, log_info } = require('../../utils');
const { gemini } = require('../connections');

const replyOwner = async (m) => {
  log_info('Gerando resposta para *', m.body.replace(process.env.BOT_NUMBER,''), '*.')
  try {
    const answer = await ai_gemini(m.body.replace(process.env.BOT_NUMBER,''));
    return await m.reply(answer);
  } catch {
   return log_erro('Erro na geração de resposta com AI - Gemini')
  }
}

const ai_gemini = async (prompt) => {  
  const result = await gemini.generateContent(prompt);
  const response = await result.response;
  return response.text();
}

module.exports = {
  replyOwner,
};
