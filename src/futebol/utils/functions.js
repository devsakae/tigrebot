const config = require('../../../data/tigrebot.json');
const prompts = require('../../../data/prompts.json');
const { postTweet } = require('../../../utils/twitter');

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
    if (jogos.length > 0) response += '\n\nAlém do nosso glorioso tricolor,';
    response += ` ${array[0].nickname} jogou contra a gente 😡 vestindo a(s) camisa(s) de `
    clubes.forEach((c, i) => response += `${i === 0 ? '' : i === (clubes.length - 1) ? ' e ' : ', '}${c}${i === (clubes.length - 1) ? '.' : ''}`)
  }
  response += `\n\nHistórico completo:`
  array[0].jogos.forEach(jogo => {
    response += `\n\n➤ *${jogo.torneio}* (${jogo.ano})`;
    response += `\n🏟 ${jogo.jogos} ${jogo.jogos > 1 ? 'jogos' : 'jogo'} (${jogo.v}V/${jogo.e}E/${jogo.d}D) ${+(jogo.gols) > 1 ? `⚽️ ${jogo.gols} gols` : +(jogo.gols) === 0 ? '' : '⚽️ 1 gol'}`
    if (!jogo.jogounotigre && jogo.clube) response += ` 👉 ${jogo.clube}`
  });
  response += `\n\nDados: meutimenarede.com.br\nScraped by @devsakae - ${config.devsakae}`
  return response;
}

const variosAtletas = (str, array) => {
  let response = `Pesquisando por "${str.toUpperCase()}" encontrei um monte de atletas!:\n`;
  array.forEach((obj) => response += `\n■ ${obj.name} (${obj.nickname}), ${obj.position}`);
  response += `\n\nDados: meutimenarede.com.br\nScraped by @devsakae - ${config.mysite}`
  return response;
}

const organizaFestinha = (array) => {
  array.sort((a, b) => a.name > b.name ? 1 : -1);
  let response = ((config.tigrelino ? 'OTROS ATTLETA-JOGADO Q FISERAO NASEMEMTO OGE' : 'Outros atletas (e ex atletas) que nasceram no dia de hoje:') + '\n');
  if (array.some((p) => p.jogos.some((j) => j.jogounotigre))) response += ((config.tigrelino ? '(CON 🐯 E PQJA JOGO NO TIGRAUM)' : '(🐯 = Jogou com a camisa do Tigre)') + '\n')
  array.forEach(
    atleta => {
      response += (config.tigrelino ? `\n🏴󠁧󠁢󠁷󠁬󠁳󠁿 ${atleta.name.toUpperCase()} ,${atleta.position.toUpperCase()}` : `\n∙ ${atleta.name.toUpperCase()} (${atleta.position})`)
      if (atleta.jogos.some((j) => j.jogounotigre)) response += ' 🐯'
    }
  );
  return response;
}

