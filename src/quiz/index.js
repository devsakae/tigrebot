const { Poll, MessageMedia } = require('whatsapp-web.js');
const { criciuma, client } = require('../connections');
const { log_info, log_erro, log_this } = require('../../utils/admin');
const { umAtleta, formataAdversario } = require('../futebol/utils/functions');
const sorteio = ['idolos', 'acerteoidolo'];
const subsorteio = ['totaljogos', 'idade'];
const tempoQuiz = 15;

const quiz = async (m) => {
  const tipo = sorteio[Math.floor(Math.random() * sorteio.length)];
  const meuQuiz = await buscaOpcoes(tipo);
  if (meuQuiz.correta === "ERRO") return m.reply("Erro ao iniciar o quiz");
  if (tipo === 'adversario') return quizAdversarios(m, meuQuiz);
  const subtipo = subsorteio[Math.floor(Math.random() * subsorteio.length)];
  log_this("Mandando um quiz de " + tipo + " com subtipo " + subtipo);
  if (tipo === 'idolos') return quizIdolos(m, meuQuiz, subtipo);
  if (tipo === 'acerteoidolo') return quizAcerteOIdolo(m, meuQuiz);
  else return log_erro("Quiz com erro");
}

const quizIdolos = async (m, meuQuiz, subtipo) => {
  if (subtipo === 'totaljogos') {
    log_this("Enviando quiz de ÍDOLOS");
    let totalDeJogos = 0;
    meuQuiz.correta.jogos.forEach((j) => { if (j.jogounotigre) totalDeJogos += Number(j.jogos) });
    let pollQuestion = "QUIZ: Quantas partidas pelo Tigre jogou o ÍDOLO *" + meuQuiz.correta.nickname + "* (" + meuQuiz.correta.name + " - " + meuQuiz.correta.position + ")?";
    let pollOptions = baguncinha(totalDeJogos);
    // let pollAnswer = "QUIZ: Tempo esgotado!\n\nNosso ídolo *" + meuQuiz.correta.nickname + "* (" + meuQuiz.correta.position + ") jogou o total de " + JSON.stringify(totalDeJogos) + " partidas pelo nosso tricolor, sendo a(s) última(s) " + meuQuiz.correta.jogos[0].jogos + " partida(s) no ano de " + meuQuiz.correta.jogos[0].ano + " pelo torneio " + meuQuiz.correta.jogos[0].torneio + ".";
    const minhaPoll = new Poll(pollQuestion, pollOptions);
    falta(m, 5);
    const tempoEsgotado = setTimeout(() => mostraAtletaEscolhido(m, meuQuiz.correta), (tempoQuiz * 60 * 1000));
    // const tempoEsgotado = setTimeout(() => client.sendMessage(m.from, pollAnswer), (tempoQuiz * 60 * 1000));
    const messageId = await client.sendMessage(m.from, minhaPoll);
    console.log("POLL MESSAGEID");
    console.log(messageId);
    setTimeout(() => messageId.reply("Quote"), 5000)
    return;
  }
  if (subtipo === 'idade') {
    log_this("Enviando quiz de IDADE DE ÍDOLOS");
    const totalIdade = calculateAge(meuQuiz.correta.birthday);
    let pollQuestion = "QUIZ: Quantos anos tem/teria o atleta *" + meuQuiz.correta.nickname + "* (" + meuQuiz.correta.name + " - " + meuQuiz.correta.position + ") na data de hoje?";
    let pollOptions = baguncinha(totalIdade).sort((a, b) => a - b);
    let pollAnswer = "QUIZ: Tempo esgotado!\n\n*" + meuQuiz.correta.nickname + "* (" + meuQuiz.correta.position + ") nasceu em " + meuQuiz.correta.birthday + ", e por isso tem/teria a idade de " + totalIdade + " anos hoje.";
    const minhaPoll = new Poll(pollQuestion, pollOptions);
    falta(m, 5);
    // const tempoEsgotado = setTimeout(() => mostraAtletaEscolhido(m, meuQuiz.correta), (tempoQuiz * 60 * 1000));
    const tempoEsgotado = setTimeout(() => client.sendMessage(m.from, pollAnswer), (tempoQuiz * 60 * 1000));
    const messageId = await client.sendMessage(m.from, minhaPoll);
    console.log("POLL MESSAGEID");
    console.log(messageId);
    setTimeout(() => messageId.reply("Quote"), 5000)
    return;
  }
}

