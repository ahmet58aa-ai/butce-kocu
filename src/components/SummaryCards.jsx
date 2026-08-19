export default function SummaryCards({ totalIncome, totalExpense, savingRate, formatMoney }) {
  return (
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
  )
}
