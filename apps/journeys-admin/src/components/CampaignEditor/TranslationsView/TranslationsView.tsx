import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import CircularProgress from '@mui/material/CircularProgress'
import Divider from '@mui/material/Divider'
import MenuItem from '@mui/material/MenuItem'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next/pages'
import { ReactElement, useEffect, useMemo, useRef, useState } from 'react'

import { isMachineTranslatable } from '@core/journeys/ui/useCampaignAiTranslateSubscription'

import { CampaignTranslations_campaignTranslations as TranslationRow } from '../../../../__generated__/CampaignTranslations'
import { GetCampaign_campaign as Campaign } from '../../../../__generated__/GetCampaign'
import {
  CampaignTranslationFilter,
  CampaignTranslationGroup
} from '../../../../__generated__/globalTypes'
import { useCampaignTranslationsQuery } from '../../../libs/useCampaignTranslationsQuery'
import { useCampaignEditor } from '../CampaignEditorProvider'
import { languageNames } from '../LanguagesPanel/LanguagesPanel'
import { TranslationRunProgress } from '../TranslationRunProgress'
import { useTranslationRun } from '../TranslationRunProvider'

import { TranslationRowItem } from './TranslationRow'
import {
  TRANSLATION_FILTERS,
  TRANSLATION_GROUPS,
  TranslationFilter,
  campaignTextSignature,
  matchesFilter,
  rowKey,
  rowMatchesSelection,
  rowPlace
} from './translationRows'

/** How long after the campaign's text changes the list is read again: past the canvas's own debounced save, so a burst of edits reads once, after the write. */
export const TRANSLATIONS_REFRESH_DELAY = 1500

interface TranslationsViewProps {
  campaign: Campaign
  /** The language to open on; the first non-default campaign language when absent or the default. */
  initialLanguageId?: string
  /** Shown once after the default language changed: promoted machine values lost their flag. */
  showPromotionNotice?: boolean
  onPromotionNoticeClose?: () => void
}

/**
 * The review surface for translated text: one campaign language at a time,
 * every Translated Field grouped Interface, Landing page, Region page and
 * Regions, filtered All, Needs review, Machine-translated, Missing or Edited.
 * The list is read once with every row and filtered here, so a row an author
 * edits turns Edited and leaves a Needs review or Missing filter as soon as
 * the write lands. Only languages other than the default are listed: the
 * default's text is the field itself. "Machine-translate missing" fills the
 * language's gaps, never touching a line a person wrote; it runs only when
 * pressed, not after edits. The run is the editor's background one: its
 * progress and Cancel show here whichever language is open, and it goes on
 * when this view closes. A language the model does not support is manual only
 * and has no such button. The view and the canvas point at each other: a
 * line's target button selects the text's place on the canvas (switching
 * page when it is on another) and scrolls the canvas to it; selecting
 * something on the canvas marks its lines here and scrolls to the first,
 * widening the filter to All when it hid them. Text added or changed while
 * the view is open is read again shortly after, so a new line appears in
 * its place in the list.
 */
