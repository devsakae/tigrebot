const prompts = require("../../data/prompts.json");
const config = require("../../data/tigrebot.json");
const { fetchWithParams, fetchApi } = require("../../utils");
const { sendTextToGroups } = require("../../utils/sender");

const clima = async () => {
  const response = await getForecast();
  return await sendTextToGroups(response.caption);
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

const forecastCodes = {
  // Para hoje, a previsão é de
  0: 'ir pra praia (quem pode) ☀️',
  1: 'sol ☀️',
  2: 'céu parcialmente nublado, com sol intermitente ⛅️',
  3: 'céu nublado ☁️',
  4: 'tempo fechado, com neblina 😶‍🌫️',
  5: 'chuva em alguns lugares 🌦',
  6: 'muita chuva 🌧',
  7: 'clima esquisito, com possibilidade de granizo 🌨',
  8: 'muita chuva ☔️',
  0: 'vai ter tempestades ⛈',
  10: 'sol, com algumas nuvens 🌤',
  20: 'sol e várias nuvens 🌥',
  30: 'tempo fechado (totalmente nublado) ☁️',
  40: 'clima ensolarado depois da névoa 🌤',
  45: 'clima ensolarado depois da névoa 🌤',
  48: 'clima ensolarado depois da névoa 🌤',
  49: 'clima ensolarado depois da névoa 🌤',
  50: 'chuva leve em alguns lugares 🌦',
  51: 'chuva leve em alguns lugares 🌦',
  55: 'pancadas isoladas de chuva 🌦', // 55 | Strong drizzle | Precipitation in liquid form with droplet size smaller than 0.6 mm, rainfall from 0.5 litres/hour 
  56: 'pancadas isoladas de chuva 🌦', // 56 | Slight drizzle, freezing | Precipitation in liquid form with droplet size smaller than 0.6 mm, rainfall up to 0.2 litres/hour, temperatures below zero degrees Celsius 
  57: 'chuva e frio ⚠️🌦', // 57 | Strong drizzle, freezing | Precipitation in liquid form with droplet size smaller than 0.6 mm, rainfall from 0.5 litres/hour, temperatures below zero degrees Celsius 
  60: 'chove 🌦', // 60 | Light rain | Precipitation in liquid form in an area >10km² and longer than 45 minutes (also with interruptions), droplet size 0.6 to 3 mm, rainfall up to 0.5 litres/hour 
  61: 'chuva leve 🌧', // 61 | Light rain | Precipitation in liquid form in an area >10km² and longer than 45 minutes (also with interruptions), droplet size 0.6 to 3 mm, rainfall up to 0.5 litres/hour 
  62: 'chuva 🌧', // 63 | Moderate rain | Precipitation in liquid form in an area >10km² and longer than 45 minutes (also with interruptions), droplet size 0.6 to 3 mm, rainfall between 0.5 and 4 litres/hour 
  65: 'chove muito 🌧', // 65 | Heavy rain | Precipitation in liquid form in an area >10km² and longer than 45 minutes (also with interruptions), droplet size 0.6 to 3 mm, rainfall more than 4 litres/hour 
  67: 'chove muito 🌧', // 67 | Moderate or heavy rain, freezing | Precipitation in liquid form in an area >10km² and longer than 45 minutes (also with interruptions), droplet size 0.6 to 3 mm, rainfall up to or above 4 litres/hour, temperatures <=0°C 
  68: 'pode ter granizo 🌧', // 68 | Light sleet | Precipitation in liquid and solid form, precipitation quantity up to 0.5 litres/hour 
  69: 'vai ter granizo 🌧', // 69 | Heavy sleet | Precipitation in liquid and solid form, precipitation quantity more than 2 litres/hour 
  70: 'vai até nevar de tão frio ❄️', // 70 | Light snowfall | Convective precipitation in solid form in a confined area (<10km²) with a maximum duration of 45 minutes, new snowfall less than 1 cm / hour 
  71: 'vai até nevar de tão frio ❄️', // 71 | Light snowfall | Convective precipitation in solid form in a confined area (<10km²) with a maximum duration of 45 minutes, new snowfall less than 1 cm / hour 
  73: 'vai até nevar de tão frio ❄️', // 73 | Moderate snowfall | Precipitation in solid form consisting of fine ice crystals, new snowfall between 1 and 4 centimetres/hour 
  75: 'vai até nevar de tão frio ❄️', // 75 | Heavy snowfall | Precipitation in solid form consisting of fine ice crystals, new snowfall more than 4 centimetres/hour 
  80: 'chuvas leves pontuais 🌨', // 80 | Light showers | Convective precipitation in liquid form in a confined area (<10km²) with a maximum duration of 45 minutes, droplet size 0.6 to 3 mm, rainfall between 0.1 and 0.4 liters / 10min 
  81: 'chuvas pontuais 🌨', // 81 | Showers | Convective precipitation in liquid form in a confined area (<10km²) with a maximum duration of 45 minutes, droplet size 0.6 to 3 mm, rainfall between 0.2 and 2 liters / 10min 
  82: 'pancadas de chuva isoladas 🌨', // 82 | Heavy showers | Convective precipitation in liquid form in a confined area (<10km²) with a maximum duration of 45 minutes, droplet size 0.6 to 3 mm, rainfall more than 2 liters / 10min 
  83: 'nevar de tão frio ❄️', // 83 | Light snowfall/showers | Convective precipitation in liquid and solid form in a confined area (<10km²) with a maximum duration of 45 minutes, precipitation between 0.1 and 0.4 liters / hour 
  84: 'neve, de tão frio ❄️', // 84 | Heavy snowfall/showers | Convective precipitation in liquid and solid form in a confined area (<10km²) with a maximum duration of 45 minutes, precipitation exceeding 2 litres / hour 
  85: 'neve, de tão frio ❄️', // 85 | Light flurry of snow | Convective precipitation in solid form in a confined area (<10km²) with a maximum duration of 45 minutes, new snowfall less than 1 cm / hour 
  86: 'neve, de tão frio ❄️', // 86 | Moderate or heavy flurry of snow | Convective precipitation in solid form in a confined area (<10km²) with a maximum duration of 45 minutes, new snowfall more than 1 cm / hour 
  95: 'pancadas leves de chuva ⛈', // 95 | Light thunderstorm | Lightning and thunder, usually accompanied by heavy rain, hail or gusts of wind; low lightning frequency, longer intervals between individual discharges 
  96: 'tempestade ⛈', // 96 | Severe thunderstorm | Lightning and thunder, usually accompanied by heavy rain, hail or gusts of wind; high frequency of lightning, constant rolls of thunder
}

const getForecast = async () => {
  try {
    // LAT:  -28.6775
    // LONG: -49.3697
    const response = await fetchWithParams({
      url: 'https://open-weather13.p.rapidapi.com/city',
      host: 'open-weather13.p.rapidapi.com',
      params: {
        city: 'Criciúma',
        lang: 'PT_BR'
      },
    });
    let previsao = config.tigrelino ? prompts.tigrelino.previsao[Math.floor(Math.random() * prompts.tigrelino.previsao.length)] : prompts.previsao[Math.floor(Math.random() * prompts.previsao.length)];
    let long = previsao + ' ' + response.weather[0].description + ' ';
    let short = previsao + ' ' + response.weather[0].description + ' ';
    // if (forecastCodes[items[0].weather.state]) {
    //   long += `${forecastCodes[items[0].weather.state]} `;
    //   short += `${forecastCodes[items[0].weather.state]} `;
    // }
    const calcCelsius = fah => ((fah - 32) * 5/9).toFixed(1);
    
    long += (config.tigrelino ? '' : `com sensação térmica de ${calcCelsius(response.main.feels_like)}°. `)
    short += `com sensação térmica de ${calcCelsius(response.main.feels_like)}°. `;
    console.info(long);
    console.info(short);
    return { long, short };
  } catch (err) {
    console.error(err);
    return { long: '', short: 'Hoje não temos previsão do tempo porque deu pau na API :(' }
  }
}

module.exports = {
  clima,
  getWeather,
  getForecast,
}