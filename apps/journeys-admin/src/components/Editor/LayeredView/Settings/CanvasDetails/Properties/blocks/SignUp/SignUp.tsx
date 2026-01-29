import Box from '@mui/material/Box'
import { useTranslation } from 'next-i18next'
import { ReactElement, useEffect } from 'react'

import type { TreeBlock } from '@core/journeys/ui/block'
import { useEditor } from '@core/journeys/ui/EditorProvider'
import InformationCircleContained from '@core/shared/ui/icons/InformationCircleContained'
import LinkIcon from '@core/shared/ui/icons/Link'

import { BlockFields_SignUpBlock as SignUpBlock } from '../../../../../../../../../__generated__/BlockFields'
import { IconFields } from '../../../../../../../../../__generated__/IconFields'
import { Accordion } from '../../Accordion'
import { Action } from '../../controls/Action'
import { getAction } from '../../controls/Action/utils/actions'
import { Icon, icons } from '../../controls/Icon'

export function SignUp({
  id,
  action,
  submitIconId,
  children
}: TreeBlock<SignUpBlock>): ReactElement {
  const { dispatch } = useEditor()
  const submitIcon = children.find(
    (block) => block.id === submitIconId
  ) as TreeBlock<IconFields>
  const { t } = useTranslation('apps-journeys-admin')
  const selectedAction = getAction(t, action?.__typename)

  useEffect(() => {
    dispatch({
      type: 'SetSelectedAttributeIdAction',
      selectedAttributeId: `${id}-signup-action`
    })
  }, [dispatch, id])

  return (
    <Box data-testid="SignUpProperties">
      <Accordion
        id={`${id}-signup-action`}
        icon={<LinkIcon />}
        name={t('Action')}
        value={selectedAction.label}
      >
        <Action />
      </Accordion>
      <Accordion
        id={`${id}-signup-icon`}
        icon={<InformationCircleContained />}
        name={t('Button Icon')}
        value={
          icons.find(({ value }) => value === submitIcon?.iconName)?.label ??
          t('None')
        }
      >
        <Icon id={submitIcon?.id} />
      </Accordion>
    </Box>
  )
}
