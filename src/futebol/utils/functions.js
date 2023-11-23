const calculaIdade = (date) => {
  const formattedDate = date.split("/")
  const birthdateTimeStamp = new Date(formattedDate[2], formattedDate[1], formattedDate[0])
  const currentDate = new Date().getTime();
  const difference = currentDate - birthdateTimeStamp;
  const currentAge = Math.floor(difference / 31557600000)
  return currentAge
};

const umAtleta = (array) => {
  const { stats } = array[0];
  return `O CRAQUE, GÊNIO, LENDÁRIO *${array[0].nickname.toUpperCase()}* já jogou no Tigre! 🐯

${array[0].name} (${array[0].position}, ${calculaIdade(array[0].birthday)} anos)
${array[0].period}

🏟 ${stats.matches} partidas
⚽️ ${stats.goals} gols
👍🏽 ${stats.w} vitórias
🤌🏽 ${stats.d} empates
🖕🏽 ${stats.l} derrotas
🟨 ${stats.yc} cartões amarelos
🟥 ${stats.rc} cartões vermelhos

Fonte: http://www.meutimenarede.com.br - Scraped by @devsakae`
};

const variosAtletas = (array) => {
  let maisDeUm = `Encontrei mais de um atleta que jogou aqui! Se liga e escolha o certo:\n`
  array.forEach((obj) => response += `\n✅ ${obj.name} (${obj.position}) - ${obj.stats.matches} jogos entre ${obj.period.substring(8)}`)
  maisDeUm = maisDeUm.concat('\n\nFonte: http://www.meutimenarede.com.br - Scraped by @devsakae');
  return maisDeUm;
};

const organizaFestinha = (array) => {
  let response = 'PARABÉNS para os atletas e ex atletas do Tigre que assopram velinhas na comemoração de seu aniversário na data de hoje! 🎉 🎉 \n';
  array.forEach((atleta) => response += `\n🎁 ${atleta.name} (${atleta.position} - ${atleta.period}) fazendo ${calculaIdade(atleta.birthday) + 1} anos`);
  return response;
}

module.exports = {
  umAtleta,
  variosAtletas,
  organizaFestinha,
}