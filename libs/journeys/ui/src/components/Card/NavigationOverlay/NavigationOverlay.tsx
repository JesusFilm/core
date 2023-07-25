import { ReactElement } from 'react'
import Box from '@mui/material/Box'
import { useBlocks } from '../../../libs/block'

export function NavigationOverlay(): ReactElement {
  const { setShowNavigation, nextActiveBlock, prevActiveBlock } = useBlocks()

  function handleNav(direction: 'next' | 'prev'): void {
    console.log('clicked overlay')
    if (direction === 'next') {
      nextActiveBlock()
    } else {
      prevActiveBlock()
    }
  }

  return (
    <>
      <Box
        data-testid="prev-navigation-overlay"
        onMouseOver={() => {
          console.log('mouse over prev')
          setShowNavigation(true)
        }}
        onClick={() => handleNav('prev')}
        sx={{
          position: 'absolute',
          top: { xs: '20%', sm: '32%', md: '20%' },
          bottom: 0,
          left: 0,
          display: 'flex',
          width: { xs: 82, lg: 114 },
          height: { xs: '55%', sm: '25%', md: '60%', lg: '59%' },
          backgroundColor: 'red',
          pointerEvents: 'all'
        }}
      />
      <Box
        data-testid="next-navigation-overlay"
        onMouseOver={() => {
          console.log('mouse over next')
          setShowNavigation(true)
        }}
        onClick={() => handleNav('next')}
        sx={{
          position: 'absolute',
          top: { xs: '20%', sm: '32%', md: '20%' },
          bottom: 0,
          right: 0,
          display: 'flex',
          width: { xs: 82, lg: 114 },
          height: { xs: '55%', sm: '25%', md: '60%', lg: '59%' },
          backgroundColor: 'red',
          pointerEvents: 'all'
        }}
      />
    </>
  )
}
