import { useEffect, useState } from 'react'

function getStorageValue<T>(key: string, defaultValue: T) {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(key)

    if (saved == null) {
      return defaultValue
    }

    const initial = JSON.parse(saved)

    return initial
  }
}

export function useLocalStorage<T>(key: string, defaultValue: T) {
  const [value, setValue] = useState(() => getStorageValue(key, defaultValue))

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value))
  }, [key, value])

  return [value, setValue]
}
