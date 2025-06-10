import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import { alpha, styled } from '@mui/material/styles'
import SvgIcon from '@mui/material/SvgIcon'
import Typography from '@mui/material/Typography'
import Image from 'next/image'
import { ReactElement } from 'react'
import { A11y, FreeMode, Mousewheel } from 'swiper/modules'
import { Swiper, SwiperSlide } from 'swiper/react'

import { VideoContentFields_bibleCitations as BibleCitation } from '../../../../__generated__/VideoContentFields'

const DEFAULT_COLLECTION_ID = '4924556'

const StyledSwiper = styled(Swiper)({})
const StyledSwiperSlide = styled(SwiperSlide)({ maxWidth: '400px' })
const CitationCard = styled(Stack)({
  boxSizing: 'border-box',
  height: '400px',
  width: '400px',
  justifyContent: 'flex-end',
  borderRadius: 8,
  maskSize: 'cover',
  backgroundColor: 'rgba(0, 0, 0, 0.1)',
  border: '1px solid rgba(255, 255, 255, 0.1)'
})

interface FreeResourceProps {
  imageUrl?: string
  bgColor?: string
  heading: string
  text: string
  cta?: { label: string; onClick: () => void; icon?: typeof SvgIcon }
}

function FreeResourceCard({
  imageUrl,
  bgColor,
  heading,
  text,
  cta
}: FreeResourceProps): ReactElement {
  const { icon: CtaIcon } = cta ?? {}

  return (
    <CitationCard>
      <Stack sx={{ p: 8, alignItems: 'flex-start' }}>
        <Typography variant="subtitle1" sx={{ textTransform: 'uppercase' }}>
          {heading}
        </Typography>
        <Typography variant="h5" sx={{ mt: 2, mb: 4 }}>
          {text}
        </Typography>
        {cta != null && (
          <Button
            role="link"
            size="xsmall"
            startIcon={CtaIcon ? <CtaIcon fontSize="small" /> : undefined}
            onClick={cta.onClick}
            sx={{
              bgcolor: 'common.white',
              color: 'common.black',
              borderRadius: 8,
              fontWeight: 'bold',
              textTransform: 'uppercase',
              '&:hover': {
                backgroundColor: ({ palette }) =>
                  alpha(palette.common.white, 0.8)
              }
            }}
          >
            {cta.label}
          </Button>
        )}
      </Stack>
    </CitationCard>
  )
}

interface BibleCitationsProps {
  bibleCitations: BibleCitation[]
  freeResource?: FreeResourceProps
}

export function BibleCitations({
  bibleCitations,
  freeResource
}: BibleCitationsProps): ReactElement {
  return (
    <Stack
      direction="row"
      spacing={2}
      sx={{ zIndex: 1 }}
      data-testid="BibleCitations"
    >
      <StyledSwiper
        modules={[Mousewheel, FreeMode, A11y]}
        grabCursor
        observeParents
        mousewheel={{
          forceToAxis: true
        }}
        watchOverflow
        slidesPerView={'auto'}
        pagination={{ clickable: true }}
        spaceBetween={48}
        sx={{
          width: '100%'
        }}
      >
        {bibleCitations.map((citation, i) => (
          <StyledSwiperSlide key={i}>
            <CitationCard>
              <Box sx={{ p: 8 }}>
                {/* <Image
                  fill
                  src={`https://source.unsplash.com/random`}
                  alt="Bible Citation"
                  style={{
                    objectFit: 'cover'
                  }}
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                /> */}

                <Typography
                  sx={{
                    fontFamily: 'Montserrat',
                    fontSize: '.75rem',
                    fontWeight: 'bold',
                    textTransform: 'uppercase',
                    color: ({ palette }) => alpha(palette.common.white, 0.8)
                  }}
                >{`${citation.bibleBook.name[0].value} ${citation.chapterStart}:${citation.verseStart}`}</Typography>
              </Box>
            </CitationCard>
          </StyledSwiperSlide>
        ))}
        {freeResource != null && (
          <StyledSwiperSlide key="free-resource">
            <FreeResourceCard {...freeResource} />
          </StyledSwiperSlide>
        )}
      </StyledSwiper>
    </Stack>
  )
}
