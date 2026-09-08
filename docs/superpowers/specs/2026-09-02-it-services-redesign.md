# SourceTX v2 — IT Services Company Redesign

Date: 2026-09-02
Status: Approved design (user confirmed scope, branding, jobs, services, style, copy)

## Goal

Convert the SourceTX website from an IT recruiter/staffing company into an IT services
company modeled on Riseup Labs (https://riseuplabs.com/) — same service portfolio and
modern enterprise look — while keeping the working infrastructure and branding.

## Decisions (confirmed with user)

- **Scope:** Full redesign (new structure + refreshed design).
- **Branding:** Keep the SourceTX name, logo treatment, and contact info.
- **Jobs:** Keep the dynamic job board but reword to fit an IT services company
  (Career-focused copy, not recruiter copy).
- **Services:** All nine — Custom Software Development, Mobile App Development, UI/UX
  Design, Cloud Solutions & DevOps, QA & Software Testing, Data & Analytics, AI &
  Machine Learning, Digital Transformation, Staff Augmentation.
- **Visual style:** Blue/violet modern — white clean sections, blue-to-violet gradient
  accents, rounded cards, bold headlines, "trusted by" logo row, process steps,
  testimonials, stats, dark navy footer.
- **Copy:** Agent writes fresh, polished copy.
- **Reference site access:** riseuplabs.com is Cloudflare-blocked and Wayback is
  unreachable; service portfolio based on known Riseup Labs service lines.

## New sitemap

- `index.html` — Home: hero, value props, services grid (9), industries, why-us,
  process (4-6 steps), testimonials, stats, CTA, footer.
- `services.html` — hub page with 9 service cards linking to detail pages.
- `software-development.html` — Custom Software Development
- `mobile-app-development.html` — Mobile App Development
- `ui-ux-design.html` — UI/UX Design
- `cloud-devops.html` — Cloud Solutions & DevOps
- `qa-testing.html` — QA & Software Testing
- `data-analytics.html` — Data & Analytics
- `ai-machine-learning.html` — AI & Machine Learning
- `digital-transformation.html` — Digital Transformation
- `staff-augmentation.html` — Staff Augmentation
- `about.html` — rewritten company story (IT services).
- Careers (reworded, structure kept): `job-seekers.html`, `jobs.html`, `job-detail.html`,
  `apply-detail.html`, `general-application.html`, job/apply detail pages.
- `contact.html` — kept; contact Topic options updated to IT services topics.
- `privacy.html`, `terms.html`, `404.html` — kept, copy adjusted where relevant.
- `employers.html` — repurposed/reworded (e.g. "Why Work With SourceTX" client page).

## Design direction

- Blue/violet gradient accents (e.g. #2563EB → #7C3AED family) replacing teal/purple.
- White sections with soft shadows; rounded cards; dark navy footer.
- Reuse the existing grid/component classes where possible; add new classes for
  hero, service cards, process steps, testimonials, logo row.
- Preserve the current Express static server, chat widget, contact form logic,
  employment verification link, admin app, and data files.

## Service page template (each of the 9)

1. Hero: service name + one-line value prop + CTA.
2. "What we do" — 3-4 offering cards.
3. Tech stack / capabilities chips.
4. Outcomes / benefits list.
5. Process or engagement model.
6. CTA band (contact).

## Unchanged infrastructure

- `server.js` — all API routes (jobs, contact, chat, admin), static serving, cache headers.
- `chatbot.js` / `storage.js` / `data/*.json` — chat knowledge base and stores.
- `public/js/*` — chat widget, jobs pages, form helpers.
- `admin/` admin app.
- `npm test` — the 19-check suite must still pass (checks updated for new pages).
- Footer employment verification link → contact.html.

## Jobs pages rewording

- Job-seekers page: frame as "Careers" / "Join our team" for a services company.
- Jobs: same listings, recruiting wording replaced with company-careers wording.
- Employers: reword to "Why work with SourceTX" / client value, or a careers for
  hiring page — final copy set during implementation.

## Versioning

- v1 was tagged and committed (`git tag v1`). v2 work proceeds on `master`.
