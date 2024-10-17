import React, { ReactElement, createContext, useContext, useState } from 'react'

export interface Position {
  x: number
  y: number
}

interface FocalPointContextType {
  focalPoint: Position
  updateFocalPoint: (newPoint: Position) => void
}

const FocalPointContext = createContext<FocalPointContextType | undefined>(
  undefined
)

export function useFocalPoint(): FocalPointContextType {
  const context = useContext(FocalPointContext)
  if (context === undefined) {
    throw new Error('useFocalPoint must be used within a FocalPointProvider')
  }
  return context
}

export function FocalPointProvider({
  children
}: {
  children: React.ReactNode
}): ReactElement {
  const [focalPoint, setFocalPoint] = useState<Position>({ x: 50, y: 50 })

  function updateFocalPoint(newPoint: Position): void {
    setFocalPoint(newPoint)
  }

  return (
    <FocalPointContext.Provider value={{ focalPoint, updateFocalPoint }}>
      {children}
    </FocalPointContext.Provider>
  )
}
