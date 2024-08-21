import Box from '@mui/material/Box'
import { useTranslation } from 'next-i18next'
import { ReactElement, useEffect } from 'react'

import type { TreeBlock } from '@core/journeys/ui/block'
import { useEditor } from '@core/journeys/ui/EditorProvider'
import LinkIcon from '@core/shared/ui/icons/Link'

import { BlockFields_RadioOptionBlock as RadioOptionBlock } from '../../../../../../../../../__generated__/BlockFields'
import { Accordion } from '../../Accordion'
import { Action } from '../../controls/Action'
import { getAction } from '../../controls/Action/utils/actions'

export function RadioOption({
  id,
  action
}: TreeBlock<RadioOptionBlock>): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { dispatch } = useEditor()
  const selectedAction = getAction(t, action?.__typename)

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
        value={selectedAction.label}
        testId="RadioOption"
      >
        <Action />
      </Accordion>
    </Box>
  )
}
