import { useMutation } from '@apollo/client/react'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import { SxProps, useTheme } from '@mui/material/styles'
import { sendGTMEvent } from '@next/third-parties/google'
import { ReactElement, useEffect } from 'react'
import { v4 as uuidv4 } from 'uuid'

import { ThemeProvider } from '@core/shared/ui/ThemeProvider'
import { ThemeName } from '@core/shared/ui/themes'

import { VisitorUpdateInput } from '../../../__generated__/globalTypes'
import { blockHistoryVar, useBlocks } from '../../libs/block/block'
import { getStepTheme } from '../../libs/block/getStepTheme'
import { TreeBlock } from '../../libs/block/TreeBlock'
import { useJourney } from '../../libs/JourneyProvider/JourneyProvider'
import { getJourneyRTL } from '../../libs/rtl/rtl'
import { BlockRenderer } from '../BlockRenderer/BlockRenderer'
import { JourneyViewEventCreate } from '../Conductor/__generated__/JourneyViewEventCreate'
import {
  JOURNEY_VIEW_EVENT_CREATE,
  JOURNEY_VISITOR_UPDATE
} from '../Conductor/Conductor'
import { StepFields } from '../Step/__generated__/StepFields'
import { StepFooter } from '../StepFooter/StepFooter'
import { StepHeader } from '../StepHeader/StepHeader'

interface WebsiteViewProps {
  blocks: TreeBlock[]
  stepBlock: TreeBlock<StepFields>
}
export function WebsiteView({
  blocks,
  stepBlock
}: WebsiteViewProps): ReactElement {
  const { setTreeBlocks, blockHistory } = useBlocks()
  const { journey, renderMode } = useJourney()
  const { locale, rtl } = getJourneyRTL(journey)
  const theme = useTheme()

  const activeBlock = blockHistory[blockHistory.length - 1] as
    | TreeBlock<StepFields>
    | undefined

  const cardBlock = activeBlock?.children[0]
  const coverBlockId =
    cardBlock?.__typename === 'CardBlock' ? cardBlock.coverBlockId : undefined
  const hasVideoBlock =
    cardBlock?.children.some(
      (block) => block.__typename === 'VideoBlock' && block.id !== coverBlockId
    ) ?? false

  const [journeyViewEventCreate] = useMutation<JourneyViewEventCreate>(
    JOURNEY_VIEW_EVENT_CREATE
  )

  const [journeyVisitorUpdate] = useMutation<VisitorUpdateInput>(
    JOURNEY_VISITOR_UPDATE
  )

  useEffect(() => {
    setTreeBlocks(blocks)
    blockHistoryVar([stepBlock])
    // multiple re-renders causes block history to be incorrect so do not pass in 'blocks' variable to deps array
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stepBlock, setTreeBlocks])

  useEffect(() => {
    if (
      (renderMode === 'default' || renderMode === 'embed') &&
      journey != null
    ) {
      const id = uuidv4()
      void journeyViewEventCreate({
        variables: {
          input: {
            id,
            journeyId: journey.id,
            label: journey.title,
            value: journey.language.id
          }
        }
      }).then(() => {
        void fetch('/api/geolocation').then((response) => {
          void response
            .json()
            .then(
              (data: { city?: string; country?: string; region?: string }) => {
                const countryCodes: string[] = []
                if (data.city != null) countryCodes.push(decodeURI(data.city))
                if (data.region != null) countryCodes.push(data.region)
                if (data.country != null) countryCodes.push(data.country)

                if (countryCodes.length > 0 || document.referrer !== '') {
                  void journeyVisitorUpdate({
                    variables: {
                      input: {
                        countryCode:
                          countryCodes.length > 0
                            ? countryCodes.join(', ')
                            : undefined,
                        referrer:
                          document.referrer !== ''
                            ? document.referrer
                            : undefined
                      }
                    }
                  })
                }
              }
            )
        })
      })
      sendGTMEvent({
        event: 'journey_view',
        journeyId: journey.id,
        eventId: id,
        journeyTitle: journey.title
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [journey])

  const mobileNotchStyling: SxProps = {
    width: {
      xs:
        renderMode === 'default' || renderMode === 'embed'
          ? 'calc(100% - env(safe-area-inset-left) - env(safe-area-inset-right))'
          : '100%',
      lg: 'auto'
    },
    left:
      renderMode === 'default' || renderMode === 'embed'
        ? 'env(safe-area-inset-left)'
        : undefined,
    right:
      renderMode === 'default' || renderMode === 'embed'
        ? 'env(safe-area-inset-right)'
        : undefined
  }

  const renderedBlock =
    renderMode === 'preview' ? (activeBlock ?? stepBlock) : stepBlock
  const stepTheme = getStepTheme(renderedBlock, journey)

  const STEP_HEADER_HEIGHT = '44px'
  const STEP_FOOTER_HEIGHT = '68px'

  return (
    <ThemeProvider
      themeName={ThemeName.journeyUi}
      themeMode={stepTheme.themeMode}
      locale={locale}
      rtl={rtl}
      nested
    >
      <Container
        data-testid="WebsiteView"
        maxWidth="xl"
        disableGutters
        sx={{
          justifyContent: 'center',
          height: '100svh',
          background: theme.palette.grey[900]
        }}
      >
        <StepHeader
          sx={{
            ...mobileNotchStyling,
            display: 'flex',
            px: { xs: 6, lg: 8 }
          }}
        />
        <ThemeProvider {...stepTheme} locale={locale} rtl={rtl} nested>
          <Box
            className="active-card"
            sx={{
              height: '100%',
              marginTop: { lg: `-${STEP_HEADER_HEIGHT}` },
              marginBottom: { lg: `-${STEP_FOOTER_HEIGHT}` }
            }}
          >
            <BlockRenderer block={renderedBlock} />
          </Box>
        </ThemeProvider>
        {!hasVideoBlock && (
          <StepFooter
            sx={{
              ...mobileNotchStyling,
              display: 'flex',
              px: { lg: 8 }
            }}
          />
        )}
      </Container>
    </ThemeProvider>
  )
}
