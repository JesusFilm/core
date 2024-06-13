import Box from '@mui/material/Box'
import { useTranslation } from 'next-i18next'
import { ReactElement, useEffect } from 'react'

import type { TreeBlock } from '@core/journeys/ui/block'
import { useEditor } from '@core/journeys/ui/EditorProvider'
import LinkIcon from '@core/shared/ui/icons/Link'

import { BlockFields_RadioOptionBlock as RadioOptionBlock } from '../../../../../../../../../__generated__/BlockFields'
import { Accordion } from '../../Accordion'
import { Action, actions } from '../../controls/Action/Action'

export function RadioOption({
  id,
  action
}: TreeBlock<RadioOptionBlock>): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { dispatch } = useEditor()

  useEffect(() => {
    dispatch({
      type: 'SetSelectedAttributeIdAction',
      selectedAttributeId: `${id}-radio-option-action`
    })
  }, [dispatch, id])

  return (
    <Box data-testid="RadioOptionProperties">
      <Accordion
        id={`${id}-radio-option-action`}
        icon={<LinkIcon />}
        name={t('Action')}
        value={
          actions.find((act) => act.value === action?.__typename)?.label ??
          'None'
        }
        testId="RadioOption"
      >
        <Action />
      </Accordion>
    </Box>
  )
}
