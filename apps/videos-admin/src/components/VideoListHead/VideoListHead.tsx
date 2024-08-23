import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import TableSortLabel from '@mui/material/TableSortLabel'
import Typography from '@mui/material/Typography'
import { useTranslations } from 'next-intl'
import { ReactElement } from 'react'

export function VideoListHead(): ReactElement {
  const t = useTranslations()

  return (
    <TableHead>
      <TableRow>
        <TableCell>
          <TableSortLabel>
            <Typography variant="subtitle3">{t('ID')}</Typography>
          </TableSortLabel>
        </TableCell>
        <TableCell>
          <TableSortLabel>
            <Typography variant="subtitle3">{t('Title')}</Typography>
          </TableSortLabel>
        </TableCell>
        <TableCell>
          <TableSortLabel>
            <Typography variant="subtitle3">{t('Description')}</Typography>
          </TableSortLabel>
        </TableCell>
      </TableRow>
    </TableHead>
  )
}