const quizAcerteOIdolo = async (m, meuQuiz) => {
  log_info("Quiz acerte o ÍDOLO!");
  let totalDeJogos = 0;
  let estreia, final, jogosContra, gols, v, e, d;
  meuQuiz.correta.jogos.forEach((j) => {
    if (j.jogounotigre) {
      estreia = estreia < Number(j.ano) ? estreia : Number(j.ano);
      final = final > Number(j.ano) ? final : Number(j.ano);
      totalDeJogos += Number(j.jogos);
      gols += Number(j.gols);
      v += Number(j.v);
      e += Number(j.e);
      d += Number(j.d);
    } else jogosContra += Number(j.jogos)
  })
  let pollQuestion = "QUIZ: Que atleta disputou *" + JSON.stringify(totalDeJogos) + "* partidas pelo Tigre " + (estreia === final ? "em " + estreia + "?" : "entre os anos de " + estreia + " a " + final + "?");
  let pollOptions = [meuQuiz.correta.nickname, meuQuiz.opcoes[0].nickname, meuQuiz.opcoes[1].nickname, meuQuiz.opcoes[2].nickname, meuQuiz.opcoes[3].nickname].sort();
  // let pollAnswer = "QUIZ ENCERRADO!!\n\nO atleta em questão era ninguém mais ninguém menos que *" + meuQuiz.correta.name + "*, mais conhecido como " + meuQuiz.correta.nickname + " (" + meuQuiz.correta.position + "), com um impressionante histórico de " + JSON.stringify(v) + " vitórias, " + JSON.stringify(e) + " empates, " + JSON.stringify(d) + " derrotas e " + JSON.stringify(gols) + " gols marcados.";
  const minhaPoll = new Poll(pollQuestion, pollOptions);
  if (jogosContra > 0) setTimeout(() => client.sendMessage(m.from, "Tempo acabando, vai aqui uma dica pra quem ainda tá em dúvida: Esse atleta chegou a disputar " + jogosContra + " partidas contra o Tigre."), (20 * 60 * 1000));
  else falta(m, 5);
  const tempoEsgotado = setTimeout(() => mostraAtletaEscolhido(m, meuQuiz.correta), (tempoQuiz * 60 * 1000));
  const messageId = await client.sendMessage(m.from, minhaPoll);
  console.log("POLL MESSAGEID");
  console.log(messageId);
  setTimeout(() => messageId.reply("Quote"), 5000)
  return;
}

const quizAdversarios = async (m, meuQuiz, subtipo) => {
  if (subtipo === 'totaljogos') {
    const escore = meuQuiz.correta.resumo.j + " jogos (" + meuQuiz.correta.resumo.v + "V/" + meuQuiz.correta.resumo.e + "E/" + meuQuiz.correta.resumo.d + "D)";
    const pollQuestion = "QUIZ: Qual time tem o histórico de " + escore + " contra o Criciúma Esporte Clube?";
    const pollOptions = opcoesAdversarios(meuQuiz);
    const minhaPoll = new Poll(pollQuestion, pollOptions);
    const messageId = await client.sendMessage(m.from, minhaPoll);
    const foto = await MessageMedia.fromUrl(meuQuiz.correta.logo);
    const caption = formataAdversario(meuQuiz.correta);
    falta(m, 2);
    const tempoEsgotado = setTimeout(() => client.sendMessage(m.from, foto, { caption: caption }), (tempoQuiz * 60 * 1000));
  }
  // if (subtipo === 'idade') {
  else {
    log_info("Quiz acerte o ADVERSÁRIO com subtipo: " + subtipo);
    const umJogo = meuQuiz.correta.jogos[Math.floor(Math.random() * meuQuiz.correta.jogos.length)];
    const tigreAnfitriao = umJogo.homeTeam.startsWith('CRICI')
    const pontuacao = umJogo.homeScore === umJogo.awayScore
                      ? "empatou conosco"
                      : umJogo.homeScore > umJogo.awayScore && tigreAnfitriao
                      ? "sofreu uma derrota pro 🐯 Tigrão"
                      : "nos derrotou 🤬";
    const placar = umJogo.homeScore === umJogo.awayScore
                    ? "em " + JSON.stringify(umJogo.homeScore) + " a " + JSON.stringify(umJogo.awayScore)
                    : umJogo.homeScore > umJogo.awayScore
                      ? "por " + JSON.stringify(umJogo.homeScore) + " a " + JSON.stringify(umJogo.awayScore)
                      : "por " + JSON.stringify(umJogo.awayScore) + " a " + JSON.stringify(umJogo.homeScore);
    const pollQuestion = "QUIZ: Este adversário " + pontuacao + placar + " em " + umJogo.date + ".";
    const pollOptions = opcoesAdversarios(meuQuiz);
    const minhaPoll = new Poll(pollQuestion, pollOptions);
    const messageId = await client.sendMessage(m.from, minhaPoll);
    setTimeout(() => messageId.reply("⏳ Faltam 2 minutos pra encerrar o quiz, que é um dos mais fáceis que eu já fiz po\n\nO treinador deles nesse dia era o " + (tigreAnfitriao ? umJogo.away_treinador : umJogo.home_treinador)), ((tempoQuiz - 2) * 60 * 1000))
    const tempoEsgotado = setTimeout(() => formataJogo(umJogo), (tempoQuiz * 60 * 1000));
  }
}

