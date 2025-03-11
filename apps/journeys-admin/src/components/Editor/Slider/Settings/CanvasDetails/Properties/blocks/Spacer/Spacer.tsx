import Box from '@mui/material/Box'
import { useTranslation } from 'next-i18next'
import { ReactElement, useEffect, useState } from 'react'

import type { TreeBlock } from '@core/journeys/ui/block'
import { useEditor } from '@core/journeys/ui/EditorProvider'
import Crop169Icon from '@core/shared/ui/icons/Crop169'

import { BlockFields_SpacerBlock as SpacerBlock } from '../../../../../../../../../__generated__/BlockFields'
import { Accordion } from '../../Accordion'

import { Spacing } from './Spacing'

export function Spacer({ id, spacing }: TreeBlock<SpacerBlock>): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { dispatch } = useEditor()
  const [value, setValue] = useState(spacing ?? 100)

  useEffect(() => {
    dispatch({
      type: 'SetSelectedAttributeIdAction',
      selectedAttributeId: `${id}-spacer-options`
    })
  }, [dispatch, id])

  return (
    <Box data-testid="SpacerProperties">
      <Accordion
        id={`${id}-spacer-options`}
        icon={<Crop169Icon />}
        name={t('Spacer Height')}
        value={t('{{pixels}} Pixels', { pixels: value })}
      >
        <Spacing value={value} setValue={setValue} />
      </Accordion>
    </Box>
  )
}
