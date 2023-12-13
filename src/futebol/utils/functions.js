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
  let response = `O CRAQUE, GÊNIO, LENDÁRIO *${array[0].nickname.toUpperCase()}* jogou por aqui! 🐯\n\n${array[0].name} (${array[0].position}), nasceu em ${array[0].birthday}.`;
  if (jogos.length > 0) response += ` Pelo Tigre, disputou ${total.jogos} partidas e teve um aproveitamento de ${aproveitamento.toFixed(1)}%.\n\nSua última partida com a camisa mais bonita do mundo 🟡⚫️⚪️ foi por ${jogos[0].torneio} de ${jogos[0].ano}, tendo ${array[0].nickname} disputado ${jogos[0].jogos} jogos e conquistado ${jogos[0].v} vitórias, ${jogos[0].e} empates e ${jogos[0].d} derrotas (aproveitamento de ${(((Number(jogos[0].v) * 3) + Number(jogos[0].e)) / (Number(jogos[0].jogos) * 3) * 100).toFixed(1)}%).`
  if (clubes.length > 0) {
    response + '\n\n';
    if (jogos.length > 0) response += 'Além do nosso glorioso tricolor, ';
    response += `${array[0].nickname} jogou contra a gente 😡 vestindo a(s) camisa(s) de `
    clubes.forEach((c, i) => response += `${i === 0 ? '' : i === (clubes.length - 1) ? ' e ' : ', '}${c}${i === (clubes.length - 1) ? '.' : ''}`)
  }
  response += `\n\nHistórico completo:`
  array[0].jogos.forEach((jogo) => {
    response += `\n\n➤ *${jogo.torneio}* (${jogo.ano})`;
    response += `\n🏟 ${jogo.jogos} ${jogo.jogos > 1 ? 'jogos' : 'jogo'} (${jogo.v}V/${jogo.e}E/${jogo.d}D) ${jogo.gols > 1 ? `⚽️ ${jogo.gols} gols` : jogo.gols === 0 ? '' : '⚽️ 1 gol'}`
    if (!jogo.jogounotigre && jogo.clube) response += ` 👉 ${jogo.clube}`
  });
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

const headToHead = stats => ((((Number(stats.v) * 3) + Number(stats.e)) / (Number(stats.j) * 3)) * 100).toFixed(1);

