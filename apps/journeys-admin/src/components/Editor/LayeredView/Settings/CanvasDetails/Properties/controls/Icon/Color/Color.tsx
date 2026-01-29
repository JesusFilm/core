import { gql, useMutation } from '@apollo/client'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

import type { TreeBlock } from '@core/journeys/ui/block'
import { useCommand } from '@core/journeys/ui/CommandProvider'
import { useEditor } from '@core/journeys/ui/EditorProvider'

import { IconColor } from '../../../../../../../../../../__generated__/globalTypes'
import {
  IconBlockColorUpdate,
  IconBlockColorUpdateVariables
} from '../../../../../../../../../../__generated__/IconBlockColorUpdate'
import { IconFields } from '../../../../../../../../../../__generated__/IconFields'
import { ColorDisplayIcon } from '../../ColorDisplayIcon'
import { ToggleButtonGroup } from '../../ToggleButtonGroup'

export const ICON_BLOCK_COLOR_UPDATE = gql`
  mutation IconBlockColorUpdate($id: ID!, $color: IconColor!) {
    iconBlockUpdate(id: $id, input: { color: $color }) {
      id
      color
    }
  }
`

interface ColorProps extends Pick<TreeBlock<IconFields>, 'id' | 'iconColor'> {}

export function Color({ id, iconColor }: ColorProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const [iconBlockColorUpdate] = useMutation<
    IconBlockColorUpdate,
    IconBlockColorUpdateVariables
  >(ICON_BLOCK_COLOR_UPDATE)
  const {
    state: { selectedBlock, selectedStep },
    dispatch
  } = useEditor()
  const { add } = useCommand()

  function handleChange(color: IconColor): void {
    if (color !== iconColor && color != null) {
      add({
        parameters: {
          execute: {
            color
          },
          undo: {
            color: iconColor
          }
        },
        execute({ color }) {
          dispatch({
            type: 'SetEditorFocusAction',
            selectedBlock,
            selectedStep
          })
          void iconBlockColorUpdate({
            variables: {
              id,
              color
            },
            optimisticResponse: {
              iconBlockUpdate: {
                __typename: 'IconBlock',
                id,
                color
              }
            }
          })
        }
      })
    }
  }

  const options = [
    {
      value: IconColor.inherit,
      label: t('Default'),
      icon: <ColorDisplayIcon color={IconColor.inherit} />
    },
    {
      value: IconColor.primary,
      label: t('Primary'),
      icon: <ColorDisplayIcon color={IconColor.primary} />
    },
    {
      value: IconColor.secondary,
      label: t('Secondary'),
      icon: <ColorDisplayIcon color={IconColor.secondary} />
    },
    {
      value: IconColor.error,
      label: t('Error'),
      icon: <ColorDisplayIcon color={IconColor.error} />
    }
  ]

  return (
    <ToggleButtonGroup
      value={iconColor ?? IconColor.inherit}
      onChange={handleChange}
      options={options}
      testId="Color"
    />
  )
}
