export default function TransactionModal({ type, editingId, form, onChange, onRecurringChange, onClose, onSubmit }) {
  if (!type) return null

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <div className="modal-header">
          <div>
            <p>{editingId ? 'İşlemi düzenle' : type === 'income' ? 'Yeni gelir' : 'Yeni harcama'}</p>
            <h2>{editingId ? 'İşlemi Düzenle' : type === 'income' ? 'Gelir Ekle' : 'Harcama Ekle'}</h2>
          </div>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        <form onSubmit={onSubmit}>
          <label>
            Tutar
            <input
              type="number"
              name="amount"
              value={form.amount}
              onChange={onChange}
              placeholder="Örn. 2500"
              min="0"
              step="0.01"
              autoFocus
            />
          </label>
          <label>
            Kategori
            <select name="category" value={form.category} onChange={onChange}>
              {(type === 'income'
                ? ['Maaş', 'Ek Gelir', 'Prim', 'Yatırım Geliri', 'Diğer']
                : ['Market', 'Yemek', 'Ulaşım', 'Faturalar', 'Kira', 'Sağlık', 'Eğlence', 'Alışveriş', 'Diğer']
              ).map((category) => <option key={category}>{category}</option>)}
            </select>
          </label>
          <label>
            Tarih
            <input type="date" name="date" value={form.date} onChange={onChange} />
          </label>
          <label>
            Açıklama
            <textarea
              name="note"
              value={form.note}
              onChange={onChange}
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
                onChange={(event) => onRecurringChange(event.target.checked)}
              />
              <span>
                <strong>Her ay tekrarla</strong>
                <small>Maaş, kira veya abonelik gibi düzenli işlemler için.</small>
              </span>
            </label>
          )}
          <div className="modal-actions">
            <button type="button" className="secondary-button" onClick={onClose}>Vazgeç</button>
            <button type="submit" className="primary-button">{editingId ? 'Güncelle' : 'Kaydet'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}
