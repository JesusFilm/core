import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next'
import { ReactElement, useEffect } from 'react'

import type { TreeBlock } from '@core/journeys/ui/block'
import { useEditor } from '@core/journeys/ui/EditorProvider'

import { BlockFields_MultiselectOptionBlock as MultiselectOptionBlock } from '../../../../../../../../../__generated__/BlockFields'

export function MultiselectOption(
  props: TreeBlock<MultiselectOptionBlock>
): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { dispatch } = useEditor()

  useEffect(() => {
    dispatch({
      type: 'SetSelectedAttributeIdAction',
      selectedAttributeId: `${props.id}-multiselect-option`
    })
  }, [dispatch, props.id])

  return (
    <Box data-testid="MultiselectOptionProperties">
      <Box sx={{ p: 4 }}>
        <Typography>
          {t('Edit the option label directly on the canvas.')}
        </Typography>
      </Box>
    </Box>
  )
}
