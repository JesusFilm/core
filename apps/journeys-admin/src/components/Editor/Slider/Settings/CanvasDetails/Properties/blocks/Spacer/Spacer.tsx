import Box from '@mui/material/Box'
import { useTranslation } from 'next-i18next'
import { ReactElement, useEffect } from 'react'

import type { TreeBlock } from '@core/journeys/ui/block'
import { useEditor } from '@core/journeys/ui/EditorProvider'
import SpaceHeight from '@core/shared/ui/icons/SpaceHeight'

import { BlockFields_SpacerBlock as SpacerBlock } from '../../../../../../../../../__generated__/BlockFields'
import { Accordion } from '../../Accordion'

import { SpacerSpacing } from './SpacerSpacing'

export function Spacer({ id, spacing }: TreeBlock<SpacerBlock>): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')

  const { dispatch } = useEditor()

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
        icon={<SpaceHeight />}
        name={t('Spacer Height')}
        value={`${spacing?.toString()} Pixels`}
      >
        <SpacerSpacing />
      </Accordion>
    </Box>
  )
}
