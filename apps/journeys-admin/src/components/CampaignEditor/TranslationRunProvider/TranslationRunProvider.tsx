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

export interface TranslationRunContextValue {
  /** The run in flight; one at a time. */
  run?: TranslationRun
  /** Why the last run failed, until the next one starts. */
  error?: string
  /** Start a run; ignored while one is in flight. */
  start: (variables: CampaignAiTranslateVariables, languageName: string) => void
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
}

/**
 * Owns the editor's one machine-translation subscription, above the Localize
 * panel and its tabs, so a run outlives switching tabs, closing the panel and
 * switching page. Anything in the editor reads its progress and can start or
 * Cancel it; ending it, by finishing or cancelling, says so in a snackbar.
 * Cancel unsubscribes: the strings the server already wrote stay, and the
 * campaign and the Translations rows are read again to show them.
 */
export function TranslationRunProvider({
  children
}: {
  children: ReactNode
}): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { enqueueSnackbar } = useSnackbar()
  const client = useApolloClient()
  const [target, setTarget] = useState<RunTarget>()
  const [error, setError] = useState<string>()
  const translatedCountRef = useRef(0)

  const refreshTranslations = useCallback((): void => {
    client.cache.evict({ id: 'ROOT_QUERY', fieldName: 'campaignTranslations' })
    client.cache.gc()
    void client.refetchQueries({ include: ['GetCampaign'] })
  }, [client])

  const { data } = useCampaignAiTranslateSubscription({
    variables: target?.variables,
    onData: ({ data: result }) => {
      translatedCountRef.current =
        result.data?.campaignAiTranslateSubscription.translatedCount ??
        translatedCountRef.current
    },
    onError: (runError) => {
      setError(runError.message)
      setTarget(undefined)
      enqueueSnackbar(runError.message, { variant: 'error' })
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
      refreshTranslations()
    }
  })

  const start = useCallback(
    (variables: CampaignAiTranslateVariables, languageName: string): void => {
      if (target != null) return
      translatedCountRef.current = 0
      setError(undefined)
      setTarget({ variables, languageName })
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
