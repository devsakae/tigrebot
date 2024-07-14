const { log_erro } = require('../../utils');
const { gemini } = require('../connections');

const replyOwner = async (m) => {
  console.log('Generating response for', m.body)
  try {
    const answer = await ai_gemini(m.body);
    return await m.reply(answer);
  } catch {
   return log_erro('Erro na geração de resposta com AI - Gemini')
  }
}

const ai_gemini = async (prompt) => {  
  const result = await gemini.generateContent(prompt);
  const response = await result.response;
  console.log('[Response]')
  console.log(response);
  return response.text();
}

module.exports = {
  replyOwner,
};
