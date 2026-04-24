export type Locale = 'pt' | 'en';

export interface SkillCategory {
  category: string;
  items: string[];
}

export interface ProjectLinks {
  github?: string;
  demo?: string;
}

export interface ProjectItem {
  id: string;
  title: string;
  summary: string;
  tags?: string[];
  links?: ProjectLinks;
  image?: string;
  highlights?: string[];
  stack?: string[];
}

export interface PortfolioContent {
  locale: Locale;
  about: string;
  bioShort: string;
  skills: SkillCategory[];
  projects: ProjectItem[];
}
