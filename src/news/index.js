const googleNewsAPI = require("google-news-json");
const prompts = require("../../data/prompts.json");

const fetchNews = async (term = 'Criciúma') => {
  const articles = await googleNewsAPI.getNews(googleNewsAPI.SEARCH, term, "pt-BR");
  const today = new Date();
  const oneLess = new Date(today.getTime());
  oneLess.setDate(today.getDate() - 1)
  const yesterday = new Date(oneLess);
  return articles.items.filter(a => new Date(a.pubDate) > yesterday)
}

const getNews = async () => {
  const response = await fetchNews();
  let texto = prompts.chamada_news[Math.floor(Math.random() * prompts.chamada_news.length)] + '\n'
  response.map(news => texto += `\n・ ${news.title} (${news.source})`)
  return texto;
}

const respondeEAtualiza = async (term) => {
  const n = await fetchNews(term);
  if (n.length > 0) return `Só te digo isso: ${n[0].title}`;
  return "Não, nada por enquanto.";
}

module.exports = {
  fetchNews,
  getNews,
  respondeEAtualiza,
}