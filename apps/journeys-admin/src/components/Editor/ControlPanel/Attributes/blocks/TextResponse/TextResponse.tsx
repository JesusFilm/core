import Divider from '@mui/material/Divider'
import { ReactElement } from 'react'
import { useTranslation } from 'react-i18next'

import type { TreeBlock } from '@core/journeys/ui/block'
import InformationCircleContainedIcon from '@core/shared/ui/icons/InformationCircleContained'
import LinkIcon from '@core/shared/ui/icons/Link'
import TextInput1Icon from '@core/shared/ui/icons/TextInput1'

import { GetJourney_journey_blocks_TextResponseBlock as TextResponseBlock } from '../../../../../../../__generated__/GetJourney'
import { IconFields } from '../../../../../../../__generated__/IconFields'
import { Action, actions } from '../../Action/Action'
import { Attribute } from '../../Attribute'
import { Icon, icons } from '../../Icon'

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

  return (
    <>
      <Attribute
        id={`${id}-text-field-options`}
        icon={<TextInput1Icon />}
        name={t('Feedback')}
        value={label}
        description={t('Feedback Properties')}
        drawerTitle={t('Feedback Properties')}
      >
        <TextResponseFields />
      </Attribute>

      <Divider orientation="vertical" variant="middle" flexItem />

      <Attribute
        id={`${id}-text-field-action`}
        icon={<LinkIcon />}
        name={t('Action')}
        value={
          actions.find((act) => act.value === action?.__typename)?.label ??
          'None'
        }
        description={t('Form Submission')}
        drawerTitle={t('Action')}
      >
        <Action />
      </Attribute>

      <Attribute
        id={`${id}-text-field-icon`}
        icon={<InformationCircleContainedIcon />}
        name={t('Button Icon')}
        value={
          icons.find(({ value }) => value === submitIcon?.iconName)?.label ??
          'None'
        }
        description={t('Button Icon')}
        drawerTitle={t('Button Icon')}
      >
        <Icon id={submitIcon.id} />
      </Attribute>
    </>
  )
}
