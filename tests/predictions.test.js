const { predictions } = require('../src/futebol/index')

describe('Testes básicos do comando !stats', () => {
  test('Função predictions() tem retorno', () => {
    expect(predictions()).toBeDefined();
  });
  test('Loga o retorno para visualização', () => {
    console.log(predictions());
  });
})