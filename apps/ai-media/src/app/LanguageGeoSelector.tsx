'use client'

import { Languages, XCircle } from 'lucide-react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useMemo, useRef, useState } from 'react'

type LanguageOption = {
  id: string
  englishLabel: string
  nativeLabel: string
}

type GeoContinent = {
  id: string
  name: string
}

type GeoCountry = {
  id: string
  name: string
  continentId: string
}

type GeoLanguage = {
  id: string
  englishLabel: string
  nativeLabel: string
  countryIds: string[]
  continentIds: string[]
  countrySpeakers: Record<string, number>
}

type GeoPayload = {
  continents: GeoContinent[]
  countries: GeoCountry[]
  languages: GeoLanguage[]
}

interface LanguageGeoSelectorProps {
  value: string[]
  options?: LanguageOption[]
  className?: string
}

function normalizeText(value: string): string {
  return value.trim().toLowerCase()
}

function formatSpeakerPercentage(value: number, total: number): string {
  if (!Number.isFinite(value) || value <= 0) return ''
  if (!Number.isFinite(total) || total <= 0) return ''

  const percentage = (value / total) * 100
  const rounded =
    percentage >= 10
      ? percentage.toFixed(0)
      : percentage >= 1
        ? percentage.toFixed(1)
        : percentage.toFixed(2)

  const normalized = rounded
    .replace(/\.0+$/, '')
    .replace(/(\.\d*[1-9])0+$/, '$1')

  return `${normalized}%`
}

function mergeUniqueStrings(values: string[]): string[] {
  return Array.from(new Set(values.filter(Boolean)))
}

function mergeGeoPayload(base: GeoPayload, incoming: GeoPayload): GeoPayload {
  const continentsMap = new Map(
    base.continents.map((continent) => [continent.id, continent])
  )
  for (const continent of incoming.continents) {
    const existing = continentsMap.get(continent.id)
    if (!existing || !existing.name) {
      continentsMap.set(continent.id, continent)
    }
  }

  const countriesMap = new Map(
    base.countries.map((country) => [country.id, country])
  )
  for (const country of incoming.countries) {
    const existing = countriesMap.get(country.id)
    if (!existing) {
      countriesMap.set(country.id, country)
      continue
    }

    countriesMap.set(country.id, {
      id: country.id,
      name: existing.name || country.name,
      continentId: existing.continentId || country.continentId
    })
  }

  const languagesMap = new Map<string, GeoLanguage>()

  const upsertLanguage = (language: GeoLanguage) => {
    const existing = languagesMap.get(language.id)
    if (!existing) {
      languagesMap.set(language.id, {
        id: language.id,
        englishLabel: language.englishLabel,
        nativeLabel: language.nativeLabel,
        countryIds: mergeUniqueStrings(language.countryIds),
        continentIds: mergeUniqueStrings(language.continentIds),
        countrySpeakers: { ...language.countrySpeakers }
      })
      return
    }

    const nextCountrySpeakers = { ...existing.countrySpeakers }
    for (const [countryId, speakers] of Object.entries(
      language.countrySpeakers
    )) {
      const existingSpeakers = nextCountrySpeakers[countryId] ?? 0
      if (speakers > existingSpeakers) {
        nextCountrySpeakers[countryId] = speakers
      }
    }

    languagesMap.set(language.id, {
      id: existing.id,
      englishLabel: existing.englishLabel || language.englishLabel,
      nativeLabel: existing.nativeLabel || language.nativeLabel,
      countryIds: mergeUniqueStrings([
        ...existing.countryIds,
        ...language.countryIds
      ]),
      continentIds: mergeUniqueStrings([
        ...existing.continentIds,
        ...language.continentIds
      ]),
      countrySpeakers: nextCountrySpeakers
    })
  }

  for (const language of base.languages) {
    upsertLanguage(language)
  }
  for (const language of incoming.languages) {
    upsertLanguage(language)
  }

  return {
    continents: Array.from(continentsMap.values()).sort((a, b) =>
      a.name.localeCompare(b.name)
    ),
    countries: Array.from(countriesMap.values()).sort((a, b) =>
      a.name.localeCompare(b.name)
    ),
    languages: Array.from(languagesMap.values()).sort((a, b) =>
      a.englishLabel.localeCompare(b.englishLabel)
    )
  }
}