const formataJogo = data => {
  const today = new Date()
  const sp = data.date.split('/')
  const matchDate = new Date(sp[2], sp[1], sp[0])
  const diff = today.getTime() - matchDate.getTime()
  const years = Math.ceil(diff / (1000 * 3600 * 24 * 365));
  let texto = `Tudo que aconteceu naquele HISTÓRICO, LENDÁRIO e PARA SEMPRE LEMBRADO jogo, há ${years} anos atrás...\n`
  texto += `\n👉 ${data.homeTeam} ${data.homeScore} x ${data.awayScore} ${data.awayTeam} 👈\n`;
  texto += `\n🗓 ${data.date}`;
  texto += `\n🏆 ${data.campeonato}`;
  texto += `\n📈 ${data.rodada}ª rodada (${data.fase}ª fase)`;
  texto += `\n👥 Público: ${data.publico}`;
  texto += `\n💰 Renda: $${data.renda}`;
  if (data.homeScore > 0) {
    texto += `\n\n⚽️ O(s) gol(s) de ${data.homeTeam} foi(ram) marcado(s) por:`;
    data.home_goals.forEach((m, i) => texto += `${i > 0 ? i === data.home_goals.length - 1 ? ' e' : ',' : ''} ${m.minuto}'/${m.tempo}T ${m.autor} (${m.pos})${i === data.home_goals.length - 1 ? '.' : ''}`);
  }
  if (data.awayScore > 0) {
    texto += `\n⚽️ O(s) gol(s) de ${data.awayTeam} foi(ram) marcado(s) por:`;
    data.away_goals.forEach((m, i) => texto += `${i > 0 ? i === data.home_goals.length - 1 ? ' e' : ',' : ''} ${m.minuto}'/${m.tempo}T ${m.autor} (${m.pos})${i === data.home_goals.length - 1 ? '.' : ''}`);
  }
  texto += `\n\nTreinados por ${data.home_treinador}, o time da casa tinha a seguinte escalação: `;
  data.home_escalacao.forEach((p, i) => {
    ycp = data.home_cards.find(c => c.nome === p.nome);
    texto += `${i > 0 ? i === data.home_escalacao.length - 1 ? ' e ' : ', ' : ''}${p.nome}${ycp ? ycp.card === 'Amarelo' ? ' 🟨' : ' 🟥' : ''} (${p.pos})${i === data.home_escalacao.length - 1 ? '.' : ''}`
  })
  texto += `\n\nCom ${data.away_treinador} no comando, os visitantes foram escalados assim: `;
  data.away_players.forEach((p, i) => {
    ycp = data.away_cards.find(c => c.nome === p.nome);
    texto += `${i > 0 ? i === data.away_players.length - 1 ? ' e ' : ', ' : ''}${p.nome}${ycp ? ycp.card === 'Amarelo' ? ' 🟨' : ' 🟥' : ''} (${p.pos})${i === data.away_players.length - 1 ? '.' : ''}`
  })
  if ((data.home_subs.length + data.away_subs.length) > 0) {
    texto += `\n\n🙏 Substituições na partida:`
    if (data.home_subs.length > 0) {
      for (let idx = 0; idx < data.home_subs.length; idx += 2) {
        texto += `\n[${data.home_subs[idx].minuto}'/${data.home_subs[idx].tempo}T - ${data.homeTeam}] ${data.home_subs[idx].nome} (${data.home_subs[idx].pos}) <> ${data.home_subs[idx + 1].nome} (${data.home_subs[idx + 1].pos})`
      }
    }
    if (data.away_subs.length > 0) {
      for (let idx = 0; idx < data.away_subs.length; idx += 2) {
        texto += `\n[${data.away_subs[idx].minuto}'/${data.away_subs[idx].tempo}T - ${data.awayTeam}] ${data.away_subs[idx].nome} (${data.away_subs[idx].pos}) <> ${data.away_subs[idx + 1].nome} (${data.away_subs[idx + 1].pos})`
      }
    }
  }
  return texto;
}

