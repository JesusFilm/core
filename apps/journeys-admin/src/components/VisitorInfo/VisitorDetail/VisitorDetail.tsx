import { ReactElement } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'react-i18next'
import { VisitorJourneysList } from '../VisitorJourneysList'
import { VisitorDetailForm } from './VisitorDetailForm'

interface Props {
  id: string
}

export function VisitorDetail({ id }: Props): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')

  return (
    <>
      <VisitorDetailForm id={id} />
      <Box sx={{ py: 4 }}>
        <Typography variant="h5">{t('Latest Journey')}</Typography>
      </Box>
      <VisitorJourneysList id={id} />
    </>
  )
}
