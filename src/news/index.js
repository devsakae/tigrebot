const axios = require('axios');

const getNews = async () => {
  const today = new Date();
  const oneLess = new Date(today.getTime());
  oneLess.setDate(today.getDate() - 1);
  const yesterday = new Date(oneLess);
  const options = {
    method: 'POST',
    url: 'https://newsnow.p.rapidapi.com/newsv2',
    headers: {
      'content-type': 'application/json',
      'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
      'X-RapidAPI-Host': 'newsnow.p.rapidapi.com'
    },
    data: {
      query: 'Criciúma',
      page: 1,
      time_bounded: true,
      from_date: today.toLocaleDateString('pt-br'),
      to_date: yesterday.toLocaleDateString('pt-br'),
      location: '',
      category: '',
      source: '4oito'
    }
  };
  try {
    const response = await axios.request(options);
    console.log(response.data);
  } catch (error) {
    console.error(error);
  }
  
}

module.exports = {
  getNews,
}