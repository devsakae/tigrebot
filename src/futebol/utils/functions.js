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
  // const { jogos } = array[0];
  const jogos = array[0].jogos.filter(j => j.jogounotigre);
  const allClubs = array[0].jogos.filter(j => !j.jogounotigre).reduce((acc, curr) => {
    acc.push(curr.clube)
    return acc;
  }, [])
  const clubes = [...new Set(allClubs)]
  const total = jogos.reduce((acc, curr) => {
    acc.jogos += Number(curr.jogos);
    acc.gols += Number(curr.gols);
    acc.v += Number(curr.v);
    acc.e += Number(curr.e);
    acc.d += Number(curr.d);
    return acc;
  }, { jogos: 0, gols: 0, v: 0, e: 0, d: 0 });
  const aproveitamento = (((total.v * 3) + (total.e)) / (total.jogos * 3)) * 100
  let response = `O CRAQUE, GÊNIO, LENDÁRIO *${array[0].nickname.toUpperCase()}* jogou por aqui! 🐯\n\n${array[0].name} (${array[0].position}), nascido em ${array[0].birthday}, disputou ${total.jogos} partidas pelo Criciúma Esporte Clube, com aproveitamento de ${aproveitamento.toFixed(1)}%.`;
  response += `\n\nSua última partida pelo tricolor foi por ${jogos[0].torneio} de ${jogos[0].ano}, tendo ${array[0].nickname} disputado ${jogos[0].jogos} jogos e conquistado ${jogos[0].v} vitórias, ${jogos[0].e} empates e ${jogos[0].d} derrotas (aproveitamento de ${(((Number(jogos[0].v) * 3) + Number(jogos[0].e)) / (Number(jogos[0].jogos) * 3) * 100).toFixed(1)}%.)`
  if (clubes.length > 0) {
    response += `\n\nAlém do nosso glorioso tricolor, ${array[0].nickname} também jogou contra a gente 😡 vestindo a(s) camisa(s) de `
    clubes.forEach((c, i) => response += `${i === 0 ? '' : i === (clubes.length - 1) ? ' e ' : ', '}${c}${i === (clubes.length - 1) ? '.' : ''}`)
  }
  response += `\n\nHistórico completo:`
  array[0].jogos.forEach((jogo) => {
    response += `\n\n➤ *${jogo.torneio}* (${jogo.ano})`;
    response += `\n🏟 ${jogo.jogos} ${jogo.jogos > 1 ? 'jogos' : 'jogo'} (${jogo.v}V/${jogo.e}E/${jogo.d}D) ⚽️ ${jogo.gols > 0 ? jogo.gols : 'Nenhum'} ${jogo.gols > 1 ? 'gols' : 'gol'}`
    if (!jogo.jogounotigre && jogo.clube) response += ` 👉 ${jogo.clube}`
  });
  // jogos.forEach((jogo) => {
  //   response += `\n\n➤ *${jogo.torneio}* (${jogo.ano})`;
  //   if (!jogo.jogounotigre && jogo.clube) response += `\nAtuando pelo ${jogo.clube}`
  //   response += `\n🏟 ${jogo.jogos} ${jogo.jogos > 1 ? 'jogos' : 'jogo'} (${jogo.v}V/${jogo.e}E/${jogo.d}D) ⚽️ ${jogo.gols} ${jogo.gols > 1 ? 'gols' : 'gol'}`
  // });
  response += '\n\nDados: meutimenarede.com.br\nScraped by @devsakae - devsakae.tech/tigrebot'
  return response;
}

const variosAtletas = (str, array) => {
  let response = `Pesquisando por "${str.toUpperCase()}" encontrei um monte de atletas!:\n`;
  array.forEach((obj) => response += `\n■ ${obj.name} (${obj.nickname}), ${obj.position}`);
  response += '\n\nDados: meutimenarede.com.br\nScraped by @devsakae - devsakae.tech/tigrebot'
  return response;
}


const organizaFestinha = (array) => {
  array.sort((a, b) => a.name > b.name ? 1 : -1);
  let response = `A lista completa de atletas (e ex atletas) que nasceram no dia de hoje é a seguinte:\n`;
  if (array.some((p) => p.jogos.some((j) => j.jogounotigre))) response += '(🐯 = Jogou com a camisa do Tigre)\n'
  array.forEach(
    atleta => {
      response += `\n‣ ${atleta.name} (${atleta.nickname} - ${atleta.position}), ${calculaIdade(atleta.birthday) + 1}º aniversário`
      if (atleta.jogos.some((j) => j.jogounotigre)) response += ' 🐯'
    }
  );
  return response;
}

module.exports = {
  umAtleta,
  variosAtletas,
  organizaFestinha,
};
