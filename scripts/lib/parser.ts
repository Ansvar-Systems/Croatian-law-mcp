/**
 * Parser and target catalogue for Croatian legislation from Narodne novine ELI pages.
 */

export interface LawTarget {
  seedFile: string;
  id: string;
  title: string;
  titleEn: string;
  shortName: string;
  year: number;
  issue: number;
  actNum: string;
  status: 'in_force' | 'amended' | 'repealed' | 'not_yet_in_force';
  description: string;
}

export interface ParsedProvision {
  provision_ref: string;
  section: string;
  title: string;
  content: string;
}

export interface ParsedDefinition {
  term: string;
  definition: string;
  source_provision?: string;
}

export interface ParsedLaw {
  id: string;
  type: 'statute';
  title: string;
  title_en: string;
  short_name: string;
  status: 'in_force' | 'amended' | 'repealed' | 'not_yet_in_force';
  issued_date: string;
  in_force_date: string;
  url: string;
  description: string;
  provisions: ParsedProvision[];
  definitions: ParsedDefinition[];
}

export const TARGET_LAWS: LawTarget[] = [
  {
    seedFile: '01-gdpr-implementation-act.json',
    id: 'gdpr-impl-nn-42-18',
    title: 'Zakon o provedbi Opće uredbe o zaštiti podataka',
    titleEn: 'Act on the Implementation of the General Data Protection Regulation',
    shortName: 'GDPR provedbeni zakon',
    year: 2018,
    issue: 42,
    actNum: '805',
    status: 'in_force',
    description:
      'Zakon osigurava provedbu GDPR-a u Republici Hrvatskoj, uređuje nadzorne ovlasti AZOP-a i posebna nacionalna pravila o obradi osobnih podataka.',
  },
  {
    seedFile: '02-cybersecurity-act.json',
    id: 'cybersecurity-nn-14-24',
    title: 'Zakon o kibernetičkoj sigurnosti',
    titleEn: 'Cybersecurity Act',
    shortName: 'ZKS',
    year: 2024,
    issue: 14,
    actNum: '254',
    status: 'in_force',
    description:
      'Zakon uređuje nacionalni okvir kibernetičke sigurnosti, obveze subjekata i tijela nadležnih za upravljanje rizicima i prijavu incidenata.',
  },
  {
    seedFile: '03-electronic-communications-act.json',
    id: 'ecomm-nn-76-22',
    title: 'Zakon o elektroničkim komunikacijama',
    titleEn: 'Electronic Communications Act',
    shortName: 'ZEK',
    year: 2022,
    issue: 76,
    actNum: '1116',
    status: 'in_force',
    description:
      'Zakon uređuje tržište elektroničkih komunikacija, prava korisnika, ovlasti regulatora i sigurnosne obveze operatora.',
  },
  {
    seedFile: '04-electronic-commerce-act.json',
    id: 'ecommerce-nn-173-03',
    title: 'Zakon o elektroničkoj trgovini',
    titleEn: 'Electronic Commerce Act',
    shortName: 'ZET',
    year: 2003,
    issue: 173,
    actNum: '2504',
    status: 'in_force',
    description:
      'Zakon uređuje pružanje usluga informacijskog društva, odgovornost pružatelja i sklapanje ugovora elektroničkim putem.',
  },
  {
    seedFile: '05-right-of-access-to-information-act.json',
    id: 'access-info-nn-25-13',
    title: 'Zakon o pravu na pristup informacijama',
    titleEn: 'Right of Access to Information Act',
    shortName: 'ZPPI',
    year: 2013,
    issue: 25,
    actNum: '403',
    status: 'in_force',
    description:
      'Zakon uređuje pravo javnosti na pristup informacijama tijela javne vlasti, ponovnu uporabu informacija i postupovna pravila ostvarivanja tog prava.',
  },
  {
    seedFile: '06-electronic-identification-act.json',
    id: 'eid-trust-nn-62-17',
    title:
      'Zakon o provedbi Uredbe (EU) br. 910/2014 Europskog parlamenta i Vijeća od 23. srpnja 2014. o elektroničkoj identifikaciji i uslugama povjerenja za elektroničke transakcije na unutarnjem tržištu i stavljanju izvan snage Direktive 1999/93/EZ',
    titleEn:
      'Act on the Implementation of Regulation (EU) No 910/2014 on Electronic Identification and Trust Services',
    shortName: 'eIDAS provedbeni zakon',
    year: 2017,
    issue: 62,
    actNum: '1430',
    status: 'in_force',
    description:
      'Zakon uređuje nacionalnu provedbu eIDAS okvira, nadležna tijela i nadzor pružatelja usluga povjerenja.',
  },
  {
    seedFile: '07-criminal-code-cybercrime.json',
    id: 'criminal-code-nn-125-11',
    title: 'Kazneni zakon',
    titleEn: 'Criminal Code',
    shortName: 'KZ',
    year: 2011,
    issue: 125,
    actNum: '2498',
    status: 'in_force',
    description:
      'Kazneni zakon propisuje kaznena djela i sankcije, uključujući odredbe relevantne za računalni kriminal i zaštitu informacijskih sustava.',
  },
  {
    seedFile: '08-critical-infrastructure-protection-act.json',
    id: 'cip-nn-56-13',
    title: 'Zakon o kritičnim infrastrukturama',
    titleEn: 'Critical Infrastructures Act',
    shortName: 'ZKI',
    year: 2013,
    issue: 56,
    actNum: '1134',
    status: 'in_force',
    description:
      'Zakon uređuje identifikaciju, zaštitu i otpornost kritičnih infrastruktura te obveze nadležnih tijela i operatora.',
  },
  {
    seedFile: '09-state-information-infrastructure-act.json',
    id: 'sii-nn-92-14',
    title: 'Zakon o državnoj informacijskoj infrastrukturi',
    titleEn: 'State Information Infrastructure Act',
    shortName: 'ZDII',
    year: 2014,
    issue: 92,
    actNum: '1840',
    status: 'in_force',
    description:
      'Zakon uređuje uspostavu i upravljanje državnom informacijskom infrastrukturom te interoperabilnost i digitalne usluge javne uprave.',
  },
  {
    seedFile: '10-trade-secrets-act.json',
    id: 'trade-secrets-nn-30-18',
    title: 'Zakon o zaštiti neobjavljenih informacija s tržišnom vrijednosti',
    titleEn: 'Trade Secrets Act',
    shortName: 'Zakon o poslovnoj tajni',
    year: 2018,
    issue: 30,
    actNum: '605',
    status: 'in_force',
    description:
      'Zakon uređuje zaštitu poslovnih tajni od nezakonitog pribavljanja, korištenja i otkrivanja te sudsku zaštitu nositelja prava.',
  },
];

