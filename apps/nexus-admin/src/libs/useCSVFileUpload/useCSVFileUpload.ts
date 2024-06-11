import { useState } from 'react'

export const useCSVFileUpload = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0])
  }

  const openFileDialog = () => {
    const input = document.createElement('input')
    input.setAttribute('type', 'file')
    input.setAttribute('accept', '.csv')
    input.addEventListener('change', handleFileChange)
    input.click()
  }

  const resetFile = () => {
    setSelectedFile(null)
  }

  return [selectedFile, openFileDialog, resetFile]
}
