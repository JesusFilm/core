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

import { GetAdminVideoVariant_Downloads as VariantDownloads } from '../../../../../../../../../../libs/useAdminVideo/useAdminVideo'

import { bytesToSize } from './utils/bytesToSize'

interface DownloadsProps {
  downloads: VariantDownloads
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
