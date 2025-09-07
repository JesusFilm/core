"use client"

import { Globe, Plus, Search, X } from 'lucide-react'
import * as React from 'react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useInstantSearch, useRefinementList } from 'react-instantsearch'

import { useAlgoliaClient } from '@/components/providers/instantsearch'
import { Button } from '@/components/ui/button'
import { Container } from '@/components/ui/container'
import { cn } from '@/lib/utils'

type LanguagePill = {
  text: string
  isDropdown?: boolean
}

type LanguageItem = {
  label: string
  value: string
  count: number
  isRefined: boolean
}

export function Languages() {
  // Access InstantSearch to surgically update UI state for filtering
  const { setIndexUiState } = useInstantSearch()

  // Pull facet values for languages from Algolia
  const { items, refine } = useRefinementList({
    attribute: 'languageEnglishName',
    limit: 5000,
    // showMore: true,
    // showMoreLimit: 5000
  }) as unknown as { items: LanguageItem[], refine: (value: string) => void }

  // State to manage the language filter dropdown
  const [isLanguageFilterOpen, setIsLanguageFilterOpen] = React.useState(false)

  // Dropdown state matching Header design
  const [query, setQuery] = useState('')
  const [focusedIndex, setFocusedIndex] = useState(-1)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Reuse Algolia client from provider (same instance as InstantSearch)
  const { searchClient: client, indexName } = useAlgoliaClient()

  // Cache of native (primary) names keyed by English name
  const nativeByEnglishRef = useRef(new Map<string, string>())
  const [, forceNativeMapRerender] = useState(0)

  // Filter list by query — match English and Native names
  const [extraEnglishFromNative, setExtraEnglishFromNative] = useState<string[]>([])

  function updateNativeMap(entries: Array<[string, string]>) {
    let changed = false
    for (const [en, nat] of entries) {
      if (en && nat && !nativeByEnglishRef.current.has(en)) {
        nativeByEnglishRef.current.set(en, nat)
        changed = true
      }
    }
    if (changed) forceNativeMapRerender((v) => v + 1)
  }

  // Utility to escape facet values with quotes
  const quote = (v: string) => `"${v.replace(/"/g, '\\"')}"`

  // Get currently selected languages with refinement data
  const selectedLanguages: (LanguageItem & { text: string })[] = useMemo(() => {
    return (items ?? [])
      .filter(item => item.isRefined)
      .map(item => ({ ...item, text: item.label }))
  }, [items])

  // Batch fetch native names for a list of English facet values using facet-only queries
  const prefetchNativeForEnglish = useCallback(
    async (englishValues: string[]) => {
      if (!client || !indexName || englishValues.length === 0) return
      try {
        const requests = englishValues.map((val) => ({
          // v5 multiple search: hits query with facets (does not require searchable())
          indexName,
          query: '',
          hitsPerPage: 0,
          facets: ['languagePrimaryName'],
          maxValuesPerFacet: 1,
          facetFilters: [[`languageEnglishName:${quote(val)}`]]
        }))
        const res = await client.search({ requests } as any)
        const pairs: Array<[string, string]> = []
        const missingForFallback: string[] = []
        res.results.forEach((r: any, i: number) => {
          const facets = r?.facets?.languagePrimaryName
          const native = facets ? Object.keys(facets)[0] : undefined
          const en = englishValues[i]
          if (en && native) pairs.push([en, native])
          else if (en) missingForFallback.push(en)
        })

        // Fallback: fetch one hit and read the attribute if facets are not configured
        if (missingForFallback.length > 0) {
          const fallbackRequests = missingForFallback.map((en) => ({
            // v5 multiple search: hits request
            indexName,
            query: '',
            hitsPerPage: 1,
            attributesToRetrieve: ['languagePrimaryName'],
            analytics: false,
            clickAnalytics: false,
            filters: `languageEnglishName:${quote(en)}`
          }))
          const fb = await client.search({ requests: fallbackRequests } as any)
          fb.results.forEach((r: any, i: number) => {
            const hit = r?.hits?.[0]
            const en = missingForFallback[i]
            const native = hit?.languagePrimaryName
            if (en && typeof native === 'string' && native) pairs.push([en, native])
          })
        }
        updateNativeMap(pairs)
      } catch (e) {
        // Best-effort; ignore errors
      }
    },
    [client, indexName]
  )

  const englishFiltered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return items ?? []
    return (items ?? []).filter((i) => i.label.toLowerCase().includes(q))
  }, [items, query])

  // Compute final filtered list by unioning native-name matches
  const filteredItems = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return items ?? []
    const baseSet = new Set(englishFiltered.map((i) => i.label))
    for (const en of extraEnglishFromNative) baseSet.add(en)
    const allByEnglishLabel = new Map((items ?? []).map((i) => [i.label, i]))
    return Array.from(baseSet)
      .map((label) => allByEnglishLabel.get(label))
      .filter(Boolean) as LanguageItem[]
  }, [items, englishFiltered, extraEnglishFromNative, query])

  const setLanguageFilter = React.useCallback(
    (language: string) => {
      setIndexUiState((prev) => {
        const next = { ...prev }
        const rl = { ...(prev.refinementList ?? {}) }
        if (language === '') delete rl['languageEnglishName']
        else rl['languageEnglishName'] = [language]
        next.refinementList = rl
        return next
      })
    },
    [setIndexUiState]
  )

  // Outside click close
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsLanguageFilterOpen(false)
        setQuery('')
        setFocusedIndex(-1)
      }
    }
    if (isLanguageFilterOpen) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isLanguageFilterOpen])

  useEffect(() => {
    setFocusedIndex(-1)
  }, [isLanguageFilterOpen, query])

  // When dropdown opens or the visible list changes, prefetch native names for visible items
  useEffect(() => {
    if (!isLanguageFilterOpen) return
    const source = query.trim() ? filteredItems : items ?? []
    const englishValues = source.slice(0, 60).map((i) => i.label)
    const missing = englishValues.filter((en) => !nativeByEnglishRef.current.has(en))
    if (missing.length > 0) void prefetchNativeForEnglish(missing)
  }, [isLanguageFilterOpen, items, filteredItems, query, prefetchNativeForEnglish])

  // Debounced native-name search to support searching by native names too
  useEffect(() => {
    let cancelled = false
    const run = async () => {
      const q = query.trim()
      if (!isLanguageFilterOpen || !q || !client || !indexName) {
        setExtraEnglishFromNative([])
        return
      }
      try {
        const sffv = await client.searchForFacetValues({
          indexName,
          facetName: 'languagePrimaryName',
          searchForFacetValuesRequest: {
            facetQuery: q,
            maxFacetHits: 20
          }
        })
        const nativeValues: string[] = (sffv?.facetHits ?? []).map((h: any) => h.value)
        if (nativeValues.length === 0) {
          setExtraEnglishFromNative([])
          return
        }
        // Prefetch mappings english<->native for these
        const requests = nativeValues.map((val) => ({
          // v5 multiple search: hits query with facets (does not require searchable())
          indexName,
          query: '',
          hitsPerPage: 0,
          facets: ['languageEnglishName'],
          maxValuesPerFacet: 1,
          facetFilters: [[`languagePrimaryName:${quote(val)}`]]
        }))
        const res = await client.search({ requests } as any)
        const englishFromNative: string[] = []
        const mapEntries: Array<[string, string]> = [] // english -> native
        const missingForFallback: string[] = []
        res.results.forEach((r: any, i: number) => {
          const enFacets = r?.facets?.languageEnglishName
          const en = enFacets ? Object.keys(enFacets)[0] : undefined
          const nat = nativeValues[i]
          if (en) {
            englishFromNative.push(en)
            mapEntries.push([en, nat])
          } else if (nat) {
            missingForFallback.push(nat)
          }
        })

        // Fallback: fetch one hit and read english attribute
        if (missingForFallback.length > 0) {
          const fbRequests = missingForFallback.map((nat) => ({
            // v5 multiple search: hits request
            indexName,
            query: '',
            hitsPerPage: 1,
            attributesToRetrieve: ['languageEnglishName'],
            analytics: false,
            clickAnalytics: false,
            filters: `languagePrimaryName:${quote(nat)}`
          }))
          const fb = await client.search({ requests: fbRequests } as any)
          fb.results.forEach((r: any, i: number) => {
            const hit = r?.hits?.[0]
            const en = hit?.languageEnglishName
            const nat = missingForFallback[i]
            if (typeof en === 'string' && en) {
              englishFromNative.push(en)
              mapEntries.push([en, nat])
            }
          })
        }
        if (!cancelled) {
          updateNativeMap(mapEntries)
          setExtraEnglishFromNative(englishFromNative)
        }
      } catch {
        if (!cancelled) setExtraEnglishFromNative([])
      }
    }
    const t = setTimeout(run, 200)
    return () => {
      cancelled = true
      clearTimeout(t)
    }
  }, [isLanguageFilterOpen, query, client, indexName])

  useEffect(() => {
    if (focusedIndex >= 0 && dropdownRef.current) {
      const el = dropdownRef.current.querySelector(`[data-index="${focusedIndex}"]`)
      el?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }
  }, [focusedIndex])

  const handleKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === 'Escape') {
      setQuery('')
      setFocusedIndex(-1)
      ;(e.currentTarget as HTMLInputElement).blur()
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      setFocusedIndex((prev) => (prev < filteredItems.length ? prev + 1 : 0))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setFocusedIndex((prev) => (prev > 0 ? prev - 1 : filteredItems.length - 1))
    } else if (e.key === 'Enter' && focusedIndex >= 0 && focusedIndex < filteredItems.length) {
      e.preventDefault()
      const selected = filteredItems[focusedIndex]
      if (selected) {
        setLanguageFilter(selected.label)
        setIsLanguageFilterOpen(false)
        setQuery('')
      }
    }
  }

  const handleRemoveLanguage = React.useCallback((languageText: string) => {
    // Use refinement list to remove the language filter
    refine(languageText)
    // Keep overlay open and reflect value by refocusing the header input
    try {
      const input = document.querySelector<HTMLInputElement>('input[data-testid="search-input"]')
      // Focus on next tick to avoid interfering with the click blur
      if (input) requestAnimationFrame(() => input.focus())
    } catch {}
  }, [refine])

  return (
    <Container>
      <div className="py-3">
        <div className="relative flex items-center gap-2 whitespace-nowrap">
          <div className="flex items-center text-white/90 text-sm font-medium flex-shrink-0 pr-1">
            <Globe className="h-4 w-4 mr-1.5" />
            <span>Filter by Language</span>
          </div>

          {/* Select a language button */}
          <div className="relative">
          <Button
            type="button"
            size="sm"
            variant="secondary"
            onClick={() => setIsLanguageFilterOpen(!isLanguageFilterOpen)}
            onMouseDown={(e) => {
              e.preventDefault()
            }}
            className={cn(
              'rounded-full px-3 py-1.5 h-8',
              'bg-white/10 hover:bg-white/20 text-white border border-white/15',
              'inline-flex items-center gap-1.5',
              'flex-shrink-0'
            )}
            aria-label="Select a language"
          >
            <Plus className="h-3.5 w-3.5" />
            <span className="text-sm font-normal">Select a language</span>
          </Button>

          {/* Language Filter Dropdown */}
              {isLanguageFilterOpen && (
                  <div
                    ref={dropdownRef}
                    className="absolute text-sm text-foreground/90 -top-4 left-0 -ml-1 bg-background/95 dark:bg-neutral-900/95 backdrop-blur-md rounded-xl shadow-xl border border-border py-3 z-50"
                  >
                    {/* Search input */}
                    <div className="px-4 pb-3 border-b border-border mb-3">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/60" />
                        <input
                          type="text"
                          value={query}
                          onChange={(e) => setQuery(e.target.value)}
                          onKeyDown={handleKeyDown}
                          placeholder="Search languages..."
                          className="w-full h-10 pl-9 pr-3 rounded text-base text-white placeholder:text-stone-400 focus:outline-none"
                          autoFocus
                          aria-label="Search languages"
                          role="searchbox"
                        />
                      </div>
                    </div>

                    {/* Options list including All languages */}
                    <div className="max-h-64 overflow-y-auto">
                      <button
                        onClick={() => {
                          // Clear all language filters
                          selectedLanguages.forEach(lang => {
                            refine(lang.label)
                          })
                          setQuery('')
                        }}
                        className="flex items-center w-full px-4 py-3 text-base transition-colors text-stone-300 hover:bg-stone-700 hover:text-white"
                      >
                        All languages
                      </button>
                      {filteredItems.length > 0 ? (
                        filteredItems.map((item, index) => (
                          <button
                            key={item.value}
                            data-index={index}
                            onClick={() => {
                              // Toggle the language filter (add if not selected, remove if selected)
                              refine(item.label)
                              setIsLanguageFilterOpen(false)
                              setQuery('')
                            }}
                            className={`flex items-start w-full px-4 py-3 text-base transition-colors text-left ${
                              index === focusedIndex
                                ? 'bg-stone-600 text-white'
                                : 'text-stone-300 hover:bg-stone-700 hover:text-white'
                            }`}
                            role="option"
                            aria-selected={item.isRefined}
                          >
                            <span className="flex-1 min-w-0">
                              <span className="block truncate">{item.label}</span>
                              {/* Native name as secondary line */}
                              {nativeByEnglishRef.current.get(item.label) && (
                                <span className="block truncate text-stone-400/80 text-sm">{nativeByEnglishRef.current.get(item.label)}</span>
                              )}
                            </span>
                            <span className="ml-3 text-stone-400 whitespace-nowrap">{item.count}</span>
                          </button>
                        ))
                      ) : (
                        <div className="px-4 py-6 text-base text-stone-400 text-center">
                          No languages found
                        </div>
                      )}
                    </div>
                  </div>
              )}
          </div>

          {/* Selected language pills with remove buttons */}
          {selectedLanguages.map((language, idx) => (
            <Button
              key={`${language.text}-${idx}`}
              type="button"
              size="sm"
              variant="secondary"
              onClick={() => handleRemoveLanguage(language.text)}
              onMouseDown={(e) => {
                // Prevent input blur when clicking the pill so overlay stays open
                e.preventDefault()
              }}
              className={cn(
                'rounded-full px-3 py-1.5 h-8',
                'bg-red-500/20 hover:bg-red-500/30 text-red-200 border border-red-500/30',
                'inline-flex items-center gap-1.5',
                'flex-shrink-0 hover:scale-105 transition-transform'
              )}
              aria-label={`Remove ${language.text} filter`}
            >
              <span className="text-sm font-normal">{language.text}</span>
              <X className="h-3.5 w-3.5" />
            </Button>
          ))}
        </div>
      </div>
    </Container>
  )
}
