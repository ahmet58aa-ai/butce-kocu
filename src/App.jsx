 import { useEffect, useMemo, useRef, useState } from 'react'
import './App.css'
import {
  calculateTotals,
  createExpenseBreakdown,
  filterTransactions,
  getRecurringDate,
  isValidBackup,
} from './utils/budget'
import BudgetCard from './components/BudgetCard'
import BudgetModal from './components/BudgetModal'
import DataTools from './components/DataTools'
import ExpenseAnalysis from './components/ExpenseAnalysis'
import GoalModal from './components/GoalModal'
import SavingsGoals from './components/SavingsGoals'
import SummaryCards from './components/SummaryCards'
import TransactionList from './components/TransactionList'
import TransactionModal from './components/TransactionModal'

function App() {
  const [transactions, setTransactions] = useState(() => {
    const savedTransactions = localStorage.getItem('butceKocuTransactions')

    if (savedTransactions) {
      return JSON.parse(savedTransactions)
    }

    return [
      {
        id: 1,
        type: 'income',
        category: 'Maaş',
        amount: 42500,
        date: '2026-08-01',
        note: 'Ağustos maaşı',
      },
      {
        id: 2,
        type: 'expense',
        category: 'Market',
        amount: 1240,
        date: '2026-08-19',
        note: 'Market alışverişi',
      },
      {
        id: 3,
        type: 'expense',
        category: 'Faturalar',
        amount: 3850,
        date: '2026-08-03',
        note: 'Aylık faturalar',
      },
    ]
  })

  const [modalType, setModalType] = useState(null)
  const [editingId, setEditingId] = useState(null)
  const [selectedMonth, setSelectedMonth] = useState(
    new Date().toISOString().slice(0, 7)
  )
  const [monthlyBudgets, setMonthlyBudgets] = useState(() => {
    const savedBudgets = localStorage.getItem('butceKocuMonthlyBudgets')
    return savedBudgets ? JSON.parse(savedBudgets) : {}
  })
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false)
  const [budgetInput, setBudgetInput] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const backupInputRef = useRef(null)
  const [savingsGoals, setSavingsGoals] = useState(() => {
    const savedGoals = localStorage.getItem('butceKocuSavingsGoals')
    return savedGoals ? JSON.parse(savedGoals) : []
  })
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false)
  const [editingGoalId, setEditingGoalId] = useState(null)
  const [goalForm, setGoalForm] = useState({
    name: '',
    targetAmount: '',
    currentAmount: '',
    targetDate: '',
  })

  const [form, setForm] = useState({
    amount: '',
    category: '',
    date: new Date().toISOString().slice(0, 10),
    note: '',
    recurring: false,
  })

  useEffect(() => {
    localStorage.setItem(
      'butceKocuTransactions',
      JSON.stringify(transactions)
    )
  }, [transactions])

  useEffect(() => {
    localStorage.setItem(
      'butceKocuMonthlyBudgets',
      JSON.stringify(monthlyBudgets)
    )
  }, [monthlyBudgets])

  useEffect(() => {
    localStorage.setItem(
      'butceKocuSavingsGoals',
      JSON.stringify(savingsGoals)
    )
  }, [savingsGoals])

  const monthlyTransactions = useMemo(() => {
    return transactions
      .filter((item) => item.date.startsWith(selectedMonth))
      .sort((a, b) => b.date.localeCompare(a.date))
  }, [transactions, selectedMonth])

  const { totalIncome, totalExpense } = useMemo(
    () => calculateTotals(monthlyTransactions),
    [monthlyTransactions]
  )

  const expenseBreakdown = useMemo(
    () => createExpenseBreakdown(monthlyTransactions),
    [monthlyTransactions]
  )

  const availableCategories = useMemo(() => {
    return [...new Set(monthlyTransactions.map((item) => item.category))]
      .sort((a, b) => a.localeCompare(b, 'tr'))
  }, [monthlyTransactions])

  const filteredTransactions = useMemo(
    () => filterTransactions(monthlyTransactions, {
      searchTerm,
      type: typeFilter,
      category: categoryFilter,
    }),
    [monthlyTransactions, searchTerm, typeFilter, categoryFilter]
  )

  const balance = totalIncome - totalExpense
  const budgetLimit = monthlyBudgets[selectedMonth] || 0
  const remainingBudget = budgetLimit - totalExpense
  const budgetUsage = budgetLimit > 0
    ? Math.min((totalExpense / budgetLimit) * 100, 100)
    : 0

  const savingRate =
    totalIncome > 0
      ? ((balance / totalIncome) * 100).toFixed(1)
      : 0

  function openModal(type) {
    setModalType(type)
    setEditingId(null)

    setForm({
      amount: '',
      category: type === 'income' ? 'Maaş' : 'Market',
      date: new Date().toISOString().slice(0, 10),
      note: '',
      recurring: false,
    })
  }

  function closeModal() {
    setModalType(null)
    setEditingId(null)
  }

  function handleChange(event) {
    const { name, value } = event.target

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  function handleSubmit(event) {
    event.preventDefault()

    const amount = Number(form.amount)

    if (!amount || amount <= 0) {
      alert('Lütfen geçerli bir tutar gir.')
      return
    }

    if (editingId) {
      setTransactions((prev) =>
        prev.map((item) =>
          item.id === editingId
            ? {
                ...item,
                type: modalType,
                amount,
                category: form.category,
                date: form.date,
                note: form.note,
                recurring: form.recurring,
              }
            : item
        )
      )
    } else {
      const newTransaction = {
        id: Date.now(),
        type: modalType,
        amount,
        category: form.category,
        date: form.date,
        note: form.note,
        recurring: form.recurring,
      }

      setTransactions((prev) => [newTransaction, ...prev])
    }

    closeModal()
  }

  function handleEdit(transaction) {
    setEditingId(transaction.id)
    setModalType(transaction.type)

    setForm({
      amount: transaction.amount,
      category: transaction.category,
      date: transaction.date,
      note: transaction.note || '',
      recurring: Boolean(transaction.recurring),
    })
  }

  function handleDelete(id) {
    const confirmed = window.confirm(
      'Bu işlemi silmek istediğine emin misin?'
    )

    if (!confirmed) return

    setTransactions((prev) =>
      prev.filter((item) => item.id !== id)
    )
  }

  function formatMoney(value) {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      maximumFractionDigits: 0,
    }).format(value)
  }

  function formatMonth(value) {
    const [year, month] = value.split('-')

    return new Intl.DateTimeFormat('tr-TR', {
      month: 'long',
      year: 'numeric',
    }).format(new Date(Number(year), Number(month) - 1, 1))
  }

  function handleMonthChange(event) {
    const nextMonth = event.target.value

    setTransactions((prev) => {
      const recurringTemplates = prev.filter(
        (item) => item.recurring && !item.recurrenceId
      )
      const missingTransactions = recurringTemplates
        .filter((template) => template.date.slice(0, 7) < nextMonth)
        .filter((template) =>
          !prev.some(
            (item) =>
              item.recurrenceId === template.id &&
              item.date.startsWith(nextMonth)
          )
        )
        .map((template) => ({
          ...template,
          id: `${template.id}-${nextMonth}`,
          date: getRecurringDate(nextMonth, template.date),
          recurring: false,
          recurrenceId: template.id,
        }))

      return missingTransactions.length > 0
        ? [...missingTransactions, ...prev]
        : prev
    })
    setSelectedMonth(nextMonth)
  }

  function openBudgetModal() {
    setBudgetInput(budgetLimit || '')
    setIsBudgetModalOpen(true)
  }

  function handleBudgetSubmit(event) {
    event.preventDefault()
    const amount = Number(budgetInput)

    if (!amount || amount <= 0) {
      alert('Lütfen geçerli bir bütçe limiti gir.')
      return
    }

    setMonthlyBudgets((prev) => ({ ...prev, [selectedMonth]: amount }))
    setIsBudgetModalOpen(false)
  }

  function openGoalModal(goal = null) {
    setEditingGoalId(goal?.id || null)
    setGoalForm({
      name: goal?.name || '',
      targetAmount: goal?.targetAmount || '',
      currentAmount: goal?.currentAmount || '',
      targetDate: goal?.targetDate || '',
    })
    setIsGoalModalOpen(true)
  }

  function handleGoalSubmit(event) {
    event.preventDefault()
    const targetAmount = Number(goalForm.targetAmount)
    const currentAmount = Number(goalForm.currentAmount || 0)

    if (!goalForm.name.trim() || targetAmount <= 0 || currentAmount < 0) {
      alert('Lütfen hedef bilgilerini doğru şekilde doldur.')
      return
    }

    const goal = {
      id: editingGoalId || Date.now(),
      name: goalForm.name.trim(),
      targetAmount,
      currentAmount,
      targetDate: goalForm.targetDate,
    }

    setSavingsGoals((prev) =>
      editingGoalId
        ? prev.map((item) => item.id === editingGoalId ? goal : item)
        : [goal, ...prev]
    )
    setIsGoalModalOpen(false)
  }

  function deleteGoal(id) {
    if (!window.confirm('Bu tasarruf hedefi silinsin mi?')) return
    setSavingsGoals((prev) => prev.filter((goal) => goal.id !== id))
  }

  function downloadFile(content, fileName, type) {
    const blob = new Blob([content], { type })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = fileName
    link.click()
    URL.revokeObjectURL(url)
  }

  function escapeCsv(value) {
    const text = String(value ?? '')
    return `"${text.replaceAll('"', '""')}"`
  }

  function exportCsv() {
    const header = ['Tür', 'Kategori', 'Tutar', 'Tarih', 'Açıklama']
    const rows = transactions.map((item) => [
      item.type === 'income' ? 'Gelir' : 'Gider',
      item.category,
      item.amount,
      item.date,
      item.note || '',
    ])
    const csv = [header, ...rows]
      .map((row) => row.map(escapeCsv).join(','))
      .join('\n')

    downloadFile(
      `\uFEFF${csv}`,
      `butce-kocu-islemler-${new Date().toISOString().slice(0, 10)}.csv`,
      'text/csv;charset=utf-8'
    )
  }

  function exportBackup() {
    const backup = {
      version: 1,
      exportedAt: new Date().toISOString(),
      transactions,
      monthlyBudgets,
      savingsGoals,
    }

    downloadFile(
      JSON.stringify(backup, null, 2),
      `butce-kocu-yedek-${new Date().toISOString().slice(0, 10)}.json`,
      'application/json'
    )
  }

  async function importBackup(event) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return

    try {
      const backup = JSON.parse(await file.text())
      if (!isValidBackup(backup)) {
        throw new Error('Geçersiz yedek biçimi')
      }

      const confirmed = window.confirm(
        'Yedek geri yüklendiğinde mevcut işlemler ve bütçe limitleri değiştirilecek. Devam edilsin mi?'
      )
      if (!confirmed) return

      setTransactions(backup.transactions.map((item) => ({
        ...item,
        amount: Number(item.amount),
      })))
      setMonthlyBudgets(backup.monthlyBudgets)
      setSavingsGoals(backup.savingsGoals || [])
      alert('Yedek başarıyla geri yüklendi.')
    } catch {
      alert('Bu dosya geçerli bir BütçeKoçu yedeği değil.')
    }
  }

  return (
    <div className="app">
      <header>
        <div>
          <h1>BütçeKoçu</h1>
          <p>Paranı yönet, hedeflerine ulaş.</p>
        </div>

        <div className="profile">AT</div>
      </header>

      <main>
        <section className="welcome">
          <div>
            <p>Merhaba 👋</p>
            <h2>Finansal durumun</h2>
          </div>

          <label className="month-filter">
            <span>Görüntülenen ay</span>
            <input
              type="month"
              value={selectedMonth}
              onChange={handleMonthChange}
            />
          </label>
        </section>

        <section className="balance-card">
          <p>Kullanılabilir Bakiye</p>
          <h2>{formatMoney(balance)}</h2>
          <span>{formatMonth(selectedMonth)}</span>
        </section>

        <SummaryCards
          totalIncome={totalIncome}
          totalExpense={totalExpense}
          savingRate={savingRate}
          formatMoney={formatMoney}
        />

        <BudgetCard
          budgetLimit={budgetLimit}
          budgetUsage={budgetUsage}
          remainingBudget={remainingBudget}
          totalExpense={totalExpense}
          formatMoney={formatMoney}
          onOpen={openBudgetModal}
        />

        <section className="actions">
          <button onClick={() => openModal('income')}>
            + Gelir Ekle
          </button>

          <button onClick={() => openModal('expense')}>
            − Harcama Ekle
          </button>
        </section>

        <section className="coach">
          <span>💡 BütçeKoçu</span>

          <h3>
            {monthlyTransactions.length === 0
              ? 'Bu ay için henüz işlem bulunmuyor.'
              : balance >= 0
              ? 'Bu ay bütçen kontrol altında.'
              : 'Bu ay giderlerin gelirini aşmış durumda.'}
          </h3>

          <p>
            {monthlyTransactions.length === 0
              ? 'Gelir veya harcama ekleyerek aylık durumunu takip etmeye başlayabilirsin.'
              : `Toplam gelirinin %${savingRate} kadarı şu anda elinde kalıyor. Harcamalarını düzenli takip ederek tasarruf oranını artırabilirsin.`}
          </p>
        </section>

        <ExpenseAnalysis
          expenseBreakdown={expenseBreakdown}
          totalExpense={totalExpense}
          formatMoney={formatMoney}
        />

        <SavingsGoals
          goals={savingsGoals}
          formatMoney={formatMoney}
          onAdd={() => openGoalModal()}
          onEdit={openGoalModal}
          onDelete={deleteGoal}
        />

        <TransactionList
          transactions={filteredTransactions}
          monthlyTransactionCount={monthlyTransactions.length}
          availableCategories={availableCategories}
          searchTerm={searchTerm}
          typeFilter={typeFilter}
          categoryFilter={categoryFilter}
          selectedMonthLabel={formatMonth(selectedMonth)}
          formatMoney={formatMoney}
          onSearchChange={setSearchTerm}
          onTypeChange={setTypeFilter}
          onCategoryChange={setCategoryFilter}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />

        <DataTools
          onExportCsv={exportCsv}
          onExportBackup={exportBackup}
          onImportClick={() => backupInputRef.current?.click()}
          inputRef={backupInputRef}
          onImport={importBackup}
        />
      </main>

      <TransactionModal
        type={modalType}
        editingId={editingId}
        form={form}
        onChange={handleChange}
        onRecurringChange={(recurring) =>
          setForm((prev) => ({ ...prev, recurring }))
        }
        onClose={closeModal}
        onSubmit={handleSubmit}
      />

      <BudgetModal
        isOpen={isBudgetModalOpen}
        monthLabel={formatMonth(selectedMonth)}
        value={budgetInput}
        onChange={setBudgetInput}
        onClose={() => setIsBudgetModalOpen(false)}
        onSubmit={handleBudgetSubmit}
      />

      <GoalModal
        isOpen={isGoalModalOpen}
        editing={Boolean(editingGoalId)}
        form={goalForm}
        onFieldChange={(field, value) =>
          setGoalForm((prev) => ({ ...prev, [field]: value }))
        }
        onClose={() => setIsGoalModalOpen(false)}
        onSubmit={handleGoalSubmit}
      />
    </div>
  )
}

export default App
