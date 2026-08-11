import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Box from '@mui/system/Box'
import { useTranslation } from 'next-i18next/pages'
import { Dispatch, ReactElement, SetStateAction, useState } from 'react'

interface ShowMoreButtonProps {
  displayMore: boolean
  setDisplayMore: Dispatch<SetStateAction<boolean>>
}

interface VideoDescriptionProps {
  videoDescription: string
}

const VIDEO_DESCRIPTION_MAX_LENGTH = 139
const COLLAPSED_LINE_COUNT = 3

export const ShowMoreButton = ({
  displayMore,
  setDisplayMore
}: ShowMoreButtonProps): ReactElement => {
  const { t } = useTranslation('apps-journeys-admin')

  return (
    <Button
      disableRipple
      variant="text"
      size="small"
      sx={{
        color: 'secondary.light',
        alignSelf: 'flex-start',
        // MUI centres a button label inside a 64px minimum box, which left the
        // toggle indented from the description text and the language chip.
        // Start the label instead, and pull back the button's own left padding
        // so the label is flush with the column while the padding stays as hit
        // area.
        minWidth: 0,
        justifyContent: 'flex-start',
        ml: '-5px',
        mt: '-4px'
      }}
      onClick={() => setDisplayMore(!displayMore)}
    >
      {displayMore ? t('Less') : t('More')}
    </Button>
  )
}

export const VideoDescription = ({
  videoDescription
}: VideoDescriptionProps): ReactElement => {
  const [displayMore, setDisplayMore] = useState(false)

  // Descriptions arrive with blank lines between paragraphs, either as raw
  // newlines or as escaped carriage returns. Rendering them as one pre-line
  // block turns each break into a full empty line that cannot be tightened,
  // so split into real paragraphs and space them with a margin instead.
  const paragraphs = videoDescription
    .replace(/&#13;/g, '\n')
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter((paragraph) => paragraph !== '')

  const showToggle = videoDescription.length > VIDEO_DESCRIPTION_MAX_LENGTH

  return (
    <Box
      sx={{ display: 'flex', flexDirection: 'column' }}
      data-testid="VideoDescription"
    >
      <Box
        sx={
          showToggle && !displayMore
            ? {
                display: '-webkit-box',
                WebkitBoxOrient: 'vertical',
                WebkitLineClamp: COLLAPSED_LINE_COUNT,
                overflow: 'hidden'
              }
            : undefined
        }
      >
        {paragraphs.map((paragraph, index) => (
          <Typography
            key={index}
            component="p"
            variant="caption"
            sx={{
              // The admin theme maps caption onto an inline span, which lets
              // the parent block's line height override the theme's 18px
              // caption leading. Rendering a block element keeps it.
              whiteSpace: 'pre-line',
              // Descriptions carry links, and a URL is one unbreakable word.
              // Nothing clips this column, so without a break it runs past the
              // drawer and gives the settings panel a horizontal scrollbar.
              overflowWrap: 'anywhere',
              mt: index === 0 ? 0 : 3
            }}
          >
            {paragraph}
          </Typography>
        ))}
      </Box>
      {showToggle && (
        <ShowMoreButton
          displayMore={displayMore}
          setDisplayMore={setDisplayMore}
        />
      )}
    </Box>
  )
}
