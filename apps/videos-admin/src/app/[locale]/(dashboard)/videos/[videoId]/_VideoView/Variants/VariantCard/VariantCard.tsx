import ListItem from '@mui/material/ListItem'
import ListItemText from '@mui/material/ListItemText'
import { CSSProperties, ReactElement } from 'react'

import { GetAdminVideoVariant } from '../../../../../../../../libs/useAdminVideo'

export interface VariantCardProps {
  variant: GetAdminVideoVariant
  style?: CSSProperties
  onClick: (variant: GetAdminVideoVariant) => void
}

export function VariantCard({
  variant,
  style,
  onClick
}: VariantCardProps): ReactElement {
  const languageName =
    variant.language.name.find(({ primary }) => !primary)?.value ??
    variant.language.name[0].value

  const nativeLanguageName = variant.language.name.find(
    ({ primary }) => primary
  )?.value

  const primaryText = `${languageName} ${nativeLanguageName != null && languageName !== nativeLanguageName ? `- ${nativeLanguageName}` : ''}`

  return (
    <>
      <ListItem
        onClick={() => onClick(variant)}
        sx={{
          border: '1px solid',
          borderColor: 'divider',
          backgroundColor: 'background.default',
          borderRadius: 1,
          p: 1,
          '&:hover': {
            cursor: 'pointer',
            backgroundColor: 'action.hover'
          },
          transition: 'background-color 0.3s ease',
          ...style,
          // css below the spread styles will override react-window styles, use with caution
          height: 66,
          width: 'calc(100% - 20px)'
        }}
      >
        <ListItemText primary={primaryText} secondary={variant.language.id} />
      </ListItem>
    </>
  )
}
