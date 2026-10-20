import ListItem from '@mui/material/ListItem'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { ReactNode } from 'react'
import type { RowComponentProps } from 'react-window'

import { isTwoLineOption } from '../../../libs/extractLanguageNames'

/**
 * Default row renderer for `LanguageAutocomplete`'s virtualized list. Shows
 * the native name as a second line only when one exists, matching the row
 * height `getRowHeight` allocated for this option. With `showLanguageId`, the
 * language id sits on the right so same-named languages can be told apart.
 */
export function defaultRenderOption(
  props: RowComponentProps<{ rows: any[]; showLanguageId?: boolean }>
): ReactNode {
  const { rows, index, style, showLanguageId = false } = props
  const { id, localName, nativeName } = rows[index][1]
  const { key, ownerState, ariaAttributes, ...optionProps } = rows[index][0]

  return (
    <ListItem
      {...optionProps}
      key={id}
      style={style}
      tabIndex={1}
      sx={{ cursor: 'pointer' }}
    >
      <Stack>
        <Typography>{localName ?? nativeName}</Typography>
        {isTwoLineOption({ localName, nativeName }) && (
          <Typography
            variant="body2"
            sx={{
              color: 'text.secondary'
            }}
          >
            {nativeName}
          </Typography>
        )}
      </Stack>
      {showLanguageId && (
        <Typography
          variant="body2"
          sx={{ color: 'text.secondary', ml: 'auto', pl: 2, flexShrink: 0 }}
        >
          {`ID ${id}`}
        </Typography>
      )}
    </ListItem>
  )
}
