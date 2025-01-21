const googleNewsScraper = require('google-news-scraper');

(async () => {
  console.log("Iniciando...")
  const gnObj = {
    searchTerm: "Criciúma",
    queryVars: {
      gl: "pt-BR",
      ceid: "BR%3Apt-419"
  },
  }

  const articles = await googleNewsScraper(gnObj);
  console.log(articles);
})()
