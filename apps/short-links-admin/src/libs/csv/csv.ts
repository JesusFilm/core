export type CsvValue = string | number | boolean | null | undefined

export interface CsvColumn<Row> {
  header: string
  value: (row: Row) => CsvValue
}

export function escapeCsvValue(value: CsvValue): string {
  if (value == null) return ''

  const text = String(value)
  if (!/[",\r\n]/.test(text)) return text

  return `"${text.replace(/"/g, '""')}"`
}

export function toCsv<Row>(rows: Row[], columns: CsvColumn<Row>[]): string {
  const header = columns.map((column) => escapeCsvValue(column.header))
  const lines = rows.map((row) =>
    columns.map((column) => escapeCsvValue(column.value(row))).join(',')
  )

  return [header.join(','), ...lines].join('\r\n')
}

export function downloadCsv(filename: string, csv: string): void {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename.endsWith('.csv') ? filename : `${filename}.csv`
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  URL.revokeObjectURL(url)
}
