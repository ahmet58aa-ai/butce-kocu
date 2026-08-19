import { describe, expect, it } from 'vitest'
import {
  calculateTotals,
  createExpenseBreakdown,
  filterTransactions,
  getRecurringDate,
  isValidBackup,
} from './budget'

const transactions = [
  { id: 1, type: 'income', category: 'Maaş', amount: 40000, date: '2026-08-01' },
  { id: 2, type: 'expense', category: 'Market', amount: 1000, date: '2026-08-02', note: 'Haftalık alışveriş' },
  { id: 3, type: 'expense', category: 'Faturalar', amount: 3000, date: '2026-08-03' },
]

describe('budget utilities', () => {
  it('calculates income and expense totals', () => {
    expect(calculateTotals(transactions)).toEqual({
      totalIncome: 40000,
      totalExpense: 4000,
    })
  })

  it('sorts expense categories and calculates percentages', () => {
    expect(createExpenseBreakdown(transactions)).toEqual([
      { category: 'Faturalar', amount: 3000, percentage: 75 },
      { category: 'Market', amount: 1000, percentage: 25 },
    ])
  })

  it('filters with Turkish-aware search, type and category', () => {
    expect(filterTransactions(transactions, { searchTerm: 'ALIŞVERİŞ', type: 'expense', category: 'Market' }))
      .toEqual([transactions[1]])
  })

  it('clamps recurring dates to the last day of short months', () => {
    expect(getRecurringDate('2027-02', '2026-01-31')).toBe('2027-02-28')
    expect(getRecurringDate('2028-02', '2026-01-31')).toBe('2028-02-29')
  })

  it('validates backup structure', () => {
    expect(isValidBackup({ transactions, monthlyBudgets: {}, savingsGoals: [] })).toBe(true)
    expect(isValidBackup({ transactions: 'invalid', monthlyBudgets: {} })).toBe(false)
  })
})
