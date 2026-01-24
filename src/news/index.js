const googleNewsAPI = require("google-news-json");
const prompts = require("../../data/prompts.json");
const config = require("../../data/tigrebot.json");
const { sendTextToGroups, saveLocal } = require("../../utils");
const gnews = require('gnews');

const fetchNews = async (term = 'Criciúma') => {
  const articles = await googleNewsAPI.getNews(googleNewsAPI.SEARCH, term, "pt-BR");
  const today = new Date();
  const oneLess = new Date(today.getTime());
  oneLess.setDate(today.getDate() - 1)
  const yesterday = new Date(oneLess);
  return articles.items.filter(a => new Date(a.pubDate) > yesterday).sort((a, b) => a.pubDate > b.pubDate ? -1 : 1)
}

const fetchGnews = async (tema = "headlines") => {
  let cricinews;
  if (tema !== "headlines") cricinews = await gnews.search(tema, { country: 'br', language: 'pt', n: 5 });
  else cricinews = await gnews.headlines({ country: 'br', language: 'pt', n: 5 });
  return cricinews;
  // for (let article of ) {
  //   console.log(article.pubDate + ' | ' + article.title);
  // }
}


const getNovidades = async () => {
  // const articles = await googleNewsAPI.getNews(googleNewsAPI.SEARCH, "Criciúma", "pt-BR");
  const articles = await fetchGnews("Criciúma");
  // const worldNews = await googleNewsAPI.getNews(googleNewsAPI.TOPICS_WORLD, null, "pt-BR");
  const worldNews = await fetchGnews("headlines");
  const today = new Date();
  const oneLess = new Date(today.getTime());
  oneLess.setDate(today.getDate() - 1)
  const yesterday = new Date(oneLess);
  const response = articles.items.filter(a => new Date(a.pubDate) > yesterday).sort((a, b) => a.pubDate > b.pubDate ? -1 : 1)
  const organized = worldNews.items.filter(a => new Date(a.pubDate) > yesterday).sort((a, b) => a.pubDate > b.pubDate ? -1 : 1)
  if (response || response.length > 0) {
    let texto = (config.tigrelino ? prompts.tigrelino.news[Math.floor(Math.random() * prompts.tigrelino.news.length)] : prompts.news[Math.floor(Math.random() * prompts.news.length)]) + '\n\n🟢🔴 Destaques em Criciúma/SC:\n'
    response.splice(0, Math.floor(Math.random() * 3) + 3).map(news => texto += `\n・ ${news.title}`)
    texto += '\n\n🇧🇷 O que é notícia no resto do país:\n'
    organized.splice(0, Math.floor(Math.random() * 3) + 3).map(news => texto += `\n・ ${news.title}`)
    return { long: texto, short: `É destaque hoje em Criciúma: ${response[0].title}.\n\nE no resto do país: ${organized[0].title}` };
  }
  console.error('Error fetching news');
  return;
}

const atualizaSobreCriciuma = async () => {
  // const response = await fetchNews();
  const response = await fetchGnews();
  if (config.news === response[0].guid.text) return;
  const latest = 'Google News Criciúma 👉 ' + await response[0].title
  config.news = await response[0].guid.text;
  saveLocal(config);
  return await sendTextToGroups(latest);
  // return await postTweet(latest);
}

const respondeEAtualiza = async (term) => {
  // const n = await fetchNews(term);
  const n = await fetchGnews(term);
  if (n.length > 0) return `Só te digo isso: ${n[0].title}`;
  return "Não, nada por enquanto.";
}

fetchGnews();

module.exports = {
  fetchNews,
  getNovidades,
  respondeEAtualiza,
  atualizaSobreCriciuma
}