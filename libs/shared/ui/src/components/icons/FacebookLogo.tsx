import { createSvgIcon } from '@mui/material/utils'

export default createSvgIcon(
  <>
    <defs>
      <linearGradient id="fbGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" style={{ stopColor: '#18ACFE', stopOpacity: 1 }} />
        <stop offset="100%" style={{ stopColor: '#0163E0', stopOpacity: 1 }} />
      </linearGradient>
    </defs>
    <circle cx="12" cy="12" r="10" fill="url(#fbGrad)" />
    <path
      d="M 15.9103 15.2112 L 16.3767 12.2476 H 13.4589 V 10.3253 C 13.4589 9.5143 13.8658 8.7233 15.1727 8.7233 H 16.5 V 6.2002 C 16.5 6.2002 15.2959 6 14.1452 6 C 11.7411 6 10.1713 7.4197 10.1713 9.9888 V 12.2476 H 7.5 V 15.2112 H 10.1713 V 22.3759 C 10.7075 22.458 11.2561 22.5 11.815 22.5 C 12.374 22.5 12.9227 22.458 13.4589 22.3759 V 15.2112 H 15.9103 Z"
      fill="white"
    />
  </>,
  'FacebookLogo'
)
