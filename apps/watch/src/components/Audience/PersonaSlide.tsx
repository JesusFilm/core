import { Avatar, Box, Typography, Badge, ButtonBase } from '@mui/material'
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord'
import AddIcon from '@mui/icons-material/Add'

// Add helper function to check if string is a single emoji
const isEmoji = (str: string) => {
  const emojiRegex = /^\p{Emoji}$/u
  return emojiRegex.test(str)
}

// Add function to generate consistent color from string
const generateColor = (str: string) => {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }

  // Generate HSL color with:
  // - Hue: full range (0-360)
  // - Saturation: 35-65% (more muted colors)
  // - Lightness: 45-65% (medium brightness)
  const h = Math.abs(hash % 360)
  const s = 35 + (hash % 30)
  const l = 45 + (hash % 20)

  return `hsla(${h}, ${s}%, ${l}%, 0.4)`
}

interface Persona {
  id: string
  name: string
  type: 'you' | 'chat' | 'email' | 'channel'
  avatarSrc: string
  unread: boolean
}

interface PersonaSlideProps {
  persona?: Persona
  isActive?: boolean
  isAddPersona?: boolean
  unread?: boolean
  onClick?: () => void
}

export function PersonaSlide({
  persona,
  isActive = false,
  isAddPersona = false,
  unread = false,
  onClick
}: PersonaSlideProps) {
  const avatarContent = isAddPersona ? (
    <AddIcon />
  ) : persona?.avatarSrc && isEmoji(persona.avatarSrc) ? (
    <Typography sx={{ fontSize: '2.5rem' }}>{persona.avatarSrc}</Typography>
  ) : null

  const avatarProps = {
    src: isEmoji(persona?.avatarSrc ?? '') ? undefined : persona?.avatarSrc,
    sx: {
      width: 60,
      height: 60,
      boxShadow:
        'inset 0 0 0 1px rgba(255,255,255, 0.07), 1px 3px 8px 4px rgba(0, 0, 0, 0.1)',
      bgcolor: isAddPersona
        ? 'action.disabled'
        : generateColor(persona?.avatarSrc ?? 'default')
    },
    children: avatarContent
  }

  return (
    <Box
      onClick={!isAddPersona ? onClick : undefined}
      sx={{
        cursor: !isAddPersona ? 'pointer' : 'default',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        pt: 3,
        px: 2,
        pb: 1,
        mx: 1,
        // width: '100%',
        minHeight: '160px',
        borderRadius: 3,
        backgroundColor: isActive ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
        '&:hover': {
          backgroundColor: 'rgba(255, 255, 255, 0.05)'
        }
      }}
    >
      {unread ? (
        <Badge
          color="primary"
          overlap="circular"
          badgeContent=" "
          sx={{
            '.MuiBadge-badge': {
              mr: -1,
              border: '2px solid',
              borderColor: 'background.default'
            }
          }}
        >
          <Avatar {...avatarProps} />
        </Badge>
      ) : (
        <Avatar {...avatarProps} />
      )}
      <Typography variant="subtitle1" sx={{ mt: 2, textAlign: 'center' }}>
        {persona?.name ?? 'Add'}
      </Typography>

      <Typography variant="overline" sx={{ opacity: 0.5 }}>
        {isAddPersona ? 'New' : persona?.type}
      </Typography>
    </Box>
  )
}