const organizaFestinhaPrive = (array) => {
  const priveArray = array.filter((p) => p.jogos.some((j) => j.jogounotigre)).sort((a, b) => a.name > b.name ? 1 : -1);
  let response = `Outros atletas (e ex atletas) do Tigre que nasceram no dia de hoje:\n`;
  priveArray.forEach(
    atleta => {
      response += `\n∙ ${atleta.name} (${atleta.position})`
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
  const moeda = Number(sp[2]) >= 1994 ? 'R$' : Number(sp[2]) >= 1990 ? 'Cr$' ? Number(sp[2]) >= 1989 : 'Cz$' : 'Cr$';
  let texto = `Tudo que aconteceu naquele HISTÓRICO, LENDÁRIO e PARA SEMPRE LEMBRADO jogo disputado há ${years} anos...\n`
  texto += `\n👉 ${data.homeTeam} ${data.homeScore} x ${data.awayScore} ${data.awayTeam} 👈\n`;
  texto += `\n🗓 ${data.date}`;
  texto += `\n🏆 ${data.campeonato}`;
  texto += `\n📈 ${data.rodada}ª rodada (${data.fase}ª fase)`;
  texto += `\n👥 Público: ${data.publico}`;
  texto += `\n💰 Renda: ${moeda} ${data.renda}`;
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

const formataAdversario = (adversario) => {
  let response = "O ~querido~ " + adversario.adversario + " (" + adversario.uf + ") nos enfrentou o total de " + adversario.resumo.j + " vezes, sendo que a última partida registrada no meu banco de dados foi em " + adversario.jogos[0].date + " pelo(a) " + adversario.jogos[0].campeonato + ".\n";
  response += "\n✅ Vencemos: *" + adversario.resumo.v + "*";
  response += "\n🫳 Empates: *" + adversario.resumo.e + "*";
  response += "\n🤬 Perdemos: *" + adversario.resumo.d + "*\n\n";
  response += "De todos os confrontos, eu nunca vou esquecer ";
  response += formataJogo(adversario.jogos[Math.floor(Math.random() * adversario.jogos.length)]);
  return response;
}

const golsDoTigre = score => score === 1 ? 'Nosso único gol foi marcado por' : 'Nossos gols foram anotados por';
const golsDosCara = score => score === 1 ? 'O gol deles foi marcado por' : 'Os gols deles foram marcados por';

const jogoDestaqueDoDia = async ({ jogo, time }) => {
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
  const moeda = Number(sp[2]) >= 1994 ? 'R$' : Number(sp[2]) >= 1990 ? 'Cr$' ? Number(sp[2]) >= 1989 : 'Cz$' : 'Cr$';
  const matchDate = new Date(sp[2], sp[1], sp[0])
  const diff = today.getTime() - matchDate.getTime()
  const years = Math.ceil(diff / (1000 * 3600 * 24 * 365));
  const tigre = jogo.homeTeam.startsWith('CRICI')
    ? { score: jogo.homeScore, escalacao: jogo.home_escalacao, gols: jogo.home_goals }
    : { score: jogo.awayScore, escalacao: jogo.away_players, gols: jogo.away_goals };
  const adversario = jogo.homeTeam.startsWith('CRICI') ? jogo.awayTeam : jogo.homeTeam;
  const adversarioScore = jogo.homeTeam.startsWith('CRICI') ? jogo.awayScore : jogo.homeScore;
  const resultado = (config.tigrelino ? (tigre.score > adversarioScore ? 'VENSE O TIME' : tigre.score < adversarioScore ? 'PERDE P' : 'EMPATA CO') : (tigre.score > adversarioScore ? 'venceu o(a)' : tigre.score < adversarioScore ? 'foi derrotado pelo(a)' : 'empatou com o(a)'))
  let texto = ((config.tigrelino ? prompts.tigrelino.jogododia[Math.floor(Math.random() * prompts.tigrelino.jogododia.length)] : prompts.jogododia[Math.floor(Math.random() * prompts.jogododia.length)]) + '\n\n')
  // let tweet = 'Grandes jogos do nosso @CriciumaEC: '
  texto += (config.tigrelino ? `FAIS ${years} ANOS EM ${jogo.date} NOSO TIGRAUM JOGO COM TRA ${adversario.toUpperCase()} (${time.uf.toUpperCase()}) ${jogo.campeonato.startsWith('Amis') ? 'N1 JOGO AMINSTOZO' : jogo.campeonato.startsWith('Copa') ? `PELA ${jogo.campeonato.toUpperCase()}` : `PELA ${jogo.rodada} RODODADA ${jogo.campeonato.toUpperCase()}`}.` : `Há ${years} anos (em ${jogo.date}), o Tigre enfrentava o ${adversario} (${time.uf}) ${jogo.campeonato.startsWith('Amis') ? 'em partida amistosa, combinada entre os clubes' : jogo.campeonato.startsWith('Copa') ? `pela ${jogo.campeonato}` : `pela ${jogo.rodada}ª rodada do ${jogo.campeonato}`}.`);
  // tweet += `Há ${years} anos (em ${jogo.date}), o Tigre enfrentava o ${adversario} (${time.uf}) ${jogo.campeonato.startsWith('Amis') ? 'em partida amistosa, combinada entre os clubes' : jogo.campeonato.startsWith('Copa') ? `pela ${jogo.campeonato}` : `pela ${jogo.rodada}ª rodada do ${jogo.campeonato}`}.`;
  const placarMaiorNaFrente = `${jogo.homeScore > jogo.awayScore ? jogo.homeScore : jogo.awayScore} x ${jogo.homeScore > jogo.awayScore ? jogo.awayScore : jogo.homeScore}`
  texto += (config.tigrelino ? `\n\n\nFORAO ${jogo.publico} TUSSEDORS${jogo.renda > 0 ? ` Q PAGARAO ${moeda} ${jogo.renda}),` : ','} P VE O TIGRAUM ${resultado} ${adversario} EM ${placarMaiorNaFrente}.` : `\n\nCom público de ${jogo.publico} pessoas${jogo.renda > 0 ? ` e renda de ${moeda} ${jogo.renda}),` : ','} o Tigre ${resultado} ${adversario} na partida que terminou em ${placarMaiorNaFrente}.`);
  texto += (config.tigrelino ? `\n\nEM FRETANDO O ${adversario.toUpperCase()} NOIS JA:` : `\n\nNosso histórico contra ${adversario} (${time.uf}) é o seguinte:`);
  const stats = (config.tigrelino ? `\n🎫 ${time.resumo.j} VESES JOGADAS\n👍 ${time.resumo.v} FISEMO O V DE VITOREA\n🫳 EMPATEMO ${time.resumo.e} \n👎 PERDEMO ${time.resumo.d}\n⚽️ ${gols.gm} GOALS NOSOS\n🥅 ${gols.gs} GOALS DELIS` : `\n🎫 ${time.resumo.j} jogos\n👍 ${time.resumo.v} vitórias\n🫳 ${time.resumo.e} empates\n👎 ${time.resumo.d} derrotas\n⚽️ ${gols.gm} gols neles\n🥅 ${gols.gs} gols deles`)
  texto += stats
  if (jogo.homeScore > 0) {
    texto += `\n\n⚽️ ${jogo.homeTeam.startsWith('CRICI') ? golsDoTigre(jogo.homeScore) : golsDosCara(jogo.homeScore)}`;
    jogo.home_goals.forEach((m, i) => texto += `${i > 0 ? i === jogo.home_goals.length - 1 ? ' e' : ',' : ''} ${m.autor} (${m.minuto}'/${m.tempo}T)${i === jogo.home_goals.length - 1 ? '.' : ''}`);
  }
  if (jogo.awayScore > 0) {
    texto += `\n\n⚽️ ${jogo.awayTeam.startsWith('CRICI') ? golsDoTigre(jogo.awayScore) : golsDosCara(jogo.awayScore)}`;
    jogo.away_goals.forEach((m, i) => texto += `${i > 0 ? i === jogo.away_goals.length - 1 ? ' e' : ',' : ''} ${m.autor} (${m.minuto}'/${m.tempo}T)${i === jogo.away_goals.length - 1 ? '.' : ''}`);
  }
  
  // Desse jeito ficaria mais fácil, só me dei conta agora
  if (config.tigrelino) {
    texto += `\n\nTRENADOS POR ${jogo.home_treinador.toUpperCase()} O ${jogo.homeTeam.toUpperCase()} Q JOGAVA ENCASA JOGO CON `;
    jogo.home_escalacao.forEach((p, i) => {
      ycp = jogo?.home_cards.find(c => c.nome === p.nome);
      sbp = jogo?.home_subs.findIndex(s => Number(p.num) === Number(s.numero));
      texto += `${i > 0 ? i === jogo.home_escalacao.length - 1 ? ' E ' : ', ' : ''}${p.nome.toUpperCase()}${ycp ? ycp.card === 'Amarelo' ? ' 🟨' : ' 🟥' : ''} (${p.pos})${sbp !== -1 ? ` ↔️ ${jogo.home_subs[sbp + 1].nome.toUpperCase()} (${jogo.home_subs[sbp + 1].pos})` : ''}${i === jogo.home_escalacao.length ? '.' : ''}`;
    })
    texto += `\n\nO COMADAMTE ${jogo.away_treinador.toUpperCase()} DO ${jogo.awayTeam.toUpperCase()} DISE PRA ELIS VIN ASIM/ `;
    jogo.away_players.forEach((p, i) => {
      ycp = jogo?.away_cards.find(c => c.nome === p.nome);
      sbp = jogo?.away_subs.findIndex(s => Number(p.num) === Number(s.numero));
      texto += `${i > 0 ? i === jogo.away_players.length - 1 ? ' E ' : ', ' : ''}${p.nome.toUpperCase()}${ycp ? ycp.card === 'Amarelo' ? ' 🟨' : ' 🟥' : ''} (${p.pos})${sbp !== -1 ? ` ↔️ ${jogo.away_subs[sbp + 1].nome.toUpperCase()} (${jogo.away_subs[sbp + 1].pos})` : ''}${i === jogo.away_players.length ? '.' : ''}`
    })
  } else {
    texto += `\n\nTreinados por ${jogo.home_treinador}, o anfitrião ${jogo.homeTeam} tinha a seguinte escalação: `;
    jogo.home_escalacao.forEach((p, i) => {
      ycp = jogo?.home_cards.find(c => c.nome === p.nome);
      sbp = jogo?.home_subs.findIndex(s => Number(p.num) === Number(s.numero));
      texto += `${i > 0 ? i === jogo.home_escalacao.length - 1 ? ' e ' : ', ' : ''}${p.nome}${ycp ? ycp.card === 'Amarelo' ? ' 🟨' : ' 🟥' : ''} (${p.pos})${sbp !== -1 ? ` ↔️ ${jogo.home_subs[sbp + 1].nome} (${jogo.home_subs[sbp + 1].pos})` : ''}${i === jogo.home_escalacao.length ? '.' : ''}`;
    })
    texto += `\n\nCom ${jogo.away_treinador} no comando, o visitante ${jogo.awayTeam} jogou com: `;
    jogo.away_players.forEach((p, i) => {
      ycp = jogo?.away_cards.find(c => c.nome === p.nome);
      sbp = jogo?.away_subs.findIndex(s => Number(p.num) === Number(s.numero));
      texto += `${i > 0 ? i === jogo.away_players.length - 1 ? ' e ' : ', ' : ''}${p.nome}${ycp ? ycp.card === 'Amarelo' ? ' 🟨' : ' 🟥' : ''} (${p.pos})${sbp !== -1 ? ` ↔️ ${jogo.away_subs[sbp + 1].nome} (${jogo.away_subs[sbp + 1].pos})` : ''}${i === jogo.away_players.length ? '.' : ''}`
    })
  }
  return texto;
}

const formataRodadaAoVivo = (jogo) => {
  return `\n・ [${jogo.tournament.name}] ${jogo.homeTeam.shortName} ${Number(jogo.homeScore.current)} x ${Number(jogo.awayScore.current)} ${jogo.awayTeam.shortName} (${jogo.status.description})`
}

module.exports = {
  umAtleta,
  variosAtletas,
  organizaFestinha,
  organizaFestinhaPrive,
  headToHead,
  formataJogo,
  jogoDestaqueDoDia,
  calculaIdade,
  formataAdversario,
  formataRodadaAoVivo,
};
