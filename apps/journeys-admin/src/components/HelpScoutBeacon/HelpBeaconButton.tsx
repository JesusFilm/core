import IconButton from '@mui/material/IconButton'
import { useState } from 'react'

import HelpCircleContained from '@core/shared/ui/icons/HelpCircleContained'
import X1 from '@core/shared/ui/icons/X1'

const HelpBeaconButton: React.FC = () => {
    const [isBeaconOpen, setIsBeaconOpen] = useState(false);
    const handleButtonClick = () :void => {
        if(window.Beacon != null){
            window.Beacon('toggle');
            setIsBeaconOpen(!isBeaconOpen)
        }
    };

    return (
      <IconButton onClick={handleButtonClick}>
        { isBeaconOpen ? <X1 sx={{ color: 'background.red', zIndex: 9999 }}/> : <HelpCircleContained sx={{ color: 'background.paper' }}/>}
      </IconButton>
    );
};

export default HelpBeaconButton;
