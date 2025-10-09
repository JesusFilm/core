import { format } from 'date-fns'

export function downloadCsv(csvContent: string, filename: string = 'data') {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const today = format(new Date(), 'yyyy-MM-dd')
  const a = document.createElement('a')
  a.href = url
  a.setAttribute('download', `[${today}] ${filename}.csv`)
  document.body.appendChild(a)
  a.click()
  setTimeout(() => {
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, 0)
}