const jogoDeHoje = ({ jogo, time }) => {
  const gols = time.jogos.reduce((acc, curr) => {
    const check = curr.homeTeam.startsWith('CRICI')
    check
      ? acc.gm += curr.homeScore
      : acc.gm += curr.awayScore;
    check
      ? acc.gs += curr.awayScore
      : acc.gs += curr.homeScore
    return acc;
  }, { gm: 0, gs: 0 });
  const today = new Date()
  const sp = jogo.date.split('/')
  const matchDate = new Date(sp[2], sp[1], sp[0])
  const diff = today.getTime() - matchDate.getTime()
  const years = Math.ceil(diff / (1000 * 3600 * 24 * 365));
  const adversario = jogo.homeTeam.startsWith('CRICI') ? jogo.awayTeam : jogo.homeTeam;
  const adversarioScore = jogo.homeTeam.startsWith('CRICI') ? jogo.awayScore : jogo.homeScore;
  const tigreScore = jogo.homeTeam.startsWith('CRICI') ? jogo.homeScore : jogo.awayScore;
  const resultado = tigreScore > adversarioScore ? 'venceu' : tigreScore < adversarioScore ? 'perdeu' : 'empatou'
  let texto = '🟡⚫️⚪️ Hoje, na história do Tigre...\n'
  texto += `\nHá ${years} anos, mais precisamente em ${jogo.date}, o nosso tricolor enfrentava o ${adversario} (${time.uf}) pelo torneio ${jogo.campeonato} (${jogo.rodada}ª rodada da ${jogo.fase}ª fase).`
  texto += `\n\nCom público de ${jogo.publico} pessoas para uma renda de R$ ${jogo.renda}, o Tigre ${resultado} com o ${adversario} no jogo que terminou em ${jogo.homeScore} x ${jogo.awayScore}.`;
  texto += '\n\nNosso histórico contra os caras:';
  texto += `\n🎫 ${time.resumo.j} jogos`
  texto += `\n👍 ${time.resumo.v} vitórias`
  texto += `\n🫳 ${time.resumo.e} empates`
  texto += `\n👎 ${time.resumo.d} derrotas`
  texto += `\n⚽️ ${gols.gm} gols neles`
  texto += `\n🥅 ${gols.gs} gols deles`
  if (jogo.homeScore > 0) {
    texto += `\n\n⚽️ O(s) gol(s) de ${jogo.homeTeam} foi(ram) marcado(s) por:`;
    jogo.home_goals.forEach((m, i) => texto += `${i > 0 ? i === jogo.home_goals.length - 1 ? ' e' : ',' : ''} ${m.minuto}'/${m.tempo}T ${m.autor} (${m.pos})${i === jogo.home_goals.length - 1 ? '.' : ''}`);
  }
  if (jogo.awayScore > 0) {
    texto += `\n⚽️ O(s) gol(s) de ${jogo.awayTeam} foi(ram) marcado(s) por:`;
    jogo.away_goals.forEach((m, i) => texto += `${i > 0 ? i === jogo.home_goals.length - 1 ? ' e' : ',' : ''} ${m.minuto}'/${m.tempo}T ${m.autor} (${m.pos})${i === jogo.home_goals.length - 1 ? '.' : ''}`);
  }
  texto += `\n\nTreinados por ${jogo.home_treinador}, o time da casa tinha a seguinte escalação: `;
  jogo.home_escalacao.forEach((p, i) => {
    ycp = jogo.home_cards.find(c => c.nome === p.nome);
    texto += `${i > 0 ? i === jogo.home_escalacao.length - 1 ? ' e ' : ', ' : ''}${p.nome}${ycp ? ycp.card === 'Amarelo' ? ' 🟨' : ' 🟥' : ''} (${p.pos})${i === jogo.home_escalacao.length ? '.' : ''}`
  })
  texto += `\n\nCom ${jogo.away_treinador} no comando, os visitantes foram escalados assim: `;
  jogo.away_players.forEach((p, i) => {
    ycp = jogo.away_cards.find(c => c.nome === p.nome);
    texto += `${i > 0 ? i === jogo.away_players.length - 1 ? ' e ' : ', ' : ''}${p.nome}${ycp ? ycp.card === 'Amarelo' ? ' 🟨' : ' 🟥' : ''} (${p.pos})${i === jogo.away_players.length ? '.' : ''}`
  })
  if ((jogo.home_subs.length + jogo.away_subs.length) > 0) {
    texto += `\n\n🙏 Substituições na partida:`
    if (jogo.home_subs.length > 0) {
      for (let idx = 0; idx < jogo.home_subs.length; idx += 2) {
        texto += `\n[${jogo.home_subs[idx].minuto}'/${jogo.home_subs[idx].tempo}T - ${jogo.homeTeam}] ${jogo.home_subs[idx].nome} (${jogo.home_subs[idx].pos}) <> ${jogo.home_subs[idx + 1].nome} (${jogo.home_subs[idx + 1].pos})`
      }
    }
    if (jogo.away_subs.length > 0) {
      for (let idx = 0; idx < jogo.away_subs.length; idx += 2) {
        texto += `\n[${jogo.away_subs[idx].minuto}'/${jogo.away_subs[idx].tempo}T - ${jogo.awayTeam}] ${jogo.away_subs[idx].nome} (${jogo.away_subs[idx].pos}) <> ${jogo.away_subs[idx + 1].nome} (${jogo.away_subs[idx + 1].pos})`
      }
    }
  }

  return texto;
}

module.exports = {
  umAtleta,
  variosAtletas,
  organizaFestinha,
  headToHead,
  formataJogo,
  jogoDeHoje,
};
