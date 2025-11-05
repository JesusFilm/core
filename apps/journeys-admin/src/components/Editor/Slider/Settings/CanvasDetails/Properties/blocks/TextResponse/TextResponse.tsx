import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import { useTranslation } from 'next-i18next'
import { ReactElement, useEffect } from 'react'

import type { TreeBlock } from '@core/journeys/ui/block'
import { useEditor } from '@core/journeys/ui/EditorProvider'
import TextInput1Icon from '@core/shared/ui/icons/TextInput1'

import { BlockFields_TextResponseBlock as TextResponseBlock } from '../../../../../../../../../__generated__/BlockFields'
import { Accordion } from '../../Accordion'

import { TextResponseFields } from './TextResponseFields'

export function TextResponse({
  id,
  label
}: TreeBlock<TextResponseBlock>): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')

  const { dispatch } = useEditor()

  useEffect(() => {
    dispatch({
      type: 'SetSelectedAttributeIdAction',
      selectedAttributeId: `${id}-text-field-options`
    })
  }, [dispatch, id])

  return (
    <Box data-testid="TextResponseProperties">
      <Accordion
        id={`${id}-text-field-options`}
        icon={<TextInput1Icon />}
        name={t('Response Field')}
        value={label}
      >
        <TextResponseFields />
      </Accordion>
      <Divider orientation="vertical" variant="middle" flexItem />
    </Box>
  )
}
