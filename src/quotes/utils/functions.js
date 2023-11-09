const calculaIdade = (date) => {
  const formattedDate = date.split("/")
  const birthdateTimeStamp = new Date(formattedDate[2], formattedDate[1], formattedDate[0])
  const currentDate = new Date().getTime();
  const difference = currentDate - birthdateTimeStamp;
  const currentAge = Math.floor(difference / 31557600000)
  return currentAge
};

const formatQuote = (quote) => {
  return `"${quote.quote}"

💬 Postagem de *${quote.autor}*
${quote.gols > 0 ? `⚽️ ${quote.gols} ${quote.gols > 1 ? 'pessoas consideraram' : 'pessoa considerou'} essa mensagem um golaço` : 'Ninguém considerou essa mensagem um golaço'}
✅ Tópico: ${quote.titulo}
🗓 Data: ${quote.data}
🪪 Id: ${quote._id.toString()}`
};

const addStats = (array) => {
  const today = new Date();
  const thisYear = today.getFullYear();
  if (array.length === 1) {
    const { stats } = array[0];
    return `O CRAQUE, GÊNIO, LENDÁRIO *${array[0].nickname.toUpperCase()}* já jogou no Tigre! 🐯

${array[0].name} (${array[0].position}, ${calculaIdade(array[0].birthday)} anos)
${array[0].period}

🏟 ${stats.matches} partidas
⚽️ ${stats.goals} gols
👍🏽 ${stats.w} vitórias
🤌🏽 ${stats.d} empates
🖕🏽 ${stats.l} derrotas
🟨 ${stats.yc} cartões amarelos
🟥 ${stats.rc} cartões vermelhos

Fonte: http://www.meutimenarede.com.br - Scraped by @devsakae`
  }
  let maisDeUm = `Encontrei mais de um atleta que jogou aqui! Se liga e escolha o certo:\n`
  array.forEach((obj) => maisDeUm = maisDeUm.concat(`\n✅ ${obj.name} (${obj.position}) - ${obj.stats.matches} jogos entre ${obj.period.substring(8)}`))
  maisDeUm = maisDeUm.concat('\n\nFonte: http://www.meutimenarede.com.br - Scraped by @devsakae');
  return maisDeUm;
};

const bestQuote = (array) => {
  const scoredQuotes = array.filter(q => q.gols > 0);
  if (scoredQuotes.length === 0) return formatQuote(array[Math.floor(Math.random() * array.length)]);
  if (scoredQuotes.length > 1) scoredQuotes.sort((a, b) => b.gols - a.gols);
  return formatQuote(scoredQuotes[0]);
}

module.exports = {
  formatQuote,
  addStats,
  bestQuote,
}