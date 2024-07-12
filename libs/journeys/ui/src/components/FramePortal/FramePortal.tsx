import createCache from '@emotion/cache'
import { CacheProvider } from '@emotion/react'
import Box from '@mui/material/Box'
import { styled } from '@mui/material/styles'
import isFunction from 'lodash/isFunction'
import {
  ComponentProps,
  ReactElement,
  ReactNode,
  useEffect,
  useMemo
} from 'react'
import Frame, { FrameContextConsumer } from 'react-frame-component'
import { prefixer } from 'stylis'
import rtlPlugin from 'stylis-plugin-rtl'

interface ContentProps {
  children: ReactNode
  dir: string | undefined
  document: Document
}

function Cache({ children, dir, document }: ContentProps): ReactElement {
  const cache = useMemo(() => {
    document.head.innerHTML = `<link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@600;800&family=Open+Sans&family=El+Messiri:wght@400;600;700&display=swap" rel="stylesheet" />`
    return createCache({
      key: 'iframe',
      container: document.head,
      prepend: true,
      stylisPlugins: document.dir === 'rtl' ? [prefixer, rtlPlugin] : []
    })
  }, [document])

  useEffect(() => {
    document.dir = dir ?? 'ltr'
    document.body.style.backgroundColor = 'transparent'
  }, [document, dir])

  return (
    <CacheProvider value={cache}>
      <Box sx={{ position: 'fixed', top: 0, right: 0, bottom: 0, left: 0 }}>
        {children}
      </Box>
    </CacheProvider>
  )
}

const StyledFrame = styled(Frame)(() => ({
  border: 0
}))

interface FrameProps
  extends Omit<ComponentProps<typeof StyledFrame>, 'children'> {
  children:
    | ((props: { window: Window; document: Document }) => ReactNode)
    | ReactNode
}

export function FramePortal({
  children,
  dir,
  ...rest
}: FrameProps): ReactElement {
  return (
    <StyledFrame {...rest}>
      <FrameContextConsumer>
        {({ window, document }) =>
          window != null &&
          document != null && (
            <Cache dir={dir} document={document}>
              {isFunction(children) ? children({ window, document }) : children}
            </Cache>
          )
        }
      </FrameContextConsumer>
    </StyledFrame>
  )
}
