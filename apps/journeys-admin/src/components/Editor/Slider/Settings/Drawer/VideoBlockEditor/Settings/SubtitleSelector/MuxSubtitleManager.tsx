import Divider from '@mui/material/Divider'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import SubtitlesIcon from '@mui/icons-material/Subtitles'
import { useTranslation } from 'next-i18next'
import { ReactElement, useEffect, useState } from 'react'

import TextField from '@mui/material/TextField'
import Autocomplete from '@mui/material/Autocomplete'
import Button from '@mui/material/Button'
import Tooltip from '@mui/material/Tooltip'
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome'
import SettingsIcon from '@core/shared/ui/icons/Settings'
import { useMutation } from '@apollo/client'
import { useSnackbar } from 'notistack'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import CloseIcon from '@mui/icons-material/Close'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import ErrorIcon from '@mui/icons-material/Error'

import { useMuxSubtitlePolling } from '../../../../../../../MuxSubtitlePollingProvider'
import { useMuxSupportedLanguages } from '../../../../../../../../libs/useMuxSupportedLanguages'
import type { MuxLanguageWithStatus } from '../../../../../../../../libs/useMuxSupportedLanguages'
import { CREATE_MUX_GENERATED_SUBTITLES } from './muxSubtitleQueries'

export interface MuxSubtitleManagerProps {
  disabled?: boolean
  muxVideoId?: string | null
  muxAssetId?: string | null
  existingSubtitles?: Array<{
    id: string
    languageCode: string
    muxLanguageName: string | null
    readyToStream: boolean
  }>
}

const getLanguageDisplayName = (
  nameArray: Array<{ value: string; primary: boolean }>
): string => {
  const primary = nameArray.find((n) => n.primary)?.value
  const secondary = nameArray.find((n) => !n.primary)?.value

  if (primary != null && secondary != null) {
    const truncationLength = 200
    const truncatedSecondary =
      secondary.length > truncationLength
        ? `${secondary.substring(0, truncationLength)}...`
        : secondary
    return `${primary} (${truncatedSecondary})`
  }
  return primary ?? secondary ?? ''
}

const getPrimaryText = (
  nameArray: Array<{ value: string; primary: boolean }>
): string => {
  const primary = nameArray.find((n) => n.primary)?.value
  return primary ?? nameArray.find((n) => !n.primary)?.value ?? ''
}

const getSecondaryText = (
  nameArray: Array<{ value: string; primary: boolean }>
): string | null => {
  const primary = nameArray.find((n) => n.primary)?.value
  const secondary = nameArray.find((n) => !n.primary)?.value

  if (primary != null && secondary != null) {
    const truncationLength = 200
    const truncatedSecondary =
      secondary.length > truncationLength
        ? `${secondary.substring(0, truncationLength)}...`
        : secondary
    return truncatedSecondary
  }
  return null
}

const getSelector = (
  options: MuxLanguageWithStatus[],
  onChange: (value: MuxLanguageWithStatus | null) => void,
  value: MuxLanguageWithStatus | null,
  disabled: boolean
): ReactElement => {
  // Sort languages: Stable first (alphabetically), then Beta (alphabetically)
  const sortedOptions = [...options].sort((a, b) => {
    if (a.status === b.status) {
      const aName = getLanguageDisplayName(a.name)
      const bName = getLanguageDisplayName(b.name)
      return aName.localeCompare(bName)
    }
    return a.status === 'Stable' ? -1 : 1
  })

  return (
    <Autocomplete
      disablePortal
      disabled={disabled}
      options={sortedOptions}
      value={value}
      onChange={(_, newValue) => {
        onChange(newValue)
      }}
      getOptionLabel={(option) => getLanguageDisplayName(option.name)}
      sx={{ width: '100%' }}
      renderInput={(params) => <TextField {...params} label="Video/Audio" />}
      renderOption={(props, option) => {
        const primaryText = getPrimaryText(option.name)
        const secondaryText = getSecondaryText(option.name)

        return (
          <Box
            component="li"
            {...props}
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: secondaryText != null ? 'center' : 'center'
            }}
          >
            <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
              <Typography
                sx={{
                  color: 'text.primary',
                  fontSize: '1rem'
                }}
              >
                {primaryText}
              </Typography>
              {secondaryText != null && (
                <Typography
                  sx={{
                    color: 'text.secondary',
                    fontSize: '0.875rem'
                  }}
                >
                  ({secondaryText})
                </Typography>
              )}
            </Box>
            <Typography
              variant="caption"
              sx={{
                color:
                  option.status === 'Stable' ? 'success.main' : 'error.main',
                marginLeft: 2,
                fontWeight: 'bold'
              }}
            >
              {option.status === 'Stable' ? 'Strong' : 'Weak'}
            </Typography>
          </Box>
        )
      }}
    />
  )
}

