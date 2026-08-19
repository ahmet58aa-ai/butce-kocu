export default function BudgetModal({ isOpen, monthLabel, value, onChange, onClose, onSubmit }) {
  if (!isOpen) return null

  return (
    <div className="modal-backdrop">
      <div className="modal budget-modal">
        <div className="modal-header">
          <div><p>{monthLabel}</p><h2>Aylık Bütçe Belirle</h2></div>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        <form onSubmit={onSubmit}>
          <label>
            Harcama limiti
            <input
              type="number"
              value={value}
              onChange={(event) => onChange(event.target.value)}
              placeholder="Örn. 15000"
              min="1"
              step="0.01"
              autoFocus
            />
          </label>
          <div className="modal-actions">
            <button type="button" className="secondary-button" onClick={onClose}>Vazgeç</button>
            <button type="submit" className="primary-button">Kaydet</button>
          </div>
        </form>
      </div>
    </div>
  )
}
