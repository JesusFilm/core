import Box from '@mui/material/Box'
import { ReactElement } from 'react'

export function CountryFlag({
  code,
  countryName,
  size = 20
}: {
  code: string | null
  countryName?: string
  size?: number
}): ReactElement | null {
  return code ? (
    <Box
      component="span"
      sx={{
        display: 'flex',
        alignItems: 'center',
        mr: 1,
        width: 20
      }}
    >
      <img
        loading="lazy"
        width={size}
        height={size * 0.75}
        src={`https://flagcdn.com/w${size}/${code.toLowerCase()}.png`}
        srcSet={`https://flagcdn.com/w${size * 2}/${code.toLowerCase()}.png 2x`}
        alt={countryName ? `${countryName} flag` : 'Country flag'}
        style={{ marginRight: 8 }}
      />
    </Box>
  ) : null
}
