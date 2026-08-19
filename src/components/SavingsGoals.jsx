export default function SavingsGoals({ goals, formatMoney, onAdd, onEdit, onDelete }) {
  return (
    <section className="goals-section">
      <div className="section-title">
        <div>
          <p className="section-eyebrow">Gelecek planı</p>
          <h3>Tasarruf hedefleri</h3>
        </div>
        <button className="add-goal-button" onClick={onAdd}>+ Hedef Ekle</button>
      </div>

      {goals.length > 0 ? (
        <div className="goals-grid">
          {goals.map((goal) => {
            const progress = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100)
            return (
              <article className="goal-card" key={goal.id}>
                <div className="goal-card-header">
                  <div>
                    <h4>{goal.name}</h4>
                    <span>{goal.targetDate ? `Hedef: ${goal.targetDate}` : 'Tarih belirtilmedi'}</span>
                  </div>
                  <strong>%{progress.toFixed(0)}</strong>
                </div>
                <div
                  className="goal-progress"
                  role="progressbar"
                  aria-label={`${goal.name} hedef ilerlemesi`}
                  aria-valuenow={Math.round(progress)}
                  aria-valuemin="0"
                  aria-valuemax="100"
                >
                  <div style={{ width: `${progress}%` }} />
                </div>
                <div className="goal-amounts">
                  <span>{formatMoney(goal.currentAmount)} birikti</span>
                  <span>{formatMoney(goal.targetAmount)} hedef</span>
                </div>
                <div className="goal-actions">
                  <button onClick={() => onEdit(goal)}>Güncelle</button>
                  <button onClick={() => onDelete(goal.id)}>Sil</button>
                </div>
              </article>
            )
          })}
        </div>
      ) : (
        <div className="goals-empty">
          <span>🎯</span>
          <div>
            <strong>İlk tasarruf hedefini oluştur</strong>
            <p>Tatil, acil durum fonu veya büyük bir alışveriş için birikimini takip et.</p>
          </div>
        </div>
      )}
    </section>
  )
}
