import { ReactElement } from 'react'
import { useEditor, ActiveFab, WrapperProps } from '@core/journeys/ui'
import { TypographyFields } from '../../../../../__generated__/TypographyFields'
import { ButtonFields } from '../../../../../__generated__/ButtonFields'
import { TypographyEdit } from './TypographyEdit'
import { ButtonEdit } from './ButtonEdit'

interface InlineEditWrapperProps
  extends WrapperProps<TypographyFields | ButtonFields> {}

export function InlineEditWrapper({
  block,
  children
}: InlineEditWrapperProps): ReactElement {
  const {
    state: { selectedBlock, activeFab }
  } = useEditor()

  const EditComponent =
    block.__typename === 'TypographyBlock' ? (
      <TypographyEdit {...block} />
    ) : block.__typename === 'ButtonBlock' ? (
      <ButtonEdit {...block} />
    ) : (
      <></>
    )

  return activeFab === ActiveFab.Save && selectedBlock?.id === block.id ? (
    EditComponent
  ) : (
    <>{children}</>
  )
}
