import Fab from '@mui/material/Fab'
import { ReactElement, useEffect, useState } from 'react'

import HelpCircleContained from '@core/shared/ui/icons/HelpCircleContained'
import { useRouter } from 'next/router'
import XCircleContained from '@core/shared/ui/icons/XCircleContained'

export function HelpScoutFab(): ReactElement {
    const router = useRouter()
    const [loaded, setLoaded] = useState(false)
    const [beaconOpen, setBeaconOpen] = useState(false)

    function handleBeaconToggle(): void {
        if (window.Beacon != null) {
            window.Beacon('on', 'open', () => {
                setBeaconOpen(true)
            })
            window.Beacon('on', 'close', () => {
                setBeaconOpen(false)
            })
        }
    }

    useEffect(() => {
        handleBeaconToggle()
    }, [loaded, setBeaconOpen])

    const handleBeaconClick = (): void => {
        if (window.Beacon != null) {
            handleBeaconToggle()
            window.Beacon('toggle')
        } else {
            void router.push('https://support.nextstep.is/')
        }
    }

    return (
        <Fab
            variant="extended"
            size="large"
            color="primary"
            onClick={handleBeaconClick}
            sx={{
                height: 48,
                width: 48,
                zIndex: 3,
                display: { xs: 'flex', md: 'none' }
            }}
            data-testid="HelpScoutFab"
        >
            {beaconOpen ? <XCircleContained /> : <HelpCircleContained />}
        </Fab>
    )
}
