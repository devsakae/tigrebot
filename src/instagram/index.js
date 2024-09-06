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
  log_info("Fetching instagram! Aguarde...");
  if (m.from === process.env.BOT_OWNER && m.body.includes("instagram.com")) {
    const splitado = m.body.split('/');
    instaurl = url + (splitado[3] === "p" ? splitado[4] : m.body) + '&include_insights=true';
    try {
      const response = await fetch(instaurl, options);
      const { data } = await response.text();
      let caption = data.caption.text;
      caption += `\n📸 ${data.user.username} (${data.user.full_name})`;
      caption += `\n💛 ${data.metrics.like_count} curtidas 👁‍🗨 ${data.metrics.comment_count} comentários`;
      caption += `\nCapturado e enviado até você por TigreBot - ${config.mysite}`;
      sendMediaUrlToGroups({ url: data.image_versions.items[-1].url, caption: caption })
    } catch (error) {
      console.error(error);
    }  
  }
}

module.exports = {
  instagram
}