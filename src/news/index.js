const googleNewsAPI = require("google-news-json");
const { sendTextToGroups, sendTextToChannels } = require("../../utils");

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
  const textoFormatado = `${n[0].title}\n\n📆 ${n[0].pubDate}\n👉 Leia em ${n[0].link}`
  await sendTextToGroups(textoFormatado)
  return await sendTextToChannels(textoFormatado)
}

module.exports = {
  getNews,
  publicaUltimaNoticia,
}