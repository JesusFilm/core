import { gql, useMutation } from '@apollo/client'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import { useTranslation } from 'next-i18next'
import { enqueueSnackbar } from 'notistack'
import { ReactElement, useState } from 'react'

import { useJourney } from '@core/journeys/ui/JourneyProvider'
import { Dialog } from '@core/shared/ui/Dialog'

import {
  CreateJourneyFonts,
  CreateJourneyFontsVariables
} from '../../../../../../../../../../__generated__/CreateJourneyFonts'
import {
  UpdateJourneyFonts,
  UpdateJourneyFontsVariables
} from '../../../../../../../../../../__generated__/UpdateJourneyFonts'
import { FontLoader } from '../../../../../../../FontLoader'

import { ThemePreview } from './ThemePreview'
import { ThemeSettings } from './ThemeSettings'

interface ThemeBuilderDialogProps {
  open: boolean
  onClose: () => void
}

export const JOURNEY_FONTS_UPDATE = gql`
  mutation UpdateJourneyFonts($id: ID!, $input: JourneyThemeUpdateInput!) {
    journeyThemeUpdate(id: $id, input: $input) {
      __typename
      id
      journeyId
      headerFont
      bodyFont
      labelFont
    }
  }
`

export const JOURNEY_FONTS_CREATE = gql`
  mutation CreateJourneyFonts($input: JourneyThemeCreateInput!) {
    journeyThemeCreate(input: $input) {
      __typename
      id
      journeyId
      headerFont
      bodyFont
      labelFont
    }
  }
`

export enum FontFamily {
  Montserrat = 'Montserrat',
  Inter = 'Inter',
  Oswald = 'Oswald',
  PlayfairDisplay = 'Playfair Display',
  Georgia = 'Georgia',
  CormorantGaramond = 'Cormorant Garamond',
  NotoSans = 'Noto Sans',
  BerkshireSwash = 'Berkshire Swash',
  Cinzel = 'Cinzel',
  Baloo = 'Baloo 2',
  Nunito = 'Nunito',
  Raleway = 'Raleway'
}

export function ThemeBuilderDialog({
  open,
  onClose
}: ThemeBuilderDialogProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { journey } = useJourney()

  const [updateJourneyFonts, { loading }] = useMutation<
    UpdateJourneyFonts,
    UpdateJourneyFontsVariables
  >(JOURNEY_FONTS_UPDATE)

  const [createJourneyFonts, { loading: createLoading }] = useMutation<
    CreateJourneyFonts,
    CreateJourneyFontsVariables
  >(JOURNEY_FONTS_CREATE)

  const journeyTheme = journey?.journeyTheme

  const [headerFont, setHeaderFont] = useState<string>(
    journeyTheme?.headerFont ?? ''
  )
  const [bodyFont, setBodyFont] = useState<string>(journeyTheme?.bodyFont ?? '')
  const [labelFont, setLabelFont] = useState<string>(
    journeyTheme?.labelFont ?? ''
  )

  function handleHeaderFontChange(font: string): void {
    setHeaderFont(font)
  }

  function handleBodyFontChange(font: string): void {
    setBodyFont(font)
  }

  function handleLabelsFontChange(font: string): void {
    setLabelFont(font)
  }

  async function handleSubmit(): Promise<void> {
    if (journey == null) return

    const journeyTheme = journey.journeyTheme

    if (journeyTheme == null) {
      await createJourneyFonts({
        variables: {
          input: {
            journeyId: journey.id,
            headerFont,
            bodyFont,
            labelFont
          }
        },
        update(cache, { data }) {
          if (data?.journeyThemeCreate == null) return
          cache.modify({
            id: cache.identify({ __typename: 'Journey', id: journey.id }),
            fields: {
              journeyTheme() {
                return data.journeyThemeCreate
              }
            }
          })
        },
        onCompleted() {
          onClose()
          enqueueSnackbar(t('Theme created'), {
            variant: 'success',
            preventDuplicate: true
          })
        },
        onError() {
          enqueueSnackbar(t('Failed to create theme'), {
            variant: 'error',
            preventDuplicate: true
          })
        }
      })
    } else {
      await updateJourneyFonts({
        variables: {
          id: journeyTheme.id,
          input: {
            headerFont,
            bodyFont,
            labelFont
          }
        },
        onCompleted() {
          onClose()
          enqueueSnackbar(t('Fonts updated'), {
            variant: 'success',
            preventDuplicate: true
          })
        },
        onError() {
          enqueueSnackbar(t('Failed to update fonts'), {
            variant: 'error',
            preventDuplicate: true
          })
        }
      })
    }
  }

  const dialogActionChildren = (
    <Stack direction="row" justifyContent="space-between" width="100%">
      <Button variant="outlined" color="secondary" onClick={onClose}>
        {t('Cancel')}
      </Button>
      <Button
        loading={loading || createLoading}
        variant="contained"
        color="primary"
        onClick={handleSubmit}
      >
        {t('Confirm')}
      </Button>
    </Stack>
  )

  return (
    <Dialog
      open={open}
      onClose={onClose}
      loading={loading || createLoading}
      sx={{
        '& .MuiDialog-paper': {
          maxWidth: '100%',
          maxHeight: '100%',
          width: 'auto'
        }
      }}
      dialogTitle={{
        title: t('Select Fonts'),
        closeButton: true
      }}
      dialogActionChildren={dialogActionChildren}
    >
      <FontLoader fonts={[headerFont, bodyFont, labelFont]} />
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={5}
        sx={{
          height: '100%',
          width: '100%'
        }}
      >
        <Box
          sx={{
            width: 380
          }}
        >
          <ThemeSettings
            headerFont={headerFont}
            bodyFont={bodyFont}
            labelsFont={labelFont}
            onHeaderFontChange={handleHeaderFontChange}
            onBodyFontChange={handleBodyFontChange}
            onLabelsFontChange={handleLabelsFontChange}
          />
        </Box>
        <Box
          sx={{
            width: 476
          }}
        >
          <ThemePreview
            headerFont={headerFont}
            bodyFont={bodyFont}
            labelsFont={labelFont}
          />
        </Box>
      </Stack>
    </Dialog>
  )
}
