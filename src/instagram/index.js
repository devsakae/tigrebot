const config = require('../../data/tigrebot.json');
const { sendMediaUrlToGroups, log_info } = require('../../utils');

const url = 'https://instagram-scraper-api2.p.rapidapi.com/v1/post_info?code_or_id_or_url='
const options = {
  method: 'GET',
  headers: {
    'x-rapidapi-key': process.env.RAPIDAPI_KEY,
    'x-rapidapi-host': 'instagram-scraper-api2.p.rapidapi.com'
  }
};

const instagram = async (m) => {
  if (m.from === process.env.BOT_OWNER && m.body.includes("instagram.com")) {
    log_info("Fetching instagram! Aguarde...");
    const splitado = m.body.split('/');
    instaurl = url + (splitado[3] === "p" ? splitado[4] : m.body) + '&include_insights=true';
    try {
      const response = await fetch(instaurl, options);
      const res = await response.text();
      let raw_caption = res.data.caption.text;
      raw_caption += `\n📸 ${res.data.user.username} (${res.data.user.full_name})`;
      raw_caption += `\n💛 ${res.data.metrics.like_count} curtidas 👁‍🗨 ${res.data.metrics.comment_count} comentários`;
      raw_caption += `\nCapturado e enviado até você por TigreBot - ${config.mysite}`;
      const image_versions = resposta.data.image_versions.items
      const imagem = image_versions[image_versions.length - 1].url;
      // console.log("CAPTION - ", raw_caption);
      return await log_info(raw_caption);
      // return await sendMediaUrlToGroups({ url: imagem, caption: raw_caption })
    } catch (error) {
      console.error(error);
    }
  }
}

module.exports = {
  instagram,
}