export function buildEliLawUrl(target: LawTarget): string {
  return `https://narodne-novine.nn.hr/eli/sluzbeni/${target.year}/${target.issue}/${target.actNum}`;
}

export function buildEliPrintHtmlUrl(target: LawTarget): string {
  return `${buildEliLawUrl(target)}/hrv/printhtml`;
}

function decodeEntities(input: string): string {
  const named = input
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&ndash;/g, '–')
    .replace(/&mdash;/g, '—')
    .replace(/&hellip;/g, '…')
    .replace(/&middot;/g, '·');

  return named.replace(/&#(\d+);/g, (_, n: string) => {
    const code = Number.parseInt(n, 10);
    return Number.isFinite(code) ? String.fromCharCode(code) : _;
  });
}

function stripHtml(input: string): string {
  return decodeEntities(
    input
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim(),
  );
}

function extractMetaContent(html: string, propertyName: string): string | null {
  const escaped = propertyName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(
    `<meta[^>]*property=\\"${escaped}\\"[^>]*content=\\"([^\\"]+)\\"[^>]*>`,
    'i',
  );
  const m = html.match(re);
  return m ? decodeEntities(m[1]).trim() : null;
}

function normalizeSection(section: string): string {
  return section.replace(/[^0-9A-Za-z]/g, '').toLowerCase();
}

