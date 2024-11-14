const config = require('../../data/tigrebot.json');
const { sendMediaUrlToGroups, log_info, log_erro } = require('../../utils');

const url = 'https://instagram-scraper-api2.p.rapidapi.com/v1/post_info?code_or_id_or_url='
const options = {
  method: 'GET',
  port: null,
  hostname: 'instagram-scraper-api2.p.rapidapi.com',
  headers: {
    'x-rapidapi-key': process.env.RAPIDAPI_KEY,
    'x-rapidapi-host': 'instagram-scraper-api2.p.rapidapi.com'
  }
};

const instagramscraperapi2 = async (m) => {
  log_info("Fetching instagram! Aguarde...");
  const splitado = m.body.split('/');
  console.info(splitado)
  instaurl = url + ((splitado[3] === "p" || splitado[3] === "reel") ? splitado[4] : m.body) + '&include_insights=true';
  console.info(instaurl)
  try {
    options.path = '/v1/post_info?code_or_id_or_url=' + instaurl
    const response = await fetch(instaurl, options);
    const responseText = await response.text();
    const res = JSON.parse(responseText)
    if (res.data.is_video) {
      return await log_erro("Post é vídeo, e eu ainda tô aprendendo patrão");
    } else {
      let raw_caption = res.data.caption.text;
      raw_caption += `\n📸 ${res.data.user.username} (${res.data.user.full_name})`;
      raw_caption += `\n💛 ${res.data.metrics.like_count} curtidas 👁‍🗨 ${res.data.metrics.comment_count} comentários`;
      raw_caption += `\nCapturado e enviado até você por TigreBot - ${config.mysite}`;
      const image_versions = resposta.data.image_versions.items
      const imagem = image_versions[image_versions.length - 1].url;
      console.info(imagem);
      return await sendMediaUrlToGroups({ url: imagem, caption: raw_caption })
    }
  } catch (error) {
    return await log_erro(error);
  }
}

module.exports = {
  instagramscraperapi2,
}