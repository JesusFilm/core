import { useState } from 'react'

interface UseContinentLanguages {
  selectedLanguagesByContinent?: Record<string, string[]>
  selectLanguageForContinent: (
    continent: string,
    language: string,
    isRefined: boolean
  ) => void
  removeLanguageFromAllContinents: (language: string) => void
}

export function useContinentLanguages(): UseContinentLanguages {
  const [selectedLanguagesByContinent, setSelectedLanguagesByContinent] =
    useState<Record<string, string[]>>()

  function selectLanguageForContinent(
    continent: string,
    language: string,
    isRefined: boolean
  ): void {
    const currentLanguages = selectedLanguagesByContinent?.[continent] ?? []
    const updatedLanguages = isRefined
      ? [...currentLanguages, language]
      : currentLanguages.filter((lang) => lang !== language)

    setSelectedLanguagesByContinent({
      ...selectedLanguagesByContinent,
      [continent]: updatedLanguages
    })
  }

  function removeLanguageFromAllContinents(language: string): void {
    const updatedLanguages = Object.entries(
      selectedLanguagesByContinent ?? {}
    ).reduce(
      (acc, [continent, languages]) => ({
        ...acc,
        [continent]: languages.filter((lang) => lang !== language)
      }),
      {}
    )
    setSelectedLanguagesByContinent(updatedLanguages)
  }

  return {
    selectedLanguagesByContinent,
    selectLanguageForContinent,
    removeLanguageFromAllContinents
  }
}
