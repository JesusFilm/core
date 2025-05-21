import Stack from '@mui/material/Stack'
import Typography, { TypographyProps } from '@mui/material/Typography'

export interface HeadingMetadata {
  variant: TypographyProps['variant']
  text: string
}

interface HeadingsProps {
  headings: HeadingMetadata[]
}

export function Headings({ headings }: HeadingsProps) {
  return (
    <Stack
      sx={{
        alignItems: 'center',
        width: '100%'
      }}
    >
      {headings.map((heading, i) => (
        <Typography
          key={i}
          variant={heading.variant}
          color="white"
          sx={{
            textAlign: 'center',
            mixBlendMode: 'difference',
            fontWeight: 'bold',
            fontFamily: 'var(--font-noto-serif)'
          }}
        >
          {heading.text}
        </Typography>
      ))}
    </Stack>
  )
}
