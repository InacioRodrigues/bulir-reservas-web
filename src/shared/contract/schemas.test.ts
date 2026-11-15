import {
  loginSchema,
  priceRangeSchema,
  registerSchema,
  serviceSchema,
  topUpSchema,
} from './schemas'

const messages = (result: { success: boolean; error?: { issues: { message: string }[] } }) =>
  result.error?.issues.map((issue) => issue.message) ?? []

describe('serviceSchema', () => {
  const valid = { name: 'Pintura', description: 'Pintura de paredes interiores.', price: '15000' }

  it('normaliza o preço escrito com vírgula e espaços', () => {
    const result = serviceSchema.parse({ ...valid, price: ' 18 500,50 ' })
    expect(result.price).toBe('18500.50')
  })

  it('rejeita mais de 2 casas decimais sem rebentar (regressão zod 4)', () => {
    const result = serviceSchema.safeParse({ ...valid, price: '12,345' })
    expect(result.success).toBe(false)
    expect(messages(result)).toContain('O preço deve ser um número com até 2 casas decimais')
  })

  it('rejeita preço zero, acima do limite e vazio', () => {
    expect(messages(serviceSchema.safeParse({ ...valid, price: '0' }))).toContain(
      'O preço deve ser maior que 0',
    )
    expect(serviceSchema.safeParse({ ...valid, price: '10000000.01' }).success).toBe(false)
    expect(serviceSchema.safeParse({ ...valid, price: '10000000.00' }).success).toBe(true)
    expect(messages(serviceSchema.safeParse({ ...valid, price: '' }))).toContain('Indique o preço')
  })

  it('aplica os limites de título e descrição do contrato', () => {
    expect(serviceSchema.safeParse({ ...valid, name: 'ab' }).success).toBe(false)
    expect(serviceSchema.safeParse({ ...valid, name: 'a'.repeat(101) }).success).toBe(false)
    expect(serviceSchema.safeParse({ ...valid, description: 'curta' }).success).toBe(false)
    expect(serviceSchema.safeParse({ ...valid, description: 'x'.repeat(1001) }).success).toBe(false)
  })
})

describe('registerSchema', () => {
  const valid = {
    fullName: 'Ana Paula',
    nif: '004512345la041',
    email: '  Ana@Exemplo.AO ',
    password: 'Senha1234',
    confirmPassword: 'Senha1234',
    role: 'CLIENT' as const,
  }

  it('normaliza NIF e e-mail como a API', () => {
    const result = registerSchema.parse({ ...valid, nif: '0045 12345 la041' })
    expect(result.nif).toBe('004512345LA041')
    expect(result.email).toBe('ana@exemplo.ao')
  })

  it('exige senha com letra e número e confirmação igual', () => {
    expect(
      registerSchema.safeParse({ ...valid, password: 'abcdefgh', confirmPassword: 'abcdefgh' })
        .success,
    ).toBe(false)
    expect(
      registerSchema.safeParse({ ...valid, password: '12345678', confirmPassword: '12345678' })
        .success,
    ).toBe(false)
    expect(
      messages(registerSchema.safeParse({ ...valid, confirmPassword: 'Outra1234' })),
    ).toContain('As senhas não coincidem')
  })

  it('exige papel e NIF alfanumérico de 9 a 14', () => {
    expect(registerSchema.safeParse({ ...valid, role: undefined }).success).toBe(false)
    expect(registerSchema.safeParse({ ...valid, nif: '12345678' }).success).toBe(false)
    expect(registerSchema.safeParse({ ...valid, nif: '12345-6789' }).success).toBe(false)
  })
})

describe('loginSchema / topUpSchema / priceRangeSchema', () => {
  it('login exige identificador e senha', () => {
    expect(loginSchema.safeParse({ identifier: ' ', password: '' }).success).toBe(false)
    expect(loginSchema.safeParse({ identifier: '5417001234', password: 'x' }).success).toBe(true)
  })

  it('carregamento entre 0 e 1 000 000', () => {
    expect(topUpSchema.parse({ amount: '5000' }).amount).toBe('5000')
    expect(topUpSchema.safeParse({ amount: '1000000.01' }).success).toBe(false)
    expect(topUpSchema.safeParse({ amount: '-5' }).success).toBe(false)
  })

  it('máximo do filtro não pode ser menor que o mínimo', () => {
    expect(priceRangeSchema.safeParse({ minPrice: '', maxPrice: '' }).success).toBe(true)
    expect(messages(priceRangeSchema.safeParse({ minPrice: '500', maxPrice: '100' }))).toContain(
      'O máximo deve ser maior ou igual ao mínimo',
    )
    expect(priceRangeSchema.safeParse({ minPrice: 'abc', maxPrice: '100' }).success).toBe(false)
  })
})
