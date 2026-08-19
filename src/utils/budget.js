export function calculateTotals(transactions) {
  return transactions.reduce(
    (totals, item) => {
      if (item.type === 'income') totals.totalIncome += Number(item.amount)
      if (item.type === 'expense') totals.totalExpense += Number(item.amount)
      return totals
    },
    { totalIncome: 0, totalExpense: 0 }
  )
}

export function createExpenseBreakdown(transactions) {
  const { totalExpense } = calculateTotals(transactions)
  const categoryTotals = transactions
    .filter((item) => item.type === 'expense')
    .reduce((totals, item) => {
      totals[item.category] = (totals[item.category] || 0) + Number(item.amount)
      return totals
    }, {})

  return Object.entries(categoryTotals)
    .map(([category, amount]) => ({
      category,
      amount,
      percentage: totalExpense > 0 ? (amount / totalExpense) * 100 : 0,
    }))
    .sort((a, b) => b.amount - a.amount)
}

export function filterTransactions(
  transactions,
  { searchTerm = '', type = 'all', category = 'all' }
) {
  const normalizedSearch = searchTerm.trim().toLocaleLowerCase('tr-TR')

  return transactions.filter((item) => {
    const matchesType = type === 'all' || item.type === type
    const matchesCategory = category === 'all' || item.category === category
    const searchableText = `${item.category} ${item.note || ''}`
      .toLocaleLowerCase('tr-TR')
    const matchesSearch =
      !normalizedSearch || searchableText.includes(normalizedSearch)

    return matchesType && matchesCategory && matchesSearch
  })
}

export function getRecurringDate(monthValue, originalDate) {
  const [year, month] = monthValue.split('-').map(Number)
  const originalDay = Number(originalDate.slice(8, 10))
  const lastDay = new Date(year, month, 0).getDate()
  const day = String(Math.min(originalDay, lastDay)).padStart(2, '0')
  return `${monthValue}-${day}`
}

export function isValidBackup(backup) {
  if (!backup || typeof backup !== 'object') return false

  const hasValidTransactions =
    Array.isArray(backup.transactions) &&
    backup.transactions.every((item) =>
      item &&
      ['income', 'expense'].includes(item.type) &&
      typeof item.category === 'string' &&
      Number.isFinite(Number(item.amount)) &&
      Number(item.amount) > 0 &&
      /^\d{4}-\d{2}-\d{2}$/.test(item.date)
    )
  const hasValidBudgets =
    backup.monthlyBudgets &&
    typeof backup.monthlyBudgets === 'object' &&
    !Array.isArray(backup.monthlyBudgets)
  const hasValidGoals =
    backup.savingsGoals === undefined || Array.isArray(backup.savingsGoals)

  return hasValidTransactions && hasValidBudgets && hasValidGoals
}
