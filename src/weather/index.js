const { fetchWithParams } = require("../../utils");
const { sendMediaUrlToGroups, sendTextToGroups } = require("../../utils/sender");

const clima = async () => {
  const response = await getWeather();
  if (response.media) return sendMediaUrlToGroups({ url: response.media, caption: response.caption })
  return sendTextToGroups(response.caption);
}

const getWeather = async () => {
  try {
    const { data } = await fetchWithParams({
      url: process.env.WEATHERBIT_API_URL + '/current',
      host: process.env.WEATHERBIT_API_HOST,
      params: {
        lat: '-28.6783',
        lon: '-49.3704',
        units: 'metric',
        lang: 'pt'
      }
    });
    return { caption: `Temperatura de ${data[0].temp}° e ${data[0].weather.description.toLowerCase()} em Criciúma/SC agora.`, url: `https://cdn.weatherbit.io/static/img/icons/${data[0].weather.icon}.png` }
  } catch (err) {
    console.error(err);
    return { caption: 'Erro ao buscar a previsão do tempo. Leva um casaquinho.', url: null }
  }
}

module.exports = {
  clima,
  getWeather,
}