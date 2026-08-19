 import { useEffect, useMemo, useRef, useState } from 'react'
import './App.css'

function getRecurringDate(monthValue, originalDate) {
  const [year, month] = monthValue.split('-').map(Number)
  const originalDay = Number(originalDate.slice(8, 10))
  const lastDay = new Date(year, month, 0).getDate()
  const day = String(Math.min(originalDay, lastDay)).padStart(2, '0')
  return `${monthValue}-${day}`
}

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

  const monthlyTransactions = useMemo(() => {
    return transactions
      .filter((item) => item.date.startsWith(selectedMonth))
      .sort((a, b) => b.date.localeCompare(a.date))
  }, [transactions, selectedMonth])

  const totalIncome = useMemo(() => {
    return monthlyTransactions
      .filter((item) => item.type === 'income')
      .reduce((sum, item) => sum + item.amount, 0)
  }, [monthlyTransactions])

  const totalExpense = useMemo(() => {
    return monthlyTransactions
      .filter((item) => item.type === 'expense')
      .reduce((sum, item) => sum + item.amount, 0)
  }, [monthlyTransactions])

  const expenseBreakdown = useMemo(() => {
    const categoryTotals = monthlyTransactions
      .filter((item) => item.type === 'expense')
      .reduce((totals, item) => {
        totals[item.category] = (totals[item.category] || 0) + item.amount
        return totals
      }, {})

    return Object.entries(categoryTotals)
      .map(([category, amount]) => ({
        category,
        amount,
        percentage: totalExpense > 0 ? (amount / totalExpense) * 100 : 0,
      }))
      .sort((a, b) => b.amount - a.amount)
  }, [monthlyTransactions, totalExpense])

  const availableCategories = useMemo(() => {
    return [...new Set(monthlyTransactions.map((item) => item.category))]
      .sort((a, b) => a.localeCompare(b, 'tr'))
  }, [monthlyTransactions])

  const filteredTransactions = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLocaleLowerCase('tr-TR')

    return monthlyTransactions.filter((item) => {
      const matchesType = typeFilter === 'all' || item.type === typeFilter
      const matchesCategory =
        categoryFilter === 'all' || item.category === categoryFilter
      const searchableText = `${item.category} ${item.note || ''}`
        .toLocaleLowerCase('tr-TR')
      const matchesSearch =
        !normalizedSearch || searchableText.includes(normalizedSearch)

      return matchesType && matchesCategory && matchesSearch
    })
  }, [monthlyTransactions, searchTerm, typeFilter, categoryFilter])

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
      const hasValidTransactions =
        Array.isArray(backup.transactions) &&
        backup.transactions.every((item) =>
          item &&
          ['income', 'expense'].includes(item.type) &&
          typeof item.category === 'string' &&
          Number.isFinite(Number(item.amount)) &&
          typeof item.date === 'string'
        )
      const hasValidBudgets =
        backup.monthlyBudgets &&
        typeof backup.monthlyBudgets === 'object' &&
        !Array.isArray(backup.monthlyBudgets)

      if (!hasValidTransactions || !hasValidBudgets) {
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

        <section className="summary">
          <div className="card">
            <span>↑ Gelir</span>
            <strong>{formatMoney(totalIncome)}</strong>
          </div>

          <div className="card">
            <span>↓ Harcama</span>
            <strong>{formatMoney(totalExpense)}</strong>
          </div>

          <div className="card">
            <span>◎ Tasarruf</span>
            <strong>%{savingRate}</strong>
          </div>
        </section>

        <section className={`budget-card ${remainingBudget < 0 ? 'budget-card-alert' : ''}`}>
          <div className="budget-header">
            <div>
              <span>Aylık harcama bütçesi</span>
              <h3>{budgetLimit ? formatMoney(budgetLimit) : 'Henüz belirlenmedi'}</h3>
            </div>

            <button onClick={openBudgetModal}>
              {budgetLimit ? 'Limiti Güncelle' : 'Bütçe Belirle'}
            </button>
          </div>

          {budgetLimit > 0 && (
            <>
              <div
                className="budget-progress"
                role="progressbar"
                aria-label="Aylık bütçe kullanımı"
                aria-valuenow={Math.round(budgetUsage)}
                aria-valuemin="0"
                aria-valuemax="100"
              >
                <div style={{ width: `${budgetUsage}%` }} />
              </div>

              <div className="budget-details">
                <span>{formatMoney(totalExpense)} harcandı</span>
                <strong>
                  {remainingBudget >= 0
                    ? `${formatMoney(remainingBudget)} kaldı`
                    : `Limit ${formatMoney(Math.abs(remainingBudget))} aşıldı`}
                </strong>
              </div>
            </>
          )}
        </section>

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

        <section className="expense-analysis">
          <div className="section-title">
            <div>
              <p className="section-eyebrow">Aylık analiz</p>
              <h3>Harcama dağılımı</h3>
            </div>

            <strong>{formatMoney(totalExpense)}</strong>
          </div>

          {expenseBreakdown.length > 0 ? (
            <>
              <div className="category-chart">
                {expenseBreakdown.map((item, index) => (
                  <div className="category-row" key={item.category}>
                    <div className="category-meta">
                      <span>{item.category}</span>
                      <span>
                        %{item.percentage.toFixed(0)} · {formatMoney(item.amount)}
                      </span>
                    </div>

                    <div
                      className="category-track"
                      role="progressbar"
                      aria-label={`${item.category} harcaması`}
                      aria-valuenow={Math.round(item.percentage)}
                      aria-valuemin="0"
                      aria-valuemax="100"
                    >
                      <div
                        className={`category-bar category-bar-${(index % 5) + 1}`}
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <p className="analysis-note">
                En yüksek harcaman <strong>{expenseBreakdown[0].category}</strong>
                {' '}kategorisinde: {formatMoney(expenseBreakdown[0].amount)}.
              </p>
            </>
          ) : (
            <div className="analysis-empty">
              Bu ay gider eklediğinde kategori dağılımını burada göreceksin.
            </div>
          )}
        </section>

        <section className="transactions">
          <div className="section-title">
            <div>
              <p className="section-eyebrow">{filteredTransactions.length} sonuç</p>
              <h3>İşlemler</h3>
            </div>
          </div>

          <div className="transaction-filters">
            <label className="search-field">
              <span className="sr-only">İşlemlerde ara</span>
              <input
                type="search"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Kategori veya açıklama ara"
              />
            </label>

            <label>
              <span className="sr-only">İşlem türü</span>
              <select
                value={typeFilter}
                onChange={(event) => setTypeFilter(event.target.value)}
              >
                <option value="all">Tüm türler</option>
                <option value="income">Gelirler</option>
                <option value="expense">Giderler</option>
              </select>
            </label>

            <label>
              <span className="sr-only">Kategori</span>
              <select
                value={categoryFilter}
                onChange={(event) => setCategoryFilter(event.target.value)}
              >
                <option value="all">Tüm kategoriler</option>
                {availableCategories.map((category) => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </label>
          </div>

          {filteredTransactions.length === 0 && (
            <div className="empty-state">
              <span>🔎</span>
              <strong>
                {monthlyTransactions.length === 0
                  ? `${formatMonth(selectedMonth)} için işlem yok`
                  : 'Filtrelere uygun işlem bulunamadı'}
              </strong>
              <p>
                {monthlyTransactions.length === 0
                  ? 'Bu aya ait ilk gelir veya harcamanı ekleyebilirsin.'
                  : 'Arama metnini veya filtreleri değiştirmeyi dene.'}
              </p>
            </div>
          )}

          {filteredTransactions.map((transaction) => (
            <div className="transaction" key={transaction.id}>
              <div>
                <strong>{transaction.category}</strong>

                <p>
                  {transaction.date}
                  {transaction.note
                    ? ` • ${transaction.note}`
                    : ''}
                  {(transaction.recurring || transaction.recurrenceId) && (
                    <span className="recurring-badge">Her ay</span>
                  )}
                </p>
              </div>

              <div className="transaction-right">
                <span
                  className={
                    transaction.type === 'income'
                      ? 'amount income'
                      : 'amount expense'
                  }
                >
                  {transaction.type === 'income' ? '+' : '-'}
                  {formatMoney(transaction.amount)}
                </span>

                <div className="transaction-actions">
                  <button
                    onClick={() => handleEdit(transaction)}
                    className="edit-button"
                  >
                    Düzenle
                  </button>

                  <button
                    onClick={() => handleDelete(transaction.id)}
                    className="delete-button"
                  >
                    Sil
                  </button>
                </div>
              </div>
            </div>
          ))}
        </section>

        <section className="data-tools">
          <div>
            <p className="section-eyebrow">Veri yönetimi</p>
            <h3>Verilerini güvende tut</h3>
            <p>İşlemlerini tabloya aktarabilir veya tam bir yedek oluşturabilirsin.</p>
          </div>

          <div className="data-tool-actions">
            <button onClick={exportCsv}>CSV İndir</button>
            <button onClick={exportBackup}>Yedek Al</button>
            <button onClick={() => backupInputRef.current?.click()}>
              Yedeği Geri Yükle
            </button>
            <input
              ref={backupInputRef}
              className="backup-input"
              type="file"
              accept="application/json,.json"
              onChange={importBackup}
            />
          </div>
        </section>
      </main>

      {modalType && (
        <div className="modal-backdrop">
          <div className="modal">
            <div className="modal-header">
              <div>
                <p>
                  {editingId
                    ? 'İşlemi düzenle'
                    : modalType === 'income'
                    ? 'Yeni gelir'
                    : 'Yeni harcama'}
                </p>

                <h2>
                  {editingId
                    ? 'İşlemi Düzenle'
                    : modalType === 'income'
                    ? 'Gelir Ekle'
                    : 'Harcama Ekle'}
                </h2>
              </div>

              <button
                className="close-button"
                onClick={closeModal}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <label>
                Tutar
                <input
                  type="number"
                  name="amount"
                  value={form.amount}
                  onChange={handleChange}
                  placeholder="Örn. 2500"
                  min="0"
                  step="0.01"
                  autoFocus
                />
              </label>

              <label>
                Kategori

                {modalType === 'income' ? (
                  <select
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                  >
                    <option>Maaş</option>
                    <option>Ek Gelir</option>
                    <option>Prim</option>
                    <option>Yatırım Geliri</option>
                    <option>Diğer</option>
                  </select>
                ) : (
                  <select
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                  >
                    <option>Market</option>
                    <option>Yemek</option>
                    <option>Ulaşım</option>
                    <option>Faturalar</option>
                    <option>Kira</option>
                    <option>Sağlık</option>
                    <option>Eğlence</option>
                    <option>Alışveriş</option>
                    <option>Diğer</option>
                  </select>
                )}
              </label>

              <label>
                Tarih
                <input
                  type="date"
                  name="date"
                  value={form.date}
                  onChange={handleChange}
                />
              </label>

              <label>
                Açıklama
                <textarea
                  name="note"
                  value={form.note}
                  onChange={handleChange}
                  placeholder="İstersen kısa bir not ekle"
                  rows="3"
                />
              </label>

              {!editingId?.toString().includes('-') && (
                <label className="recurring-option">
                  <input
                    type="checkbox"
                    name="recurring"
                    checked={form.recurring}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        recurring: event.target.checked,
                      }))
                    }
                  />
                  <span>
                    <strong>Her ay tekrarla</strong>
                    <small>Maaş, kira veya abonelik gibi düzenli işlemler için.</small>
                  </span>
                </label>
              )}

              <div className="modal-actions">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={closeModal}
                >
                  Vazgeç
                </button>

                <button
                  type="submit"
                  className="primary-button"
                >
                  {editingId ? 'Güncelle' : 'Kaydet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isBudgetModalOpen && (
        <div className="modal-backdrop">
          <div className="modal budget-modal">
            <div className="modal-header">
              <div>
                <p>{formatMonth(selectedMonth)}</p>
                <h2>Aylık Bütçe Belirle</h2>
              </div>

              <button
                className="close-button"
                onClick={() => setIsBudgetModalOpen(false)}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleBudgetSubmit}>
              <label>
                Harcama limiti
                <input
                  type="number"
                  value={budgetInput}
                  onChange={(event) => setBudgetInput(event.target.value)}
                  placeholder="Örn. 15000"
                  min="1"
                  step="0.01"
                  autoFocus
                />
              </label>

              <div className="modal-actions">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => setIsBudgetModalOpen(false)}
                >
                  Vazgeç
                </button>
                <button type="submit" className="primary-button">
                  Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
