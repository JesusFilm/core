import Paper from '@mui/material/Paper'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Typography from '@mui/material/Typography'
import { useTranslations } from 'next-intl'
import { ReactElement } from 'react'

import { GetAdminVideoVariant } from '../../../../../../../../libs/useAdminVideo'

function bytesToSize(bytes): string {
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  if (bytes === 0) return 'n/a'
  const i = parseInt(
    Math.floor(Math.log(bytes) / Math.log(1024)).toString(),
    10
  )
  if (i === 0) return `${bytes} ${sizes[i]})`
  return `${(bytes / 1024 ** i).toFixed(1)} ${sizes[i]}`
}

interface DownloadsProps {
  downloads: GetAdminVideoVariant['downloads']
}

export function Downloads({ downloads }: DownloadsProps): ReactElement {
  const t = useTranslations()

  return (
    <>
      <Typography variant="h4">{t('Downloads')}</Typography>
      <>
        {downloads.length === 0 ? (
          <Typography>{t('No downloads available')}</Typography>
        ) : (
          <TableContainer component={Paper}>
            <Table sx={{ minWidth: 700 }}>
              <TableHead>
                <TableRow>
                  <TableCell>{t('Quality')}</TableCell>
                  <TableCell>{t('Size')}</TableCell>
                  <TableCell>{t('Dimensions')}</TableCell>
                  <TableCell>{t('URL')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {downloads.map(({ id, quality, size, width, height, url }) => (
                  <TableRow key={id}>
                    <TableCell>{quality}</TableCell>
                    <TableCell>{bytesToSize(size)}</TableCell>
                    <TableCell>{`${width}x${height}`}</TableCell>
                    <TableCell>{url}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </>
    </>
  )
}
