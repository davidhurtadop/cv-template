// Technology logos for the hero strip. `tech: [python, aws]` in the front matter uses these slugs.
// Logos live in vendor/devicon/tech.svg as <symbol id="tech-<slug>"> (see vendor/VERSIONS.md to add more).
export const TECH = {
  python: 'Python',
  flask: 'Flask',
  fastapi: 'FastAPI',
  dotnet: '.NET',
  csharp: 'C#',
  aws: 'AWS',
  azure: 'Azure',
  azuredevops: 'Azure DevOps',
  oracle: 'Oracle',
  mysql: 'MySQL',
  sqlserver: 'SQL Server',
  git: 'Git',
  githubactions: 'GitHub Actions',
  terraform: 'Terraform',
  docker: 'Docker',
  postman: 'Postman',
  openapi: 'OpenAPI',
  pytest: 'Pytest',
  sonarqube: 'SonarQube',
  datadog: 'Datadog',
};

export const TECH_SPRITE_PATH = 'vendor/devicon/tech.svg';

const titleCase = (slug) => slug.replace(/[-_]+/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

/** Unknown slugs still show as a text-only chip, so a typo never hides the strip. */
export function techEntry(slug) {
  const known = slug in TECH;
  return {
    slug,
    label: known ? TECH[slug] : titleCase(slug),
    icon: known ? `${TECH_SPRITE_PATH}#tech-${slug}` : '',
  };
}
