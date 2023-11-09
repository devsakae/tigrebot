const formatLance = (event) => {
  let response = `[${event.time.elapsed}'${event.time.extra ? '+' + event.time.extra + '] ' : '] '}`;
  switch (event.type) {
    case 'Goal':
      response += `⚽️ *GOL do(a) ${event.team.name}*! ${event.player.name} (${event.detail})`
      break;
    case 'Card':
      event.detail.match(/Yellow/gi)
        ? response += `🟨 Cartão AMARELO para *${event.player.name}* (${event.team.name})`
        : response += `🟥 Cartão VERMELHO para *${event.player.name}* (${event.team.name})`
      break;
    case 'subst':
      response += `🔄 Substituição no(a) ${event.team.name}\n\nSAI ❌ ${event.player.name}\nENTRA ✅ ${event.assist.name}`;
      break;
    default:
      response += `${event.detail} de ${event.team.name}`
      break;
  }
  return response
}

module.exports = {
  formatLance
}