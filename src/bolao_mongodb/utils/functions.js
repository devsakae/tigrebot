const { client } = require("../../connections");

const getCommand = (raw) => {
  const divide = raw.split(' ');
  if (divide.length > 1) return raw.substring(divide[0].length).trimStart();
  return false;
}

const forMatch = (match) => {
  const data = new Date(match.hora);
  return `🚨🚨 BOLÃO ABERTO! 🚨🚨

⚽️ ${match.homeTeam} x ${match.awayTeam} 🏆 ${match.torneio} 🗓 ${data.toLocaleString('pt-br')}

*COMO JOGAR*: Responda essa mensagem com apenas seu palpite, no formato:

👉👉 *<mandante> <placar> x <placar> <visitante>* 👈👈
ex.: ${match.homeTeam} ${Math.floor(Math.random() * 5)} x ${Math.floor(Math.random() * 5)} ${match.awayTeam}

Palpites válidos somente se enviados em até *10 minutos* antes da partida e o Bot tiver reagido à mensagem com o emoji 🎟. Se não tiver, o palpite não é válido!

*REGRAS*: As rodadas são abertas 36 horas antes do horário da partida.

✅ Acertou o placar em cheio: *4 pontos*
✅ Acertar o vencedor e diferença de gols: *3 pontos*
✅ Acertar vitória ou derrota e o placar de apenas um dos times: *2 pontos*
✅ Acertar vitória, empate ou derrota: *1 ponto*
🟡 Tigre venceu? Todo mundo ganha *+1 ponto* 🐯
🚫 Repetir palpite
⚖️ Desempate: Palpite mais antigo leva

Boa sorte!

Sistema de bolão ©️ devsakae.tech
Id da partida: ${match.id}`;
};

const formatPredicts = (predicts) => {
  let response = `👁 Stats pre-match para *${predicts.teams.home.name}* x *${predicts.teams.away.name}*:

👉 *Resultado*
  ${predicts.predictions.winner.comment} de ${predicts.predictions.winner.name}

🍀 *Super dica*
  ${predicts.predictions.advice}

⚽️ *Gol(s) marcado(s)*
  ${predicts.teams.home.name}: ${predicts.predictions.goals.home}
  ${predicts.teams.away.name}: ${predicts.predictions.goals.away}

📈 *Chances*
  ${predicts.teams.home.name}: ${predicts.predictions.percent.home}
  Empate: ${predicts.predictions.percent.draw}
  ${predicts.teams.away.name}: ${predicts.predictions.percent.away}

🗂 *Última(s) partida(s)*`;
  predicts.h2h.forEach((match) => {
    const matchDate = new Date(match.fixture.timestamp * 1000);
    response += `\n ${match.teams.home.name} ${match.goals.home} x ${match.goals.away} ${match.teams.away.name} (${matchDate.toDateString()} - ${match.league.name} ${match.league.season})`
  });
  return response;
};

const sendAdmin = (what) => client.sendMessage(process.env.BOT_OWNER, what);

const calculaRanking = async (matchInfo, grupo) => {
  const today = new Date();
  const homeScore = Number(matchInfo.response[0].goals.home);
  const awayScore = Number(matchInfo.response[0].goals.away);
  const resultado = homeScore > awayScore ? 'V' : homeScore < awayScore ? 'D' : 'E';
  try {
    const palpites = await bolao
      .collection(grupo.split("@")[0])
      .find()
      .toArray();
    
  } catch (err) {
    console.error(err);
  } finally {
    return 'teste';
  }
  // const rankingDaRodada =  .palpites
  //   .map((p) => {
  //     let pontos = 0;
  //     if (p.resultado === resultado) pontos = 1;
  //     if (
  //       p.resultado === resultado &&
  //       (p.homeScore === homeScore || p.awayScore === awayScore)
  //     )
  //       pontos = 2;
  //     if (p.homeScore === homeScore && p.awayScore === awayScore) pontos = 3;
  //     const playerIdx = data[grupo][data[grupo].activeRound.team.slug].ranking.findIndex(
  //       (player) => player.id === p.userId,
  //     );
  //     playerIdx < 0
  //       ? data[grupo][data[grupo].activeRound.team.slug].ranking.push({
  //         id: p.userId,
  //         usuario: p.userName,
  //         pontos: pontos,
  //       })
  //       : (data[grupo][data[grupo].activeRound.team.slug].ranking[playerIdx].pontos += pontos);
  //     return { ...p, pontos: pontos };
  //   })
  //   .sort((a, b) => (a.pontos < b.pontos ? 1 : a.pontos > b.pontos ? -1 : 0));
  // if (rankingDaRodada[0].pontos === 0) {
  //   response = 'Ninguém pontuou na última rodada!';
  //   data[grupo][data[grupo].activeRound.team.slug][today.getFullYear()][data[grupo].activeRound.matchId] = {
  //     ...data[grupo][data[grupo].activeRound.team.slug][today.getFullYear()][data[grupo].activeRound.matchId],
  //     ranking: response,
  //     palpites: rankingDaRodada,
  //   };
  //   writeData(data);
  //   return client.sendMessage(grupo, response);
  // }
  // response = `🏁🏁 Resultado do bolão da ${data[grupo][data[grupo].activeRound.team.slug][today.getFullYear()][data[grupo].activeRound.matchId].rodada}ª rodada 🏁🏁\n`;
  // response += `\nPartida: ${matchInfo.response[0].teams.home.name} ${matchInfo.response[0].goals.home} x ${matchInfo.response[0].goals.away} ${matchInfo.response[0].teams.away.name}\n`;
  // rankingDaRodada.forEach((pos, idx) => {
  //   const medal =
  //     idx === 0 ? '🥇 ' : idx === 1 ? '🥈 ' : idx === 2 ? '🥉 ' : '';
  //   pos.pontos > 0
  //     ? (response += `\n${medal}${pos.userName} fez ${pos.pontos} ponto(s) com o palpite ${pos.homeScore} x ${pos.awayScore} ${pos.data ? `em ${pos.data}` : ''}`)
  //     : (response += `\n${pos.userName} zerou com o palpite ${pos.homeScore} x ${pos.awayScore}`);
  // });
}


module.exports = {
  sendAdmin,
  getCommand,
  forMatch,
  formatPredicts,
  calculaRanking,
}