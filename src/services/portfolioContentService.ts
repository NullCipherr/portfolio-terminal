import { Locale, PortfolioContent, ProjectItem, SkillCategory } from '../types/content';

const DEFAULT_RAW_BASE_URL =
  'https://raw.githubusercontent.com/NullCipherr/portfolio-content/main';

const rawBaseUrl =
  import.meta.env.VITE_PORTFOLIO_CONTENT_RAW_BASE_URL?.trim() || DEFAULT_RAW_BASE_URL;

const normalizeBaseUrl = (value: string): string => value.replace(/\/+$/, '');

const buildRawUrl = (locale: Locale, file: string): string =>
  `${normalizeBaseUrl(rawBaseUrl)}/content/${locale}/${file}`;

const parseSkills = (payload: unknown): SkillCategory[] => {
  if (!Array.isArray(payload)) return [];

  return payload
    .map((entry) => {
      const category =
        typeof entry === 'object' && entry !== null && 'category' in entry
          ? String((entry as { category: unknown }).category)
          : '';

      const itemsRaw =
        typeof entry === 'object' && entry !== null && 'items' in entry
          ? (entry as { items: unknown }).items
          : [];

      const items = Array.isArray(itemsRaw)
        ? itemsRaw.map((item) => String(item)).filter(Boolean)
        : [];

      return { category, items };
    })
    .filter((entry) => entry.category.length > 0);
};

const parseProjects = (payload: unknown): ProjectItem[] => {
  if (!Array.isArray(payload)) return [];

  const output: ProjectItem[] = [];

  payload.forEach((entry) => {
    if (!entry || typeof entry !== 'object') return;

    const item = entry as Record<string, unknown>;
    const id = String(item.id ?? '').trim();
    const title = String(item.title ?? '').trim();
    const summary = String(item.summary ?? '').trim();

    if (!id || !title || !summary) return;

    const linksRaw = item.links;
    const links = linksRaw && typeof linksRaw === 'object'
      ? {
          github:
            typeof (linksRaw as { github?: unknown }).github === 'string'
              ? (linksRaw as { github: string }).github
              : undefined,
          demo:
            typeof (linksRaw as { demo?: unknown }).demo === 'string'
              ? (linksRaw as { demo: string }).demo
              : undefined,
        }
      : undefined;

    output.push({
      id,
      title,
      summary,
      tags: Array.isArray(item.tags)
        ? item.tags.map((tag) => String(tag)).filter(Boolean)
        : undefined,
      links,
      image: typeof item.image === 'string' ? item.image : undefined,
      highlights: Array.isArray(item.highlights)
        ? item.highlights.map((highlight) => String(highlight)).filter(Boolean)
        : undefined,
      stack: Array.isArray(item.stack)
        ? item.stack.map((tech) => String(tech)).filter(Boolean)
        : undefined,
    });
  });

  return output;
};

const fetchText = async (url: string): Promise<string> => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Falha ao carregar ${url} (${response.status})`);
  }

  return response.text();
};

const fetchJson = async <T>(url: string): Promise<T> => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Falha ao carregar ${url} (${response.status})`);
  }

  return (await response.json()) as T;
};

export const portfolioContentService = {
  rawBaseUrl: normalizeBaseUrl(rawBaseUrl),

  async getContent(locale: Locale): Promise<PortfolioContent> {
    const [about, bioShort, skillsPayload, projectsPayload] = await Promise.all([
      fetchText(buildRawUrl(locale, 'about.md')),
      fetchText(buildRawUrl(locale, 'bio-short.md')),
      fetchJson<unknown>(buildRawUrl(locale, 'skills.json')),
      fetchJson<unknown>(buildRawUrl(locale, 'projects.json')),
    ]);

    return {
      locale,
      about,
      bioShort,
      skills: parseSkills(skillsPayload),
      projects: parseProjects(projectsPayload),
    };
  },
};