function extractProvisions(html: string): ParsedProvision[] {
  const cleaned = html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ');

  const articleHeadingRe = new RegExp(
    String.raw`<p[^>]*class\s*=\s*(?:"[^"]*Clanak[^"]*"|'[^']*Clanak[^']*'|[^\s>]*Clanak[^\s>]*)[^>]*>[\s\S]*?Članak\s*(\d+[a-z]?)\.[\s\S]*?<\/p>`,
    'giu',
  );
  const headings = [...cleaned.matchAll(articleHeadingRe)];

  const longestBySection = new Map<string, ParsedProvision>();

  for (let i = 0; i < headings.length; i++) {
    const sectionRaw = headings[i][1].trim();
    const section = normalizeSection(sectionRaw);
    if (!section) continue;

    const start = (headings[i].index ?? 0) + headings[i][0].length;
    const end = headings[i + 1] ? (headings[i + 1].index ?? cleaned.length) : cleaned.length;
    const articleHtml = cleaned.slice(start, end);

    const content = stripHtml(articleHtml);
    if (content.length < 20) continue;

    const provision: ParsedProvision = {
      provision_ref: `art${section}`,
      section,
      title: `Članak ${sectionRaw}.`,
      content,
    };

    const existing = longestBySection.get(section);
    if (!existing || provision.content.length > existing.content.length) {
      longestBySection.set(section, provision);
    }
  }

  return [...longestBySection.values()].sort((a, b) => {
    const an = Number.parseInt(a.section, 10);
    const bn = Number.parseInt(b.section, 10);
    if (Number.isFinite(an) && Number.isFinite(bn) && an !== bn) return an - bn;
    return a.section.localeCompare(b.section, 'hr');
  });
}

function extractDefinitions(provisions: ParsedProvision[]): ParsedDefinition[] {
  const definitions: ParsedDefinition[] = [];
  const seen = new Set<string>();

  for (const provision of provisions) {
    const text = provision.content;
    const lower = text.toLowerCase();

    const isDefinitionArticle =
      lower.includes('u smislu ovoga zakona') ||
      lower.includes('pojedini izrazi') ||
      lower.includes('značenje izraza') ||
      lower.includes('u smislu ove uredbe');

    if (!isDefinitionArticle) continue;

    const numberedPattern = /(?:\(|\b)(\d{1,3})\)?\.?\s*[\-–—]?\s*[„"«]?([^"»“”\n:;]{2,90})["»“”]?\s*[:\-–—]\s*([^\n]{8,800}?)(?=(?:\s*\(\d+\)|\s+\d+\)|$))/g;
    let match: RegExpExecArray | null;

    while ((match = numberedPattern.exec(text)) !== null) {
      const term = match[2].replace(/\s+/g, ' ').trim();
      const definition = match[3].replace(/\s+/g, ' ').replace(/[;,.]\s*$/, '').trim();
      const key = `${term.toLowerCase()}|${definition.toLowerCase()}`;

      if (term.length < 2 || term.length > 120) continue;
      if (definition.length < 8) continue;
      if (seen.has(key)) continue;

      definitions.push({
        term,
        definition,
        source_provision: provision.provision_ref,
      });
      seen.add(key);
    }

    const quotedPattern = /[„"«]([^"»“”]{2,90})["»“”]\s+(?:znači|označava)\s+([^.;]{8,600})/gi;
    while ((match = quotedPattern.exec(text)) !== null) {
      const term = match[1].replace(/\s+/g, ' ').trim();
      const definition = match[2].replace(/\s+/g, ' ').trim();
      const key = `${term.toLowerCase()}|${definition.toLowerCase()}`;

      if (seen.has(key)) continue;
      definitions.push({
        term,
        definition,
        source_provision: provision.provision_ref,
      });
      seen.add(key);
    }
  }

  return definitions;
}

export function parseCroatianEliHtml(html: string, target: LawTarget): ParsedLaw {
  const titleMeta = extractMetaContent(html, 'http://data.europa.eu/eli/ontology#title');
  const dateDocument = extractMetaContent(html, 'http://data.europa.eu/eli/ontology#date_document');
  const datePublication = extractMetaContent(html, 'http://data.europa.eu/eli/ontology#date_publication');

  const provisions = extractProvisions(html);
  const definitions = extractDefinitions(provisions);

  return {
    id: target.id,
    type: 'statute',
    title: titleMeta ?? target.title,
    title_en: target.titleEn,
    short_name: target.shortName,
    status: target.status,
    issued_date: dateDocument ?? `${target.year}-01-01`,
    in_force_date: datePublication ?? dateDocument ?? `${target.year}-01-01`,
    url: buildEliLawUrl(target),
    description: target.description,
    provisions,
    definitions,
  };
}
