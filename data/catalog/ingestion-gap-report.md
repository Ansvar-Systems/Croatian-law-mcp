# Ingestion Gap Report

Generated at: `2026-02-22T07:37:42Z` (UTC)

## Snapshot

- Catalog entries (`data/catalog/nn-law-catalog.json`): `4763`
- Correction notices (`ispravak`, intentionally skipped): `234`
- Ingestable catalog targets (non-`ispravak`): `4529`
- Matched ingested IDs in `data/seed-catalog`: `4515`
- Unresolved catalog targets: `14`

Notes:
- `data/seed-catalog` currently contains 6 legacy IDs that are not part of the normalized catalog ID set. They are excluded from matched coverage above.
- This report documents official-source gaps only. No legal text was fabricated.

## Unresolved Targets

| Key | Title | Reason | URL |
|---|---|---|---|
| `1990-13-176` | Zakon o davanju garancije Socijalističkoj Federativnoj Republici Jugoslaviji za otplatu zajma Međunarodne banke za obnovu i razvoj, Washington, koji će koristiti ŽTP - Željezničko-transportno poduzeće | `PARSED_0_PROVISIONS` | https://narodne-novine.nn.hr/eli/sluzbeni/1990/13/176/hrv/printhtml |
| `1990-18-344` | Zakon o privremenoj zabrani raspolaganja dijelom društvenih sredstava društveno-političkih zajednica, samoupravnih interesnih zajednica i samoupravnih fondova društvenih djelatnosti i socijalne sigur | `PARSED_0_PROVISIONS` | https://narodne-novine.nn.hr/eli/sluzbeni/1990/18/344/hrv/printhtml |
| `1990-28-533` | Zakon o Hrvatskoj radio-televiziji | `PARSED_0_PROVISIONS` | https://narodne-novine.nn.hr/eli/sluzbeni/1990/28/533/hrv/printhtml |
| `1990-58-1139` | Zakon o plaćanju doprinosa za mirovinsko i invalidsko osiguranje individualnih poljoprivrednika u 1991. godini | `PARSED_0_PROVISIONS` | https://narodne-novine.nn.hr/eli/sluzbeni/1990/58/1139/hrv/printhtml |
| `1990-59-1162` | Zakon o dopunama Zakona o povlasticama slijepih osoba, osoba oboljelih od distrofije i srodnih mišićnih i neuromišićnih bolesti i njihovih pratilaca u unutrašnjem putničkom prijevozu | `PARSED_0_PROVISIONS` | https://narodne-novine.nn.hr/eli/sluzbeni/1990/59/1162/hrv/printhtml |
| `1991-53-2001` | Zakon o Carinskoj tarifi | `PARSED_0_PROVISIONS` | https://narodne-novine.nn.hr/eli/sluzbeni/1991/53/2001/hrv/printhtml |
| `1991-65-1664` | Ustavni zakon o ljudskim pravima i slobodama i o pravima etničkih i nacionalnih zajednica ili manjina u Republici Hrvatskoj | `PARSED_0_PROVISIONS` | https://narodne-novine.nn.hr/eli/sluzbeni/1991/65/1664/hrv/printhtml |
| `1993-118-1771` | NN 91A/93 - Zakon o osnovama deviznog sustava, deviznog poslovanja i prometu zlata | `HTTP_404` | https://narodne-novine.nn.hr/eli/sluzbeni/1993/118/1771/hrv/printhtml |
| `1993-91-2291` | NN 91A/93 - Zakon o osnovama deviznog sustava, deviznog poslovanja i prometu zlata | `PARSED_0_PROVISIONS` | https://narodne-novine.nn.hr/eli/sluzbeni/1993/91/2291/hrv/printhtml |
| `1996-111-2168` | Zakon o izmjeni i dopuni Zakona o plaćama sudaca i drugih pravosudnih dužnosnika | `PARSED_0_PROVISIONS` | https://narodne-novine.nn.hr/eli/sluzbeni/1996/111/2168/hrv/printhtml |
| `1996-41-811` | Zakon o plaćanju doplatne marke "Spasite djecu Hrvatske" u unutarnjem poštanskom prometu | `PARSED_0_PROVISIONS` | https://narodne-novine.nn.hr/eli/sluzbeni/1996/41/811/hrv/printhtml |
| `1996-41-812` | Zakon o plaćanju doplatne marke "Zaustavimo bijelu smrt!" u unutarnjem poštanskom prometu | `PARSED_0_PROVISIONS` | https://narodne-novine.nn.hr/eli/sluzbeni/1996/41/812/hrv/printhtml |
| `1996-41-813` | Zakon o izmjenama Zakona o zaštiti od elementarnih nepogoda | `PARSED_0_PROVISIONS` | https://narodne-novine.nn.hr/eli/sluzbeni/1996/41/813/hrv/printhtml |
| `2020-124-2402` | Zakon o izmjenama i dopunama Zakona o izvršavanju Državnog proračuna Republike Hrvatske za 2020. godinu | `HTTP_404` | https://narodne-novine.nn.hr/eli/sluzbeni/2020/124/2402/hrv/printhtml |

## Repro

To reproduce unresolved coverage state:

```bash
npm run catalog:build-csv
npm run catalog:ingest
```

