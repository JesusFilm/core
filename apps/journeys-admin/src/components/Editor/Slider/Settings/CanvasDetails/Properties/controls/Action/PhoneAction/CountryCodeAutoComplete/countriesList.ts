export interface Country {
  countryCode: string
  label: string
  callingCode: string
  placeholder: string
  suggested?: boolean
}

// From https://bitbucket.org/atlassian/atlaskit-mk-2/raw/4ad0e56649c3e6c973e226b7efaeb28cb240ccb0/packages/core/select/src/data/countries.js
export const countries: Country[] = [
  {
    countryCode: 'AD',
    label: 'Andorra',
    callingCode: '+376',
    placeholder: '312 345'
  },
  {
    countryCode: 'AE',
    label: 'United Arab Emirates',
    callingCode: '+971',
    placeholder: '50 123 4567'
  },
  {
    countryCode: 'AF',
    label: 'Afghanistan',
    callingCode: '+93',
    placeholder: '70 123 4567'
  },
  {
    countryCode: 'AG',
    label: 'Antigua and Barbuda',
    callingCode: '+1-268',
    placeholder: '464 1234'
  },
  {
    countryCode: 'AI',
    label: 'Anguilla',
    callingCode: '+1-264',
    placeholder: '235 1234'
  },
  {
    countryCode: 'AL',
    label: 'Albania',
    callingCode: '+355',
    placeholder: '67 212 3456'
  },
  {
    countryCode: 'AM',
    label: 'Armenia',
    callingCode: '+374',
    placeholder: '77 123456'
  },
  {
    countryCode: 'AO',
    label: 'Angola',
    callingCode: '+244',
    placeholder: '923 123 456'
  },
  {
    countryCode: 'AQ',
    label: 'Antarctica',
    callingCode: '+672',
    placeholder: '12 345'
  },
  {
    countryCode: 'AR',
    label: 'Argentina',
    callingCode: '+54',
    placeholder: '9 11 1234 5678'
  },
  {
    countryCode: 'AS',
    label: 'American Samoa',
    callingCode: '+1-684',
    placeholder: '733 1234'
  },
  {
    countryCode: 'AT',
    label: 'Austria',
    callingCode: '+43',
    placeholder: '664 123456'
  },
  {
    countryCode: 'AU',
    label: 'Australia',
    callingCode: '+61',
    placeholder: '412 345 678',
    suggested: true
  },
  {
    countryCode: 'AW',
    label: 'Aruba',
    callingCode: '+297',
    placeholder: '560 1234'
  },
  {
    countryCode: 'AX',
    label: 'Alland Islands',
    callingCode: '+358',
    placeholder: '41 2345678'
  },
  {
    countryCode: 'AZ',
    label: 'Azerbaijan',
    callingCode: '+994',
    placeholder: '40 123 45 67'
  },
  {
    countryCode: 'BA',
    label: 'Bosnia and Herzegovina',
    callingCode: '+387',
    placeholder: '61 123 456'
  },
  {
    countryCode: 'BB',
    label: 'Barbados',
    callingCode: '+1-246',
    placeholder: '250 1234'
  },
  {
    countryCode: 'BD',
    label: 'Bangladesh',
    callingCode: '+880',
    placeholder: '1812 345678'
  },
  {
    countryCode: 'BE',
    label: 'Belgium',
    callingCode: '+32',
    placeholder: '470 12 34 56'
  },
  {
    countryCode: 'BF',
    label: 'Burkina Faso',
    callingCode: '+226',
    placeholder: '70 12 34 56'
  },
  {
    countryCode: 'BG',
    label: 'Bulgaria',
    callingCode: '+359',
    placeholder: '87 123 4567'
  },
  {
    countryCode: 'BH',
    label: 'Bahrain',
    callingCode: '+973',
    placeholder: '3612 3456'
  },
  {
    countryCode: 'BI',
    label: 'Burundi',
    callingCode: '+257',
    placeholder: '79 56 12 34'
  },
  {
    countryCode: 'BJ',
    label: 'Benin',
    callingCode: '+229',
    placeholder: '90 01 12 34'
  },
  {
    countryCode: 'BL',
    label: 'Saint Barthelemy',
    callingCode: '+590',
    placeholder: '690 12 34 56'
  },
  {
    countryCode: 'BM',
    label: 'Bermuda',
    callingCode: '+1-441',
    placeholder: '370 1234'
  },
  {
    countryCode: 'BN',
    label: 'Brunei Darussalam',
    callingCode: '+673',
    placeholder: '712 3456'
  },
  {
    countryCode: 'BO',
    label: 'Bolivia',
    callingCode: '+591',
    placeholder: '71234567'
  },
  {
    countryCode: 'BR',
    label: 'Brazil',
    callingCode: '+55',
    placeholder: '11 91234 5678'
  },
  {
    countryCode: 'BS',
    label: 'Bahamas',
    callingCode: '+1-242',
    placeholder: '359 1234'
  },
  {
    countryCode: 'BT',
    label: 'Bhutan',
    callingCode: '+975',
    placeholder: '17 12 34 56'
  },
  {
    countryCode: 'BV',
    label: 'Bouvet Island',
    callingCode: '+47',
    placeholder: '406 12 345'
  },
  {
    countryCode: 'BW',
    label: 'Botswana',
    callingCode: '+267',
    placeholder: '71 123 456'
  },
  {
    countryCode: 'BY',
    label: 'Belarus',
    callingCode: '+375',
    placeholder: '29 491 19 11'
  },
  {
    countryCode: 'BZ',
    label: 'Belize',
    callingCode: '+501',
    placeholder: '622 1234'
  },
  {
    countryCode: 'CA',
    label: 'Canada',
    callingCode: '+1',
    placeholder: '506 234 5678',
    suggested: true
  },
  {
    countryCode: 'CC',
    label: 'Cocos (Keeling) Islands',
    callingCode: '+61',
    placeholder: '412 345 678'
  },
  {
    countryCode: 'CD',
    label: 'Congo, Democratic Republic of the',
    callingCode: '+243',
    placeholder: '991 234 567'
  },
  {
    countryCode: 'CF',
    label: 'Central African Republic',
    callingCode: '+236',
    placeholder: '70 01 23 45'
  },
  {
    countryCode: 'CG',
    label: 'Congo, Republic of the',
    callingCode: '+242',
    placeholder: '06 612 3456'
  },
  {
    countryCode: 'CH',
    label: 'Switzerland',
    callingCode: '+41',
    placeholder: '78 123 45 67'
  },
  {
    countryCode: 'CI',
    label: "Cote d'Ivoire",
    callingCode: '+225',
    placeholder: '01 23 45 67'
  },
  {
    countryCode: 'CK',
    label: 'Cook Islands',
    callingCode: '+682',
    placeholder: '71 234'
  },
  {
    countryCode: 'CL',
    label: 'Chile',
    callingCode: '+56',
    placeholder: '9 6123 4567'
  },
  {
    countryCode: 'CM',
    label: 'Cameroon',
    callingCode: '+237',
    placeholder: '6 71 23 45 67'
  },
  {
    countryCode: 'CN',
    label: 'China',
    callingCode: '+86',
    placeholder: '131 2345 6789'
  },
  {
    countryCode: 'CO',
    label: 'Colombia',
    callingCode: '+57',
    placeholder: '321 1234567'
  },
  {
    countryCode: 'CR',
    label: 'Costa Rica',
    callingCode: '+506',
    placeholder: '8312 3456'
  },
  {
    countryCode: 'CU',
    label: 'Cuba',
    callingCode: '+53',
    placeholder: '5 1234567'
  },
  {
    countryCode: 'CV',
    label: 'Cape Verde',
    callingCode: '+238',
    placeholder: '991 12 34'
  },
  {
    countryCode: 'CW',
    label: 'Curacao',
    callingCode: '+599',
    placeholder: '9 518 1234'
  },
  {
    countryCode: 'CX',
    label: 'Christmas Island',
    callingCode: '+61',
    placeholder: '412 345 678'
  },
  {
    countryCode: 'CY',
    label: 'Cyprus',
    callingCode: '+357',
    placeholder: '96 123456'
  },
  {
    countryCode: 'CZ',
    label: 'Czech Republic',
    callingCode: '+420',
    placeholder: '601 123 456'
  },
  {
    countryCode: 'DE',
    label: 'Germany',
    callingCode: '+49',
    placeholder: '1512 3456789',
    suggested: true
  },
  {
    countryCode: 'DJ',
    label: 'Djibouti',
    callingCode: '+253',
    placeholder: '77 83 10 01'
  },
  {
    countryCode: 'DK',
    label: 'Denmark',
    callingCode: '+45',
    placeholder: '20 12 34 56'
  },
  {
    countryCode: 'DM',
    label: 'Dominica',
    callingCode: '+1-767',
    placeholder: '235 1234'
  },
  {
    countryCode: 'DO',
    label: 'Dominican Republic',
    callingCode: '+1-809',
    placeholder: '829 1234567'
  },
  {
    countryCode: 'DZ',
    label: 'Algeria',
    callingCode: '+213',
    placeholder: '551 23 45 67'
  },
  {
    countryCode: 'EC',
    label: 'Ecuador',
    callingCode: '+593',
    placeholder: '99 123 4567'
  },
  {
    countryCode: 'EE',
    label: 'Estonia',
    callingCode: '+372',
    placeholder: '5123 4567'
  },
  {
    countryCode: 'EG',
    label: 'Egypt',
    callingCode: '+20',
    placeholder: '100 123 4567'
  },
  {
    countryCode: 'EH',
    label: 'Western Sahara',
    callingCode: '+212',
    placeholder: '650 123456'
  },
  {
    countryCode: 'ER',
    label: 'Eritrea',
    callingCode: '+291',
    placeholder: '7 123 456'
  },
  {
    countryCode: 'ES',
    label: 'Spain',
    callingCode: '+34',
    placeholder: '612 34 56 78'
  },
  {
    countryCode: 'ET',
    label: 'Ethiopia',
    callingCode: '+251',
    placeholder: '91 123 4567'
  },
  {
    countryCode: 'FI',
    label: 'Finland',
    callingCode: '+358',
    placeholder: '50 123 4567'
  },
  {
    countryCode: 'FJ',
    label: 'Fiji',
    callingCode: '+679',
    placeholder: '701 2345'
  },
  {
    countryCode: 'FK',
    label: 'Falkland Islands (Malvinas)',
    callingCode: '+500',
    placeholder: '51234'
  },
  {
    countryCode: 'FM',
    label: 'Micronesia, Federated States of',
    callingCode: '+691',
    placeholder: '350 1234'
  },
  {
    countryCode: 'FO',
    label: 'Faroe Islands',
    callingCode: '+298',
    placeholder: '211234'
  },
  {
    countryCode: 'FR',
    label: 'France',
    callingCode: '+33',
    placeholder: '6 12 34 56 78',
    suggested: true
  },
  {
    countryCode: 'GA',
    label: 'Gabon',
    callingCode: '+241',
    placeholder: '06 03 12 34'
  },
  {
    countryCode: 'GB',
    label: 'United Kingdom',
    callingCode: '+44',
    placeholder: '7400 123456'
  },
  {
    countryCode: 'GD',
    label: 'Grenada',
    callingCode: '+1-473',
    placeholder: '403 1234'
  },
  {
    countryCode: 'GE',
    label: 'Georgia',
    callingCode: '+995',
    placeholder: '555 12 34 56'
  },
  {
    countryCode: 'GF',
    label: 'French Guiana',
    callingCode: '+594',
    placeholder: '694 20 12 34'
  },
  {
    countryCode: 'GG',
    label: 'Guernsey',
    callingCode: '+44',
    placeholder: '7781 123456'
  },
  {
    countryCode: 'GH',
    label: 'Ghana',
    callingCode: '+233',
    placeholder: '23 123 4567'
  },
  {
    countryCode: 'GI',
    label: 'Gibraltar',
    callingCode: '+350',
    placeholder: '57123456'
  },
  {
    countryCode: 'GL',
    label: 'Greenland',
    callingCode: '+299',
    placeholder: '22 12 34'
  },
  {
    countryCode: 'GM',
    label: 'Gambia',
    callingCode: '+220',
    placeholder: '301 2345'
  },
  {
    countryCode: 'GN',
    label: 'Guinea',
    callingCode: '+224',
    placeholder: '601 12 34 56'
  },
  {
    countryCode: 'GP',
    label: 'Guadeloupe',
    callingCode: '+590',
    placeholder: '690 12 34 56'
  },
  {
    countryCode: 'GQ',
    label: 'Equatorial Guinea',
    callingCode: '+240',
    placeholder: '222 123 456'
  },
  {
    countryCode: 'GR',
    label: 'Greece',
    callingCode: '+30',
    placeholder: '691 234 5678'
  },
  {
    countryCode: 'GS',
    label: 'South Georgia and the South Sandwich Islands',
    callingCode: '+500',
    placeholder: '51234'
  },
  {
    countryCode: 'GT',
    label: 'Guatemala',
    callingCode: '+502',
    placeholder: '5123 4567'
  },
  {
    countryCode: 'GU',
    label: 'Guam',
    callingCode: '+1-671',
    placeholder: '300 1234'
  },
  {
    countryCode: 'GW',
    label: 'Guinea-Bissau',
    callingCode: '+245',
    placeholder: '955 012 345'
  },
  {
    countryCode: 'GY',
    label: 'Guyana',
    callingCode: '+592',
    placeholder: '609 1234'
  },
  {
    countryCode: 'HK',
    label: 'Hong Kong',
    callingCode: '+852',
    placeholder: '5123 4567'
  },
  {
    countryCode: 'HM',
    label: 'Heard Island and McDonald Islands',
    callingCode: '+672',
    placeholder: '12 345'
  },
  {
    countryCode: 'HN',
    label: 'Honduras',
    callingCode: '+504',
    placeholder: '9123 4567'
  },
  {
    countryCode: 'HR',
    label: 'Croatia',
    callingCode: '+385',
    placeholder: '91 234 567'
  },
  {
    countryCode: 'HT',
    label: 'Haiti',
    callingCode: '+509',
    placeholder: '34 12 3456'
  },
  {
    countryCode: 'HU',
    label: 'Hungary',
    callingCode: '+36',
    placeholder: '20 123 4567'
  },
  {
    countryCode: 'ID',
    label: 'Indonesia',
    callingCode: '+62',
    placeholder: '812 3456 789'
  },
  {
    countryCode: 'IE',
    label: 'Ireland',
    callingCode: '+353',
    placeholder: '85 012 3456'
  },
  {
    countryCode: 'IL',
    label: 'Israel',
    callingCode: '+972',
    placeholder: '50 123 4567'
  },
  {
    countryCode: 'IM',
    label: 'Isle of Man',
    callingCode: '+44',
    placeholder: '7924 123456'
  },
  {
    countryCode: 'IN',
    label: 'India',
    callingCode: '+91',
    placeholder: '81234 56789'
  },
  {
    countryCode: 'IO',
    label: 'British Indian Ocean Territory',
    callingCode: '+246',
    placeholder: '380 1234'
  },
  {
    countryCode: 'IQ',
    label: 'Iraq',
    callingCode: '+964',
    placeholder: '790 123 4567'
  },
  {
    countryCode: 'IR',
    label: 'Iran, Islamic Republic of',
    callingCode: '+98',
    placeholder: '901 234 5678'
  },
  {
    countryCode: 'IS',
    label: 'Iceland',
    callingCode: '+354',
    placeholder: '611 1234'
  },
  {
    countryCode: 'IT',
    label: 'Italy',
    callingCode: '+39',
    placeholder: '312 123 4567'
  },
  {
    countryCode: 'JE',
    label: 'Jersey',
    callingCode: '+44',
    placeholder: '7797 123456'
  },
  {
    countryCode: 'JM',
    label: 'Jamaica',
    callingCode: '+1-876',
    placeholder: '210 1234'
  },
  {
    countryCode: 'JO',
    label: 'Jordan',
    callingCode: '+962',
    placeholder: '7 9012 3456'
  },
  {
    countryCode: 'JP',
    label: 'Japan',
    callingCode: '+81',
    placeholder: '90 1234 5678',
    suggested: true
  },
  {
    countryCode: 'KE',
    label: 'Kenya',
    callingCode: '+254',
    placeholder: '712 123456'
  },
  {
    countryCode: 'KG',
    label: 'Kyrgyzstan',
    callingCode: '+996',
    placeholder: '700 123 456'
  },
  {
    countryCode: 'KH',
    label: 'Cambodia',
    callingCode: '+855',
    placeholder: '91 234 567'
  },
  {
    countryCode: 'KI',
    label: 'Kiribati',
    callingCode: '+686',
    placeholder: '72012345'
  },
  {
    countryCode: 'KM',
    label: 'Comoros',
    callingCode: '+269',
    placeholder: '321 23 45'
  },
  {
    countryCode: 'KN',
    label: 'Saint Kitts and Nevis',
    callingCode: '+1-869',
    placeholder: '765 1234'
  },
  {
    countryCode: 'KP',
    label: "Korea, Democratic People's Republic of",
    callingCode: '+850',
    placeholder: '191 234 567'
  },
  {
    countryCode: 'KR',
    label: 'Korea, Republic of',
    callingCode: '+82',
    placeholder: '10 1234 5678'
  },
  {
    countryCode: 'KW',
    label: 'Kuwait',
    callingCode: '+965',
    placeholder: '500 12345'
  },
  {
    countryCode: 'KY',
    label: 'Cayman Islands',
    callingCode: '+1-345',
    placeholder: '323 1234'
  },
  {
    countryCode: 'KZ',
    label: 'Kazakhstan',
    callingCode: '+7',
    placeholder: '771 000 9998'
  },
  {
    countryCode: 'LA',
    label: "Lao People's Democratic Republic",
    callingCode: '+856',
    placeholder: '20 23 123 456'
  },
  {
    countryCode: 'LB',
    label: 'Lebanon',
    callingCode: '+961',
    placeholder: '71 123 456'
  },
  {
    countryCode: 'LC',
    label: 'Saint Lucia',
    callingCode: '+1-758',
    placeholder: '284 1234'
  },
  {
    countryCode: 'LI',
    label: 'Liechtenstein',
    callingCode: '+423',
    placeholder: '660 123 456'
  },
  {
    countryCode: 'LK',
    label: 'Sri Lanka',
    callingCode: '+94',
    placeholder: '71 234 5678'
  },
  {
    countryCode: 'LR',
    label: 'Liberia',
    callingCode: '+231',
    placeholder: '77 012 3456'
  },
  {
    countryCode: 'LS',
    label: 'Lesotho',
    callingCode: '+266',
    placeholder: '5012 3456'
  },
  {
    countryCode: 'LT',
    label: 'Lithuania',
    callingCode: '+370',
    placeholder: '612 34567'
  },
  {
    countryCode: 'LU',
    label: 'Luxembourg',
    callingCode: '+352',
    placeholder: '628 123 456'
  },
  {
    countryCode: 'LV',
    label: 'Latvia',
    callingCode: '+371',
    placeholder: '21 234 567'
  },
  {
    countryCode: 'LY',
    label: 'Libya',
    callingCode: '+218',
    placeholder: '91 2345678'
  },
  {
    countryCode: 'MA',
    label: 'Morocco',
    callingCode: '+212',
    placeholder: '650 123456'
  },
  {
    countryCode: 'MC',
    label: 'Monaco',
    callingCode: '+377',
    placeholder: '6 12 34 56 78'
  },
  {
    countryCode: 'MD',
    label: 'Moldova, Republic of',
    callingCode: '+373',
    placeholder: '621 12 345'
  },
  {
    countryCode: 'ME',
    label: 'Montenegro',
    callingCode: '+382',
    placeholder: '67 622 901'
  },
  {
    countryCode: 'MF',
    label: 'Saint Martin (French part)',
    callingCode: '+590',
    placeholder: '690 12 34 56'
  },
  {
    countryCode: 'MG',
    label: 'Madagascar',
    callingCode: '+261',
    placeholder: '32 12 345 67'
  },
  {
    countryCode: 'MH',
    label: 'Marshall Islands',
    callingCode: '+692',
    placeholder: '235 1234'
  },
  {
    countryCode: 'MK',
    label: 'Macedonia, the Former Yugoslav Republic of',
    callingCode: '+389',
    placeholder: '72 345 678'
  },
  {
    countryCode: 'ML',
    label: 'Mali',
    callingCode: '+223',
    placeholder: '65 01 23 45'
  },
  {
    countryCode: 'MM',
    label: 'Myanmar',
    callingCode: '+95',
    placeholder: '9 212 3456'
  },
  {
    countryCode: 'MN',
    label: 'Mongolia',
    callingCode: '+976',
    placeholder: '8812 3456'
  },
  {
    countryCode: 'MO',
    label: 'Macao',
    callingCode: '+853',
    placeholder: '6612 3456'
  },
  {
    countryCode: 'MP',
    label: 'Northern Mariana Islands',
    callingCode: '+1-670',
    placeholder: '234 1234'
  },
  {
    countryCode: 'MQ',
    label: 'Martinique',
    callingCode: '+596',
    placeholder: '696 20 12 34'
  },
  {
    countryCode: 'MR',
    label: 'Mauritania',
    callingCode: '+222',
    placeholder: '22 12 34 56'
  },
  {
    countryCode: 'MS',
    label: 'Montserrat',
    callingCode: '+1-664',
    placeholder: '492 1234'
  },
  {
    countryCode: 'MT',
    label: 'Malta',
    callingCode: '+356',
    placeholder: '9696 1234'
  },
  {
    countryCode: 'MU',
    label: 'Mauritius',
    callingCode: '+230',
    placeholder: '5251 2345'
  },
  {
    countryCode: 'MV',
    label: 'Maldives',
    callingCode: '+960',
    placeholder: '771 2345'
  },
  {
    countryCode: 'MW',
    label: 'Malawi',
    callingCode: '+265',
    placeholder: '991 23 45 67'
  },
  {
    countryCode: 'MX',
    label: 'Mexico',
    callingCode: '+52',
    placeholder: '1 55 1234 5678'
  },
  {
    countryCode: 'MY',
    label: 'Malaysia',
    callingCode: '+60',
    placeholder: '12 345 6789'
  },
  {
    countryCode: 'MZ',
    label: 'Mozambique',
    callingCode: '+258',
    placeholder: '82 123 4567'
  },
  {
    countryCode: 'NA',
    label: 'Namibia',
    callingCode: '+264',
    placeholder: '81 123 4567'
  },
  {
    countryCode: 'NC',
    label: 'New Caledonia',
    callingCode: '+687',
    placeholder: '75 12 34'
  },
  {
    countryCode: 'NE',
    label: 'Niger',
    callingCode: '+227',
    placeholder: '90 12 34 56'
  },
  {
    countryCode: 'NF',
    label: 'Norfolk Island',
    callingCode: '+672',
    placeholder: '12 345'
  },
  {
    countryCode: 'NG',
    label: 'Nigeria',
    callingCode: '+234',
    placeholder: '802 123 4567'
  },
  {
    countryCode: 'NI',
    label: 'Nicaragua',
    callingCode: '+505',
    placeholder: '8712 3456'
  },
  {
    countryCode: 'NL',
    label: 'Netherlands',
    callingCode: '+31',
    placeholder: '6 12345678'
  },
  {
    countryCode: 'NO',
    label: 'Norway',
    callingCode: '+47',
    placeholder: '406 12 345'
  },
  {
    countryCode: 'NP',
    label: 'Nepal',
    callingCode: '+977',
    placeholder: '98 1234 5678'
  },
  {
    countryCode: 'NR',
    label: 'Nauru',
    callingCode: '+674',
    placeholder: '555 1234'
  },
  {
    countryCode: 'NU',
    label: 'Niue',
    callingCode: '+683',
    placeholder: '1234'
  },
  {
    countryCode: 'NZ',
    label: 'New Zealand',
    callingCode: '+64',
    placeholder: '21 123 4567'
  },
  {
    countryCode: 'OM',
    label: 'Oman',
    callingCode: '+968',
    placeholder: '9212 3456'
  },
  {
    countryCode: 'PA',
    label: 'Panama',
    callingCode: '+507',
    placeholder: '6123 4567'
  },
  {
    countryCode: 'PE',
    label: 'Peru',
    callingCode: '+51',
    placeholder: '912 345 678'
  },
  {
    countryCode: 'PF',
    label: 'French Polynesia',
    callingCode: '+689',
    placeholder: '87 12 34 56'
  },
  {
    countryCode: 'PG',
    label: 'Papua New Guinea',
    callingCode: '+675',
    placeholder: '7012 3456'
  },
  {
    countryCode: 'PH',
    label: 'Philippines',
    callingCode: '+63',
    placeholder: '917 123 4567'
  },
  {
    countryCode: 'PK',
    label: 'Pakistan',
    callingCode: '+92',
    placeholder: '301 2345678'
  },
  {
    countryCode: 'PL',
    label: 'Poland',
    callingCode: '+48',
    placeholder: '512 123 456'
  },
  {
    countryCode: 'PM',
    label: 'Saint Pierre and Miquelon',
    callingCode: '+508',
    placeholder: '55 12 34'
  },
  {
    countryCode: 'PN',
    label: 'Pitcairn',
    callingCode: '+870',
    placeholder: '12345'
  },
  {
    countryCode: 'PR',
    label: 'Puerto Rico',
    callingCode: '+1',
    placeholder: '787 234 5678'
  },
  {
    countryCode: 'PS',
    label: 'Palestine, State of',
    callingCode: '+970',
    placeholder: '59 123 4567'
  },
  {
    countryCode: 'PT',
    label: 'Portugal',
    callingCode: '+351',
    placeholder: '912 345 678'
  },
  {
    countryCode: 'PW',
    label: 'Palau',
    callingCode: '+680',
    placeholder: '620 1234'
  },
  {
    countryCode: 'PY',
    label: 'Paraguay',
    callingCode: '+595',
    placeholder: '961 456789'
  },
  {
    countryCode: 'QA',
    label: 'Qatar',
    callingCode: '+974',
    placeholder: '3312 3456'
  },
  {
    countryCode: 'RE',
    label: 'Reunion',
    callingCode: '+262',
    placeholder: '692 12 34 56'
  },
  {
    countryCode: 'RO',
    label: 'Romania',
    callingCode: '+40',
    placeholder: '712 345 678'
  },
  {
    countryCode: 'RS',
    label: 'Serbia',
    callingCode: '+381',
    placeholder: '60 1234567'
  },
  {
    countryCode: 'RU',
    label: 'Russian Federation',
    callingCode: '+7',
    placeholder: '912 345 67 89'
  },
  {
    countryCode: 'RW',
    label: 'Rwanda',
    callingCode: '+250',
    placeholder: '781 234 567'
  },
  {
    countryCode: 'SA',
    label: 'Saudi Arabia',
    callingCode: '+966',
    placeholder: '50 123 4567'
  },
  {
    countryCode: 'SB',
    label: 'Solomon Islands',
    callingCode: '+677',
    placeholder: '74 12345'
  },
  {
    countryCode: 'SC',
    label: 'Seychelles',
    callingCode: '+248',
    placeholder: '2 510 123'
  },
  {
    countryCode: 'SD',
    label: 'Sudan',
    callingCode: '+249',
    placeholder: '91 123 1234'
  },
  {
    countryCode: 'SE',
    label: 'Sweden',
    callingCode: '+46',
    placeholder: '70 123 45 67'
  },
  {
    countryCode: 'SG',
    label: 'Singapore',
    callingCode: '+65',
    placeholder: '8123 4567'
  },
  {
    countryCode: 'SH',
    label: 'Saint Helena',
    callingCode: '+290',
    placeholder: '51234'
  },
  {
    countryCode: 'SI',
    label: 'Slovenia',
    callingCode: '+386',
    placeholder: '31 234 567'
  },
  {
    countryCode: 'SJ',
    label: 'Svalbard and Jan Mayen',
    callingCode: '+47',
    placeholder: '79 12 34 56'
  },
  {
    countryCode: 'SK',
    label: 'Slovakia',
    callingCode: '+421',
    placeholder: '912 123 456'
  },
  {
    countryCode: 'SL',
    label: 'Sierra Leone',
    callingCode: '+232',
    placeholder: '25 123456'
  },
  {
    countryCode: 'SM',
    label: 'San Marino',
    callingCode: '+378',
    placeholder: '66 66 12 12'
  },
  {
    countryCode: 'SN',
    label: 'Senegal',
    callingCode: '+221',
    placeholder: '70 123 45 67'
  },
  {
    countryCode: 'SO',
    label: 'Somalia',
    callingCode: '+252',
    placeholder: '7 1123456'
  },
  {
    countryCode: 'SR',
    label: 'Suriname',
    callingCode: '+597',
    placeholder: '741 2345'
  },
  {
    countryCode: 'SS',
    label: 'South Sudan',
    callingCode: '+211',
    placeholder: '91 123 4567'
  },
  {
    countryCode: 'ST',
    label: 'Sao Tome and Principe',
    callingCode: '+239',
    placeholder: '981 2345'
  },
  {
    countryCode: 'SV',
    label: 'El Salvador',
    callingCode: '+503',
    placeholder: '7012 3456'
  },
  {
    countryCode: 'SX',
    label: 'Sint Maarten (Dutch part)',
    callingCode: '+1-721',
    placeholder: '520 1234'
  },
  {
    countryCode: 'SY',
    label: 'Syrian Arab Republic',
    callingCode: '+963',
    placeholder: '944 567 890'
  },
  {
    countryCode: 'SZ',
    label: 'Swaziland',
    callingCode: '+268',
    placeholder: '7612 3456'
  },
  {
    countryCode: 'TC',
    label: 'Turks and Caicos Islands',
    callingCode: '+1-649',
    placeholder: '231 1234'
  },
  {
    countryCode: 'TD',
    label: 'Chad',
    callingCode: '+235',
    placeholder: '63 01 23 45'
  },
  {
    countryCode: 'TF',
    label: 'French Southern Territories',
    callingCode: '+262',
    placeholder: '692 12 34 56'
  },
  {
    countryCode: 'TG',
    label: 'Togo',
    callingCode: '+228',
    placeholder: '90 11 23 45'
  },
  {
    countryCode: 'TH',
    label: 'Thailand',
    callingCode: '+66',
    placeholder: '81 234 5678'
  },
  {
    countryCode: 'TJ',
    label: 'Tajikistan',
    callingCode: '+992',
    placeholder: '37 123 4567'
  },
  {
    countryCode: 'TK',
    label: 'Tokelau',
    callingCode: '+690',
    placeholder: '7290'
  },
  {
    countryCode: 'TL',
    label: 'Timor-Leste',
    callingCode: '+670',
    placeholder: '7721 2345'
  },
  {
    countryCode: 'TM',
    label: 'Turkmenistan',
    callingCode: '+993',
    placeholder: '65 123456'
  },
  {
    countryCode: 'TN',
    label: 'Tunisia',
    callingCode: '+216',
    placeholder: '20 123 456'
  },
  {
    countryCode: 'TO',
    label: 'Tonga',
    callingCode: '+676',
    placeholder: '771 5123'
  },
  {
    countryCode: 'TR',
    label: 'Turkey',
    callingCode: '+90',
    placeholder: '501 234 56 78'
  },
  {
    countryCode: 'TT',
    label: 'Trinidad and Tobago',
    callingCode: '+1-868',
    placeholder: '291 1234'
  },
  {
    countryCode: 'TV',
    label: 'Tuvalu',
    callingCode: '+688',
    placeholder: '901234'
  },
  {
    countryCode: 'TW',
    label: 'Taiwan',
    callingCode: '+886',
    placeholder: '912 345 678'
  },
  {
    countryCode: 'TZ',
    label: 'United Republic of Tanzania',
    callingCode: '+255',
    placeholder: '621 234 567'
  },
  {
    countryCode: 'UA',
    label: 'Ukraine',
    callingCode: '+380',
    placeholder: '50 123 4567'
  },
  {
    countryCode: 'UG',
    label: 'Uganda',
    callingCode: '+256',
    placeholder: '712 345678'
  },
  {
    countryCode: 'US',
    label: 'United States',
    callingCode: '+1',
    placeholder: '201 555 0123',
    suggested: true
  },
  {
    countryCode: 'UY',
    label: 'Uruguay',
    callingCode: '+598',
    placeholder: '94 231 234'
  },
  {
    countryCode: 'UZ',
    label: 'Uzbekistan',
    callingCode: '+998',
    placeholder: '90 123 45 67'
  },
  {
    countryCode: 'VA',
    label: 'Holy See (Vatican City State)',
    callingCode: '+379',
    placeholder: '06 698 12345'
  },
  {
    countryCode: 'VC',
    label: 'Saint Vincent and the Grenadines',
    callingCode: '+1-784',
    placeholder: '430 1234'
  },
  {
    countryCode: 'VE',
    label: 'Venezuela',
    callingCode: '+58',
    placeholder: '412 1234567'
  },
  {
    countryCode: 'VG',
    label: 'British Virgin Islands',
    callingCode: '+1-284',
    placeholder: '300 1234'
  },
  {
    countryCode: 'VI',
    label: 'US Virgin Islands',
    callingCode: '+1-340',
    placeholder: '642 1234'
  },
  {
    countryCode: 'VN',
    label: 'Vietnam',
    callingCode: '+84',
    placeholder: '91 234 56 78'
  },
  {
    countryCode: 'VU',
    label: 'Vanuatu',
    callingCode: '+678',
    placeholder: '591 2345'
  },
  {
    countryCode: 'WF',
    label: 'Wallis and Futuna',
    callingCode: '+681',
    placeholder: '82 12 34'
  },
  {
    countryCode: 'WS',
    label: 'Samoa',
    callingCode: '+685',
    placeholder: '72 12345'
  },
  {
    countryCode: 'XK',
    label: 'Kosovo',
    callingCode: '+383',
    placeholder: '43 201 234'
  },
  {
    countryCode: 'YE',
    label: 'Yemen',
    callingCode: '+967',
    placeholder: '1 234 567'
  },
  {
    countryCode: 'YT',
    label: 'Mayotte',
    callingCode: '+262',
    placeholder: '639 12 34 56'
  },
  {
    countryCode: 'ZA',
    label: 'South Africa',
    callingCode: '+27',
    placeholder: '82 123 4567'
  },
  {
    countryCode: 'ZM',
    label: 'Zambia',
    callingCode: '+260',
    placeholder: '95 5123456'
  },
  {
    countryCode: 'ZW',
    label: 'Zimbabwe',
    callingCode: '+263',
    placeholder: '71 212 3456'
  }
]
