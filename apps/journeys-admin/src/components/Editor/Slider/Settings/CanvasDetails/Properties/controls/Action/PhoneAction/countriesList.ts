export interface Country {
  countryCode: string
  label: string
  callingCode: string
  suggested?: boolean
}
// From https://bitbucket.org/atlassian/atlaskit-mk-2/raw/4ad0e56649c3e6c973e226b7efaeb28cb240ccb0/packages/core/select/src/data/countries.js
export const countries: Country[] = [
  {
    countryCode: 'AD',
    label: 'Andorra',
    callingCode: '+376'
  },
  {
    countryCode: 'AE',
    label: 'United Arab Emirates',
    callingCode: '+971'
  },
  {
    countryCode: 'AF',
    label: 'Afghanistan',
    callingCode: '+93'
  },
  {
    countryCode: 'AG',
    label: 'Antigua and Barbuda',
    callingCode: '+1-268'
  },
  {
    countryCode: 'AI',
    label: 'Anguilla',
    callingCode: '+1-264'
  },
  {
    countryCode: 'AL',
    label: 'Albania',
    callingCode: '+355'
  },
  {
    countryCode: 'AM',
    label: 'Armenia',
    callingCode: '+374'
  },
  {
    countryCode: 'AO',
    label: 'Angola',
    callingCode: '+244'
  },
  {
    countryCode: 'AQ',
    label: 'Antarctica',
    callingCode: '+672'
  },
  {
    countryCode: 'AR',
    label: 'Argentina',
    callingCode: '+54'
  },
  {
    countryCode: 'AS',
    label: 'American Samoa',
    callingCode: '+1-684'
  },
  {
    countryCode: 'AT',
    label: 'Austria',
    callingCode: '+43'
  },
  {
    countryCode: 'AU',
    label: 'Australia',
    callingCode: '+61',
    suggested: true
  },
  {
    countryCode: 'AW',
    label: 'Aruba',
    callingCode: '+297'
  },
  {
    countryCode: 'AX',
    label: 'Alland Islands',
    callingCode: '+358'
  },
  {
    countryCode: 'AZ',
    label: 'Azerbaijan',
    callingCode: '+994'
  },
  {
    countryCode: 'BA',
    label: 'Bosnia and Herzegovina',
    callingCode: '+387'
  },
  {
    countryCode: 'BB',
    label: 'Barbados',
    callingCode: '+1-246'
  },
  {
    countryCode: 'BD',
    label: 'Bangladesh',
    callingCode: '+880'
  },
  {
    countryCode: 'BE',
    label: 'Belgium',
    callingCode: '+32'
  },
  {
    countryCode: 'BF',
    label: 'Burkina Faso',
    callingCode: '+226'
  },
  {
    countryCode: 'BG',
    label: 'Bulgaria',
    callingCode: '+359'
  },
  {
    countryCode: 'BH',
    label: 'Bahrain',
    callingCode: '+973'
  },
  {
    countryCode: 'BI',
    label: 'Burundi',
    callingCode: '+257'
  },
  {
    countryCode: 'BJ',
    label: 'Benin',
    callingCode: '+229'
  },
  {
    countryCode: 'BL',
    label: 'Saint Barthelemy',
    callingCode: '+590'
  },
  {
    countryCode: 'BM',
    label: 'Bermuda',
    callingCode: '+1-441'
  },
  {
    countryCode: 'BN',
    label: 'Brunei Darussalam',
    callingCode: '+673'
  },
  {
    countryCode: 'BO',
    label: 'Bolivia',
    callingCode: '+591'
  },
  {
    countryCode: 'BR',
    label: 'Brazil',
    callingCode: '+55'
  },
  {
    countryCode: 'BS',
    label: 'Bahamas',
    callingCode: '+1-242'
  },
  {
    countryCode: 'BT',
    label: 'Bhutan',
    callingCode: '+975'
  },
  {
    countryCode: 'BV',
    label: 'Bouvet Island',
    callingCode: '+47'
  },
  {
    countryCode: 'BW',
    label: 'Botswana',
    callingCode: '+267'
  },
  {
    countryCode: 'BY',
    label: 'Belarus',
    callingCode: '+375'
  },
  {
    countryCode: 'BZ',
    label: 'Belize',
    callingCode: '+501'
  },
  {
    countryCode: 'CA',
    label: 'Canada',
    callingCode: '+1',
    suggested: true
  },
  {
    countryCode: 'CC',
    label: 'Cocos (Keeling) Islands',
    callingCode: '+61'
  },
  {
    countryCode: 'CD',
    label: 'Congo, Democratic Republic of the',
    callingCode: '+243'
  },
  {
    countryCode: 'CF',
    label: 'Central African Republic',
    callingCode: '+236'
  },
  {
    countryCode: 'CG',
    label: 'Congo, Republic of the',
    callingCode: '+242'
  },
  {
    countryCode: 'CH',
    label: 'Switzerland',
    callingCode: '+41'
  },
  {
    countryCode: 'CI',
    label: "Cote d'Ivoire",
    callingCode: '+225'
  },
  {
    countryCode: 'CK',
    label: 'Cook Islands',
    callingCode: '+682'
  },
  {
    countryCode: 'CL',
    label: 'Chile',
    callingCode: '+56'
  },
  {
    countryCode: 'CM',
    label: 'Cameroon',
    callingCode: '+237'
  },
  {
    countryCode: 'CN',
    label: 'China',
    callingCode: '+86'
  },
  {
    countryCode: 'CO',
    label: 'Colombia',
    callingCode: '+57'
  },
  {
    countryCode: 'CR',
    label: 'Costa Rica',
    callingCode: '+506'
  },
  {
    countryCode: 'CU',
    label: 'Cuba',
    callingCode: '+53'
  },
  {
    countryCode: 'CV',
    label: 'Cape Verde',
    callingCode: '+238'
  },
  {
    countryCode: 'CW',
    label: 'Curacao',
    callingCode: '+599'
  },
  {
    countryCode: 'CX',
    label: 'Christmas Island',
    callingCode: '+61'
  },
  {
    countryCode: 'CY',
    label: 'Cyprus',
    callingCode: '+357'
  },
  {
    countryCode: 'CZ',
    label: 'Czech Republic',
    callingCode: '+420'
  },
  {
    countryCode: 'DE',
    label: 'Germany',
    callingCode: '+49',
    suggested: true
  },
  {
    countryCode: 'DJ',
    label: 'Djibouti',
    callingCode: '+253'
  },
  {
    countryCode: 'DK',
    label: 'Denmark',
    callingCode: '+45'
  },
  {
    countryCode: 'DM',
    label: 'Dominica',
    callingCode: '+1-767'
  },
  {
    countryCode: 'DO',
    label: 'Dominican Republic',
    callingCode: '+1-809'
  },
  {
    countryCode: 'DZ',
    label: 'Algeria',
    callingCode: '+213'
  },
  {
    countryCode: 'EC',
    label: 'Ecuador',
    callingCode: '+593'
  },
  {
    countryCode: 'EE',
    label: 'Estonia',
    callingCode: '+372'
  },
  {
    countryCode: 'EG',
    label: 'Egypt',
    callingCode: '+20'
  },
  {
    countryCode: 'EH',
    label: 'Western Sahara',
    callingCode: '+212'
  },
  {
    countryCode: 'ER',
    label: 'Eritrea',
    callingCode: '+291'
  },
  {
    countryCode: 'ES',
    label: 'Spain',
    callingCode: '+34'
  },
  {
    countryCode: 'ET',
    label: 'Ethiopia',
    callingCode: '+251'
  },
  {
    countryCode: 'FI',
    label: 'Finland',
    callingCode: '+358'
  },
  {
    countryCode: 'FJ',
    label: 'Fiji',
    callingCode: '+679'
  },
  {
    countryCode: 'FK',
    label: 'Falkland Islands (Malvinas)',
    callingCode: '+500'
  },
  {
    countryCode: 'FM',
    label: 'Micronesia, Federated States of',
    callingCode: '+691'
  },
  {
    countryCode: 'FO',
    label: 'Faroe Islands',
    callingCode: '+298'
  },
  {
    countryCode: 'FR',
    label: 'France',
    callingCode: '+33',
    suggested: true
  },
  {
    countryCode: 'GA',
    label: 'Gabon',
    callingCode: '+241'
  },
  {
    countryCode: 'GB',
    label: 'United Kingdom',
    callingCode: '+44'
  },
  {
    countryCode: 'GD',
    label: 'Grenada',
    callingCode: '+1-473'
  },
  {
    countryCode: 'GE',
    label: 'Georgia',
    callingCode: '+995'
  },
  {
    countryCode: 'GF',
    label: 'French Guiana',
    callingCode: '+594'
  },
  {
    countryCode: 'GG',
    label: 'Guernsey',
    callingCode: '+44'
  },
  {
    countryCode: 'GH',
    label: 'Ghana',
    callingCode: '+233'
  },
  {
    countryCode: 'GI',
    label: 'Gibraltar',
    callingCode: '+350'
  },
  {
    countryCode: 'GL',
    label: 'Greenland',
    callingCode: '+299'
  },
  {
    countryCode: 'GM',
    label: 'Gambia',
    callingCode: '+220'
  },
  {
    countryCode: 'GN',
    label: 'Guinea',
    callingCode: '+224'
  },
  {
    countryCode: 'GP',
    label: 'Guadeloupe',
    callingCode: '+590'
  },
  {
    countryCode: 'GQ',
    label: 'Equatorial Guinea',
    callingCode: '+240'
  },
  {
    countryCode: 'GR',
    label: 'Greece',
    callingCode: '+30'
  },
  {
    countryCode: 'GS',
    label: 'South Georgia and the South Sandwich Islands',
    callingCode: '+500'
  },
  {
    countryCode: 'GT',
    label: 'Guatemala',
    callingCode: '+502'
  },
  {
    countryCode: 'GU',
    label: 'Guam',
    callingCode: '+1-671'
  },
  {
    countryCode: 'GW',
    label: 'Guinea-Bissau',
    callingCode: '+245'
  },
  {
    countryCode: 'GY',
    label: 'Guyana',
    callingCode: '+592'
  },
  {
    countryCode: 'HK',
    label: 'Hong Kong',
    callingCode: '+852'
  },
  {
    countryCode: 'HM',
    label: 'Heard Island and McDonald Islands',
    callingCode: '+672'
  },
  {
    countryCode: 'HN',
    label: 'Honduras',
    callingCode: '+504'
  },
  {
    countryCode: 'HR',
    label: 'Croatia',
    callingCode: '+385'
  },
  {
    countryCode: 'HT',
    label: 'Haiti',
    callingCode: '+509'
  },
  {
    countryCode: 'HU',
    label: 'Hungary',
    callingCode: '+36'
  },
  {
    countryCode: 'ID',
    label: 'Indonesia',
    callingCode: '+62'
  },
  {
    countryCode: 'IE',
    label: 'Ireland',
    callingCode: '+353'
  },
  {
    countryCode: 'IL',
    label: 'Israel',
    callingCode: '+972'
  },
  {
    countryCode: 'IM',
    label: 'Isle of Man',
    callingCode: '+44'
  },
  {
    countryCode: 'IN',
    label: 'India',
    callingCode: '+91'
  },
  {
    countryCode: 'IO',
    label: 'British Indian Ocean Territory',
    callingCode: '+246'
  },
  {
    countryCode: 'IQ',
    label: 'Iraq',
    callingCode: '+964'
  },
  {
    countryCode: 'IR',
    label: 'Iran, Islamic Republic of',
    callingCode: '+98'
  },
  {
    countryCode: 'IS',
    label: 'Iceland',
    callingCode: '+354'
  },
  {
    countryCode: 'IT',
    label: 'Italy',
    callingCode: '+39'
  },
  {
    countryCode: 'JE',
    label: 'Jersey',
    callingCode: '+44'
  },
  {
    countryCode: 'JM',
    label: 'Jamaica',
    callingCode: '+1-876'
  },
  {
    countryCode: 'JO',
    label: 'Jordan',
    callingCode: '+962'
  },
  {
    countryCode: 'JP',
    label: 'Japan',
    callingCode: '+81',
    suggested: true
  },
  {
    countryCode: 'KE',
    label: 'Kenya',
    callingCode: '+254'
  },
  {
    countryCode: 'KG',
    label: 'Kyrgyzstan',
    callingCode: '+996'
  },
  {
    countryCode: 'KH',
    label: 'Cambodia',
    callingCode: '+855'
  },
  {
    countryCode: 'KI',
    label: 'Kiribati',
    callingCode: '+686'
  },
  {
    countryCode: 'KM',
    label: 'Comoros',
    callingCode: '+269'
  },
  {
    countryCode: 'KN',
    label: 'Saint Kitts and Nevis',
    callingCode: '+1-869'
  },
  {
    countryCode: 'KP',
    label: "Korea, Democratic People's Republic of",
    callingCode: '+850'
  },
  {
    countryCode: 'KR',
    label: 'Korea, Republic of',
    callingCode: '+82'
  },
  {
    countryCode: 'KW',
    label: 'Kuwait',
    callingCode: '+965'
  },
  {
    countryCode: 'KY',
    label: 'Cayman Islands',
    callingCode: '+1-345'
  },
  {
    countryCode: 'KZ',
    label: 'Kazakhstan',
    callingCode: '+7'
  },
  {
    countryCode: 'LA',
    label: "Lao People's Democratic Republic",
    callingCode: '+856'
  },
  {
    countryCode: 'LB',
    label: 'Lebanon',
    callingCode: '+961'
  },
  {
    countryCode: 'LC',
    label: 'Saint Lucia',
    callingCode: '+1-758'
  },
  {
    countryCode: 'LI',
    label: 'Liechtenstein',
    callingCode: '+423'
  },
  {
    countryCode: 'LK',
    label: 'Sri Lanka',
    callingCode: '+94'
  },
  {
    countryCode: 'LR',
    label: 'Liberia',
    callingCode: '+231'
  },
  {
    countryCode: 'LS',
    label: 'Lesotho',
    callingCode: '+266'
  },
  {
    countryCode: 'LT',
    label: 'Lithuania',
    callingCode: '+370'
  },
  {
    countryCode: 'LU',
    label: 'Luxembourg',
    callingCode: '+352'
  },
  {
    countryCode: 'LV',
    label: 'Latvia',
    callingCode: '+371'
  },
  {
    countryCode: 'LY',
    label: 'Libya',
    callingCode: '+218'
  },
  {
    countryCode: 'MA',
    label: 'Morocco',
    callingCode: '+212'
  },
  {
    countryCode: 'MC',
    label: 'Monaco',
    callingCode: '+377'
  },
  {
    countryCode: 'MD',
    label: 'Moldova, Republic of',
    callingCode: '+373'
  },
  {
    countryCode: 'ME',
    label: 'Montenegro',
    callingCode: '+382'
  },
  {
    countryCode: 'MF',
    label: 'Saint Martin (French part)',
    callingCode: '+590'
  },
  {
    countryCode: 'MG',
    label: 'Madagascar',
    callingCode: '+261'
  },
  {
    countryCode: 'MH',
    label: 'Marshall Islands',
    callingCode: '+692'
  },
  {
    countryCode: 'MK',
    label: 'Macedonia, the Former Yugoslav Republic of',
    callingCode: '+389'
  },
  {
    countryCode: 'ML',
    label: 'Mali',
    callingCode: '+223'
  },
  {
    countryCode: 'MM',
    label: 'Myanmar',
    callingCode: '+95'
  },
  {
    countryCode: 'MN',
    label: 'Mongolia',
    callingCode: '+976'
  },
  {
    countryCode: 'MO',
    label: 'Macao',
    callingCode: '+853'
  },
  {
    countryCode: 'MP',
    label: 'Northern Mariana Islands',
    callingCode: '+1-670'
  },
  {
    countryCode: 'MQ',
    label: 'Martinique',
    callingCode: '+596'
  },
  {
    countryCode: 'MR',
    label: 'Mauritania',
    callingCode: '+222'
  },
  {
    countryCode: 'MS',
    label: 'Montserrat',
    callingCode: '+1-664'
  },
  {
    countryCode: 'MT',
    label: 'Malta',
    callingCode: '+356'
  },
  {
    countryCode: 'MU',
    label: 'Mauritius',
    callingCode: '+230'
  },
  {
    countryCode: 'MV',
    label: 'Maldives',
    callingCode: '+960'
  },
  {
    countryCode: 'MW',
    label: 'Malawi',
    callingCode: '+265'
  },
  {
    countryCode: 'MX',
    label: 'Mexico',
    callingCode: '+52'
  },
  {
    countryCode: 'MY',
    label: 'Malaysia',
    callingCode: '+60'
  },
  {
    countryCode: 'MZ',
    label: 'Mozambique',
    callingCode: '+258'
  },
  {
    countryCode: 'NA',
    label: 'Namibia',
    callingCode: '+264'
  },
  {
    countryCode: 'NC',
    label: 'New Caledonia',
    callingCode: '+687'
  },
  {
    countryCode: 'NE',
    label: 'Niger',
    callingCode: '+227'
  },
  {
    countryCode: 'NF',
    label: 'Norfolk Island',
    callingCode: '+672'
  },
  {
    countryCode: 'NG',
    label: 'Nigeria',
    callingCode: '+234'
  },
  {
    countryCode: 'NI',
    label: 'Nicaragua',
    callingCode: '+505'
  },
  {
    countryCode: 'NL',
    label: 'Netherlands',
    callingCode: '+31'
  },
  {
    countryCode: 'NO',
    label: 'Norway',
    callingCode: '+47'
  },
  {
    countryCode: 'NP',
    label: 'Nepal',
    callingCode: '+977'
  },
  {
    countryCode: 'NR',
    label: 'Nauru',
    callingCode: '+674'
  },
  {
    countryCode: 'NU',
    label: 'Niue',
    callingCode: '+683'
  },
  {
    countryCode: 'NZ',
    label: 'New Zealand',
    callingCode: '+64'
  },
  {
    countryCode: 'OM',
    label: 'Oman',
    callingCode: '+968'
  },
  {
    countryCode: 'PA',
    label: 'Panama',
    callingCode: '+507'
  },
  {
    countryCode: 'PE',
    label: 'Peru',
    callingCode: '+51'
  },
  {
    countryCode: 'PF',
    label: 'French Polynesia',
    callingCode: '+689'
  },
  {
    countryCode: 'PG',
    label: 'Papua New Guinea',
    callingCode: '+675'
  },
  {
    countryCode: 'PH',
    label: 'Philippines',
    callingCode: '+63'
  },
  {
    countryCode: 'PK',
    label: 'Pakistan',
    callingCode: '+92'
  },
  {
    countryCode: 'PL',
    label: 'Poland',
    callingCode: '+48'
  },
  {
    countryCode: 'PM',
    label: 'Saint Pierre and Miquelon',
    callingCode: '+508'
  },
  {
    countryCode: 'PN',
    label: 'Pitcairn',
    callingCode: '+870'
  },
  {
    countryCode: 'PR',
    label: 'Puerto Rico',
    callingCode: '+1'
  },
  {
    countryCode: 'PS',
    label: 'Palestine, State of',
    callingCode: '+970'
  },
  {
    countryCode: 'PT',
    label: 'Portugal',
    callingCode: '+351'
  },
  {
    countryCode: 'PW',
    label: 'Palau',
    callingCode: '+680'
  },
  {
    countryCode: 'PY',
    label: 'Paraguay',
    callingCode: '+595'
  },
  {
    countryCode: 'QA',
    label: 'Qatar',
    callingCode: '+974'
  },
  {
    countryCode: 'RE',
    label: 'Reunion',
    callingCode: '+262'
  },
  {
    countryCode: 'RO',
    label: 'Romania',
    callingCode: '+40'
  },
  {
    countryCode: 'RS',
    label: 'Serbia',
    callingCode: '+381'
  },
  {
    countryCode: 'RU',
    label: 'Russian Federation',
    callingCode: '+7'
  },
  {
    countryCode: 'RW',
    label: 'Rwanda',
    callingCode: '+250'
  },
  {
    countryCode: 'SA',
    label: 'Saudi Arabia',
    callingCode: '+966'
  },
  {
    countryCode: 'SB',
    label: 'Solomon Islands',
    callingCode: '+677'
  },
  {
    countryCode: 'SC',
    label: 'Seychelles',
    callingCode: '+248'
  },
  {
    countryCode: 'SD',
    label: 'Sudan',
    callingCode: '+249'
  },
  {
    countryCode: 'SE',
    label: 'Sweden',
    callingCode: '+46'
  },
  {
    countryCode: 'SG',
    label: 'Singapore',
    callingCode: '+65'
  },
  {
    countryCode: 'SH',
    label: 'Saint Helena',
    callingCode: '+290'
  },
  {
    countryCode: 'SI',
    label: 'Slovenia',
    callingCode: '+386'
  },
  {
    countryCode: 'SJ',
    label: 'Svalbard and Jan Mayen',
    callingCode: '+47'
  },
  {
    countryCode: 'SK',
    label: 'Slovakia',
    callingCode: '+421'
  },
  {
    countryCode: 'SL',
    label: 'Sierra Leone',
    callingCode: '+232'
  },
  {
    countryCode: 'SM',
    label: 'San Marino',
    callingCode: '+378'
  },
  {
    countryCode: 'SN',
    label: 'Senegal',
    callingCode: '+221'
  },
  {
    countryCode: 'SO',
    label: 'Somalia',
    callingCode: '+252'
  },
  {
    countryCode: 'SR',
    label: 'Suriname',
    callingCode: '+597'
  },
  {
    countryCode: 'SS',
    label: 'South Sudan',
    callingCode: '+211'
  },
  {
    countryCode: 'ST',
    label: 'Sao Tome and Principe',
    callingCode: '+239'
  },
  {
    countryCode: 'SV',
    label: 'El Salvador',
    callingCode: '+503'
  },
  {
    countryCode: 'SX',
    label: 'Sint Maarten (Dutch part)',
    callingCode: '+1-721'
  },
  {
    countryCode: 'SY',
    label: 'Syrian Arab Republic',
    callingCode: '+963'
  },
  {
    countryCode: 'SZ',
    label: 'Swaziland',
    callingCode: '+268'
  },
  {
    countryCode: 'TC',
    label: 'Turks and Caicos Islands',
    callingCode: '+1-649'
  },
  {
    countryCode: 'TD',
    label: 'Chad',
    callingCode: '+235'
  },
  {
    countryCode: 'TF',
    label: 'French Southern Territories',
    callingCode: '+262'
  },
  {
    countryCode: 'TG',
    label: 'Togo',
    callingCode: '+228'
  },
  {
    countryCode: 'TH',
    label: 'Thailand',
    callingCode: '+66'
  },
  {
    countryCode: 'TJ',
    label: 'Tajikistan',
    callingCode: '+992'
  },
  {
    countryCode: 'TK',
    label: 'Tokelau',
    callingCode: '+690'
  },
  {
    countryCode: 'TL',
    label: 'Timor-Leste',
    callingCode: '+670'
  },
  {
    countryCode: 'TM',
    label: 'Turkmenistan',
    callingCode: '+993'
  },
  {
    countryCode: 'TN',
    label: 'Tunisia',
    callingCode: '+216'
  },
  {
    countryCode: 'TO',
    label: 'Tonga',
    callingCode: '+676'
  },
  {
    countryCode: 'TR',
    label: 'Turkey',
    callingCode: '+90'
  },
  {
    countryCode: 'TT',
    label: 'Trinidad and Tobago',
    callingCode: '+1-868'
  },
  {
    countryCode: 'TV',
    label: 'Tuvalu',
    callingCode: '+688'
  },
  {
    countryCode: 'TW',
    label: 'Taiwan',
    callingCode: '+886'
  },
  {
    countryCode: 'TZ',
    label: 'United Republic of Tanzania',
    callingCode: '+255'
  },
  {
    countryCode: 'UA',
    label: 'Ukraine',
    callingCode: '+380'
  },
  {
    countryCode: 'UG',
    label: 'Uganda',
    callingCode: '+256'
  },
  {
    countryCode: 'US',
    label: 'United States',
    callingCode: '+1',
    suggested: true
  },
  {
    countryCode: 'UY',
    label: 'Uruguay',
    callingCode: '+598'
  },
  {
    countryCode: 'UZ',
    label: 'Uzbekistan',
    callingCode: '+998'
  },
  {
    countryCode: 'VA',
    label: 'Holy See (Vatican City State)',
    callingCode: '+379'
  },
  {
    countryCode: 'VC',
    label: 'Saint Vincent and the Grenadines',
    callingCode: '+1-784'
  },
  {
    countryCode: 'VE',
    label: 'Venezuela',
    callingCode: '+58'
  },
  {
    countryCode: 'VG',
    label: 'British Virgin Islands',
    callingCode: '+1-284'
  },
  {
    countryCode: 'VI',
    label: 'US Virgin Islands',
    callingCode: '+1-340'
  },
  {
    countryCode: 'VN',
    label: 'Vietnam',
    callingCode: '+84'
  },
  {
    countryCode: 'VU',
    label: 'Vanuatu',
    callingCode: '+678'
  },
  {
    countryCode: 'WF',
    label: 'Wallis and Futuna',
    callingCode: '+681'
  },
  {
    countryCode: 'WS',
    label: 'Samoa',
    callingCode: '+685'
  },
  {
    countryCode: 'XK',
    label: 'Kosovo',
    callingCode: '+383'
  },
  {
    countryCode: 'YE',
    label: 'Yemen',
    callingCode: '+967'
  },
  {
    countryCode: 'YT',
    label: 'Mayotte',
    callingCode: '+262'
  },
  {
    countryCode: 'ZA',
    label: 'South Africa',
    callingCode: '+27'
  },
  {
    countryCode: 'ZM',
    label: 'Zambia',
    callingCode: '+260'
  },
  {
    countryCode: 'ZW',
    label: 'Zimbabwe',
    callingCode: '+263'
  }
]