const buscaOpcoes = async (tipo) => {
  if (tipo === 'idolos' || tipo === 'acerteoidolo') {
    const atleta = await criciuma
      .collection('atletas')
      .aggregate([{ $match: { "jogos.jogounotigre": true } }, { $sample: { size: 5 } }])
      .toArray();
    const escolhidoIdx = Math.floor(Math.random() * atleta.length);
    const escolhido = atleta[escolhidoIdx];
    const opcoes = atleta.toSpliced(escolhidoIdx, 1);
    return { correta: escolhido, opcoes: opcoes }
  }
  if (tipo === 'adversarios') {
    const adversario = await criciuma
      .collection('jogos')
      .aggregate([ { $sample: { size: 5 } } ])
      .toArray();
    const escolhidoIdx = Math.floor(Math.random() * adversario.length);
    const escolhido = adversario[escolhidoIdx];
    const opcoes = adversario.toSpliced(escolhidoIdx, 1);
    return { correta: escolhido, opcoes: opcoes }
  }
  // if (tipo === 'atletas') {
  //   const atleta = await criciuma
  //     .collection('atletas')
  //     .aggregate([{ $sample: { size: 5 } }])
  //     .toArray();
  // }
  // if (tipo === 'jogos') {
  //   const jogo = await criciuma
  //     .collection('jogos')
  //     .aggregate([{ $sample: { size: 1 } }])
  //     .toArray();
  // }
  else return { correta: "ERRO", opcoes: [] }
}

const baguncinha = (resposta) => {
  const falaUmNumero = randomNum(1,4);
  const guessANum = randomNum(1,2);
  const guessBNum = randomNum(3,4);
  let optA, optB, optC, optD;
  if (falaUmNumero === 1) {
    optA = resposta - guessANum;
    optB = resposta - (guessANum * 2)
    optC = resposta - (guessANum * 3)
    optD = resposta - (guessANum * 4)
  }
  if (falaUmNumero === 2) {
    optA = resposta + guessANum;
    optB = resposta + (guessANum * 2)
    optC = resposta + (guessANum * 3)
    optD = resposta + (guessANum * 4)
  }
  if (falaUmNumero === 3) {
    optA = randomOpr(resposta, guessANum);
    optB = randomOpr(resposta, guessANum * 2)
    optC = randomOpr(resposta, guessBNum)
    optD = randomOpr(resposta, guessBNum * 2)
  }
  if (falaUmNumero === 4) {
    optA = resposta + guessANum;
    optB = resposta + (guessANum * 2)
    optC = resposta - guessANum
    optD = resposta - (guessANum * 2)
  }
  if (falaUmNumero === 5) {
    optA = resposta + guessANum;
    optB = resposta + (guessANum * 2)
    optC = resposta + (guessANum * 3)
    optD = resposta - guessANum
  }
  if (optA === optB || optA === optC || optA === optD) return [resposta, optB, optC, optD];
  if (optB === optA || optB === optC || optB === optD) return [resposta, optA, optC, optD];
  if (optC === optA || optC === optB || optC === optD) return [resposta, optA, optB, optD];
  if (optD === optA || optD === optB || optD === optC) return [resposta, optA, optB, optC];
  return [JSON.stringify(resposta), JSON.stringify(optA), JSON.stringify(optB), JSON.stringify(optC), JSON.stringify(optD)];
}

const randomNum = (min, max) => Math.floor(Math.random() * (max - min + 1) + min);
const randomOpr = (val, mol) => randomNum(0,1) === 0 ? (val + mol) : (val - mol) < 0 ? (val + mol) : (val - mol);

const falta = (m, exp, tempo = tempoQuiz) => {
  setTimeout(() => client.sendMessage(m.from, "Alô grupo de tartarugas! Faltam *" + JSON.stringify(exp) + " minutos* pra escolher uma opção!\n\nUse a porra do ~mouse~ dedo"), (Number(tempo - exp) * 60 * 1000))
}

const mostraAtletaEscolhido = async (m, escolhido) => {
  const foto = await MessageMedia.fromUrl(escolhido.image);
  const caption = umAtleta([escolhido]);
  return await client.sendMessage(m.from, foto, { caption: caption });
}

function calculateAge(raw_birthday) {
  const rb = raw_birthday.split("/");
  const birthday = new Date(rb[2], Number(rb[1]) - 1, rb[0]);
  var ageDifMs = Date.now() - birthday;
  var ageDate = new Date(ageDifMs); // miliseconds from epoch
  return Math.abs(ageDate.getUTCFullYear() - 1970);
}

const opcoesAdversarios = (meuQuiz) => [meuQuiz.correta.adversario + " (" + meuQuiz.correta.uf + ")", ...meuQuiz.opcoes.map((adv) => adv.adversario + " (" + adv.uf + ")")].sort();

module.exports = {
  quiz
}