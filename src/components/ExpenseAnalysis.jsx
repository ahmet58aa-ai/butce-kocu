export default function ExpenseAnalysis({ expenseBreakdown, totalExpense, formatMoney }) {
  return (
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
                  <span>%{item.percentage.toFixed(0)} · {formatMoney(item.amount)}</span>
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
            En yüksek harcaman <strong>{expenseBreakdown[0].category}</strong>{' '}
            kategorisinde: {formatMoney(expenseBreakdown[0].amount)}.
          </p>
        </>
      ) : (
        <div className="analysis-empty">
          Bu ay gider eklediğinde kategori dağılımını burada göreceksin.
        </div>
      )}
    </section>
  )
}
