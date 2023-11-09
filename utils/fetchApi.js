const { default: axios } = require("axios");
const { client } = require('../src/connections');

const fetchApi = async ({ url, host }) => {
  try {
    const response = await axios.request({
      method: 'GET',
      url: url,
      headers: {
        'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
        'X-RapidAPI-Host': host,
      },
    });
    return response.data;
  } catch (err) {
    console.error(err);
    return client.sendMessage(process.env.BOT_OWNER, err);
  }
}

const fetchWithParams = async ({ url, host, params }) => {
  try {
    const response = await axios.request({
      method: 'GET',
      url: url,
      params: params,
      headers: {
        'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
        'X-RapidAPI-Host': host,
      },
    });
    return response.data;
  } catch (err) {
    console.error(err);
    return client.sendMessage(process.env.BOT_OWNER, err);
  }
}

module.exports = {
  fetchApi,
  fetchWithParams,
}