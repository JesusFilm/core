import debounce from 'lodash/debounce'
import React, {
  ReactElement,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState
} from 'react'

interface FocalPoint {
  x: number
  y: number
}

interface FocalPointContextType {
  focalPoint: FocalPoint
  updateFocalPoint: (newPoint: FocalPoint) => void
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
  const [focalPoint, setFocalPoint] = useState<FocalPoint>({ x: 50, y: 50 })

  const debouncedSave = useCallback(
    debounce((point: FocalPoint) => {
      console.log('TODO - save in database:', point)
    }, 2000),
    []
  )

  const updateFocalPoint = useCallback(
    (newPoint: FocalPoint) => {
      setFocalPoint(newPoint)
      debouncedSave(newPoint)
    },
    [debouncedSave]
  )

  useEffect(() => {
    return () => {
      debouncedSave.cancel()
    }
  }, [debouncedSave])

  return (
    <FocalPointContext.Provider value={{ focalPoint, updateFocalPoint }}>
      {children}
    </FocalPointContext.Provider>
  )
}
