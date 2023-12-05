const googleNewsAPI = require("google-news-json");
const prompts = require("../../data/prompts.json");
const config = require("../../data/tigrebot.json");
const { sendTextToChannels, sendTextToGroups, saveLocal } = require("../../utils");
const { postTweet } = require("../../utils/twitter");

const fetchNews = async (term = 'Criciúma') => {
  const articles = await googleNewsAPI.getNews(googleNewsAPI.SEARCH, term, "pt-BR");
  const today = new Date();
  const oneLess = new Date(today.getTime());
  oneLess.setDate(today.getDate() - 1)
  const yesterday = new Date(oneLess);
  return articles.items.filter(a => new Date(a.pubDate) > yesterday).sort((a, b) => a.pubDate > b.pubDate ? -1 : 1)
}

const getNovidades = async () => {
  const articles = await googleNewsAPI.getNews(googleNewsAPI.SEARCH, "Criciúma", "pt-BR");
  const worldNews = await googleNewsAPI.getNews(googleNewsAPI.TOPICS_WORLD, null, "pt-BR");
  const today = new Date();
  const oneLess = new Date(today.getTime());
  oneLess.setDate(today.getDate() - 1)
  const yesterday = new Date(oneLess);
  const response = articles.items.filter(a => new Date(a.pubDate) > yesterday).sort((a, b) => a.pubDate > b.pubDate ? -1 : 1)
  const organized = worldNews.items.filter(a => new Date(a.pubDate) > yesterday).sort((a, b) => a.pubDate > b.pubDate ? -1 : 1)
  if (response || response.length > 0) {
    let texto = prompts.bomdia.news[Math.floor(Math.random() * prompts.bomdia.news.length)] + '\n\n🟢🔴 Destaques para Criciúma/SC:\n'
    response.splice(0, Math.floor(Math.random() * 3) + 3).map(news => texto += `\n・ ${news.title}`)
    texto += '\n\n🌎 O que é notícia no mundo:\n'
    organized.splice(0, Math.floor(Math.random() * 3) + 3).map(news => texto += `\n・ ${news.title}`)
    return texto;
  }
  console.error('Error fetching news');
  return;
}

const atualizaSobreCriciuma = async () => {
  const response = await fetchNews();
  if (config.news === response[0].guid.text) return;
  const latest = 'Google News Criciúma 👉 ' + await response[0].title
  config.news = await response[0].guid.text;
  saveLocal(config);
  await sendTextToChannels(latest);
  await sendTextToGroups(latest);
  return await postTweet(latest);
}

const respondeEAtualiza = async (term) => {
  const n = await fetchNews(term);
  if (n.length > 0) return `Só te digo isso: ${n[0].title}`;
  return "Não, nada por enquanto.";
}

module.exports = {
  fetchNews,
  getNovidades,
  respondeEAtualiza,
  atualizaSobreCriciuma,
}