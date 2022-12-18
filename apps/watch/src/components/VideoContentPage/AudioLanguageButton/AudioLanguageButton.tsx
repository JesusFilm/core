import { ReactElement, useState } from 'react'
import { ThemeProvider } from '@core/shared/ui/ThemeProvider'
import { ThemeMode, ThemeName } from '@core/shared/ui/themes'
import LanguageOutlined from '@mui/icons-material/LanguageOutlined'
import AddOutlined from '@mui/icons-material/AddOutlined'
import KeyboardArrowDownOutlined from '@mui/icons-material/KeyboardArrowDownOutlined'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import { useQuery, gql } from '@apollo/client'
import LanguageRounded from '@mui/icons-material/LanguageRounded'
import { GetVideoLanguages } from '../../../../__generated__/GetVideoLanguages'
import { useVideo } from '../../../libs/videoContext'
import { AudioLanguageDialog } from '../../AudioDialog'

export const GET_VIDEO_LANGUAGES = gql`
  query GetVideoLanguages($id: ID!) {
    video(id: $id, idType: slug) {
      id
      variant {
        id
        language {
          name {
            value
            primary
          }
        }
      }
      variantLanguagesWithSlug {
        slug
        language {
          id
          name {
            value
            primary
          }
        }
      }
    }
  }
`

interface AudioLanguageButtonProps {
  componentVariant: 'button' | 'icon'
}

export function AudioLanguageButton({
  componentVariant
}: AudioLanguageButtonProps): ReactElement {
  const { variant: videoVariant } = useVideo()
  const [openAudioLanguage, setOpenAudioLanguage] = useState(false)

  const { data, loading } = useQuery<GetVideoLanguages>(GET_VIDEO_LANGUAGES, {
    variables: {
      id: videoVariant?.slug
    }
  })

  const variant = data?.video?.variant
  const variantLanguagesWithSlug = data?.video?.variantLanguagesWithSlug

  const nativeName = variant?.language?.name.find(
    ({ primary }) => !primary
  )?.value
  const localName = variant?.language?.name.find(
    ({ primary }) => primary
  )?.value

  return (
    <ThemeProvider themeName={ThemeName.website} themeMode={ThemeMode.light}>
      {variant != null && variantLanguagesWithSlug != null && (
        <>
          {componentVariant === 'button' ? (
            <Button size="large" onClick={() => setOpenAudioLanguage(true)}>
              <Typography>
                <LanguageOutlined />
                {localName ?? nativeName}
                <AddOutlined />
                {variantLanguagesWithSlug.length - 1}
                Languages
                <KeyboardArrowDownOutlined />
              </Typography>
            </Button>
          ) : (
            <IconButton onClick={() => setOpenAudioLanguage(true)}>
              <LanguageRounded sx={{ color: '#ffffff' }} />
            </IconButton>
          )}
          <AudioLanguageDialog
            variant={variant}
            variantLanguagesWithSlug={variantLanguagesWithSlug}
            loading={loading}
            open={openAudioLanguage}
            onClose={() => setOpenAudioLanguage(false)}
          />
        </>
      )}
    </ThemeProvider>
  )
}
