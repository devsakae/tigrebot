const { fetchWithParams, fetchApi } = require("../../utils");
const {  sendTextToGroups } = require("../../utils/sender");

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
  0: '☀️ Sol, meu querido sol',
  1: '🌤 Poucas nuvens - 1/8 a 3/8 do céu coberto por nuvens',
  2: '⛅️ Parcialmente nublado - 4/8 a 6/8 do céu coberto por nuvens, sol intermitente',
  3: '☁️ Nublado - 7/8 a 8/8 do céu coberto por nuvens, pouco sol, sem chuva',
  4: '😶‍🌫️ Neblina',
  5: '🌦 Chuvas pontuais',
  6: '🌧 Chuvas',
  7: '🌨 Diz a wetter.com que vai até nevar...',
  8: '☔️ Leve um guarda chuva',
  0: '⛈ Tempestades',
  10: '🌤 Poucas nuvens',
  20: '🌥 Muitas nuvens no céu',
  30: '☁️ Nublado',
  40: '🌤 O sol vem depois da neblina',
  45: '🌤 O sol vem depois da neblina',
  48: '🌤 O sol vem depois da neblina',
  49: '🌤 O sol vem depois da neblina',
  50: '🌦 Chuva leve',
  51: '🌦 Chuva leve', 
  55: '🌦 Pancadas de chuva isoladas', // 55 | Strong drizzle | Precipitation in liquid form with droplet size smaller than 0.6 mm, rainfall from 0.5 litres/hour 
  56: '🌦 Pancadas de chuva isoladas', // 56 | Slight drizzle, freezing | Precipitation in liquid form with droplet size smaller than 0.6 mm, rainfall up to 0.2 litres/hour, temperatures below zero degrees Celsius 
  57: '⚠️🌦 Chuva e frio', // 57 | Strong drizzle, freezing | Precipitation in liquid form with droplet size smaller than 0.6 mm, rainfall from 0.5 litres/hour, temperatures below zero degrees Celsius 
  60: '🌦 Chuva! Vai de guarda chuva!', // 60 | Light rain | Precipitation in liquid form in an area >10km² and longer than 45 minutes (also with interruptions), droplet size 0.6 to 3 mm, rainfall up to 0.5 litres/hour 
  61: '🌧 Chuva leve', // 61 | Light rain | Precipitation in liquid form in an area >10km² and longer than 45 minutes (also with interruptions), droplet size 0.6 to 3 mm, rainfall up to 0.5 litres/hour 
  62: '🌧 Chuva média', // 63 | Moderate rain | Precipitation in liquid form in an area >10km² and longer than 45 minutes (also with interruptions), droplet size 0.6 to 3 mm, rainfall between 0.5 and 4 litres/hour 
  65: '🌧 Muita chuva!', // 65 | Heavy rain | Precipitation in liquid form in an area >10km² and longer than 45 minutes (also with interruptions), droplet size 0.6 to 3 mm, rainfall more than 4 litres/hour 
  67: '🌧 Muita chuva', // 67 | Moderate or heavy rain, freezing | Precipitation in liquid form in an area >10km² and longer than 45 minutes (also with interruptions), droplet size 0.6 to 3 mm, rainfall up to or above 4 litres/hour, temperatures <=0°C 
  68: '🌧 Chance de granizo', // 68 | Light sleet | Precipitation in liquid and solid form, precipitation quantity up to 0.5 litres/hour 
  69: '🌧 Granizo', // 69 | Heavy sleet | Precipitation in liquid and solid form, precipitation quantity more than 2 litres/hour 
  70: '❄️ Diz que vai até nevar...', // 70 | Light snowfall | Convective precipitation in solid form in a confined area (<10km²) with a maximum duration of 45 minutes, new snowfall less than 1 cm / hour 
  71: '❄️ Diz que vai até nevar...', // 71 | Light snowfall | Convective precipitation in solid form in a confined area (<10km²) with a maximum duration of 45 minutes, new snowfall less than 1 cm / hour 
  73: '❄️ Diz que vai até nevar...', // 73 | Moderate snowfall | Precipitation in solid form consisting of fine ice crystals, new snowfall between 1 and 4 centimetres/hour 
  75: '❄️ Diz que vai até nevar...', // 75 | Heavy snowfall | Precipitation in solid form consisting of fine ice crystals, new snowfall more than 4 centimetres/hour 
  80: '🌨 Possibilidade de chuvas isoladas', // 80 | Light showers | Convective precipitation in liquid form in a confined area (<10km²) with a maximum duration of 45 minutes, droplet size 0.6 to 3 mm, rainfall between 0.1 and 0.4 liters / 10min 
  81: '🌨 Chuvas isoladas', // 81 | Showers | Convective precipitation in liquid form in a confined area (<10km²) with a maximum duration of 45 minutes, droplet size 0.6 to 3 mm, rainfall between 0.2 and 2 liters / 10min 
  82: '🌨 Pancadas de chuva isoladas', // 82 | Heavy showers | Convective precipitation in liquid form in a confined area (<10km²) with a maximum duration of 45 minutes, droplet size 0.6 to 3 mm, rainfall more than 2 liters / 10min 
  83: '❄️ Diz que vai até nevar...', // 83 | Light snowfall/showers | Convective precipitation in liquid and solid form in a confined area (<10km²) with a maximum duration of 45 minutes, precipitation between 0.1 and 0.4 liters / hour 
  84: '❄️ Diz que vai até nevar...', // 84 | Heavy snowfall/showers | Convective precipitation in liquid and solid form in a confined area (<10km²) with a maximum duration of 45 minutes, precipitation exceeding 2 litres / hour 
  85: '❄️ Diz que vai até nevar...', // 85 | Light flurry of snow | Convective precipitation in solid form in a confined area (<10km²) with a maximum duration of 45 minutes, new snowfall less than 1 cm / hour 
  86: '❄️ Diz que vai até nevar...', // 86 | Moderate or heavy flurry of snow | Convective precipitation in solid form in a confined area (<10km²) with a maximum duration of 45 minutes, new snowfall more than 1 cm / hour 
  95: '⛈ Tempestade', // 95 | Light thunderstorm | Lightning and thunder, usually accompanied by heavy rain, hail or gusts of wind; low lightning frequency, longer intervals between individual discharges 
  96: '⛈ Tempestade', // 96 | Severe thunderstorm | Lightning and thunder, usually accompanied by heavy rain, hail or gusts of wind; high frequency of lightning, constant rolls of thunder
}

const getForecast = async () => {
  try {
    const { items } = await fetchApi({
      url: 'https://forecast9.p.rapidapi.com/rapidapi/forecast/-28.6783/-49.3704/summary/',
      host: 'forecast9.p.rapidapi.com',
    });
    let previsao = `Previsão do tempo para Criciúma/SC hoje:`
    if (forecastCodes[items[0].weather.state]) previsao += forecastCodes[items[0].weather.state]
    previsao += `\n🌡 Temperatura entre ${items[0].temperature.min} e ${items[0].temperature.max}° (sensação térmica de ${items[0].windchill.min} a ${items[0].windchill.max}°)`
    if (items[0].weather.state === 6) previsao += `\n☔️ ${items[0].prec.probability}% de precipitação`
    if (items[0].wind.significationWind) { previsao += `\n💨 Vento ${items[0].wind.text} de ${items[0].wind.min}-${items[0].wind.max} ${items[0].wind.unit}` }
    return { caption: previsao }
  } catch (err) {
    return console.error(err);
  }
}

module.exports = {
  clima,
  getWeather,
  getForecast,
}