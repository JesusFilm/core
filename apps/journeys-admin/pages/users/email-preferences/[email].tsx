import { gql, useQuery } from '@apollo/client';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import Typography from '@mui/material/Typography';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';


const GET_EMAIL_PREFERENCES = gql`
  query GetEmailPreference($emailPreferenceId: ID!, $idType: String!) {
    emailPreference(id: $emailPreferenceId, idType: $idType) {
      journeyNotifications
      teamInvites
      thirdCategory
    }
  }
`;

const UPDATE_EMAIL_PREFERENCES = gql`
mutation UpdateEmailPreferences($input: EmailPreferencesUpdateInput!) {
  updateEmailPreferences(input: $input) {
    id
    journeyNotifications
    teamInvites
    thirdCategory
  }
}
`;

const EmailPreferencesPage: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const [emailPreferences, setEmailPreferences] = useState(null);
  const { data, loading, error } = useQuery(GET_EMAIL_PREFERENCES, {
    variables: { id: 1234, idType: 'id'},
  });

  console.log('data', data);

  useEffect(() => {
    console.log('EmailPreferencesPage rendered');
    console.log('emailPreferences', emailPreferences);
  }, [emailPreferences]);

  const handlePreferenceChange = (preference: string): void => {
    setEmailPreferences((prevPreferences) => ({
      ...prevPreferences,
      [preference]: !(prevPreferences[preference] as boolean),
    }));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <Typography variant="h1" style={{ padding: '20px' }}>Email Preferences {emailPreferences?.email}</Typography>
      <div style={{ display: 'flex', flexDirection: 'column', border: '1px solid black', padding: '20px' }}>
        <FormControlLabel
            control={
              <Checkbox
                checked={emailPreferences?.journeyNotifications}
                onChange={() => handlePreferenceChange('journeyNotifications')}
              />
            }
            label="Receive journeyNotifications emails"
          />
        <FormControlLabel
            control={
              <Checkbox
                checked={emailPreferences?.teamInvites}
                onChange={() => handlePreferenceChange('teamInvites')}
              />
            }
            label="Receive teamInvites emails"
          />
        <FormControlLabel
            control={
              <Checkbox
                checked={emailPreferences?.thirdCategory}
                onChange={() => handlePreferenceChange('thirdCategory')}
              />
            }
            label="Receive notification emails"
          />
        <button onClick={() => console.log("Submit")}>Submit</button>
      </div>
      <Typography variant="body2" color="textSecondary">
        Customize your email preferences to stay up-to-date with the latest news, teamInvites, and thirdCategory.
      </Typography>
    </div>
    );
};

export default EmailPreferencesPage;
