import { ReactElement } from 'react'
import Box from '@mui/material/Box'

export const Facebook = (): ReactElement => {
  return (
    <Box sx={{ width: 100, height: 100, zIndex: 1000 }}>
      <div id="fb-root" />
      <div id="fb-customer-chat" className="fb-customerchat" />
      <script
        dangerouslySetInnerHTML={{
          __html: ` var chatbox = document.getElementById('fb-customer-chat');
          chatbox.setAttribute("page_id", "103131092693803");
          chatbox.setAttribute("attribution", "biz_inbox");          

          window.fbAsyncInit = function() {
            FB.init({
              xfbml: true,
              version: 'v17.0'
            });
          };
  
          (function(d, s, id) {
            var js, fjs = d.getElementsByTagName(s)[0];
            if (d.getElementById(id)) return;
            js = d.createElement(s); js.id = id;
            js.src = 'https://connect.facebook.net/en_US/sdk/xfbml.customerchat.js';
            fjs.parentNode.insertBefore(js, fjs);
          }(document, 'script', 'facebook-jssdk'));`
        }}
      />
    </Box>
  )
}
