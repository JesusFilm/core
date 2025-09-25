import { useTranslation } from 'next-i18next'
import {
  type ChangeEvent,
  type KeyboardEvent,
  type ReactElement,
  useMemo,
  useState
} from 'react'

import { cn } from '../../libs/cn'

type HighlightCategory = 'majority' | 'minority'

interface CountryMapConfig {
  path: string
  label: {
    x: number
    y: number
  }
}

interface CountryData {
  id: string
  name: string
  capital: string
  region: string
  population: string
  summary: string
  languages: {
    native: string[]
    widelySpoken: string[]
  }
  peopleGroups: Record<HighlightCategory, string[]>
  religions: string[]
  spotlight: Array<{ label: string; value: string }>
  map: CountryMapConfig
}

const COUNTRY_DATA: CountryData[] = [
  {
    id: 'united-states',
    name: 'United States',
    capital: 'Washington, D.C.',
    region: 'North America',
    population: '331M (est.)',
    summary:
      'Multilingual sending hub with dense diaspora communities concentrated in coastal cities and university towns.',
    languages: {
      native: ['English'],
      widelySpoken: ['Spanish', 'Chinese', 'Tagalog', 'Vietnamese']
    },
    peopleGroups: {
      majority: ['Anglo-American communities', 'African American communities'],
      minority: ['Hispanic / Latino diaspora', 'Asian diaspora networks', 'Indigenous nations']
    },
    religions: [
      'Christian (Protestant, Catholic, Orthodox)',
      'Religiously unaffiliated',
      'Other faith communities (Islam, Hinduism, Buddhism, Judaism)'
    ],
    spotlight: [
      { label: 'Urban focus', value: 'New York, Los Angeles, Houston, Chicago' },
      {
        label: 'Next step',
        value: 'Strengthen multilingual partnerships and digital discipleship hubs.'
      }
    ],
    map: {
      path: 'M140 95 L228 95 L268 128 L252 164 L204 176 L162 154 L136 128 Z',
      label: { x: 210, y: 140 }
    }
  },
  {
    id: 'brazil',
    name: 'Brazil',
    capital: 'Brasília',
    region: 'South America',
    population: '214M (est.)',
    summary:
      'Expansive Portuguese-speaking nation with vibrant indigenous languages in the Amazon basin and urban youth movements.',
    languages: {
      native: ['Portuguese'],
      widelySpoken: ['Spanish', 'Indigenous dialect clusters', 'English (urban centers)']
    },
    peopleGroups: {
      majority: ['Euro-Brazilian and Afro-Brazilian communities'],
      minority: ['Indigenous peoples', 'Japanese Brazilian diaspora', 'Nordeste rural communities']
    },
    religions: [
      'Christian (Catholic majority, expanding Evangelical movements)',
      'Afro-Brazilian religions (Candomblé, Umbanda)',
      'Growing secular / spiritual seekers'
    ],
    spotlight: [
      {
        label: 'Emerging opportunity',
        value: 'Campus evangelism and sports outreach in São Paulo and Rio.'
      },
      {
        label: 'Prayer highlight',
        value: 'Translation support for Amazonian language clusters.'
      }
    ],
    map: {
      path: 'M276 208 L312 212 L338 248 L326 296 L292 284 L270 244 Z',
      label: { x: 318, y: 252 }
    }
  },
  {
    id: 'nigeria',
    name: 'Nigeria',
    capital: 'Abuja',
    region: 'West Africa',
    population: '213M (est.)',
    summary:
      'Young, urbanising nation with over 500 languages and shifting cultural influence between north and south corridors.',
    languages: {
      native: ['English (official)', 'Hausa', 'Yorùbá', 'Igbo'],
      widelySpoken: ['Pidgin English', 'Fulfulde', 'Kanuri']
    },
    peopleGroups: {
      majority: ['Hausa-Fulani', 'Yorùbá', 'Igbo'],
      minority: ['Tiv', 'Ijaw', 'Middle Belt minority clusters']
    },
    religions: [
      'Christian (predominantly south and central regions)',
      'Islam (predominantly northern regions)',
      'Traditional beliefs / syncretic movements'
    ],
    spotlight: [
      {
        label: 'Ministry rhythm',
        value: 'Story-centric evangelism and oral Scripture engagement.'
      },
      { label: 'Security note', value: 'Prioritise local partnerships in sensitive northern states.' }
    ],
    map: {
      path: 'M360 184 L396 184 L412 212 L398 236 L364 224 L350 204 Z',
      label: { x: 398, y: 212 }
    }
  },
  {
    id: 'india',
    name: 'India',
    capital: 'New Delhi',
    region: 'South Asia',
    population: '1.4B (est.)',
    summary:
      'Complex mosaic of linguistic zones and caste dynamics with rapid digital adoption in tier-two cities.',
    languages: {
      native: ['Hindi', 'Bengali', 'Telugu', 'Marathi', 'Tamil'],
      widelySpoken: ['English (commerce)', 'Urdu', 'Gujarati', 'Kannada']
    },
    peopleGroups: {
      majority: ['Indo-Aryan groups', 'Dravidian groups'],
      minority: ['Adivasi tribal communities', 'Tibeto-Burman groups', 'Muslim-majority districts']
    },
    religions: [
      'Hinduism (majority)',
      'Islam (largest minority)',
      'Christian, Sikh, Buddhist, Jain communities'
    ],
    spotlight: [
      {
        label: 'Digital doorways',
        value: 'Mobile-first storytelling in Hindi, Telugu, Marathi, and Tamil.'
      },
      {
        label: 'Long-term vision',
        value: 'Equip emerging leaders for contextual discipleship in urban slums.'
      }
    ],
    map: {
      path: 'M500 188 L540 198 L552 236 L518 252 L488 222 Z',
      label: { x: 534, y: 226 }
    }
  },
  {
    id: 'philippines',
    name: 'Philippines',
    capital: 'Manila',
    region: 'Southeast Asia',
    population: '114M (est.)',
    summary:
      'Archipelago nation with diaspora influence, youth-led movements, and strong relational evangelism culture.',
    languages: {
      native: ['Filipino', 'Cebuano', 'Ilocano', 'Hiligaynon'],
      widelySpoken: ['English', 'Taglish hybrid', 'Arabic (overseas workers)']
    },
    peopleGroups: {
      majority: ['Tagalog / Filipino'],
      minority: ['Cebuano', 'Moro Muslim peoples of Mindanao', 'Indigenous Lumad tribes']
    },
    religions: [
      'Christian (Catholic majority, Evangelical growth)',
      'Islam (Mindanao provinces)',
      'Folk religion / animist expressions'
    ],
    spotlight: [
      {
        label: 'Key cities',
        value: 'Manila, Cebu, Davao for campus and marketplace engagement.'
      },
      {
        label: 'Diaspora connection',
        value: 'Resource overseas Filipino workers as digital missionaries.'
      }
    ],
    map: {
      path: 'M576 216 L588 226 L600 246 L590 258 L574 244 Z',
      label: { x: 594, y: 238 }
    }
  },
  {
    id: 'australia',
    name: 'Australia',
    capital: 'Canberra',
    region: 'Oceania',
    population: '26M (est.)',
    summary:
      'Strategic Pacific base with multicultural cities and a growing focus on ministry to international students.',
    languages: {
      native: ['English'],
      widelySpoken: ['Mandarin', 'Arabic', 'Vietnamese', 'Hindi']
    },
    peopleGroups: {
      majority: ['Anglo-Australian communities'],
      minority: ['Aboriginal and Torres Strait Islander peoples', 'Recent immigrants from Asia and the Middle East']
    },
    religions: [
      'Christian heritage with increasing secular worldview',
      'Buddhist and Hindu diaspora communities',
      'Indigenous spiritualities'
    ],
    spotlight: [
      {
        label: 'University outreach',
        value: 'Discipleship communities among international students in Sydney and Melbourne.'
      },
      {
        label: 'Cultural care',
        value: 'Partner with indigenous leaders for story-driven ministry tools.'
      }
    ],
    map: {
      path: 'M640 268 L708 268 L736 308 L686 330 L632 312 Z',
      label: { x: 700, y: 302 }
    }
  }
]

