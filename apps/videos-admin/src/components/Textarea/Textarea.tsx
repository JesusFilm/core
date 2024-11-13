import { TextareaAutosize } from '@mui/base/TextareaAutosize'
import { alpha, styled } from '@mui/material/styles'
// import styled from '@mui/system/styled'

import { brand, grey } from '../../theme/themePrimitives'

const blue = {
  100: '#DAECFF',
  200: '#b6daff',
  400: '#3399FF',
  500: '#007FFF',
  600: '#0072E5',
  900: '#003A75'
}

export const Textarea = styled(TextareaAutosize)(
  ({ theme }) => `
  box-sizing: border-box;
  width: 320px;
  font-family: 'IBM Plex Sans', sans-serif;
  font-size: 0.875rem;
  font-weight: 400;
  line-height: 1.5;
  padding: 8px 12px;
  border-radius: 8px;
  color: ${theme.palette.mode === 'dark' ? grey[300] : grey[900]};
  background: ${
    theme.palette.mode === 'dark' ? theme.palette.background.default : '#fff'
  };
  border: 1px solid ${theme.palette.mode === 'dark' ? grey[700] : grey[200]};
  box-shadow: 0px 2px 2px ${
    theme.palette.mode === 'dark' ? grey[900] : grey[50]
  };

  &:hover {
    border-color: ${theme.palette.mode === 'dark' ? grey[500] : grey[400]};
  }

  &:focus {
    border-color: ${brand[500]};
    box-shadow: 0 0 0 3px ${
      theme.palette.mode === 'dark' ? alpha(brand[500], 0.5) : blue[200]
    };
  }

  // firefox
  &:focus-visible {
    outline: 0;
  }
`
)
