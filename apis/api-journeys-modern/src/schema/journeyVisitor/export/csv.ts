import { stringify } from 'csv-stringify'

export interface CsvColumn {
  key: string
}

export function createCsvStringifier(columns: CsvColumn[]) {
  const stringifier = stringify({
    header: false,
    quoted: true,
    quote: '"',
    escape: '"',
    quoted_empty: true,
    columns,
    cast: {
      string: (value: any) => String(value ?? '')
    }
  })

  let csvContent = ''
  stringifier.on('data', (chunk) => {
    csvContent += chunk
  })

  const onEndPromise = new Promise<void>((resolve) => {
    stringifier.on('end', () => resolve())
  })

  return {
    stringifier,
    onEndPromise,
    getContent: () => csvContent
  }
}


