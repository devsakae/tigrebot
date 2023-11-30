const formatQuote = (quote) => {
  return `"${quote.quote}"

💬 Postagem de *${quote.autor}*
${quote.gols > 0 ? `⚽️ ${quote.gols} ${quote.gols > 1 ? 'pessoas consideraram' : 'pessoa considerou'} essa mensagem um golaço` : 'Ninguém considerou essa mensagem um golaço'}
✅ Tópico: ${quote.titulo}
🗓 Data: ${quote.data}
🪪 Id: ${quote._id.toString()}`
};

const bestQuote = (array) => {
  return array.some(q => q.gols > 0)
    ? formatQuote(array.filter(q => q.gols > 0)[0])
    : formatQuote(array[Math.floor(Math.random() * array.length)])
  // const scoredQuotes = array.filter(q => q.gols > 0);
  // if (scoredQuotes.length === 0) return formatQuote(array[Math.floor(Math.random() * array.length)]);
  // if (scoredQuotes.length > 1) scoredQuotes.sort((a, b) => b.gols - a.gols);
  // return formatQuote(scoredQuotes[0]);
}

module.exports = {
  formatQuote,
  bestQuote,
}