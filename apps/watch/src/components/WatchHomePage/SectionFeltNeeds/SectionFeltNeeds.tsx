import { Input } from '@ui/components/input'
import { ChevronLeft, ChevronRight, Search } from 'lucide-react'
import { useTranslation } from 'next-i18next'
import {
  type ChangeEvent,
  type ReactElement,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react'
import { useSearchBox } from 'react-instantsearch'

import { cn } from '../../../libs/cn'
import { buttonVariants } from '../../Button'
import { AlgoliaVideoGrid } from '../../VideoGrid/AlgoliaVideoGrid'

const SCROLL_OFFSET = 240

interface FeltNeedOptionConfig {
  id: string
  query: string
  labelKey: string
  defaultLabel: string
  shareTipKey: string
  defaultShareTip: string
}

interface FeltNeedOption {
  id: string
  query: string
  label: string
  shareTip: string
}

const FELT_NEED_OPTIONS: FeltNeedOptionConfig[] = [
  {
    id: 'anxiety',
    query: 'anxiety',
    labelKey: 'feltNeeds.options.anxiety.label',
    defaultLabel: 'Anxiety',
    shareTipKey: 'feltNeeds.options.anxiety.shareTip',
    defaultShareTip:
      'Send a caring message acknowledging their anxiety and include this video so they can pause, breathe, and reflect on God\'s peace.'
  },
  {
    id: 'loneliness',
    query: 'loneliness',
    labelKey: 'feltNeeds.options.loneliness.label',
    defaultLabel: 'Loneliness',
    shareTipKey: 'feltNeeds.options.loneliness.shareTip',
    defaultShareTip:
      'Share the link with a note that they are not alone and offer to watch together, even virtually.'
  },
  {
    id: 'grief',
    query: 'grief',
    labelKey: 'feltNeeds.options.grief.label',
    defaultLabel: 'Grief',
    shareTipKey: 'feltNeeds.options.grief.shareTip',
    defaultShareTip:
      "Let them know you are present in their grief and suggest watching when they're ready, then ask how you can keep supporting them."
  },
  {
    id: 'purpose',
    query: 'purpose',
    labelKey: 'feltNeeds.options.purpose.label',
    defaultLabel: 'Purpose',
    shareTipKey: 'feltNeeds.options.purpose.shareTip',
    defaultShareTip:
      'Invite them to watch and talk about what purpose could look like in this season of life.'
  },
  {
    id: 'forgiveness',
    query: 'forgiveness',
    labelKey: 'feltNeeds.options.forgiveness.label',
    defaultLabel: 'Forgiveness',
    shareTipKey: 'feltNeeds.options.forgiveness.shareTip',
    defaultShareTip:
      'Share the video along with a story of how forgiveness has impacted you, and ask if you can pray with them.'
  },
  {
    id: 'hope',
    query: 'hope',
    labelKey: 'feltNeeds.options.hope.label',
    defaultLabel: 'Hope',
    shareTipKey: 'feltNeeds.options.hope.shareTip',
    defaultShareTip:
      "Tell them this gave you hope and you'd love to hear what stands out to them after watching."
  }
]

interface SectionFeltNeedsProps {
  languageId?: string
}

export function SectionFeltNeeds({
  languageId
}: SectionFeltNeedsProps): ReactElement {
  const { t } = useTranslation('apps-watch')
  const { refine } = useSearchBox()
  const sliderRef = useRef<HTMLDivElement>(null)

  const options = useMemo<FeltNeedOption[]>(
    () =>
      FELT_NEED_OPTIONS.map(({
        id,
        query,
        labelKey,
        defaultLabel,
        shareTipKey,
        defaultShareTip
      }) => ({
        id,
        query,
        label: t(labelKey, { defaultValue: defaultLabel }),
        shareTip: t(shareTipKey, { defaultValue: defaultShareTip })
      })),
    [t]
  )

  const firstOption = options[0]

  const [activeOptionId, setActiveOptionId] = useState<string | null>(
    firstOption?.id ?? null
  )
  const [searchValue, setSearchValue] = useState<string>(
    firstOption?.query ?? ''
  )

  useEffect(() => {
    const initialQuery = firstOption?.query ?? ''
    setSearchValue(initialQuery)
    setActiveOptionId(firstOption?.id ?? null)
    refine(initialQuery)
  }, [firstOption?.id, firstOption?.query, refine])

  const activeOption = useMemo(() => {
    return options.find((option) => option.id === activeOptionId) ?? null
  }, [activeOptionId, options])

  const shareTip = useMemo(() => {
    if (activeOption != null) return activeOption.shareTip

    const trimmedQuery = searchValue.trim()
    if (trimmedQuery.length > 0) {
      return t('feltNeeds.genericShareTip', {
        defaultValue:
          'Let them know you found this video about {{topic}} and invite them to watch it, then follow up afterward to talk about it.',
        topic: trimmedQuery
      })
    }

    return t('feltNeeds.idleShareTip', {
      defaultValue:
        'Select a felt need or type your own to get ideas for how to share the video.'
    })
  }, [activeOption, searchValue, t])

  const handleOptionSelect = useCallback(
    (option: FeltNeedOption) => {
      setActiveOptionId(option.id)
      setSearchValue(option.query)
      refine(option.query)
    },
    [refine]
  )

  const handleSearchChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value
      setSearchValue(value)
      setActiveOptionId(null)
      refine(value)
    },
    [refine]
  )

  const scrollSlider = useCallback((direction: 'left' | 'right') => {
    const element = sliderRef.current
    if (element == null) return

    const offset = direction === 'left' ? -SCROLL_OFFSET : SCROLL_OFFSET
    element.scrollBy({ left: offset, behavior: 'smooth' })
  }, [])

  return (
    <section
      className="mt-16"
      data-testid="SectionFeltNeeds"
      aria-labelledby="felt-needs-title"
    >
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_40px_120px_-60px_rgba(15,23,42,0.8)] backdrop-blur-sm md:p-10">
        <div className="flex flex-col gap-6 text-white">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between md:gap-6">
            <div className="max-w-3xl space-y-2">
              <span className="text-xs font-semibold uppercase tracking-[0.3em] text-white/70">
                {t('feltNeeds.sectionLabel', { defaultValue: 'Felt needs' })}
              </span>
              <h2
                id="felt-needs-title"
                className="text-3xl font-bold leading-tight md:text-4xl"
              >
                {t('feltNeeds.sectionTitle', {
                  defaultValue: 'Find a video for someone you care about'
                })}
              </h2>
              <p className="text-base text-white/80 md:text-lg">
                {t('feltNeeds.sectionDescription', {
                  defaultValue:
                    'Choose a topic to see videos that speak to a specific felt need, or search for something else that fits your friend.'
                })}
              </p>
            </div>
            <div className="w-full max-w-md space-y-2">
              <label
                htmlFor="felt-needs-search"
                className="text-sm font-semibold text-white/80"
              >
                {t('feltNeeds.searchLabel', {
                  defaultValue: 'Search for a felt need'
                })}
              </label>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/60" />
                <Input
                  id="felt-needs-search"
                  data-testid="FeltNeedsSearchInput"
                  type="search"
                  value={searchValue}
                  onChange={handleSearchChange}
                  placeholder={t('feltNeeds.searchPlaceholder', {
                    defaultValue:
                      'Type a need or topic (e.g. anxiety, grief, hope)'
                  })}
                  autoComplete="off"
                  className="h-12 rounded-full border-white/20 bg-white/10 pl-12 text-base text-white placeholder:text-white/60 focus:border-white/40 focus:bg-white/20 focus-visible:ring-white/30"
                />
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between gap-4">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-white/60">
                {t('feltNeeds.sliderLabel', {
                  defaultValue: 'Popular felt needs'
                })}
              </p>
              <div className="hidden gap-2 md:flex">
                <button
                  type="button"
                  aria-label={t('feltNeeds.previousLabel', {
                    defaultValue: 'Scroll felt needs backward'
                  })}
                  className={cn(
                    buttonVariants({ variant: 'outline', size: 'icon' }),
                    'h-10 w-10 rounded-full border-white/30 bg-white/10 text-white hover:bg-white/20'
                  )}
                  onClick={() => scrollSlider('left')}
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  aria-label={t('feltNeeds.nextLabel', {
                    defaultValue: 'Scroll felt needs forward'
                  })}
                  className={cn(
                    buttonVariants({ variant: 'outline', size: 'icon' }),
                    'h-10 w-10 rounded-full border-white/30 bg-white/10 text-white hover:bg-white/20'
                  )}
                  onClick={() => scrollSlider('right')}
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-[#080B16] to-transparent opacity-80" />
              <div className="pointer-events-none absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-[#080B16] to-transparent opacity-80" />
              <ul
                ref={sliderRef}
                className="flex list-none gap-3 overflow-x-auto py-1 pr-2 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/20"
                aria-label={t('feltNeeds.sliderLabel', {
                  defaultValue: 'Popular felt needs'
                })}
              >
                {options.map((option) => {
                  const isActive = activeOptionId === option.id
                  return (
                    <li key={option.id} className="flex-shrink-0">
                      <button
                        type="button"
                        aria-pressed={isActive}
                        data-testid={`FeltNeedsOption-${option.id}`}
                        onClick={() => handleOptionSelect(option)}
                        className={cn(
                          buttonVariants({
                            variant: isActive ? 'default' : 'outline',
                            size: 'sm'
                          }),
                          'rounded-full border-white/20 bg-white/10 px-5 py-2 text-sm font-semibold capitalize text-white shadow-sm transition-all duration-200 hover:bg-white/20 hover:text-white focus-visible:ring-white/30',
                          isActive && 'bg-white text-slate-900 hover:text-slate-900'
                        )}
                      >
                        {option.label}
                      </button>
                    </li>
                  )
                })}
              </ul>
            </div>
          </div>

          <div className="mt-6 rounded-3xl bg-slate-900/40 p-6">
            <AlgoliaVideoGrid
              languageId={languageId}
              analyticsTag="felt-needs"
              showLoadMore
            />
          </div>

          <div className="rounded-3xl border border-white/15 bg-white/10 p-6" data-testid="FeltNeedsShareTips">
            <h3 className="text-lg font-semibold text-white">
              {t('feltNeeds.shareHeading', { defaultValue: 'How to share' })}
            </h3>
            <p className="mt-2 text-base text-white/80" aria-live="polite">
              {shareTip}
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
