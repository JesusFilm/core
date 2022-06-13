import { ReactElement } from 'react'
import ContentCopyRounded from '@mui/icons-material/ContentCopyRounded'
import IconButton from '@mui/material/IconButton'
import ListItemText from '@mui/material/ListItemText'
import ListItemIcon from '@mui/material/ListItemIcon'
import MenuItem from '@mui/material/MenuItem'
import Typography from '@mui/material/Typography'
import { SxProps } from '@mui/system/styleFunctionSx'
import { Theme } from '@mui/material/styles'
import { useEditor } from '@core/journeys/ui'
import { useSnackbar } from 'notistack'

interface DuplicateBlockProps {
  variant: 'button' | 'list-item'
  journeyId?: string
  sx?: SxProps<Theme>
}

export function DuplicateBlock({
  variant,
  journeyId,
  sx
}: DuplicateBlockProps): ReactElement {
  const {
    state: { selectedBlock }
  } = useEditor()
  const { enqueueSnackbar } = useSnackbar()
  const blockLabel =
    selectedBlock?.__typename === 'StepBlock' ? 'Card' : 'Block'
  const label = journeyId != null ? 'Journey' : blockLabel

  const handleDuplicateBlock = (): void => {
    enqueueSnackbar(`${label} Duplicated`, {
      variant: 'success',
      preventDuplicate: true
    })
  }
  return (
    <>
      {variant === 'button' ? (
        <IconButton
          id={`duplicate-${label}-actions`}
          aria-label={`Duplicate ${label} Actions`}
          onClick={handleDuplicateBlock}
        >
          <ContentCopyRounded />
        </IconButton>
      ) : (
        <MenuItem onClick={handleDuplicateBlock} sx={{ ...sx }}>
          <ListItemIcon>
            <ContentCopyRounded
              color={journeyId != null ? 'secondary' : 'inherit'}
            />
          </ListItemIcon>
          <ListItemText>
            {journeyId != null ? (
              <Typography variant="body1" sx={{ pl: 2 }}>
                Duplicate
              </Typography>
            ) : (
              `Duplicate ${blockLabel}`
            )}
          </ListItemText>
        </MenuItem>
      )}
    </>
  )
}
