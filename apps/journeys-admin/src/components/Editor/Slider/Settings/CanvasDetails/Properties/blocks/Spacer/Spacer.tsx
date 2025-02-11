import Box from '@mui/material/Box'
import Slider from '@mui/material/Slider'
import Stack from '@mui/material/Stack'
import { useTranslation } from 'next-i18next'
import { ReactElement, useEffect, useState } from 'react'

import type { TreeBlock } from '@core/journeys/ui/block'
import { useEditor } from '@core/journeys/ui/EditorProvider'
import SpaceHeight from '@core/shared/ui/icons/SpaceHeight'

import { BlockFields_SpacerBlock as SpacerBlock } from '../../../../../../../../../__generated__/BlockFields'
import { Accordion } from '../../Accordion'

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

  function handleChange(_event, spacing: number): void {
    setValue(spacing)
  }

  return (
    <Box data-testid="SpacerProperties">
      <Accordion
        id={`${id}-spacer-options`}
        icon={<SpaceHeight />}
        name={t('Spacer Height')}
        value={`${value.toString()} Pixels`}
      >
        <Stack data-testid="SpacerFields">
          <Box sx={{ p: 4, pt: 0 }} data-testid="Label">
            <Slider
              sx={{ width: '100%' }}
              min={20}
              max={400}
              step={20}
              value={value}
              onChange={handleChange}
            />
          </Box>
        </Stack>
      </Accordion>
    </Box>
  )
}
