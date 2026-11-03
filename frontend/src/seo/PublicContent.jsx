import { PUBLIC_ROUTES, alternatePage } from '../../../shared/publicRoutes.mjs';
import { SEO_COPY } from './content';
import en from '../i18n/en.json';
import vi from '../i18n/vi.json';

const pathFor = (kind, lang) => PUBLIC_ROUTES.find((p) => p.kind === kind && p.lang === lang).path;
const copies = { en, vi };

export function PublicLinks({ lang }) {
  const { nav } = SEO_COPY[lang];
  return (
    <nav aria-label={nav.label} className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 py-6 text-base font-bold text-primary-dark">
      {['home', 'gallery', 'guide'].map((kind) => <a key={kind} className="underline underline-offset-4" href={pathFor(kind, lang)}>{nav[kind]}</a>)}
      <a className="underline underline-offset-4" href="/plans">{nav.plans}</a>
    </nav>
  );
}

export function PublicHeader({ page }) {
  const copy = SEO_COPY[page.lang];
  const other = alternatePage(page, page.lang === 'vi' ? 'en' : 'vi');
  return <header className="border-b border-line bg-white">
    <div className="mx-auto flex min-h-[72px] max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-3">
      <a href={pathFor('home', page.lang)} className="flex items-center gap-2 font-display text-2xl font-extrabold text-primary">
        <img src="/favicon.svg" alt="" width="36" height="36" />TinyTints
      </a>
      <nav className="flex items-center gap-4" aria-label={copy.nav.label}>
        <a href={other.path} hrefLang={other.lang} lang={other.lang} className="font-bold text-primary-dark">{other.lang === 'vi' ? 'Tiếng Việt' : 'English'}</a>
        <a href="/login" className="btn-ghost">{copy.nav.login}</a>
      </nav>
    </div>
  </header>;
}

export function HomeIntro({ lang, gallery }) {
  const copy = SEO_COPY[lang];
  const landing = copies[lang].landing;
  return <>
    <section className="grid items-center gap-6 py-6 md:grid-cols-2 md:py-12">
      <div>
        <h1 className="font-display text-4xl font-extrabold leading-tight md:text-6xl">{copy.home.heading}</h1>
        <p className="mt-3 text-lg text-muted md:text-xl">{copy.home.intro}</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <a href="/register" className="btn-primary text-xl" data-testid="cta-register">{copy.nav.register}</a>
          <a href={pathFor('gallery', lang)} className="btn-ghost text-xl">{copy.nav.gallery}</a>
        </div>
      </div>
      {gallery || <div className="grid grid-cols-2 gap-3" aria-hidden="true">
        {copy.topics.map((topic) => <div key={topic.image} className="card p-3"><img src={`/mascots/${topic.image}.svg`} alt="" width="200" height="200" className="aspect-square w-full object-contain" /></div>)}
      </div>}
    </section>
    <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-label={lang === 'vi' ? 'Tính năng TinyTints' : 'TinyTints features'}>
      {Object.entries(landing.features).map(([key, feature]) => <div key={key} className="card p-5">
        <h2 className="font-display text-xl font-bold">{feature.title}</h2>
        <p className="text-muted">{feature.text}</p>
      </div>)}
    </section>
  </>;
}

function Topics({ copy }) {
  return <section className="mt-10" aria-labelledby="coloring-topics">
    <h2 id="coloring-topics" className="font-display text-2xl font-extrabold">{copy.topicsTitle}</h2>
    <p className="mt-2 text-muted">{copy.topicsIntro}</p>
    <div className="mt-5 grid gap-4 sm:grid-cols-2">
      {copy.topics.map((topic) => <article key={topic.image} className="card flex items-start gap-4 p-5">
        <img src={`/mascots/${topic.image}.svg`} alt="" width="80" height="80" loading="lazy" className="h-20 w-20 shrink-0 object-contain" />
        <div><h3 className="font-display text-xl font-bold">{topic.title}</h3><p className="mt-2 text-muted">{topic.text}</p></div>
      </article>)}
    </div>
  </section>;
}

export function PublicDetails({ page }) {
  const copy = SEO_COPY[page.lang];
  return <div className="mt-8 space-y-10" data-testid="public-content">
    {(page.kind === 'gallery' || page.kind === 'home') && <Topics copy={copy} />}
    {page.kind === 'home' && <section>
      <h2 className="font-display text-2xl font-extrabold">{copy.modesTitle}</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">{copy.modes.map((mode) => <article key={mode.title} className="card p-5"><h3 className="font-display text-xl font-bold">{mode.title}</h3><p className="mt-2 text-muted">{mode.text}</p></article>)}</div>
    </section>}
    {page.kind === 'guide' && <section>
      <h2 className="font-display text-2xl font-extrabold">{copy.stepsTitle}</h2>
      <ol className="mt-5 list-decimal space-y-5 pl-6">{copy.steps.map((step) => <li key={step.title} className="pl-2"><h3 className="font-display text-xl font-bold">{step.title}</h3><p className="mt-2 text-muted">{step.text}</p></li>)}</ol>
    </section>}
    {page.kind !== 'home' && <section className="card p-5"><h2 className="font-display text-2xl font-extrabold">{copy.parentsTitle}</h2><p className="mt-3 text-muted">{copy.parentsText}</p></section>}
    {page.kind !== 'gallery' && <section>
      <h2 className="font-display text-2xl font-extrabold">{copy.faqTitle}</h2>
      <div className="mt-4 space-y-3">{copy.faq.map((faq) => <details key={faq.q} className="card p-5"><summary className="cursor-pointer font-bold">{faq.q}</summary><p className="mt-3 text-muted">{faq.a}</p></details>)}</div>
    </section>}
    <section className="card p-6 text-center">
      <h2 className="font-display text-2xl font-extrabold">{copy.nextTitle}</h2><p className="mx-auto mt-2 max-w-2xl text-muted">{copy.nextText}</p>
      <a href="/register" className="btn-primary mt-5">{copy.nav.register}</a>
    </section>
    <PublicLinks lang={page.lang} />
  </div>;
}

export function PublicArticle({ page }) {
  const copy = SEO_COPY[page.lang];
  return <article className="page max-w-5xl" data-testid="public-article">
    <PublicLinks lang={page.lang} />
    <h1 className="page-title">{copy[page.kind].heading}</h1>
    <p className="mt-4 text-lg text-muted">{copy[page.kind].intro}</p>
    <PublicDetails page={page} />
  </article>;
}

export function StaticPublicPage({ page }) {
  return <><PublicHeader page={page} />{page.kind === 'home'
    ? <main className="bg-[#BFE8FF] bg-cover bg-center" style={{ backgroundImage: 'url(/home-bg.webp)' }}><div className="page"><HomeIntro lang={page.lang} /><PublicDetails page={page} /></div></main>
    : <main><PublicArticle page={page} /></main>}</>;
}
