import { useQuery } from '@apollo/client'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Checkbox from '@mui/material/Checkbox'
import Divider from '@mui/material/Divider'
import FormControlLabel from '@mui/material/FormControlLabel'
import FormGroup from '@mui/material/FormGroup'
import IconButton from '@mui/material/IconButton'
import Radio from '@mui/material/Radio'
import RadioGroup from '@mui/material/RadioGroup'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { ReactElement, useEffect, useState } from 'react'

import { graphql } from '@core/shared/gql'
import LinkExternal from '@core/shared/ui/icons/LinkExternal'
import X2Icon from '@core/shared/ui/icons/X2'

import { Tooltip } from '../../Tooltip/Tooltip'

import { ClearAllButton } from './ClearAllButton'
import { ExportDialog } from './ExportDialog'
import { GoogleSheetsSyncDialog } from './GoogleSheetsSyncDialog'

export const GET_JOURNEY_BLOCK_TYPENAMES = graphql(`
  query GetJourneyBlockTypes($id: ID!) {
    journey: adminJourney(id: $id, idType: databaseId) {
      id
      createdAt
      blockTypenames
    }
  }
`)

interface FilterDrawerProps {
  handleClose?: () => void
  handleChange?: (e) => void
  sortSetting?: 'date' | 'duration'
  chatStarted: boolean
  withPollAnswers: boolean
  withMultiselectAnswers?: boolean
  withSubmittedText: boolean
  withIcon: boolean
  hideInteractive: boolean
  handleClearAll: () => void
  journeyId?: string
  disableExportButton?: boolean
}

