const CATEGORY_RULES = [
  { category: 'Market', keywords: ['migros', 'a101', 'bim', 'şok market', 'carrefour', 'market'] },
  { category: 'Yemek', keywords: ['yemeksepeti', 'restoran', 'restaurant', 'kahve', 'cafe', 'burger', 'pizza'] },
  { category: 'Ulaşım', keywords: ['uber', 'taksi', 'metro', 'otobüs', 'benzin', 'akaryakıt', 'shell', 'opet'] },
  { category: 'Faturalar', keywords: ['elektrik', 'doğalgaz', 'internet', 'telefon', 'turkcell', 'vodafone', 'türk telekom', 'fatura'] },
  { category: 'Kira', keywords: ['kira'] },
  { category: 'Sağlık', keywords: ['eczane', 'hastane', 'klinik', 'sağlık'] },
  { category: 'Eğlence', keywords: ['netflix', 'spotify', 'sinema', 'youtube', 'oyun'] },
  { category: 'Alışveriş', keywords: ['trendyol', 'hepsiburada', 'amazon', 'mağaza', 'giyim'] },
  { category: 'Maaş', keywords: ['maaş', 'salary', 'ücret ödemesi'] },
]

function splitCsvLine(line, delimiter) {
  const cells = []
  let value = ''
  let quoted = false

  for (let index = 0; index < line.length; index += 1) {
    const character = line[index]

    if (character === '"' && line[index + 1] === '"' && quoted) {
      value += '"'
      index += 1
    } else if (character === '"') {
      quoted = !quoted
    } else if (character === delimiter && !quoted) {
      cells.push(value.trim())
      value = ''
    } else {
      value += character
    }
  }

  cells.push(value.trim())
  return cells
}

function normalizeHeader(value) {
  return value
    .replace(/^\uFEFF/, '')
    .trim()
    .toLocaleLowerCase('tr-TR')
    .replaceAll('ı', 'i')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

function findColumn(headers, aliases) {
  const normalizedAliases = aliases.map(normalizeHeader)
  return headers.findIndex((header) =>
    normalizedAliases.includes(normalizeHeader(header))
  )
}

export function parseAmount(value) {
  const cleaned = String(value ?? '')
    .replace(/[^\d,.-]/g, '')
    .trim()

  if (!cleaned) return Number.NaN

  const normalized = cleaned.includes(',')
    ? cleaned.replaceAll('.', '').replace(',', '.')
    : cleaned

  return Number(normalized)
}

export function normalizeDate(value) {
  const text = String(value ?? '').trim()
  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return text

  const match = text.match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{4})$/)
  if (!match) return null

  const [, day, month, year] = match
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
}

export function suggestCategory(description, type = 'expense') {
  if (type === 'income') return 'Ek Gelir'
  const text = String(description ?? '')
    .toLocaleLowerCase('tr-TR')
    .replaceAll('ı', 'i')
  return CATEGORY_RULES.find((rule) =>
    rule.keywords.some((keyword) => text.includes(keyword))
  )?.category || 'Diğer'
}

export function parseTransactionCsv(content) {
  const lines = content
    .replace(/^\uFEFF/, '')
    .split(/\r?\n/)
    .filter((line) => line.trim())

  if (lines.length < 2) return { transactions: [], skipped: 0 }

  const delimiters = [',', ';', '\t']
  const delimiter = delimiters
    .map((candidate) => ({ candidate, count: splitCsvLine(lines[0], candidate).length }))
    .sort((a, b) => b.count - a.count)[0].candidate
  const headers = splitCsvLine(lines[0], delimiter)

  const typeIndex = findColumn(headers, ['tür', 'tur', 'tip', 'type', 'işlem türü', 'islem turu'])
  const categoryIndex = findColumn(headers, ['kategori', 'category'])
  const amountIndex = findColumn(headers, ['tutar', 'amount', 'miktar', 'işlem tutarı', 'islem tutari'])
  const dateIndex = findColumn(headers, ['tarih', 'date', 'işlem tarihi', 'islem tarihi'])
  const noteIndex = findColumn(headers, ['açıklama', 'aciklama', 'description', 'not', 'işlem açıklaması', 'islem aciklamasi'])

  if (amountIndex < 0 || dateIndex < 0) {
    throw new Error('CSV dosyasında Tutar ve Tarih sütunları bulunmalı.')
  }

  const parsed = []
  let skipped = 0

  lines.slice(1).forEach((line, index) => {
    const cells = splitCsvLine(line, delimiter)
    const rawAmount = parseAmount(cells[amountIndex])
    const date = normalizeDate(cells[dateIndex])

    if (!Number.isFinite(rawAmount) || rawAmount === 0 || !date) {
      skipped += 1
      return
    }

    const rawType = typeIndex >= 0
      ? normalizeHeader(cells[typeIndex])
      : ''
    const type = ['gelir', 'income', 'alacak'].includes(rawType)
      ? 'income'
      : ['gider', 'expense', 'borç', 'borc'].includes(rawType)
      ? 'expense'
      : rawAmount > 0
      ? 'income'
      : 'expense'
    const note = noteIndex >= 0 ? cells[noteIndex] : ''
    const category = categoryIndex >= 0 && cells[categoryIndex]
      ? cells[categoryIndex]
      : suggestCategory(note, type)

    parsed.push({
      id: `${Date.now()}-${index}`,
      type,
      category,
      amount: Math.abs(rawAmount),
      date,
      note,
      recurring: false,
    })
  })

  return { transactions: parsed, skipped }
}
