import { gql, useMutation } from '@apollo/client'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

import type { TreeBlock } from '@core/journeys/ui/block'

import {
  IconBlockColorUpdate,
  IconBlockColorUpdateVariables
} from '../../../../../../../../../../__generated__/IconBlockColorUpdate'
import { IconFields } from '../../../../../../../../../../__generated__/IconFields'
import { IconColor } from '../../../../../../../../../../__generated__/globalTypes'
import { ColorDisplayIcon } from '../../ColorDisplayIcon'
import { ToggleButtonGroup } from '../../ToggleButtonGroup'

export const ICON_BLOCK_COLOR_UPDATE = gql`
  mutation IconBlockColorUpdate(
    $id: ID!
    $input: IconBlockUpdateInput!
  ) {
    iconBlockUpdate(id: $id, input: $input) {
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

  async function handleChange(color: IconColor): Promise<void> {
    if (color !== iconColor && color != null) {
      await iconBlockColorUpdate({
        variables: {
          id,
          input: {
            color
          }
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
