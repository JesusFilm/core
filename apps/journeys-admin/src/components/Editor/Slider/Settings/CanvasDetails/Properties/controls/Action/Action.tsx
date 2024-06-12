import { gql, useMutation } from '@apollo/client'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select, { SelectChangeEvent } from '@mui/material/Select'
import Stack from '@mui/material/Stack'
import { init, t } from 'i18next'
import { useTranslation } from 'next-i18next'
import { ReactElement, useEffect, useState } from 'react'

import type { TreeBlock } from '@core/journeys/ui/block'
import { useEditor } from '@core/journeys/ui/EditorProvider'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import ChevronDownIcon from '@core/shared/ui/icons/ChevronDown'

import { ActionDelete } from '../../../../../../../../../__generated__/ActionDelete'
import {
  BlockFields_ButtonBlock as ButtonBlock,
  BlockFields_FormBlock as FormBlock,
  BlockFields_SignUpBlock as SignUpBlock,
  BlockFields_VideoBlock as VideoBlock
} from '../../../../../../../../../__generated__/BlockFields'

import { EmailAction } from './EmailAction'
import { LinkAction } from './LinkAction'
import { NavigateToBlockAction } from './NavigateToBlockAction'

export const ACTION_DELETE = gql`
  mutation ActionDelete($id: ID!, $journeyId: ID!) {
    blockDeleteAction(id: $id, journeyId: $journeyId) {
      id
    }
  }
`

void init({ defaultNS: 'apps-journeys-admin', fallbackLng: 'en' })

export const actions = [
  {
    value: 'none',
    label: t('None')
  },
  {
    value: 'NavigateToBlockAction',
    label: t('Selected Card')
  },
  {
    value: 'LinkAction',
    label: t('URL/Website')
  },
  {
    value: 'EmailAction',
    label: t('Email')
  }
]

export function Action(): ReactElement {
  const { state } = useEditor()
  const { journey } = useJourney()
  const { t } = useTranslation('apps-journeys-admin')

  // Add addtional types here to use this component for that block
  const selectedBlock = state.selectedBlock as
    | TreeBlock<ButtonBlock>
    | TreeBlock<FormBlock>
    | TreeBlock<SignUpBlock>
    | TreeBlock<VideoBlock>
    | undefined

  const [actionDelete] = useMutation<ActionDelete>(ACTION_DELETE)

  const selectedAction = actions.find(
    (act) => act.value === selectedBlock?.action?.__typename
  )

  const [action, setAction] = useState(selectedAction?.value ?? 'none')

  useEffect(() => {
    if (selectedAction != null) {
      setAction(selectedAction.value)
    } else {
      setAction('none')
    }
  }, [selectedBlock, selectedAction])

  async function removeAction(): Promise<void> {
    if (selectedBlock != null && journey != null) {
      const { id, __typename: typeName } = selectedBlock
      await actionDelete({
        variables: {
          id,
          journeyId: journey.id
        },
        update(cache, { data }) {
          if (data?.blockDeleteAction != null) {
            cache.modify({
              id: cache.identify({
                __typename: typeName,
                id
              }),
              fields: {
                action: () => null
              }
            })
          }
        }
      })
    }
  }

  async function handleChange(event: SelectChangeEvent): Promise<void> {
    if (event.target.value === 'none') {
      await removeAction()
    }
    setAction(event.target.value)
  }

  return (
    <>
      <Stack sx={{ p: 4, pt: 0 }} data-testid="Action">
        <FormControl variant="filled">
          <InputLabel sx={{ '&.MuiFormLabel-root': { lineHeight: 1.5 } }}>
            {t('Navigate to:')}
          </InputLabel>

          <Select
            onChange={handleChange}
            value={action}
            IconComponent={ChevronDownIcon}
          >
            {actions.map((action) => {
              return (
                <MenuItem
                  key={`button-action-${action.value}`}
                  value={action.value}
                >
                  {t(action.label)}
                </MenuItem>
              )
            })}
          </Select>
        </FormControl>
        {action === 'LinkAction' && <LinkAction />}
        {action === 'EmailAction' && <EmailAction />}
        {action === 'NavigateToBlockAction' && <NavigateToBlockAction />}
      </Stack>
    </>
  )
}
