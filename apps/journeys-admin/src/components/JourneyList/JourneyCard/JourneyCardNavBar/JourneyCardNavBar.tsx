import { ReactElement } from 'react'
import * as React from 'react';
import { AppBar, Box, Button, Toolbar, Typography } from '@mui/material'
import Link from 'next/link'

export default function JourneyCardNavBar(): ReactElement {
  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static" sx={{ backgroundColor:(theme)=> theme.palette.background.default }}>
        <Toolbar>
          <Box my={2}>
            <Link href={`/journeys`} passHref>
              <Button variant="text" fullWidth>
                &#60;
              </Button>
            </Link>
          </Box>
          <Typography variant="h6" component="div" sx={{  color: "black"}}>
            Journeys
          </Typography>
        </Toolbar>
      </AppBar>
    </Box>
  );
}