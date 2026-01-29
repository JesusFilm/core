import { ReactElement } from "react";
import { HelpScoutBeacon } from "../HelpScoutBeacon";
import { useTranslation } from "next-i18next";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import Typography from "@mui/material/Typography";
import { useUser } from "next-firebase-auth";

export function SidePanelTitle(): ReactElement {
    const { t } = useTranslation('apps-journeys-admin')
    const theme = useTheme()
    const user = useUser()
    const mdUp = useMediaQuery(theme.breakpoints.up('md'), { noSsr: true })

    const userInfo = {
        name: user?.displayName ?? '',
        email: user?.email ?? ''
    }
    return (
        <>
            <Typography variant="subtitle1">
                {t('Create a New Journey')}
            </Typography>
            {mdUp && <HelpScoutBeacon
                userInfo={userInfo}
            />}
        </>
    )
}