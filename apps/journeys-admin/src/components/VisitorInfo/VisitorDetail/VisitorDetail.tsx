import { ReactElement } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'react-i18next'
import { VisitorJourneyList } from '../VisitorJourneyList'
import { VisitorDetailForm } from './VisitorDetailForm'

interface Props {
  id: string
}

export function VisitorDetail({ id }: Props): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')

  return (
    <Box pt={4}>
      <VisitorDetailForm id={id} />
      <Box sx={{ px: 4, pt: 4 }}>
        <Typography variant="h5">{t('Latest Journey')}</Typography>
      </Box>
      <VisitorJourneyList id={id} limit={1} />
    </Box>
  )
}
