import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography
} from '@mui/material'
import { useTranslations } from 'next-intl'
import { ReactElement } from 'react'

function bytesToSize(bytes) {
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  if (bytes === 0) return 'n/a'
  const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)), 10)
  if (i === 0) return `${bytes} ${sizes[i]})`
  return `${(bytes / 1024 ** i).toFixed(1)} ${sizes[i]}`
}

interface DownloadsProps {
  downloads: []
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
