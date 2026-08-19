export default function DataTools({
  onExportCsv,
  onExportBackup,
  onImportClick,
  inputRef,
  onImport,
  onCsvImportClick,
  csvInputRef,
  onCsvImport,
}) {
  return (
    <section className="data-tools">
      <div>
        <p className="section-eyebrow">Veri yönetimi</p>
        <h3>Verilerini güvende tut</h3>
        <p>İşlemlerini tabloya aktarabilir veya tam bir yedek oluşturabilirsin.</p>
      </div>
      <div className="data-tool-actions">
        <button onClick={onCsvImportClick}>Banka CSV Yükle</button>
        <button onClick={onExportCsv}>CSV İndir</button>
        <button onClick={onExportBackup}>Yedek Al</button>
        <button onClick={onImportClick}>Yedeği Geri Yükle</button>
        <input
          ref={inputRef}
          className="backup-input"
          type="file"
          accept="application/json,.json"
          onChange={onImport}
        />
        <input
          ref={csvInputRef}
          className="backup-input"
          type="file"
          accept="text/csv,.csv"
          onChange={onCsvImport}
        />
      </div>
    </section>
  )
}
