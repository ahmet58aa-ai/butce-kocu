import { describe, expect, it } from 'vitest'
import { normalizeDate, parseAmount, parseTransactionCsv, suggestCategory } from './csv'

describe('CSV import utilities', () => {
  it('parses Turkish formatted amounts and dates', () => {
    expect(parseAmount('₺1.234,56')).toBe(1234.56)
    expect(normalizeDate('19.08.2026')).toBe('2026-08-19')
  })

  it('suggests categories from transaction descriptions', () => {
    expect(suggestCategory('MİGROS SANAL MARKET')).toBe('Market')
    expect(suggestCategory('NETFLIX.COM')).toBe('Eğlence')
  })

  it('imports semicolon-delimited bank transactions', () => {
    const csv = [
      'Tarih;Açıklama;Tutar',
      '19.08.2026;Migros alışverişi;-1.250,50',
      '01.08.2026;Maaş ödemesi;42.500,00',
    ].join('\n')

    const result = parseTransactionCsv(csv)
    expect(result.skipped).toBe(0)
    expect(result.transactions).toHaveLength(2)
    expect(result.transactions[0]).toMatchObject({
      type: 'expense',
      category: 'Market',
      amount: 1250.5,
      date: '2026-08-19',
    })
    expect(result.transactions[1]).toMatchObject({ type: 'income', amount: 42500 })
  })
})
