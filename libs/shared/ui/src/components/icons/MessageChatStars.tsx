import { createSvgIcon } from '@mui/material/utils'

// Authored on a 100x100 grid; scaled to the 24x24 SvgIcon viewBox.
export default createSvgIcon(
  <g transform="scale(0.24)">
    <circle
      cx="50"
      cy="50"
      r="46.3"
      fill="none"
      stroke="currentColor"
      strokeWidth={3.4}
    />
    <g transform="translate(5.6,18.2) scale(1.15)">
      <path
        d="M 52 31 V 33 A 11 11 0 0 1 41 44 H 28 L 18 52 L 24 44 H 23 A 11 11 0 0 1 12 33 V 29 A 11 11 0 0 1 23 18 H 37"
        fill="none"
        stroke="currentColor"
        strokeWidth={3.6}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <circle cx="22" cy="31" r="3" fill="currentColor" />
      <circle cx="32" cy="31" r="3" fill="currentColor" />
      <circle cx="42" cy="31" r="3" fill="currentColor" />
      <path
        d="M 52 -1 C 52 3.86 47.86 8 43 8 C 47.86 8 52 12.14 52 17 C 52 12.14 56.14 8 61 8 C 56.14 8 52 3.86 52 -1 Z"
        fill="currentColor"
      />
      <path
        d="M 60 12 C 60 16.86 55.86 21 51 21 C 55.86 21 60 25.14 60 30 C 60 25.14 64.14 21 69 21 C 64.14 21 60 16.86 60 12 Z"
        fill="currentColor"
      />
    </g>
  </g>,
  'MessageChatStars'
)
