import { gql } from '@apollo/client'
import { useMutation } from '@apollo/client/react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import { Theme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useTranslation } from 'next-i18next/pages'
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
import {
  BODY_FONT_OPTIONS,
  HEADER_FONT_OPTIONS,
  LABELS_FONT_OPTIONS,
  ThemeSettings
} from './ThemeSettings'

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

/**
 * Dialog for customizing theme typography settings
 * @param open - Boolean indicating whether the dialog is open
 * @param onClose - Callback function triggered when the dialog is closed
 * @returns Theme builder dialog component
 */
export function ThemeBuilderDialog({
  open,
  onClose
}: ThemeBuilderDialogProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const smUp = useMediaQuery((theme: Theme) => theme.breakpoints.up('sm'))
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
    journeyTheme?.headerFont ?? 'Montserrat'
  )
  const [bodyFont, setBodyFont] = useState<string>(
    journeyTheme?.bodyFont ?? 'Montserrat'
  )
  const [labelFont, setLabelFont] = useState<string>(
    journeyTheme?.labelFont ?? 'Montserrat'
  )

  const allFontOptions = [
    ...new Set([
      ...HEADER_FONT_OPTIONS,
      ...BODY_FONT_OPTIONS,
      ...LABELS_FONT_OPTIONS
    ])
  ]

  function handleHeaderFontChange(font: string): void {
    setHeaderFont(font)
  }

  function handleBodyFontChange(font: string): void {
    setBodyFont(font)
  }

  function handleLabelsFontChange(font: string): void {
    setLabelFont(font)
  }

  const saving = loading || createLoading

  function handleClose(): void {
    if (saving) return
    onClose()
  }

  async function handleSubmit(): Promise<void> {
    if (journey == null) return

    const journeyTheme = journey.journeyTheme

    if (journeyTheme == null) {
      // Apollo Client 4 rejects the mutate promise on failure even when
      // `onError` is supplied. `onError` already reports the failure, so
      // swallow the rejection rather than let it escape unhandled.
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

          cache.writeFragment({
            id: cache.identify({ __typename: 'Journey', id: journey.id }),
            fragment: gql`
              fragment JourneyWithTheme on Journey {
                journeyTheme {
                  id
                  headerFont
                  bodyFont
                  labelFont
                }
              }
            `,
            data: {
              journeyTheme: data.journeyThemeCreate
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
      }).catch(() => undefined)
    } else {
      // Apollo Client 4 rejects the mutate promise on failure even when
      // `onError` is supplied. `onError` already reports the failure, so
      // swallow the rejection rather than let it escape unhandled.
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
      }).catch(() => undefined)
    }
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullscreen={!smUp}
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
      slotProps={{ titleButton: { disabled: saving } }}
      dialogActionChildren={
        // gap rather than margin: StyledDialog zeroes marginLeft on non-first
        // DialogActions children, so margin-based spacing collapses here
        <Stack
          direction="row"
          sx={{
            gap: 2
          }}
        >
          <Button
            variant="outlined"
            color="secondary"
            onClick={handleClose}
            disabled={saving}
          >
            {t('Cancel')}
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSubmit}
            loading={saving}
            disabled={saving}
          >
            {t('Confirm')}
          </Button>
        </Stack>
      }
    >
      <FontLoader fonts={allFontOptions} />
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
            width: { xs: '100%', sm: 380 }
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
            width: { xs: '100%', sm: 476 },
            pb: { xs: 6, sm: 0 }
          }}
        >
          <ThemePreview
            headerFont={headerFont}
            bodyFont={bodyFont}
            labelFont={labelFont}
          />
        </Box>
      </Stack>
    </Dialog>
  )
}