const MAP_BASE_LAYERS = [
  'M100 70 L260 70 L312 122 L284 184 L192 200 L132 154 Z',
  'M284 184 L332 236 L348 316 L304 364 L264 296 Z',
  'M328 92 L382 92 L424 122 L404 154 L338 144 Z',
  'M338 144 L404 144 L436 224 L386 304 L322 244 Z',
  'M420 84 L588 84 L632 148 L610 214 L524 226 L456 170 Z',
  'M604 244 L724 244 L768 304 L688 348 L624 324 Z'
]

const MAX_SUGGESTIONS = 6

export function CountryExplorerSection(): ReactElement {
  const [searchTerm, setSearchTerm] = useState(COUNTRY_DATA[0]?.name ?? '')
  const [selectedCountryId, setSelectedCountryId] = useState<string>(
    COUNTRY_DATA[0]?.id ?? ''
  )
  const { t } = useTranslation('apps-watch')

  const selectedCountry = useMemo(() => {
    return (
      COUNTRY_DATA.find((country) => country.id === selectedCountryId) ??
      COUNTRY_DATA[0]
    )
  }, [selectedCountryId])

  const filteredCountries = useMemo(() => {
    const term = searchTerm.trim().toLowerCase()
    if (term === '') return COUNTRY_DATA.slice(0, MAX_SUGGESTIONS)

    return COUNTRY_DATA.filter((country) =>
      country.name.toLowerCase().includes(term)
    ).slice(0, MAX_SUGGESTIONS)
  }, [searchTerm])

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>): void => {
    setSearchTerm(event.target.value)
  }

  const handleSelectCountry = (countryId: string): void => {
    const match = COUNTRY_DATA.find((country) => country.id === countryId)
    if (match != null) {
      setSelectedCountryId(match.id)
      setSearchTerm(match.name)
    }
  }

  const handleMapKeyDown = (
    event: KeyboardEvent<SVGPathElement>,
    countryId: string
  ): void => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      handleSelectCountry(countryId)
    }
  }

  return (
    <section
      className="relative overflow-hidden bg-slate-950/80 py-20 text-slate-100"
      data-testid="CountryExplorerSection"
    >
      <div className="absolute inset-0 bg-[url(/watch/assets/overlay.svg)] opacity-20" aria-hidden="true" />
      <div className="relative z-10 padded flex flex-col gap-12">
        <div className="flex flex-col gap-4 lg:max-w-3xl">
          <span className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-200/70">
            {t('countryExplorerPrototypeLabel')}
          </span>
          <h2 className="text-3xl font-semibold md:text-4xl">
            {t('countryExplorerTitle')}
          </h2>
          <p className="text-base text-slate-200/80 md:text-lg">
            {t('countryExplorerDescription')}
          </p>
        </div>

        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] lg:items-start">
          <div className="flex flex-col gap-6">
            <div className="grid gap-4 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
              <label className="flex flex-col gap-2" htmlFor="country-explorer-search">
                <span className="text-sm font-medium uppercase tracking-wider text-slate-200/70">
                  {t('countryExplorerSearchLabel')}
                </span>
                <input
                  id="country-explorer-search"
                  type="search"
                  autoComplete="off"
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="w-full rounded-xl border border-white/20 bg-slate-900/60 px-4 py-3 text-base text-slate-100 placeholder:text-slate-400 focus:border-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-400/60"
                  placeholder={t('countryExplorerSearchPlaceholder')}
                />
              </label>
              <div className="grid gap-2">
                <span className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-300/70">
                  {t('countryExplorerQuickPicks')}
                </span>
                <div className="flex flex-wrap gap-2">
                  {COUNTRY_DATA.map((country) => {
                    const isActive = country.id === selectedCountry?.id
                    return (
                      <button
                        key={country.id}
                        type="button"
                        onClick={() => {
                          handleSelectCountry(country.id)
                        }}
                        className={cn(
                          'rounded-full border px-3 py-1.5 text-sm font-medium transition-colors',
                          isActive
                            ? 'border-amber-300 bg-amber-300/20 text-amber-100 shadow-[0_0_0_1px_rgba(251,191,36,0.5)]'
                            : 'border-white/10 bg-slate-900/30 text-slate-200 hover:border-amber-200/60 hover:text-amber-100'
                        )}
                      >
                        {country.name}
                      </button>
                    )
                  })}
                </div>
              </div>
              {filteredCountries.length > 0 && (
                <div className="grid gap-3">
                  <span className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-300/70">
                    {t('countryExplorerSuggestions')}
                  </span>
                  <ul
                    className="grid gap-2"
                    aria-label={t('countryExplorerSuggestionListLabel')}
                  >
                    {filteredCountries.map((country) => (
                      <li key={country.id}>
                        <button
                          type="button"
                          onClick={() => {
                            handleSelectCountry(country.id)
                          }}
                          className={cn(
                            'flex w-full items-center justify-between rounded-xl border px-3 py-2 text-left text-sm transition-colors',
                            country.id === selectedCountry?.id
                              ? 'border-amber-300/80 bg-amber-200/20 text-amber-100'
                              : 'border-white/10 bg-slate-900/40 text-slate-200 hover:border-amber-200/60 hover:text-amber-100'
                          )}
                        >
                          <span>{country.name}</span>
                          <span className="text-xs uppercase tracking-wide text-slate-400">
                            {country.region}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="relative rounded-3xl border border-white/10 bg-slate-900/50 p-4 shadow-2xl">
              <svg
                viewBox="0 0 800 400"
                role="img"
                aria-labelledby="country-explorer-map-title"
                className="h-auto w-full"
                preserveAspectRatio="xMidYMid meet"
              >
                <title id="country-explorer-map-title">
                  {t('countryExplorerMapTitle')}
                </title>
                <defs>
                  <radialGradient id="country-explorer-glow" cx="50%" cy="40%" r="70%">
                    <stop offset="0%" stopColor="#facc15" stopOpacity="0.35" />
                    <stop offset="60%" stopColor="#facc15" stopOpacity="0.08" />
                    <stop offset="100%" stopColor="#0f172a" stopOpacity="0" />
                  </radialGradient>
                </defs>

                <rect
                  x="0"
                  y="0"
                  width="800"
                  height="400"
                  rx="28"
                  fill="#0f172a"
                />

                <g className="fill-white/8">
                  {MAP_BASE_LAYERS.map((path, index) => (
                    <path key={`base-${index.toString()}`} d={path} />
                  ))}
                </g>

                {COUNTRY_DATA.map((country) => {
                  const isActive = country.id === selectedCountry?.id
                  return (
                    <g key={country.id}>
                      <path
                        d={country.map.path}
                        role="button"
                        tabIndex={0}
                        aria-label={t('countryExplorerHighlightCountry', {
                          country: country.name
                        })}
                        onClick={() => {
                          handleSelectCountry(country.id)
                        }}
                        onKeyDown={(event) => {
                          handleMapKeyDown(event, country.id)
                        }}
                        className={cn(
                          'cursor-pointer transition-all duration-300 ease-out focus:outline-none focus:ring-4 focus:ring-amber-300/40',
                          isActive
                            ? 'fill-amber-300/60 stroke-amber-100 stroke-[3px] drop-shadow-[0_0_12px_rgba(251,191,36,0.45)]'
                            : 'fill-white/15 stroke-white/20 hover:fill-amber-200/40 hover:stroke-amber-200/60'
                        )}
                      />
                      {isActive && (
                        <>
                          <circle
                            cx={country.map.label.x}
                            cy={country.map.label.y}
                            r={36}
                            fill="url(#country-explorer-glow)"
                          />
                          <circle
                            cx={country.map.label.x}
                            cy={country.map.label.y}
                            r={6}
                            className="fill-amber-200"
                          />
                        </>
                      )}
                    </g>
                  )})}
              </svg>
            </div>
          </div>

          <div className="relative flex flex-col gap-6 rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900/80 via-slate-900/60 to-indigo-950/60 p-8 shadow-xl backdrop-blur">
            <div className="flex flex-col gap-2">
              <span className="w-fit rounded-full bg-amber-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-amber-200">
                {t('countryExplorerPrototypeDataBadge')}
              </span>
              <h3 className="text-2xl font-semibold text-white md:text-3xl">
                {selectedCountry?.name}
              </h3>
              <p className="text-sm uppercase tracking-[0.35em] text-slate-300">
                {selectedCountry?.region}
              </p>
              <p className="text-base leading-relaxed text-slate-200/85">
                {selectedCountry?.summary}
              </p>
            </div>

            <dl className="grid gap-3 text-sm text-slate-200/80 md:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4">
                <dt className="text-xs uppercase tracking-[0.3em] text-slate-400">
                  {t('countryExplorerCapitalLabel')}
                </dt>
                <dd className="text-base font-semibold text-white">
                  {selectedCountry?.capital}
                </dd>
              </div>
              <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4">
                <dt className="text-xs uppercase tracking-[0.3em] text-slate-400">
                  {t('countryExplorerPopulationLabel')}
                </dt>
                <dd className="text-base font-semibold text-white">
                  {selectedCountry?.population}
                </dd>
              </div>
            </dl>

            <div className="grid gap-4">
              <div>
                <h4 className="text-sm font-semibold uppercase tracking-[0.3em] text-amber-100">
                  {t('countryExplorerLanguagesHeading')}
                </h4>
                <div className="mt-3 grid gap-3 md:grid-cols-2">
                  <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-300">
                      {t('countryExplorerNativeLanguagesLabel')}
                    </p>
                    <ul className="mt-2 grid gap-1 text-sm text-slate-200/80">
                      {selectedCountry?.languages.native.map((language) => (
                        <li key={language}>{language}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-300">
                      {t('countryExplorerWidelySpokenLabel')}
                    </p>
                    <ul className="mt-2 grid gap-1 text-sm text-slate-200/80">
                      {selectedCountry?.languages.widelySpoken.map((language) => (
                        <li key={language}>{language}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold uppercase tracking-[0.3em] text-amber-100">
                  {t('countryExplorerPeopleGroupsHeading')}
                </h4>
                <div className="mt-3 grid gap-3 md:grid-cols-2">
                  <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-300">
                      {t('countryExplorerMajorityLabel')}
                    </p>
                    <ul className="mt-2 grid gap-1 text-sm text-slate-200/80">
                      {selectedCountry?.peopleGroups.majority.map((group) => (
                        <li key={group}>{group}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-300">
                      {t('countryExplorerMinorityLabel')}
                    </p>
                    <ul className="mt-2 grid gap-1 text-sm text-slate-200/80">
                      {selectedCountry?.peopleGroups.minority.map((group) => (
                        <li key={group}>{group}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold uppercase tracking-[0.3em] text-amber-100">
                  {t('countryExplorerReligiousHeading')}
                </h4>
                <ul className="mt-3 grid gap-2 text-sm text-slate-200/80">
                  {selectedCountry?.religions.map((religion) => (
                    <li
                      key={religion}
                      className="rounded-xl border border-white/10 bg-slate-900/60 px-4 py-2"
                    >
                      {religion}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="text-sm font-semibold uppercase tracking-[0.3em] text-amber-100">
                  {t('countryExplorerFieldNotesHeading')}
                </h4>
                <ul className="mt-3 grid gap-3">
                  {selectedCountry?.spotlight.map((item) => (
                    <li
                      key={`${selectedCountry.id}-${item.label}`}
                      className="rounded-2xl border border-amber-200/20 bg-amber-100/5 p-4"
                    >
                      <p className="text-xs uppercase tracking-[0.3em] text-amber-200/80">
                        {item.label}
                      </p>
                      <p className="mt-2 text-sm text-slate-100/90">{item.value}</p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