export function TranslationsView({
  campaign,
  initialLanguageId,
  showPromotionNotice = false,
  onPromotionNoticeClose
}: TranslationsViewProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const languages = useMemo(
    () =>
      campaign.languages
        .filter(
          (language) => language.languageId !== campaign.defaultLanguageId
        )
        .sort((a, b) => a.order - b.order),
    [campaign.languages, campaign.defaultLanguageId]
  )
  const [chosenLanguageId, setChosenLanguageId] = useState(initialLanguageId)
  const [filter, setFilter] = useState<TranslationFilter>('all')
  const { run, error: translateError, start } = useTranslationRun()
  const {
    selection,
    state: { pageKind },
    dispatch,
    pageKindOf,
    frameDocumentRef
  } = useCampaignEditor()
  const listRef = useRef<HTMLDivElement>(null)
  /** The canvas element id to scroll to once the frame shows it. */
  const [revealId, setRevealId] = useState<string>()
  /** The selection the list last scrolled to, so a filter change alone does not scroll again. */
  const scrolledToRef = useRef<string | undefined>(undefined)
  const languageId = languages.some(
    (language) => language.languageId === chosenLanguageId
  )
    ? chosenLanguageId
    : languages[0]?.languageId
  const queryVariables =
    languageId == null
      ? undefined
      : {
          campaignId: campaign.id,
          languageId,
          filter: CampaignTranslationFilter.all
        }
  const { data, loading, error, refetch } =
    useCampaignTranslationsQuery(queryVariables)

  // New or changed default-language text while the view is open: the list
  // is read again once the canvas's save has had time to land, so a new line
  // lands in its place without a reload. A translation edit changes no line
  // and is written into the list by the row itself, so it never re-reads:
  // a re-read could race the write and show the old value. The first read
  // is the mount's own.
  const textSignature = useMemo(
    () => campaignTextSignature(campaign),
    [campaign]
  )
  const textSignatureRef = useRef(textSignature)
  useEffect(() => {
    if (textSignatureRef.current === textSignature) return
    textSignatureRef.current = textSignature
    if (queryVariables == null) return
    const timer = setTimeout(() => {
      refetch().catch(() => undefined)
    }, TRANSLATIONS_REFRESH_DELAY)
    return () => clearTimeout(timer)
  }, [textSignature, queryVariables, refetch])

  const selectionKey =
    selection.kind === 'campaign'
      ? 'campaign'
      : `${selection.region?.id ?? ''}:${selection.block?.id ?? ''}`

  // Canvas to list: the lines of what is selected are marked, and the list
  // scrolls to the first one, showing All first when the filter hid them.
  useEffect(() => {
    if (data == null || selection.kind === 'campaign') return
    if (scrolledToRef.current === selectionKey) return
    const matching = data.campaignTranslations.filter((row) =>
      rowMatchesSelection(row, selection, campaign)
    )
    if (matching.length === 0) {
      scrolledToRef.current = selectionKey
      return
    }
    const shown = matching.find((row) => matchesFilter(row, filter))
    if (shown == null) {
      setFilter('all')
      return
    }
    const key = rowKey(shown)
    const element = Array.from(
      listRef.current?.querySelectorAll<HTMLElement>('[data-row-key]') ?? []
    ).find((candidate) => candidate.dataset.rowKey === key)
    element?.scrollIntoView?.({ block: 'center' })
    scrolledToRef.current = selectionKey
  }, [data, selection, selectionKey, filter, campaign])

  // List to canvas: once the frame shows the revealed element, scroll to it.
  // The frame renders a page switch on a later pass, so this retries each
  // render until the element is there.
  useEffect(() => {
    if (revealId == null) return
    const element = frameDocumentRef.current?.getElementById(revealId)
    if (element == null) return
    element.scrollIntoView?.({ block: 'center' })
    setRevealId(undefined)
  })

  function handleReveal(row: TranslationRow): void {
    const place = rowPlace(row, campaign)
    if (place.regionId != null) {
      const host = campaign.blocks.find(
        (block) => block.__typename === 'CampaignRegionSwitcherBlock'
      )
      dispatch({
        type: 'SetEditorFocusAction',
        pageKind: (host == null ? undefined : pageKindOf(host)) ?? pageKind,
        selectedBlockId: host?.id,
        selectedRegionId: place.regionId
      })
      setRevealId(host == null ? undefined : `${host.id}__${place.regionId}`)
      return
    }
    const block = campaign.blocks.find(
      (candidate) => candidate.id === place.blockId
    )
    dispatch({
      type: 'SetEditorFocusAction',
      pageKind: (block == null ? undefined : pageKindOf(block)) ?? pageKind,
      selectedBlockId: block?.id,
      selectedRegionId: undefined
    })
    // Interface wording shows on the canvas only in place; its field is in Settings.
    if (row.target.stringId != null)
      dispatch({ type: 'SetInspectorTabAction', inspectorTab: 'settings' })
    setRevealId(block?.id)
  }

  const groupLabels: Record<CampaignTranslationGroup, string> = {
    [CampaignTranslationGroup.interface]: t('Interface'),
    [CampaignTranslationGroup.landing]: t('Landing page'),
    [CampaignTranslationGroup.region]: t('Region page'),
    [CampaignTranslationGroup.regions]: t('Regions')
  }
  const filterLabels: Record<TranslationFilter, string> = {
    all: t('All'),
    needsReview: t('Needs review'),
    machine: t('Machine-translated'),
    missing: t('Missing'),
    edited: t('Edited')
  }

  const selectedLanguage = languages.find(
    (language) => language.languageId === languageId
  )
  const bcp47 = selectedLanguage?.language.bcp47 ?? ''

  if (languageId == null || queryVariables == null)
    return (
      <Stack spacing={1} data-testid="TranslationsView" sx={{ width: '100%' }}>
        <Typography variant="h6">{t('Translations')}</Typography>
        <Typography variant="body2" color="text.secondary">
          {t('Add a language to the campaign to start translating it.')}
        </Typography>
      </Stack>
    )

  const rows = (data?.campaignTranslations ?? []).filter((row) =>
    matchesFilter(row, filter)
  )
  const manualOnly = !isMachineTranslatable(languageId)

  function handleMachineTranslateMissing(): void {
    if (languageId == null) return
    start(
      { campaignId: campaign.id, languageId, mode: 'missing' },
      selectedLanguage == null
        ? languageId
        : languageNames(selectedLanguage).autonym
    )
  }

  return (
    <Stack spacing={3} data-testid="TranslationsView" sx={{ width: '100%' }}>
      <Stack spacing={1}>
        <Typography variant="h6">{t('Translations')}</Typography>
        <Typography variant="body2" color="text.secondary">
          {t(
            'Review each line in a language. Editing a line saves it as your own wording.'
          )}
        </Typography>
      </Stack>
      {showPromotionNotice && (
        <Alert
          severity="info"
          onClose={onPromotionNoticeClose}
          data-testid="TranslationsPromotionNotice"
        >
          {t(
            'The default language changed. Texts that were machine-translated into the new default are now your own text and are no longer marked as machine-translated.'
          )}
        </Alert>
      )}
      <TextField
        select
        size="small"
        label={t('Language')}
        value={languageId}
        onChange={(event) => setChosenLanguageId(event.target.value)}
      >
        {languages.map((language) => {
          const { autonym, localName } = languageNames(language)
          return (
            <MenuItem key={language.id} value={language.languageId}>
              {localName == null ? autonym : `${autonym} · ${localName}`}
            </MenuItem>
          )
        })}
      </TextField>
      {manualOnly ? (
        <Typography
          variant="body2"
          color="text.secondary"
          data-testid="TranslationsManualOnly"
        >
          {t(
            'Manual only: machine translation does not cover this language, so write each line yourself.'
          )}
        </Typography>
      ) : (
        <Button
          variant="outlined"
          size="small"
          disabled={run != null}
          onClick={handleMachineTranslateMissing}
          sx={{ alignSelf: 'flex-start' }}
        >
          {t('Machine-translate missing')}
        </Button>
      )}
      <TranslationRunProgress data-testid="TranslationsProgress" />
      {translateError != null && (
        <Alert severity="error" data-testid="TranslationsTranslateError">
          {translateError}
        </Alert>
      )}
      <Stack
        direction="row"
        role="group"
        aria-label={t('Filter')}
        sx={{ flexWrap: 'wrap', gap: 1 }}
      >
        {TRANSLATION_FILTERS.map((option) => (
          <Chip
            key={option}
            label={filterLabels[option]}
            color={option === filter ? 'primary' : 'default'}
            variant={option === filter ? 'filled' : 'outlined'}
            aria-pressed={option === filter}
            onClick={() => setFilter(option)}
          />
        ))}
      </Stack>
      {loading && data == null && (
        <Stack sx={{ alignItems: 'center' }}>
          <CircularProgress />
        </Stack>
      )}
      {error != null && <Alert severity="error">{error.message}</Alert>}
      {data != null && rows.length === 0 && (
        <Typography
          variant="body2"
          color="text.secondary"
          data-testid="TranslationsEmpty"
        >
          {t('Nothing to show here.')}
        </Typography>
      )}
      <Stack ref={listRef} spacing={3}>
        {TRANSLATION_GROUPS.map((group) => {
          const groupRows = rows.filter((row) => row.group === group)
          if (groupRows.length === 0) return null
          return (
            <Stack key={group} data-testid={`TranslationGroup-${group}`}>
              <Typography variant="subtitle1" component="h3">
                {groupLabels[group]}
              </Typography>
              <Divider />
              {groupRows.map((row) => (
                <TranslationRowItem
                  key={rowKey(row)}
                  row={row}
                  languageId={languageId}
                  bcp47={bcp47}
                  queryVariables={queryVariables}
                  selected={rowMatchesSelection(row, selection, campaign)}
                  onReveal={() => handleReveal(row)}
                />
              ))}
            </Stack>
          )
        })}
      </Stack>
    </Stack>
  )
}
