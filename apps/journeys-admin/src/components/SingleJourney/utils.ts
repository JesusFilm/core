import { useState, useEffect } from 'react'

export function screenSize() {
  const theme = useTheme()
  const [width, setWidth] = useState(window.innerWidth)
  const [height, setHeight] = useState(window.innerHeight)
  const breakpoints = useBreakpoints()

  useEffect(() => {
    const updateWidth = (): void => {
      setWidth(window.innerWidth)
      setHeight(window.innerHeight)
    }

    window.addEventListener('resize', updateWidth)
    return () => window.removeEventListener('resize', updateWidth)
  }, [])
}
