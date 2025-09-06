"use client"

import { useMemo, useCallback, useEffect, useRef, useState } from 'react'
import { useInstantSearch, useRefinementList } from 'react-instantsearch'
import { Button } from '@/components/ui/button'
import { Search, ChevronDown } from 'lucide-react'
import { useAlgoliaClient } from '@/components/providers/instantsearch'

type LanguageItem = {
  label: string
  value: string
  count: number
  isRefined: boolean
}

export function LanguageFilter() {
  // Pull facet values for languages from Algolia
  const { items } = useRefinementList({
    attribute: 'languageEnglishName',
    limit: 5000,
    // showMore: true,
    // showMoreLimit: 5000
  }) as unknown as { items: LanguageItem[] }

  // Access InstantSearch to surgically update UI state
  const { setIndexUiState } = useInstantSearch()

  // Compute current selection (first refined language if any)
  const current = useMemo(() => {
    const refined = items?.find((i) => i.isRefined)
    return refined?.label ?? ''
  }, [items])

  const setLanguage = useCallback(
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

  // Dropdown state matching Header design
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [focusedIndex, setFocusedIndex] = useState(-1)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Reuse Algolia client from provider (same instance as InstantSearch)
  const { searchClient: client, indexName } = useAlgoliaClient()

  // Using Algolia v5 client directly (no initIndex in v5)

  // Cache of native (primary) names keyed by English name
  const nativeByEnglishRef = useRef(new Map<string, string>())
  const [, forceNativeMapRerender] = useState(0)

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

  // Filter list by query — match English and Native names
  const [extraEnglishFromNative, setExtraEnglishFromNative] = useState<string[]>([])

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

  // Outside click close
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false)
        setQuery('')
        setFocusedIndex(-1)
      }
    }
    if (open) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  useEffect(() => {
    setFocusedIndex(-1)
  }, [open, query])

  // When dropdown opens or the visible list changes, prefetch native names for visible items
  useEffect(() => {
    if (!open) return
    const source = query.trim() ? filteredItems : items ?? []
    const englishValues = source.slice(0, 60).map((i) => i.label)
    const missing = englishValues.filter((en) => !nativeByEnglishRef.current.has(en))
    if (missing.length > 0) void prefetchNativeForEnglish(missing)
  }, [open, items, filteredItems, query, prefetchNativeForEnglish])

  // Debounced native-name search to support searching by native names too
  useEffect(() => {
    let cancelled = false
    const run = async () => {
      const q = query.trim()
      if (!open || !q || !client || !indexName) {
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
        let res = await client.search({ requests } as any)
        let englishFromNative: string[] = []
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
  }, [open, query, client, indexName])

  useEffect(() => {
    if (focusedIndex >= 0 && dropdownRef.current) {
      const el = dropdownRef.current.querySelector(`[data-index="${focusedIndex}"]`) as HTMLElement | null
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
        setLanguage(selected.label)
        setOpen(false)
        setQuery('')
      }
    }
  }

  return (
    <div className="relative text-sm text-foreground/90">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 text-white/80 hover:text-white hover:bg-white/10"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Open language filter"
      >
        <span className="text-sm font-medium">
          {current || 'Language'}
        </span>
        <ChevronDown className="h-4 w-4" />
      </Button>

      {open && (
        <div
          ref={dropdownRef}
          className="absolute right-0 mt-2 w-80 bg-background/95 dark:bg-neutral-900/95 backdrop-blur-md rounded-xl shadow-xl border border-border py-3 z-50"
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
                setLanguage('')
                setOpen(false)
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
                    setLanguage(item.label)
                    setOpen(false)
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
  )
}
