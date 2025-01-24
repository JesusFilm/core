import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { gql, useQuery } from '@apollo/client'
import { useTranslation } from 'next-i18next'
import { ReactElement, useEffect, useState } from 'react'
import CircularProgress from '@mui/material/CircularProgress'

import { useVideo } from '../../../libs/videoContext'
import { TextFormatter } from '../../TextFormatter'
import { GetSubtitles } from '../../../../__generated__/GetSubtitles'

export const GET_SUBTITLES = gql`
  query GetSubtitles($id: ID!) {
    video(id: $id, idType: slug) {
      variant {
        subtitle {
          language {
            name {
              value
              primary
            }
            bcp47
            id
          }
          value
        }
      }
    }
  }
`

interface SubtitleCue {
  startTime: string
  endTime: string
  text: string
}

async function parseVTT(vttUrl: string): Promise<SubtitleCue[]> {
  const response = await fetch(vttUrl)
  const vttText = await response.text()

  // Split into lines and remove WebVTT header
  const lines = vttText.split('\n').slice(1)
  const cues: SubtitleCue[] = []
  let currentCue: Partial<SubtitleCue> = {}

  function stripHtmlTags(text: string): string {
    return text.replace(/<\/?[^>]+(>|$)/g, '')
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()

    if (line === '') continue

    if (line.includes('-->')) {
      const [start, end] = line.split('-->').map((time) => time.trim())
      currentCue.startTime = start
      currentCue.endTime = end
    } else if (currentCue.startTime) {
      const cleanLine = stripHtmlTags(line)
      if (!currentCue.text) {
        currentCue.text = cleanLine
      } else {
        currentCue.text += ' ' + cleanLine
      }

      // If next line is blank or contains timing, save current cue
      if (!lines[i + 1]?.trim() || lines[i + 1]?.includes('-->')) {
        cues.push(currentCue as SubtitleCue)
        currentCue = {}
      }
    }
  }

  return cues
}

// Add RTL language codes
const RTL_LANGUAGES = [
  'ar', // Arabic
  'he', // Hebrew
  'fa', // Persian (Farsi)
  'ur', // Urdu
  'syr', // Syriac
  'dv', // Divehi (Maldivian)
  'ku', // Kurdish (Sorani script specifically)
  'ps', // Pashto
  'ug', // Uighur
  'sd' // Sindhi
]

function isRTL(bcp47?: string): boolean {
  if (!bcp47) return false
  return RTL_LANGUAGES.some((lang) => bcp47.startsWith(lang))
}

export function VideoContent(): ReactElement {
  const { description, variant, title } = useVideo()
  const [subtitleCues, setSubtitleCues] = useState<SubtitleCue[]>([])
  const [isLoadingCues, setIsLoadingCues] = useState(false)
  const { t } = useTranslation('apps-watch')
  const isRTLLanguage = isRTL(variant?.language?.bcp47)

  const { data } = useQuery<GetSubtitles>(GET_SUBTITLES, {
    variables: {
      id: variant?.slug
    }
  })

  useEffect(() => {
    async function loadSubtitles() {
      const currentSubtitle = data?.video?.variant?.subtitle?.find(
        (sub) => sub.language.id === variant?.language?.id
      )

      if (!currentSubtitle?.value) {
        setSubtitleCues([])
        return
      }

      setIsLoadingCues(true)
      try {
        const cues = await parseVTT(currentSubtitle.value)
        setSubtitleCues(cues)
      } catch (error) {
        console.error('Failed to load subtitles:', error)
        setSubtitleCues([])
      }
      setIsLoadingCues(false)
    }

    loadSubtitles()
  }, [data, variant?.language?.id])

  return (
    <Box width="100%" data-testid="VideoContent">
      <Typography component="h1" variant="h2" sx={{ mb: 10 }}>
        {title?.[0]?.value}{' '}
        {variant?.language?.name?.find((name) => !name.primary)?.value && (
          <Typography
            component="em"
            variant="overline2"
            color="text.secondary"
            sx={{
              fontStyle: 'normal',
              textTransform: 'uppercase',
              display: 'block',
              opacity: 0.5,
              marginTop: -3
            }}
          >
            <br />
            video in{' '}
            {variant?.language?.name?.find((name) => !name.primary)?.value}
          </Typography>
        )}
      </Typography>
      <Stack>
        <TextFormatter
          slotProps={{
            typography: {
              variant: 'body1',
              color: 'text.secondary',
              gutterBottom: true
            }
          }}
        >
          {description[0]?.value}
        </TextFormatter>

        {Boolean(variant?.subtitleCount) && Boolean(subtitleCues.length) && (
          <>
            <Typography
              component="h2"
              variant="overline2"
              color="text.secondary"
              sx={{
                fontStyle: 'normal',
                textTransform: 'uppercase',
                display: 'block',
                opacity: 0.5,
                mt: 8,
                mb: 4,
                direction: isRTLLanguage ? 'rtl' : 'ltr',
                textAlign: isRTLLanguage ? 'right' : 'left'
              }}
            >
              {t('subtitles')}
              {variant?.language?.name?.find((name) => !name.primary)
                ?.value && (
                <>
                  {' '}
                  in {variant.language.name.find((name) => !name.primary).value}
                </>
              )}
            </Typography>
            {isLoadingCues ? (
              <Box display="flex" justifyContent="center" py={4}>
                <CircularProgress />
              </Box>
            ) : (
              <Typography
                component="p"
                variant="body1"
                color="text.secondary"
                sx={{
                  direction: isRTLLanguage ? 'rtl' : 'ltr',
                  textAlign: isRTLLanguage ? 'right' : 'left'
                }}
              >
                {subtitleCues.map((cue, index) => (
                  <Box
                    key={index}
                    component="span"
                    display="inline"
                    sx={{
                      position: 'relative',
                      transition: 'all 0.2s',
                      '&:hover': {
                        bgcolor: 'rgba(234, 45, 59, 0.08)',
                        borderRadius: 0.5
                      },
                      '&:hover .timestamp': {
                        opacity: 1
                      }
                    }}
                  >
                    <Typography
                      className="timestamp"
                      variant="caption"
                      component="span"
                      sx={{
                        position: 'absolute',
                        top: -24,
                        [isRTLLanguage ? 'right' : 'left']: '50%',
                        transform: isRTLLanguage
                          ? 'translateX(50%)'
                          : 'translateX(-50%)',
                        opacity: 0,
                        transition: 'opacity 0.2s',
                        bgcolor: 'background.paper',
                        px: 1,
                        py: 0.5,
                        borderRadius: 1,
                        boxShadow: 1,
                        whiteSpace: 'nowrap',
                        zIndex: 1,
                        pointerEvents: 'none',
                        direction: 'ltr' // Keep timestamp LTR for consistency
                      }}
                    >
                      {cue.startTime} → {cue.endTime}
                    </Typography>
                    <Box
                      component="span"
                      px={0.5}
                      sx={{
                        direction: isRTLLanguage ? 'rtl' : 'ltr',
                        unicodeBidi: 'embed'
                      }}
                    >
                      {cue.text}{' '}
                    </Box>
                  </Box>
                ))}
              </Typography>
            )}
          </>
        )}
      </Stack>
    </Box>
  )
}
