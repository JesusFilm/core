import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import { useTranslation } from 'next-i18next'
import { ReactElement, useEffect } from 'react'

import type { TreeBlock } from '@core/journeys/ui/block'
import { useEditor } from '@core/journeys/ui/EditorProvider'
import InformationCircleContainedIcon from '@core/shared/ui/icons/InformationCircleContained'
import LinkIcon from '@core/shared/ui/icons/Link'
import TextInput1Icon from '@core/shared/ui/icons/TextInput1'

import { BlockFields_TextResponseBlock as TextResponseBlock } from '../../../../../../../../../__generated__/BlockFields'
import { IconFields } from '../../../../../../../../../__generated__/IconFields'
import { Accordion } from '../../Accordion'
import { Action, actions } from '../../controls/Action/Action'
import { Icon, icons } from '../../controls/Icon'

import { TextResponseFields } from './TextResponseFields'

export function TextResponse({
  id,
  children,
  action,
  submitIconId,
  label
}: TreeBlock<TextResponseBlock>): ReactElement {
  const submitIcon = children.find(
    (block) => block.id === submitIconId
  ) as TreeBlock<IconFields>
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
        name={t('Feedback')}
        value={label}
      >
        <TextResponseFields />
      </Accordion>
      <Divider orientation="vertical" variant="middle" flexItem />
      <Accordion
        id={`${id}-text-field-action`}
        icon={<LinkIcon />}
        name={t('Action')}
        value={
          actions.find((act) => act.value === action?.__typename)?.label ??
          'None'
        }
      >
        <Action />
      </Accordion>
      <Accordion
        id={`${id}-text-field-icon`}
        icon={<InformationCircleContainedIcon />}
        name={t('Button Icon')}
        value={
          icons.find(({ value }) => value === submitIcon?.iconName)?.label ??
          'None'
        }
      >
        <Icon id={submitIcon?.id} />
      </Accordion>
    </Box>
  )
}
