import { CombinedGraphQLErrors } from '@apollo/client'
import { useApolloClient } from '@apollo/client/react'
import { useTranslation } from 'next-i18next/pages'
import { useSnackbar } from 'notistack'
import {
  ReactElement,
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState
} from 'react'

import {
  CampaignAiTranslateVariables,
  useCampaignAiTranslateSubscription
} from '@core/journeys/ui/useCampaignAiTranslateSubscription'

import { messageOf } from '../utils/messageOf'
import {
  missingCountOf,
  useCampaignDefaultLanguageSwap
} from '../utils/useCampaignDefaultLanguageSwap'

/** A machine-translation run in flight: what it translates and how far it has got. */
export interface TranslationRun extends CampaignAiTranslateVariables {
  /** The language's autonym, for the messages about the run. */
  languageName: string
  /** 0-100. */
  progress: number
  /** The step the run reports; absent until its first report. */
  message?: string
  /** Strings written so far. */
  translatedCount: number
}

export interface TranslationRunOptions {
  /** Once the run completes, and only then, make its language the default. */
  thenSwapDefaultLanguage: true
  /** The swap went through: the campaign was read again with every text moved. */
  onDefaultLanguageChanged?: () => void
}

export interface TranslationRunContextValue {
  /** The run in flight; one at a time. */
  run?: TranslationRun
  /** Why the last run failed, until the next one starts. */
  error?: string
  /** Start a run; ignored while one is in flight. */
  start: (
    variables: CampaignAiTranslateVariables,
    languageName: string,
    options?: TranslationRunOptions
  ) => void
  /** Stop the run, keeping every string already written. */
  cancel: () => void
}

export const TranslationRunContext =
  createContext<TranslationRunContextValue | null>(null)

/** The editor's machine-translation run: see {@link TranslationRunProvider}. */
export function useTranslationRun(): TranslationRunContextValue {
  const context = useContext(TranslationRunContext)
  if (context == null)
    throw new Error(
      'useTranslationRun must be used within TranslationRunProvider'
    )
  return context
}

interface RunTarget {
  variables: CampaignAiTranslateVariables
  languageName: string
  options?: TranslationRunOptions
}

/** The API's refusal of a second run for the same campaign and language. */
function isRunConflict(error: unknown): boolean {
  return (
    CombinedGraphQLErrors.is(error) &&
    error.errors.some(
      (graphQLError) =>
        graphQLError.extensions?.code === 'CONFLICT' &&
        graphQLError.extensions?.field === 'languageId'
    )
  )
}

/**
 * Owns the editor's one machine-translation subscription, above the Localize
 * panel and its tabs, so a run outlives switching tabs, closing the panel and
 * switching page. Anything in the editor reads its progress and can start or
 * Cancel it; ending it, by finishing or cancelling, says so in a snackbar.
 * Cancel unsubscribes: the strings the server already wrote stay, and the
 * campaign and the Translations rows are read again to show them. A run
 * started with `thenSwapDefaultLanguage` makes its language the default once
 * it completes; an error or Cancel leaves the default alone.
 */
export function TranslationRunProvider({
  children
}: {
  children: ReactNode
}): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { enqueueSnackbar } = useSnackbar()
  const client = useApolloClient()
  const swapDefaultLanguage = useCampaignDefaultLanguageSwap()
  const [target, setTarget] = useState<RunTarget>()
  const [error, setError] = useState<string>()
  const translatedCountRef = useRef(0)

  const refreshTranslations = useCallback((): void => {
    client.cache.evict({ id: 'ROOT_QUERY', fieldName: 'campaignTranslations' })
    client.cache.gc()
    void client.refetchQueries({ include: ['GetCampaign'] })
  }, [client])

  /** The swap a completed run asked for; on success it has read the campaign again itself. */
  const swapAfterRun = useCallback(
    async ({ variables, languageName, options }: RunTarget): Promise<void> => {
      try {
        await swapDefaultLanguage(variables.campaignId, variables.languageId)
        options?.onDefaultLanguageChanged?.()
      } catch (swapError) {
        const count = missingCountOf(swapError)
        enqueueSnackbar(
          count == null
            ? messageOf(swapError)
            : t(
                '{{count}} texts still have no translation in {{language}}, so it cannot become the default.',
                { count, language: languageName }
              ),
          { variant: 'error' }
        )
        refreshTranslations()
      }
    },
    [swapDefaultLanguage, enqueueSnackbar, t, refreshTranslations]
  )

  const { data } = useCampaignAiTranslateSubscription({
    variables: target?.variables,
    onData: ({ data: result }) => {
      translatedCountRef.current =
        result.data?.campaignAiTranslateSubscription.translatedCount ??
        translatedCountRef.current
    },
    onError: (runError) => {
      const message = isRunConflict(runError)
        ? t(
            '{{language}} is already being translated. Try again when it has finished.',
            { language: target?.languageName ?? '' }
          )
        : runError.message
      setError(message)
      setTarget(undefined)
      enqueueSnackbar(message, { variant: 'error' })
      refreshTranslations()
    },
    onComplete: () => {
      if (target == null) return
      setTarget(undefined)
      enqueueSnackbar(
        t('Translated {{count}} strings into {{language}}', {
          count: translatedCountRef.current,
          language: target.languageName
        }),
        { variant: 'success' }
      )
      if (target.options?.thenSwapDefaultLanguage === true) {
        void swapAfterRun(target)
        return
      }
      refreshTranslations()
    }
  })

  const start = useCallback(
    (
      variables: CampaignAiTranslateVariables,
      languageName: string,
      options?: TranslationRunOptions
    ): void => {
      if (target != null) return
      translatedCountRef.current = 0
      setError(undefined)
      setTarget({ variables, languageName, options })
    },
    [target]
  )

  const cancel = useCallback((): void => {
    if (target == null) return
    setTarget(undefined)
    enqueueSnackbar(
      t('Translation into {{language}} cancelled. {{count}} strings kept.', {
        count: translatedCountRef.current,
        language: target.languageName
      }),
      { variant: 'info' }
    )
    refreshTranslations()
  }, [target, enqueueSnackbar, t, refreshTranslations])

  const progress = data?.campaignAiTranslateSubscription
  const value = useMemo<TranslationRunContextValue>(
    () => ({
      run:
        target == null
          ? undefined
          : {
              ...target.variables,
              languageName: target.languageName,
              progress: progress?.progress ?? 0,
              message: progress?.message ?? undefined,
              translatedCount: progress?.translatedCount ?? 0
            },
      error,
      start,
      cancel
    }),
    [target, progress, error, start, cancel]
  )

  return (
    <TranslationRunContext.Provider value={value}>
      {children}
    </TranslationRunContext.Provider>
  )
}
