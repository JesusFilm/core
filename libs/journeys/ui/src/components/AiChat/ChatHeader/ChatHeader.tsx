import CloseRoundedIcon from '@mui/icons-material/CloseRounded'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import Link from '@mui/material/Link'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next/pages'
import { ReactElement } from 'react'

import { useJourney } from '../../../libs/JourneyProvider'
import {
  ASSISTANT_FG,
  DIVIDER,
  PANEL_LINK_FG,
  PRIMARY_ON,
  SPARKLE_AVATAR_SHADOW,
  SPARKLE_GRADIENT,
  TEXT_SECONDARY
} from '../chatStyles'
import { getAboutChatHref } from '../getAboutChatHref'

interface ChatHeaderProps {
  /**
   * When true, the sparkle avatar runs the two-beat "thinking" animation.
   * Drive from the chat's loading/streaming state so the mark is alive
   * while the assistant is working and at rest otherwise.
   */
  thinking?: boolean
  /**
   * When provided, renders a close (X) button at the right edge of the
   * header — the mobile drawer's only dismiss control, mirroring the
   * desktop overlay's corner close button.
   */
  onClose?: () => void
}

export function ChatHeader({
  thinking = false,
  onClose
}: ChatHeaderProps): ReactElement {
  const { t } = useTranslation('libs-journeys-ui')
  const { journey } = useJourney()

  return (
    <Box
      data-testid="ChatHeader"
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1.25,
        pt: 1,
        pb: 1.5,
        px: 1.75,
        borderBottom: '1px solid',
        borderBottomColor: DIVIDER,
        flexShrink: 0
      }}
    >
      <Box
        sx={{
          width: 32,
          height: 32,
          borderRadius: '50%',
          background: SPARKLE_GRADIENT,
          color: PRIMARY_ON,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: SPARKLE_AVATAR_SHADOW,
          flexShrink: 0
        }}
      >
        <Box
          component="svg"
          viewBox="0 0 31 25"
          aria-hidden="true"
          sx={{
            width: 18,
            height: 'auto',
            color: PRIMARY_ON,
            overflow: 'visible',
            // Two-beat "thinking" rhythm — the top and bottom halves of the
            // mark scale and tilt out of phase, like two halves in dialogue.
            // Animation only runs while `thinking` is true so we don't burn
            // mobile battery repainting at rest.
            '& .jfp-mark-shape': {
              transformBox: 'fill-box',
              transformOrigin: 'center'
            },
            '& .jfp-mark-top': {
              animation: thinking
                ? 'jfpMarkTop 1.6s ease-in-out infinite'
                : 'none'
            },
            '& .jfp-mark-bottom': {
              animation: thinking
                ? 'jfpMarkBottom 1.6s ease-in-out infinite'
                : 'none'
            },
            '@keyframes jfpMarkTop': {
              '0%, 100%': {
                transform: 'scale(0.92) rotate(-2deg)',
                opacity: 0.7
              },
              '50%': {
                transform: 'scale(1.04) rotate(2deg)',
                opacity: 0.9
              }
            },
            '@keyframes jfpMarkBottom': {
              '0%, 100%': {
                transform: 'scale(1.04) rotate(2deg)',
                opacity: 1
              },
              '50%': {
                transform: 'scale(0.92) rotate(-2deg)',
                opacity: 0.85
              }
            },
            '@media (prefers-reduced-motion: reduce)': {
              '& .jfp-mark-top, & .jfp-mark-bottom': { animation: 'none' }
            }
          }}
        >
          <path
            className="jfp-mark-shape jfp-mark-top"
            d="m8.22217 2c0-1.104569.89543-2 2.00003-2h18.2222c1.1046 0 2 .895431 2 2v15.5449c0 1.4001-1.4016 2.3669-2.7104 1.8696l-18.22227-6.9245c-.77632-.295-1.28956-1.039-1.28956-1.8695z"
            fill="currentColor"
          />
          <path
            className="jfp-mark-shape jfp-mark-bottom"
            d="m22.2222 23c0 1.1046-.8955 2-2 2h-18.22226c-1.104565 0-1.9999946-.8954-1.9999946-2v-15.54491c0-1.40014 1.4016146-2.36692 2.7104346-1.86957l18.22222 6.92448c.7763.295 1.2896 1.039 1.2896 1.8695z"
            fill="currentColor"
          />
        </Box>
      </Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography
          variant="subtitle1"
          sx={{
            color: ASSISTANT_FG,
            fontSize: 16,
            fontWeight: 600,
            lineHeight: '22px',
            letterSpacing: 0
          }}
        >
          {t('Ask your questions about faith')}
        </Typography>
        <Typography
          variant="caption"
          sx={{
            display: 'block',
            color: TEXT_SECONDARY,
            fontSize: 12,
            lineHeight: '20px',
            letterSpacing: 0
          }}
        >
          {t('Replies may not be perfect')}
          {' · '}
          <Link
            href={getAboutChatHref(journey?.language?.bcp47)}
            target="_blank"
            rel="noopener noreferrer"
            underline="always"
            sx={{
              // PANEL_LINK_FG is a concrete brandRed — using
              // 'primary.main' here would invert to near-white under
              // dark-themed journey cards (whose theme this component
              // inherits), making the label invisible on the panel's
              // white surface. whiteSpace:nowrap keeps the label
              // tokenised so longer translations of "About this chat"
              // don't break mid-word; the surrounding Typography still
              // wraps the bullet and link to a new line when the whole
              // line overflows.
              color: PANEL_LINK_FG,
              fontSize: 'inherit',
              fontWeight: 600,
              whiteSpace: 'nowrap'
            }}
          >
            {t('About this chat')}
          </Link>
        </Typography>
      </Box>
      {onClose != null && (
        <IconButton
          onClick={onClose}
          aria-label={t('Close chat')}
          sx={{
            width: 32,
            height: 32,
            p: 0,
            flexShrink: 0,
            color: TEXT_SECONDARY
          }}
        >
          <CloseRoundedIcon fontSize="small" />
        </IconButton>
      )}
    </Box>
  )
}
