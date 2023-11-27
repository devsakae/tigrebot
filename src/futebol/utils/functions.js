const calculaIdade = (date) => {
  const formattedDate = date.split('/');
  const birthdateTimeStamp = new Date(
    formattedDate[2],
    formattedDate[1],
    formattedDate[0],
  );
  const currentDate = new Date().getTime();
  const difference = currentDate - birthdateTimeStamp;
  const currentAge = Math.floor(difference / 31557600000);
  return currentAge;
};

const umAtleta = (array) => {
  const { jogos } = array[0];
  let response = `O CRAQUE, GÊNIO, LENDÁRIO *${array[0].nickname.toUpperCase()}* jogou por aqui! 🐯\n\n${array[0].name} (${array[0].position}, ${calculaIdade(array[0].birthday)} anos)`;
  jogos.forEach((jogo) => {
    response += `\n\n➤ *${jogo.torneio}* (${jogo.ano})`;
    if (!jogo.jogounotigre && jogo.clube) response += `\nAtuando pelo ${jogo.clube}`
    response += `\n🏟 ${jogo.jogos} ${jogo.jogos > 1 ? 'jogos' : 'jogo'} (${jogo.v}V/${jogo.e}E/${jogo.d}D) ⚽️ ${jogo.gols} ${jogo.gols > 1 ? 'gols' : 'gol'}`
  });
  response += '\n\nDados: meutimenarede.com.br\nScraped by @devsakae - tigrebot.devsakae.tech'
  return response;
}

const variosAtletas = (str, array) => {
  let response = `Pesquisando por "${str.toUpperCase()}" encontrei um monte de atletas!:\n`;
  array.forEach((obj) => response += `\n■ ${obj.name} (${obj.nickname}), ${obj.position}`);
  response += '\n\nDados: meutimenarede.com.br\nScraped by @devsakae - tigrebot.devsakae.tech'
  return response;
}

const icons = ['🎉', '🎁', '🪅', '🎈', '🎊']

const organizaFestinha = (array) => {
  array.sort((a, b) => a.name > b.name ? 1 : -1);
  let response = 'Feliz aniversário para os atletas e ex atletas que assopram velinhas na data de hoje!\n';
  array.forEach(
    (atleta, idx) => response += `\n${icons[idx % icons.length]} ${atleta.name.toUpperCase()} (${atleta.nickname}, ${atleta.position}) completa ${calculaIdade(atleta.birthday) + 1} anos${idx !== (array.length - 1) ? ';' : ''}`
  );
  return response;
}

module.exports = {
  umAtleta,
  variosAtletas,
  organizaFestinha,
};