export function FilterDrawer({
  journeyId,
  handleClose,
  handleChange,
  sortSetting,
  chatStarted,
  withPollAnswers,
  withMultiselectAnswers,
  withSubmittedText,
  withIcon,
  hideInteractive,
  handleClearAll,
  disableExportButton = false
}: FilterDrawerProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const router = useRouter()
  const [showExportDialog, setShowExportDialog] = useState(false)
  const [showSyncsDialog, setShowSyncsDialog] = useState(false)

  // Check for query parameter to open sync dialog after integration creation
  useEffect(() => {
    if (journeyId == null) return
    const openSyncDialog = router.query.openSyncDialog === 'true'
    if (openSyncDialog) {
      setShowSyncsDialog(true)
    }
  }, [journeyId, router])

  const { data: blockTypesData } = useQuery(GET_JOURNEY_BLOCK_TYPENAMES, {
    skip: journeyId == null,
    variables: { id: journeyId! }
  })
  const availableBlockTypes: string[] =
    blockTypesData?.journey?.blockTypenames ?? []

  return (
    <Stack sx={{ height: '100vh' }} data-testid="FilterDrawer">
      <Box sx={{ display: { sm: 'block', md: 'none' } }}>
        <Stack direction="row" sx={{ px: 6, py: 2 }} alignItems="center">
          <Typography variant="subtitle1">{t('Refine Results')}</Typography>
          <IconButton sx={{ ml: 'auto' }}>
            <X2Icon onClick={handleClose} />
          </IconButton>
        </Stack>
        <Divider />
      </Box>

      <Box sx={{ px: 6, py: 5 }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Typography variant="subtitle2">{t('Filter By')}</Typography>
          <ClearAllButton handleClearAll={handleClearAll} />
        </Stack>
        <FormGroup>
          <FormControlLabel
            control={<Checkbox />}
            label={t('Chat Started')}
            value="Chat Started"
            onChange={handleChange}
            checked={chatStarted}
          />
          {availableBlockTypes.includes('RadioQuestionBlock') && (
            <FormControlLabel
              control={<Checkbox />}
              label={t('Poll Answers')}
              value="Poll Answers"
              onChange={handleChange}
              checked={withPollAnswers}
            />
          )}
          {availableBlockTypes.includes('MultiselectBlock') && (
            <FormControlLabel
              control={<Checkbox />}
              label={t('Multiselect Answers')}
              value="Multiselect Answers"
              onChange={handleChange}
              checked={withMultiselectAnswers ?? false}
            />
          )}
          {availableBlockTypes.includes('TextResponseBlock') && (
            <FormControlLabel
              control={<Checkbox />}
              label={t('Submitted Text')}
              value="Submitted Text"
              onChange={handleChange}
              checked={withSubmittedText}
            />
          )}
          {availableBlockTypes.includes('IconBlock') && (
            <FormControlLabel
              control={<Checkbox />}
              label={t('Icon')}
              value="Icon"
              onChange={handleChange}
              checked={withIcon}
            />
          )}
          <FormControlLabel
            control={<Checkbox />}
            label={t('Hide Inactive')}
            value="Hide Inactive"
            onChange={handleChange}
            checked={hideInteractive}
          />
        </FormGroup>
      </Box>

      <Divider />

      <Box sx={{ px: 6, py: 5 }}>
        <Typography variant="subtitle2">{t('Sort By')}</Typography>
        <RadioGroup
          aria-labelledby="journeys-sort-radio-buttons-group"
          defaultValue="date"
          name="journeys-sort-radio-group"
        >
          <FormControlLabel
            value="date"
            control={<Radio />}
            label={t('Date')}
            onChange={handleChange}
            checked={sortSetting === 'date'}
          />
          <FormControlLabel
            value="duration"
            control={<Radio />}
            label={t('Duration')}
            onChange={handleChange}
            checked={sortSetting === 'duration'}
          />
        </RadioGroup>
      </Box>

      {journeyId != null && (
        <>
          <Box sx={{ px: 6, py: 5, mt: 'auto' }}>
            <Button
              variant="contained"
              color="secondary"
              sx={{ width: '100%', mb: 2 }}
              onClick={() => setShowSyncsDialog(true)}
              disabled={disableExportButton}
            >
              {t('Sync to Google Sheets')}
            </Button>
            {disableExportButton ? (
              <Tooltip
                title={t(
                  'Only team members and journey owners can export data.'
                )}
                placement="top"
              >
                <span>
                  <Button
                    variant="outlined"
                    color="secondary"
                    sx={{ width: '100%' }}
                    aria-label={`${t('Export Data')} - ${t(
                      'Only team members and journey owners can export data.'
                    )}`}
                    onClick={() => setShowExportDialog(true)}
                    disabled
                  >
                    {t('Export Data')}
                  </Button>
                </span>
              </Tooltip>
            ) : (
              <Button
                variant="outlined"
                color="secondary"
                sx={{ width: '100%' }}
                onClick={() => setShowExportDialog(true)}
              >
                {t('Export Data')}
              </Button>
            )}
            <Button
              size="small"
              component={Link}
              href="https://support.nextstep.is/article/1428-response-fields-and-data-analysis"
              target="_blank"
              rel="noopener noreferrer"
              endIcon={<LinkExternal sx={{ width: '1rem', height: '1rem' }} />}
              sx={{
                width: '100%',
                color: 'text.secondary'
              }}
              aria-label={`${t('Data Analytics Test')} - ${t('Opens in new tab')}`}
            >
              {t('Data analysis help')}
            </Button>
          </Box>
          <ExportDialog
            open={showExportDialog}
            onClose={() => setShowExportDialog(false)}
            journeyId={journeyId}
            availableBlockTypes={availableBlockTypes}
            createdAt={
              typeof blockTypesData?.journey?.createdAt === 'string'
                ? blockTypesData.journey.createdAt
                : blockTypesData?.journey?.createdAt instanceof Date
                  ? blockTypesData.journey.createdAt.toISOString()
                  : null
            }
          />
          <GoogleSheetsSyncDialog
            open={showSyncsDialog}
            onClose={() => setShowSyncsDialog(false)}
            journeyId={journeyId}
          />
        </>
      )}
    </Stack>
  )
}