export function MuxSubtitleManager({
  disabled = false,
  muxVideoId,
  muxAssetId,
  existingSubtitles = []
}: MuxSubtitleManagerProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { enqueueSnackbar, closeSnackbar } = useSnackbar()
  const { startPolling, getPollingStatus } = useMuxSubtitlePolling()
  const { languages, loading: languagesLoading } = useMuxSupportedLanguages()

  const [selectedLanguage, setSelectedLanguage] =
    useState<MuxLanguageWithStatus | null>(null)
  const [initialLanguage, setInitialLanguage] =
    useState<MuxLanguageWithStatus | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const [createSubtitles, { loading: creating }] = useMutation(
    CREATE_MUX_GENERATED_SUBTITLES
  )

  // Initialize from existing subtitles
  useEffect(() => {
    if (existingSubtitles.length > 0 && languages.length > 0) {
      // Find the first existing subtitle
      const existing = existingSubtitles[0]
      const language = languages.find(
        (lang) => lang.bcp47 === existing.languageCode
      )
      if (language != null) {
        setSelectedLanguage(language)
        setInitialLanguage(language)
      }
    }
  }, [existingSubtitles, languages])

  // Clear error message when language changes
  useEffect(() => {
    setErrorMessage(null)
  }, [selectedLanguage])

  // Check polling status
  const pollingStatus = muxVideoId != null ? getPollingStatus(muxVideoId) : null

  // Determine states
  const hasExistingSubtitle = existingSubtitles.length > 0
  const languageChanged = selectedLanguage?.bcp47 !== initialLanguage?.bcp47
  const isGenerating = pollingStatus?.status === 'polling' || creating

  const getButtonText = (): string => {
    if (isGenerating) {
      return 'Generating...'
    }
    return 'Generate Subtitles'
  }

  const isButtonDisabled = (): boolean => {
    if (selectedLanguage == null) return true
    if (isGenerating) return true
    if (hasExistingSubtitle && !languageChanged) return true
    return false
  }

  const getButtonStyles = () => {
    const isDisabled = isButtonDisabled()
    if (isDisabled && !isGenerating) {
      return {
        backgroundColor: 'action.disabledBackground',
        color: 'action.disabled',
        '&:hover': {
          backgroundColor: 'action.disabledBackground'
        }
      }
    }
    // For enabled and generating states
    return {
      backgroundColor: '#2D2F33',
      color: 'white',
      '&:hover': {
        backgroundColor: '#3D3F43'
      },
      '&.Mui-disabled': {
        backgroundColor: '#2D2F33',
        color: 'white'
      }
    }
  }

  const handleGenerateSubtitles = async (): Promise<void> => {
    if (selectedLanguage == null || muxAssetId == null || muxVideoId == null) {
      return
    }

    // Clear any previous error
    setErrorMessage(null)

    try {
      const result = await createSubtitles({
        variables: {
          assetId: muxAssetId,
          languageCode: selectedLanguage.bcp47,
          name: getLanguageDisplayName(selectedLanguage.name)
          // userGenerated is determined by backend based on user role
        }
      })

      const data =
        result.data?.createMuxGeneratedSubtitlesByAssetId?.__typename ===
        'MutationCreateMuxGeneratedSubtitlesByAssetIdSuccess'
          ? result.data.createMuxGeneratedSubtitlesByAssetId.data
          : null

      if (data != null) {
        // Start polling for completion (backend determines userGenerated from user role)
        startPolling(muxVideoId, data.id, selectedLanguage.bcp47)
        setInitialLanguage(selectedLanguage)
      } else {
        const error =
          result.data?.createMuxGeneratedSubtitlesByAssetId?.__typename ===
          'Error'
            ? result.data.createMuxGeneratedSubtitlesByAssetId.message
            : 'Failed to create subtitles'
        setErrorMessage('Error while generating file. Please try again.')
        enqueueSnackbar(error, {
          variant: 'error',
          persist: true,
          action: (key) => (
            <IconButton
              size="small"
              aria-label="close"
              color="inherit"
              onClick={() => {
                closeSnackbar(key)
              }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          )
        })
      }
    } catch (error) {
      const errorMsg =
        error instanceof Error ? error.message : 'Failed to generate subtitles'
      setErrorMessage('Error while generating file. Please try again.')
      enqueueSnackbar(errorMsg, {
        variant: 'error',
        persist: true,
        action: (key) => (
          <IconButton
            size="small"
            aria-label="close"
            color="inherit"
            onClick={() => {
              closeSnackbar(key)
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        )
      })
    }
  }

  // Determine tooltip message for generate button
  const getTooltipTitle = (): string => {
    if (selectedLanguage == null) {
      return 'Select language first'
    }
    if (hasExistingSubtitle && languageChanged) {
      return 'Changing language will replace existing subtitles'
    }
    return ''
  }

  // Determine tooltip message for autocomplete
  const getAutocompleteTooltipTitle = (): string => {
    if (hasExistingSubtitle) {
      return 'Changing the language will replace the current subtitle.'
    }
    return 'Subtitles are AI generated. Accuracy will vary by language.'
  }

  // Determine status label to show
  const getStatusLabel = (): ReactElement | null => {
    // Show error if there's an error from mutation or polling
    if (errorMessage != null || pollingStatus?.status === 'error') {
      return (
        <Stack direction="row" spacing={1} alignItems="center">
          <ErrorIcon sx={{ color: 'error.main', fontSize: 16 }} />
          <Typography variant="caption" sx={{ color: 'error.main' }}>
            Error while generating file. Please try again.
          </Typography>
        </Stack>
      )
    }

    // Show success if we have existing subtitles, language matches, and not generating
    if (
      hasExistingSubtitle &&
      !languageChanged &&
      !isGenerating &&
      selectedLanguage != null
    ) {
      const languageName = getLanguageDisplayName(selectedLanguage.name)
      return (
        <Stack direction="row" spacing={1} alignItems="center">
          <CheckCircleIcon sx={{ color: 'success.main', fontSize: 16 }} />
          <Typography variant="caption">
            Subtitle have been generated in {languageName}
          </Typography>
        </Stack>
      )
    }

    return null
  }

  return (
    <Stack direction="column" spacing={4}>
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Stack direction="row" alignItems="center" spacing={2}>
          <SubtitlesIcon
            sx={{
              color: disabled ? 'action.disabled' : 'text.primary',
              fontSize: 20,
              fontWeight: 1000,
              stroke: 'currentColor',
              fill: 'none'
            }}
          />
          <Typography
            variant="subtitle2"
            sx={{
              color: disabled ? 'action.disabled' : undefined
            }}
          >
            {t('Subtitles Management')}
          </Typography>
        </Stack>
        <SettingsIcon
          sx={{
            color: disabled ? 'action.disabled' : 'error.main',
            fontSize: 20
          }}
        />
      </Stack>
      <Tooltip title={getAutocompleteTooltipTitle()} placement="top">
        <div>
          {getSelector(
            languages,
            setSelectedLanguage,
            selectedLanguage,
            disabled
          )}
        </div>
      </Tooltip>
      <Tooltip title={getTooltipTitle()} placement="top">
        <span style={{ width: '100%', display: 'block' }}>
          <Button
            variant="contained"
            disabled={isButtonDisabled() || disabled}
            onClick={() => void handleGenerateSubtitles()}
            startIcon={<AutoAwesomeIcon />}
            sx={{
              width: '100%',
              borderRadius: 4,
              textTransform: 'none',
              paddingX: 3,
              paddingY: 3,
              ...getButtonStyles()
            }}
          >
            {getButtonText()}
          </Button>
        </span>
      </Tooltip>
      {getStatusLabel()}
      <Divider />
    </Stack>
  )
}
