import { useState } from 'react'

export const useCSVFileUpload = (): [File | null, () => void, () => void] => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const handleFileChange = (event: Event): void => {
    setSelectedFile((event.target as HTMLInputElement).files?.[0] ?? null)
  }

  const openFileDialog = (): void => {
    const input = document.createElement('input')
    input.setAttribute('type', 'file')
    input.setAttribute('accept', '.csv')
    input.addEventListener('change', handleFileChange)
    input.click()
  }

  const resetFile = (): void => {
    setSelectedFile(null)
  }

  return [selectedFile, openFileDialog, resetFile]
}
