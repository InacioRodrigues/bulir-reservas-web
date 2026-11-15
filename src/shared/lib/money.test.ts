import {
  addMoney,
  compareMoney,
  formatKz,
  fromCents,
  hasSufficientBalance,
  normalizeMoneyInput,
  subtractMoney,
  toCents,
} from './money'

describe('money', () => {
  it('converte strings decimais para cêntimos sem vírgula flutuante', () => {
    expect(toCents('1500.00')).toBe(150000n)
    expect(toCents('0.1')).toBe(10n)
    expect(toCents('-5000.5')).toBe(-500050n)
    expect(toCents('10000000.00')).toBe(1000000000n)
  })

  it('volta a string com 2 casas', () => {
    expect(fromCents(150000n)).toBe('1500.00')
    expect(fromCents(5n)).toBe('0.05')
    expect(fromCents(-500050n)).toBe('-5000.50')
  })

  it('soma e subtrai com exatidão (0.1 + 0.2)', () => {
    expect(addMoney('0.1', '0.2')).toBe('0.30')
    expect(subtractMoney('50000.00', '12000.00')).toBe('38000.00')
  })

  it('compara valores e aceita saldo igual ao preço', () => {
    expect(compareMoney('10.00', '9.99')).toBe(1)
    expect(compareMoney('9.99', '10')).toBe(-1)
    expect(hasSufficientBalance('1500.00', '1500')).toBe(true)
    expect(hasSufficientBalance('1499.99', '1500.00')).toBe(false)
  })

  it('normaliza o que o utilizador escreve', () => {
    expect(normalizeMoneyInput(' 1 500,5 ')).toBe('1500.5')
  })

  it('rejeita formatos inválidos', () => {
    expect(() => toCents('1.234')).toThrow('Valor monetário inválido')
    expect(() => toCents('abc')).toThrow('Valor monetário inválido')
  })

  it('formata em Kwanzas', () => {
    const text = formatKz('50000.00')
    expect(text).toMatch(/50\s?000,00/)
    expect(text).toMatch(/Kz|AOA/)
    expect(formatKz('5000.00', { signed: true }).startsWith('+')).toBe(true)
    expect(formatKz('-5000.00', { signed: true })).toMatch(/^-/)
  })
})
