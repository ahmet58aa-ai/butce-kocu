export default function BudgetCard({
  budgetLimit,
  budgetUsage,
  remainingBudget,
  totalExpense,
  formatMoney,
  onOpen,
}) {
  return (
    <section className={`budget-card ${remainingBudget < 0 ? 'budget-card-alert' : ''}`}>
      <div className="budget-header">
        <div>
          <span>Aylık harcama bütçesi</span>
          <h3>{budgetLimit ? formatMoney(budgetLimit) : 'Henüz belirlenmedi'}</h3>
        </div>
        <button onClick={onOpen}>
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
  )
}