export function LanguageGeoSelector({
  value,
  options = [],
  className
}: LanguageGeoSelectorProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)
  const [geoData, setGeoData] = useState<GeoPayload | null>(null)
  const [searchValue, setSearchValue] = useState('')
  const [draftLanguages, setDraftLanguages] = useState<string[]>(value)
  const [draftContinents, setDraftContinents] = useState<Set<string>>(new Set())
  const [draftCountries, setDraftCountries] = useState<Set<string>>(new Set())
  const [isSearchingServer, setIsSearchingServer] = useState(false)
  const searchInputRef = useRef<HTMLInputElement | null>(null)
  const navigationTimeoutRef = useRef<number | null>(null)
  const searchedTermsRef = useRef<Set<string>>(new Set())
  const inFlightSearchesRef = useRef(0)

  const fallbackLabel = useMemo(() => {
    if (!draftLanguages.length) {
      return options[0]?.englishLabel ?? ''
    }
    const selected = draftLanguages
      .map(
        (id) => options.find((option) => option.id === id)?.englishLabel ?? id
      )
      .filter(Boolean)
    if (selected.length === 0) return options[0]?.englishLabel ?? ''
    if (selected.length === 1) return selected[0]
    return `${selected[0]} +${selected.length - 1}`
  }, [draftLanguages, options])

  const selectedLanguage = useMemo(() => {
    if (!geoData) return null
    return (
      geoData.languages.find((language) => language.id === draftLanguages[0]) ??
      null
    )
  }, [draftLanguages, geoData])

  const selectedLabel = selectedLanguage?.englishLabel || fallbackLabel
  const selectedLanguageSet = useMemo(
    () => new Set(draftLanguages),
    [draftLanguages]
  )
  const languageLabelById = useMemo(() => {
    const labels = new Map<string, string>()

    for (const option of options) {
      const label = option.englishLabel.trim()
      if (label) {
        labels.set(option.id, label)
      }
    }

    for (const language of geoData?.languages ?? []) {
      const label = language.englishLabel.trim()
      if (label) {
        labels.set(language.id, label)
      }
    }

    return labels
  }, [geoData, options])
  const selectedLanguagePills = useMemo(
    () =>
      draftLanguages.map((id) => ({
        id,
        label: languageLabelById.get(id) ?? id
      })),
    [draftLanguages, languageLabelById]
  )

  const hasPendingChanges = useMemo(() => {
    const valueSet = new Set(value)
    if (valueSet.size !== draftLanguages.length) return true
    for (const id of draftLanguages) {
      if (!valueSet.has(id)) return true
    }
    return false
  }, [draftLanguages, value])

  useEffect(() => {
    if (typeof document === 'undefined') return
    const loading = isLoading
    if (loading) {
      document.documentElement.dataset.loading = 'true'
    } else {
      delete document.documentElement.dataset.loading
    }
  }, [isLoading])

  useEffect(() => {
    setIsLoading(false)
  }, [value])

  useEffect(() => {
    return () => {
      if (navigationTimeoutRef.current) {
        window.clearTimeout(navigationTimeoutRef.current)
      }
    }
  }, [])

  useEffect(() => {
    let isActive = true
    const controller = new AbortController()

    const fetchLanguages = async () => {
      try {
        const response = await fetch('/api/languages', {
          signal: controller.signal
        })

        if (!response.ok) return
        const payload = (await response.json()) as GeoPayload

        if (!isActive) return
        if (payload?.languages && payload?.countries && payload?.continents) {
          setGeoData(payload)
        }
      } catch {
        // keep fallback options
      }
    }

    void fetchLanguages()

    return () => {
      isActive = false
      controller.abort()
    }
  }, [])

  useEffect(() => {
    if (!geoData) return

    const query = normalizeText(searchValue)
    if (query.length < 2) return

    const hasLocalMatch = geoData.languages.some((language) => {
      const english = normalizeText(language.englishLabel)
      const native = normalizeText(language.nativeLabel)
      return english.includes(query) || native.includes(query)
    })
    if (hasLocalMatch) return

    if (searchedTermsRef.current.has(query)) return

    const controller = new AbortController()
    const timeoutId = window.setTimeout(() => {
      void (async () => {
        let didCompleteLookup = false

        try {
          inFlightSearchesRef.current += 1
          setIsSearchingServer(true)

          const response = await fetch(
            `/api/languages?search=${encodeURIComponent(query)}`,
            {
              signal: controller.signal
            }
          )
          if (!response.ok) return
          didCompleteLookup = true

          const payload = (await response.json()) as GeoPayload
          if (!payload?.languages || payload.languages.length === 0) return

          setGeoData((previous) =>
            previous ? mergeGeoPayload(previous, payload) : payload
          )
        } catch {
          // ignore fallback search errors
        } finally {
          if (!controller.signal.aborted && didCompleteLookup) {
            searchedTermsRef.current.add(query)
          }
          inFlightSearchesRef.current = Math.max(
            0,
            inFlightSearchesRef.current - 1
          )
          if (inFlightSearchesRef.current === 0) {
            setIsSearchingServer(false)
          }
        }
      })()
    }, 300)

    return () => {
      controller.abort()
      window.clearTimeout(timeoutId)
    }
  }, [geoData, searchValue])

  const countriesByContinent = useMemo(() => {
    if (!geoData) return []
    const continentMap = new Map(
      geoData.continents.map((continent) => [continent.id, continent])
    )
    const grouped = new Map<string, GeoCountry[]>()
    for (const country of geoData.countries) {
      const bucket = grouped.get(country.continentId) ?? []
      bucket.push(country)
      grouped.set(country.continentId, bucket)
    }
    return Array.from(grouped.entries())
      .map(([continentId, countries]) => ({
        continent: continentMap.get(continentId),
        countries: [...countries].sort((a, b) => a.name.localeCompare(b.name))
      }))
      .filter((entry) => entry.continent != null)
      .sort((a, b) => a.continent!.name.localeCompare(b.continent!.name))
  }, [geoData])

  const filteredLanguages = useMemo(() => {
    if (!geoData) return []
    const query = normalizeText(searchValue)
    const hasCountryFilter = draftCountries.size > 0
    const selectedCountryIds = Array.from(draftCountries)
    const hasQuery = Boolean(query)

    const matchesFilters = (language: GeoLanguage) => {
      if (!hasQuery) {
        if (
          draftContinents.size > 0 &&
          !language.continentIds.some((id) => draftContinents.has(id))
        ) {
          return false
        }
        if (
          draftCountries.size > 0 &&
          !language.countryIds.some((id) => draftCountries.has(id))
        ) {
          return false
        }
        return true
      }
      return (
        normalizeText(language.englishLabel).includes(query) ||
        normalizeText(language.nativeLabel).includes(query)
      )
    }

    const getSpeakerCount = (language: GeoLanguage) => {
      if (!hasCountryFilter) return 0
      return selectedCountryIds.reduce(
        (sum, id) => sum + (language.countrySpeakers[id] ?? 0),
        0
      )
    }

    return geoData.languages.filter(matchesFilters).sort((a, b) => {
      if (hasCountryFilter) {
        const speakerDiff = getSpeakerCount(b) - getSpeakerCount(a)
        if (speakerDiff !== 0) return speakerDiff
      }
      return a.englishLabel.localeCompare(b.englishLabel)
    })
  }, [draftContinents, draftCountries, geoData, searchValue])

  const languageSpeakerEstimates = useMemo(() => {
    if (!geoData) return new Map<string, number>()

    const selectedCountryIds = Array.from(draftCountries)
    const hasCountryFilter = selectedCountryIds.length > 0
    const hasContinentFilter = draftContinents.size > 0
    const continentCountryIds = hasContinentFilter
      ? geoData.countries
          .filter((country) => draftContinents.has(country.continentId))
          .map((country) => country.id)
      : []
    const estimates = new Map<string, number>()

    for (const language of geoData.languages) {
      const countryIds = hasCountryFilter
        ? selectedCountryIds
        : hasContinentFilter
          ? continentCountryIds
          : language.countryIds
      const totalSpeakers = countryIds.reduce(
        (sum, countryId) => sum + (language.countrySpeakers[countryId] ?? 0),
        0
      )
      estimates.set(language.id, totalSpeakers)
    }

    return estimates
  }, [draftContinents, draftCountries, geoData])

  const visibleLanguages = useMemo(() => {
    const MIN_SPEAKERS_FOR_NON_ZERO_MIL = 100_000
    const MIN_VISIBLE_LANGUAGES = 5

    const languagesWithAtLeastPointOneMil = filteredLanguages.filter(
      (language) =>
        (languageSpeakerEstimates.get(language.id) ?? 0) >=
        MIN_SPEAKERS_FOR_NON_ZERO_MIL
    )

    if (languagesWithAtLeastPointOneMil.length >= MIN_VISIBLE_LANGUAGES) {
      return languagesWithAtLeastPointOneMil
    }

    return filteredLanguages.slice(0, MIN_VISIBLE_LANGUAGES)
  }, [filteredLanguages, languageSpeakerEstimates])

  const hasSelectedCountry = draftCountries.size > 0

  const totalVisibleSpeakers = useMemo(
    () =>
      visibleLanguages.reduce(
        (sum, language) => sum + (languageSpeakerEstimates.get(language.id) ?? 0),
        0
      ),
    [visibleLanguages, languageSpeakerEstimates]
  )

  const applyUrlParams = (nextLanguageIds: string[]) => {
    const currentQuery = searchParams?.toString() ?? ''
    const nextParams = new URLSearchParams(currentQuery)

    if (nextLanguageIds.length > 0) {
      nextParams.set('languageId', nextLanguageIds.join(','))
    } else {
      nextParams.delete('languageId')
    }

    const queryString = nextParams.toString()
    const nextUrl = queryString ? `${pathname}?${queryString}` : pathname
    const currentUrl = currentQuery ? `${pathname}?${currentQuery}` : pathname

    if (nextUrl === currentUrl) {
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    if (navigationTimeoutRef.current) {
      window.clearTimeout(navigationTimeoutRef.current)
    }
    navigationTimeoutRef.current = window.setTimeout(() => {
      if (typeof window !== 'undefined') {
        window.location.href = nextUrl
        return
      }
      router.push(nextUrl)
    }, 250)
  }

  const handleSelect = (nextValue: string) => {
    setDraftLanguages((prev) =>
      selectedLanguageSet.has(nextValue)
        ? prev.filter((id) => id !== nextValue)
        : [...prev, nextValue]
    )
  }

  const toggleContinent = (id: string) => {
    setDraftContinents((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const toggleCountry = (id: string) => {
    setDraftCountries((prev) => {
      if (prev.has(id)) {
        return new Set()
      }
      return new Set([id])
    })
  }

  const clearFilters = () => {
    setDraftContinents(new Set())
    setDraftCountries(new Set())
    setDraftLanguages([])
    setSearchValue('')
  }

  const confirmSelection = () => {
    applyUrlParams(draftLanguages)
  }

  useEffect(() => {
    setDraftLanguages(value)
  }, [value])

  return (
    <div className={className ? `geo-panel ${className}` : 'geo-panel'}>
      <div className="geo-panel-header">
        <span className="geo-panel-label">Language</span>
        <span className="geo-panel-value">{selectedLabel}</span>
        {isLoading && (
          <span className="control-loading" aria-live="polite">
            Loading…
          </span>
        )}
      </div>
      <div className="geo-dropdown" role="group" aria-label="Language">
        <div className="geo-toolbar">
          <div className="geo-search-shell">
            <Languages className="geo-search-icon" aria-hidden="true" />
            <input
              type="search"
              value={searchValue}
              ref={searchInputRef}
              onChange={(event) => setSearchValue(event.target.value)}
              placeholder="Search languages..."
              aria-label="Search languages"
              className="geo-search-input"
            />
            <button
              type="button"
              className="geo-clear"
              onClick={clearFilters}
              aria-label="Clear filters"
            >
              <XCircle className="icon" aria-hidden="true" />
            </button>
          </div>
          {isSearchingServer && (
            <span className="control-loading" aria-live="polite">
              Searching server…
            </span>
          )}
        </div>
        <div className="geo-grid">
          <div className="geo-column">
            <p className="geo-title">Regions</p>
            <div className="geo-accordion-list">
              {countriesByContinent.map(({ continent, countries }) => {
                if (!continent) return null
                const isOpen =
                  draftContinents.has(continent.id) ||
                  countries.some((country) => draftCountries.has(country.id))
                return (
                  <details
                    key={continent.id}
                    className="geo-accordion"
                    open={isOpen}
                  >
                    <summary className="geo-accordion-summary">
                      <button
                        type="button"
                        className={`geo-filter-button${
                          draftContinents.has(continent.id) ? 'is-active' : ''
                        }`}
                        onClick={(event) => {
                          event.preventDefault()
                          event.stopPropagation()
                          toggleContinent(continent.id)
                        }}
                        aria-pressed={draftContinents.has(continent.id)}
                      >
                        {continent.name}
                      </button>
                      <span className="geo-accordion-count">
                        {countries.length}
                      </span>
                    </summary>
                    <div className="geo-accordion-panel">
                      {countries.map((country) => (
                        <button
                          key={country.id}
                          type="button"
                          className={`geo-filter-button geo-filter-button--country${
                            draftCountries.has(country.id) ? 'is-active' : ''
                          }`}
                          onClick={() => toggleCountry(country.id)}
                          aria-pressed={draftCountries.has(country.id)}
                        >
                          {country.name}
                        </button>
                      ))}
                    </div>
                  </details>
                )
              })}
            </div>
          </div>
          <div className="geo-column geo-column--divider">
            <p className="geo-title">Languages</p>
            <div className="geo-list">
              {visibleLanguages.map((language) => {
                const speakerEstimate =
                  languageSpeakerEstimates.get(language.id) ?? 0
                const speakerLabel = hasSelectedCountry
                  ? formatSpeakerPercentage(speakerEstimate, totalVisibleSpeakers)
                  : ''

                return (
                  <label key={language.id} className="geo-option">
                    <input
                      type="checkbox"
                      checked={selectedLanguageSet.has(language.id)}
                      onChange={() => handleSelect(language.id)}
                    />
                    <span className="geo-option-content">
                      <span className="geo-option-label">
                        {language.englishLabel}
                        {language.nativeLabel &&
                        language.nativeLabel !== language.englishLabel
                          ? ` · ${language.nativeLabel}`
                          : ''}
                      </span>
                      {speakerLabel ? (
                        <span className="geo-option-speakers">
                          {speakerLabel}
                        </span>
                      ) : null}
                    </span>
                  </label>
                )
              })}
            </div>
          </div>
        </div>
        {selectedLanguagePills.length > 0 ? (
          <div className="geo-selected">
            <p className="geo-selected-title">Selected languages</p>
            <div className="geo-footer geo-footer--with-pills">
              <div className="geo-selected-pills">
                {selectedLanguagePills.map((language) => (
                  <button
                    key={language.id}
                    type="button"
                    className="geo-selected-pill"
                    onClick={() => handleSelect(language.id)}
                    aria-label={`Remove ${language.label}`}
                  >
                    {language.label}
                    <span className="geo-selected-pill-remove" aria-hidden="true">
                      ×
                    </span>
                  </button>
                ))}
              </div>
              <button
                type="button"
                className="geo-confirm"
                onClick={confirmSelection}
                disabled={!hasPendingChanges || isLoading}
              >
                Confirm
              </button>
            </div>
          </div>
        ) : (
          <div className="geo-footer">
            <button
              type="button"
              className="geo-confirm"
              onClick={confirmSelection}
              disabled={!hasPendingChanges || isLoading}
            >
              Confirm
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
