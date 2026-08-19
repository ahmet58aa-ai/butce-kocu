export default function GoalModal({ isOpen, editing, form, onFieldChange, onClose, onSubmit }) {
  if (!isOpen) return null

  const fields = [
    { key: 'name', label: 'Hedef adı', placeholder: 'Örn. Acil durum fonu', type: 'text' },
    { key: 'targetAmount', label: 'Hedef tutarı', placeholder: 'Örn. 50000', type: 'number', min: '1' },
    { key: 'currentAmount', label: 'Şu an biriken', placeholder: 'Örn. 10000', type: 'number', min: '0' },
    { key: 'targetDate', label: 'Hedef tarihi', type: 'date' },
  ]

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <div className="modal-header">
          <div><p>Tasarruf planı</p><h2>{editing ? 'Hedefi Güncelle' : 'Yeni Hedef'}</h2></div>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        <form onSubmit={onSubmit}>
          {fields.map((field, index) => (
            <label key={field.key}>
              {field.label}
              <input
                type={field.type}
                value={form[field.key]}
                onChange={(event) => onFieldChange(field.key, event.target.value)}
                placeholder={field.placeholder}
                min={field.min}
                step={field.type === 'number' ? '0.01' : undefined}
                autoFocus={index === 0}
              />
            </label>
          ))}
          <div className="modal-actions">
            <button type="button" className="secondary-button" onClick={onClose}>Vazgeç</button>
            <button type="submit" className="primary-button">{editing ? 'Güncelle' : 'Hedef Oluştur'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}
