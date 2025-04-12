import { CSSProperties, MouseEvent, ReactElement } from 'react'

import { GetAdminVideoVariant } from '../../../../../../libs/useAdminVideo'

export interface VariantCardProps {
  variant: GetAdminVideoVariant
  style?: CSSProperties
  onClick: (variant: GetAdminVideoVariant) => void
  onDelete?: (
    variant: GetAdminVideoVariant,
    event: MouseEvent<HTMLButtonElement>
  ) => void
}

export function VariantCard({
  variant,
  style,
  onClick,
  onDelete
}: VariantCardProps): ReactElement {
  const languageName =
    variant.language.name.find(({ primary }) => !primary)?.value ??
    variant.language.name[0].value

  const nativeLanguageName = variant.language.name.find(
    ({ primary }) => primary
  )?.value

  const primaryText = `${languageName} ${nativeLanguageName != null && languageName !== nativeLanguageName ? `- ${nativeLanguageName}` : ''}`

  const handleDeleteClick = (event: MouseEvent<HTMLButtonElement>): void => {
    event.stopPropagation()
    if (onDelete) {
      onDelete(variant, event)
    }
  }

  return <></>
}
