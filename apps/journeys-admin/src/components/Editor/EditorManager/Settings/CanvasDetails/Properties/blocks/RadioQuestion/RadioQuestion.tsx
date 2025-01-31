import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

import { TreeBlock } from '@core/journeys/ui/block'

import { BlockFields_RadioQuestionBlock as RadioQuestionBlock } from '../../../../../../../../../__generated__/BlockFields'

export function RadioQuestion(
  props: TreeBlock<RadioQuestionBlock>
): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')

  return (
    <Box data-testid="RadioQuestionProperties" sx={{ p: 4 }}>
      <Typography>
        {t('To edit poll content, choose each option individually.')}
      </Typography>
    </Box>
  )
}
