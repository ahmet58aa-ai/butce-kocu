 import { useEffect, useMemo, useState } from 'react'
import './App.css'

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

  const [form, setForm] = useState({
    amount: '',
    category: '',
    date: new Date().toISOString().slice(0, 10),
    note: '',
  })

  useEffect(() => {
    localStorage.setItem(
      'butceKocuTransactions',
      JSON.stringify(transactions)
    )
  }, [transactions])

  const totalIncome = useMemo(() => {
    return transactions
      .filter((item) => item.type === 'income')
      .reduce((sum, item) => sum + item.amount, 0)
  }, [transactions])

  const totalExpense = useMemo(() => {
    return transactions
      .filter((item) => item.type === 'expense')
      .reduce((sum, item) => sum + item.amount, 0)
  }, [transactions])

  const balance = totalIncome - totalExpense

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
          <p>Merhaba 👋</p>
          <h2>Finansal durumun</h2>
        </section>

        <section className="balance-card">
          <p>Kullanılabilir Bakiye</p>
          <h2>{formatMoney(balance)}</h2>
          <span>Bu ay</span>
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
            {balance >= 0
              ? 'Bu ay bütçen kontrol altında.'
              : 'Bu ay giderlerin gelirini aşmış durumda.'}
          </h3>

          <p>
            Toplam gelirinin %{savingRate} kadarı şu anda elinde kalıyor.
            Harcamalarını düzenli takip ederek tasarruf oranını artırabilirsin.
          </p>
        </section>

        <section className="transactions">
          <div className="section-title">
            <h3>Son İşlemler</h3>
            <button>Tümünü Gör</button>
          </div>

          {transactions.map((transaction) => (
            <div className="transaction" key={transaction.id}>
              <div>
                <strong>{transaction.category}</strong>

                <p>
                  {transaction.date}
                  {transaction.note
                    ? ` • ${transaction.note}`
                    : ''}
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
    </div>
  )
}

export default App