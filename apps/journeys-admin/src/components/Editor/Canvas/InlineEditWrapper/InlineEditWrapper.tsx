import { ReactElement } from 'react'
import { useEditor, ActiveFab, WrapperProps } from '@core/journeys/ui'
import { TypographyFields } from '../../../../../__generated__/TypographyFields'
import { TypographyEdit } from './TypographyEdit'

interface InlineEditWrapperProps extends WrapperProps<TypographyFields> {}

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
    ) : (
      <></>
    )

  return activeFab === ActiveFab.Save && selectedBlock?.id === block.id ? (
    EditComponent
  ) : (
    <>{children}</>
  )
}
