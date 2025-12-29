import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import { ReactElement, useState } from 'react'
import { EDIT_TOOLBAR_HEIGHT } from '../constants'
import { JourneyFlow } from './JourneyFlow'
import { Content } from './Content'
import { Settings } from './Settings'

export function LayeredView(): ReactElement {
  const [showItem1, setShowItem1] = useState(false)
  const [showItem2, setShowItem2] = useState(false)

  const handleMainBodyClick = () => {
    if (!showItem1) {
      setShowItem1(true)
    }
  }

  const handleItem1Click = () => {
    if (!showItem2) {
      setShowItem2(true)
    }
  }

  const handleMainBodyClose = (event: React.MouseEvent) => {
    event.stopPropagation()
    setShowItem1(false)
    setShowItem2(false)
  }

  const handleItem1Close = (event: React.MouseEvent) => {
    event.stopPropagation()
    setShowItem1(false)
    setShowItem2(false)
  }

  const handleItem2Close = (event: React.MouseEvent) => {
    event.stopPropagation()
    setShowItem2(false)
  }

  return (
    <Box
      sx={{
        width: '100%',
        height: `calc(100svh - ${EDIT_TOOLBAR_HEIGHT}px)`,
        position: 'relative'
      }}
    >
      <JourneyFlow />
      {/* <Box
        data-testid="main body"
        onClick={handleMainBodyClick}
        sx={{
          width: '100%',
          height: '100%',
          backgroundColor: 'red',
          cursor: showItem1 ? 'default' : 'pointer',
          position: 'relative'
        }}
      >
        {showItem1 && (
          <Button
            onClick={handleMainBodyClose}
            sx={{
              position: 'absolute',
              top: 8,
              left: 8,
              zIndex: 20,
              minWidth: 'auto',
              padding: '4px 8px'
            }}
          >
            Close All
          </Button>
        )}
      </Box> */}
      <Content />
      {/* {showItem1 && (
        <Box
          data-testid="item 1"
          position="absolute"
          top={0}
          right={showItem2 ? '100px' : 0}
          onClick={handleItem1Click}
          sx={{
            height: '100px',
            width: '100px',
            backgroundColor: 'blue',
            zIndex: 10,
            cursor: showItem2 ? 'default' : 'pointer',
            transition: 'right 0.3s ease-in-out'
          }}
        >
          <Button
            onClick={handleItem1Close}
            sx={{
              position: 'absolute',
              top: 4,
              right: 4,
              zIndex: 20,
              minWidth: 'auto',
              padding: '2px 4px',
              fontSize: '10px'
            }}
          >
            ×
          </Button>
        </Box>
      )} */}
      {showItem1 && (
        <Settings />
        // <Box
        //   data-testid="item 2"
        //   position="absolute"
        //   top={0}
        //   right={0}
        //   sx={{
        //     height: '100px',
        //     width: '100px',
        //     backgroundColor: 'green',
        //     zIndex: 10,
        //     transform: showItem2 ? 'translateX(0)' : 'translateX(100%)',
        //     transition: 'transform 0.3s ease-in-out',
        //     pointerEvents: showItem2 ? 'auto' : 'none'
        //   }}
        // >
        //   {showItem2 && (
        //     <Button
        //       onClick={handleItem2Close}
        //       sx={{
        //         position: 'absolute',
        //         top: 4,
        //         right: 4,
        //         zIndex: 20,
        //         minWidth: 'auto',
        //         padding: '2px 4px',
        //         fontSize: '10px'
        //       }}
        //     >
        //       ×
        //     </Button>
        //   )}
        // </Box>
      )}
    </Box>
  )
}
