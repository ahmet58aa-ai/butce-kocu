export default function TransactionList({
  transactions,
  monthlyTransactionCount,
  availableCategories,
  searchTerm,
  typeFilter,
  categoryFilter,
  selectedMonthLabel,
  formatMoney,
  onSearchChange,
  onTypeChange,
  onCategoryChange,
  onEdit,
  onDelete,
}) {
  return (
    <section className="transactions">
      <div className="section-title">
        <div>
          <p className="section-eyebrow">{transactions.length} sonuç</p>
          <h3>İşlemler</h3>
        </div>
      </div>

      <div className="transaction-filters">
        <label className="search-field">
          <span className="sr-only">İşlemlerde ara</span>
          <input
            type="search"
            value={searchTerm}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Kategori veya açıklama ara"
          />
        </label>
        <label>
          <span className="sr-only">İşlem türü</span>
          <select value={typeFilter} onChange={(event) => onTypeChange(event.target.value)}>
            <option value="all">Tüm türler</option>
            <option value="income">Gelirler</option>
            <option value="expense">Giderler</option>
          </select>
        </label>
        <label>
          <span className="sr-only">Kategori</span>
          <select
            value={categoryFilter}
            onChange={(event) => onCategoryChange(event.target.value)}
          >
            <option value="all">Tüm kategoriler</option>
            {availableCategories.map((category) => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </label>
      </div>

      {transactions.length === 0 && (
        <div className="empty-state">
          <span>🔎</span>
          <strong>
            {monthlyTransactionCount === 0
              ? `${selectedMonthLabel} için işlem yok`
              : 'Filtrelere uygun işlem bulunamadı'}
          </strong>
          <p>
            {monthlyTransactionCount === 0
              ? 'Bu aya ait ilk gelir veya harcamanı ekleyebilirsin.'
              : 'Arama metnini veya filtreleri değiştirmeyi dene.'}
          </p>
        </div>
      )}

      {transactions.map((transaction) => (
        <div className="transaction" key={transaction.id}>
          <div>
            <strong>{transaction.category}</strong>
            <p>
              {transaction.date}
              {transaction.note ? ` • ${transaction.note}` : ''}
              {(transaction.recurring || transaction.recurrenceId) && (
                <span className="recurring-badge">Her ay</span>
              )}
            </p>
          </div>
          <div className="transaction-right">
            <span className={transaction.type === 'income' ? 'amount income' : 'amount expense'}>
              {transaction.type === 'income' ? '+' : '-'}{formatMoney(transaction.amount)}
            </span>
            <div className="transaction-actions">
              <button onClick={() => onEdit(transaction)} className="edit-button">Düzenle</button>
              <button onClick={() => onDelete(transaction.id)} className="delete-button">Sil</button>
            </div>
          </div>
        </div>
      ))}
    </section>
  )
}
