const googleNewsAPI = require("google-news-json");
const { sendTextToGroups, sendTextToChannels, saveLocal } = require("../../utils");
const config = require("../../data/tigrebot.json");

const getNews = async () => {
  const articles = await googleNewsAPI.getNews(googleNewsAPI.SEARCH, "Criciúma", "pt-BR");
  const today = new Date();
  const oneLess = new Date(today.getTime());
  oneLess.setDate(today.getDate() - 1)
  const yesterday = new Date(oneLess);
  return articles.items.filter(a => new Date(a.pubDate) > yesterday)
}

const publicaUltimaNoticia = async () => {
  const n = await getNews();
  if (config.news === n[0].guid.text) return;
  const textoFormatado = `${n[0].title}\n\n📆 ${n[0].pubDate}\nℹ️ Fonte: ${n[0].source.text} - ${n[0].source.url}\n\nLink para a notícia completa 👉 ${n[0].link}`;
  config.news = n[0].guid.text;
  saveLocal(config);
  await sendTextToGroups(textoFormatado)
  return await sendTextToChannels(textoFormatado)
}

const respondeEAtualiza = async () => {
  const n = await getNews();
  return `Parece que ${n[0].title[0].toLowerCase() + n[0].title.substring(1)}.`;
}

module.exports = {
  getNews,
  publicaUltimaNoticia,
  respondeEAtualiza,
}