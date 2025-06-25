import Stack from '@mui/material/Stack'
import { Action, ActionMetadata } from '../../SlideComponents/Action'
import { SlideWrapper } from '../../SlideComponents/SlideWrapper'
import Typography from '@mui/material/Typography'
import {
  HeadingMetadata,
  Headings
} from '../../SlideComponents/Headings/Headings'

interface OptionsProps {
  bgImage?: string
  bgColor?: string
  headings: HeadingMetadata[]
  options: ActionMetadata[]
}

export function Options({ bgImage, bgColor, headings, options }: OptionsProps) {
  const setHoveredIdx = (idx: number) => {}

  return (
    <SlideWrapper bgImage={bgImage} bgColor={bgColor}>
      <Headings headings={headings} />
      <Stack
        role="listbox"
        sx={{
          flexDirection: 'row',
          justifyContent: 'center',
          gap: 8,
          width: '100%'
        }}
      >
        {options.map((action, i) => (
          <Action
            key={i}
            idx={i}
            onHover={() => setHoveredIdx(i)}
            {...action}
          />
        ))}
      </Stack>
    </SlideWrapper>
  )
}
