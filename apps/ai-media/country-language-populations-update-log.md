# Country-Language Population Update Log

Run timestamp (UTC): 2026-02-05T20:59:47.681Z

Source:
- Jesus Film public GraphQL gateway (`https://api-gateway.central.jesusfilm.org/`)
- Query fields used: `languages{id countryLanguages{country{id} speakers displaySpeakers suggested primary}}`

Selection rule per language-country pair:
- Prefer highest `displaySpeakers` from non-suggested entries.
- Fallback to highest positive estimate from any entry.
- If no positive value exists, keep zero.

Batch results:
- Batch 1: countries 1-30 (AF, AL, DZ, AS, AD, AO, AI, AG, AR, AM, AW, AU, AT, AZ, BS, BH, BD, BB, BY, BE, BZ, BJ, BM, BT, BO, BA, BW, BR, IO, BN)
  - updated: 184
  - unchanged: 472
  - missing source rows: 0
- Batch 2: countries 31-60 (BG, BF, BI, KH, CM, CA, CV, BQ, KY, CF, TD, CL, CN, CX, CC, CO, KM, CG, CK, CR, CI, HR, CU, CW, CY, CZ, DK, DJ, DM, DO)
  - updated: 166
  - unchanged: 669
  - missing source rows: 0
- Batch 3: countries 61-90 (CD, TL, EC, EG, SV, GQ, ER, EE, SZ, ET, FK, FO, FJ, FI, FR, GF, PF, GA, GM, GE, DE, GH, GI, GR, GL, GD, GP, GU, GT, GN)
  - updated: 195
  - unchanged: 575
  - missing source rows: 0
- Batch 4: countries 91-120 (GW, GY, HT, HN, HK, HU, IS, IN, ID, IR, IQ, IE, IM, IL, IT, JM, JP, JO, KZ, KE, KI, KP, KR, KW, KG, LA, LV, LB, LS, LR)
  - updated: 164
  - unchanged: 946
  - missing source rows: 0
- Batch 5: countries 121-150 (LY, LI, LT, LU, MO, MK, MG, MW, MY, MV, ML, MT, MH, MQ, MR, MU, YT, MX, FM, MD, MC, MN, ME, MS, MA, MZ, MM, NA, NR, NP)
  - updated: 156
  - unchanged: 508
  - missing source rows: 0
- Batch 6: countries 151-180 (NL, NC, NZ, NI, NE, NG, NU, NF, MP, NO, OM, PK, PW, PS, PA, PG, PY, PE, PH, PN, PL, PT, PR, QA, RE, RO, RU, RW, BL, KN)
  - updated: 178
  - unchanged: 788
  - missing source rows: 0
- Batch 7: countries 181-210 (LC, MF, VC, WS, SM, ST, SA, SN, RS, SC, SL, SG, SX, SK, SI, SB, SO, ZA, SS, ES, LK, SH, PM, SD, SR, SJ, SE, CH, SY, TW)
  - updated: 161
  - unchanged: 429
  - missing source rows: 0
- Batch 8: countries 211-240 (TJ, TZ, TH, TG, TK, TO, TT, TN, TR, TM, TC, TV, UG, UA, AE, GB, US, UY, UZ, VU, VA, VE, VN, VG, VI, WF, EH, YE, ZM, ZW)
  - updated: 204
  - unchanged: 803
  - missing source rows: 0

Totals:
- updated: 1408
- unchanged: 5190
- missing source rows: 0

