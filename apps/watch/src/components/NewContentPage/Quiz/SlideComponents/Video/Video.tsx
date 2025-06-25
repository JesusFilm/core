import Box from '@mui/material/Box'

interface VideoProps {
  src: string
}

export function Video({ src }: VideoProps) {
  return (
    <Box>
      <video src={src} autoPlay muted loop />
    </Box>
  )
}
