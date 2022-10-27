import { ReactElement, ReactNode } from 'react'
import { useTheme } from '@mui/material/styles'
import Box from '@mui/material/Box'

interface ContentOverlayProps {
  children: ReactNode
  backgroundColor: string
  backgroundSrc?: string
}

export function ContentOverlay({
  children,
  backgroundColor,
  backgroundSrc
}: ContentOverlayProps): ReactElement {
  const theme = useTheme()

  return (
    <>
      {/*  Mobile overlay */}
      <Box
        sx={{
          display: { xs: 'flex', md: 'none' },
          flexDirection: 'column',
          clipPath: {
            xs: 'polygon(0 6vw, 100% 0, 100% 100%, 0 100%)',
            sm:
              theme.direction !== 'rtl'
                ? 'polygon(7% 0, 100% 0, 100% 100%, 0 100%)'
                : 'polygon(0 0, 93% 0%, 100% 100%, 0 100%)'
          },
          marginTop: { xs: '-6vw', sm: 0 },
          marginLeft: { xs: 0, sm: '-6vh' },
          paddingLeft: { sm: `6vh` },
          width: { xs: 'auto', sm: '50%' },
          overflow: 'hidden',
          position: 'relative',
          borderTopRightRadius: { sm: theme.spacing(4) },
          borderBottomRightRadius: { sm: theme.spacing(4) },
          // Set to maintain RTL
          marginRight: 0,
          paddingRight: 0,
          borderTopLeftRadius: 0,
          borderBottomLeftRadius: 0
        }}
      >
        <Box
          sx={{
            my: 'auto',
            p: {
              xs: `calc(6vw + ${theme.spacing(4)}) ${theme.spacing(
                7
              )} ${theme.spacing(7)}`,
              sm: theme.spacing(7, 8, 7, 4)
            },
            overflow: 'auto',
            '& > *': {
              '&:first-child': { mt: 0 },
              '&:last-child': { mb: 0 }
            }
          }}
        >
          {children}
        </Box>
        <Box
          sx={{
            position: 'absolute',
            width: '100%',
            height: '110%',
            backgroundRepeat: 'no-repeat',
            backgroundSize: '100% 100%',
            backgroundPosition: '0% 0%',
            left: 0,
            top: '-10%',
            zIndex: -1,
            transform: 'scaleY(-1)',
            backgroundBlendMode: 'hard-light',
            backgroundColor:
              backgroundSrc == null ? backgroundColor : undefined,
            backgroundImage:
              backgroundSrc != null
                ? `url(${backgroundSrc}), url(${backgroundSrc})`
                : undefined
          }}
        />
      </Box>
      {/* Desktop overlay */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          display: { xs: 'none', md: 'flex' },
          flexDirection: 'column',
          justifyContent: 'center'
        }}
      >
        <Box
          sx={{
            overflow: 'auto',
            pr: 9,
            pl: 0,
            py: 7,
            width: 300
          }}
        >
          <Box
            sx={{
              borderRadius: theme.spacing(4),
              overflow: 'hidden'
            }}
            className="box"
          >
            <Box
              sx={{
                backgroundSize: 'cover',
                position: 'relative',
                marginTop: '-40px',
                marginBottom: '40px',
                borderRadius: theme.spacing(4),
                paddingTop: `calc(40px + ${theme.spacing(7)})`,
                paddingBottom: `calc(20px + ${theme.spacing(4)})`,
                transform: 'skewY(-10deg)',
                overflow: 'hidden'
              }}
            >
              <Box
                sx={{
                  transform: 'skewY(10deg)',
                  px: 7,
                  '& > *': {
                    '&:first-child': { mt: 0 },
                    '&:last-child': { mb: 0 }
                  }
                }}
              >
                {children}
              </Box>
              <Box
                sx={{
                  position: 'absolute',
                  width: '100%',
                  height: '110%',
                  backgroundRepeat: 'no-repeat',
                  backgroundSize: '100% 100%',
                  backgroundPosition: '0% 0%',
                  backgroundColor:
                    backgroundSrc == null ? backgroundColor : undefined,
                  backgroundImage:
                    backgroundSrc != null
                      ? `url(${backgroundSrc}), url(${backgroundSrc})`
                      : undefined,
                  left: 0,
                  top: '-10%',
                  zIndex: -1,
                  transform: 'scaleY(-1)',
                  backgroundBlendMode: 'hard-light',
                  opacity: 0.9
                }}
              />
            </Box>
          </Box>
        </Box>
      </Box>
    </>
  )
}
