import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Find Your School — SubMe",
  description: "Sign in to your school's SubMe portal.",
};

// A small directory of every school running on SubMe — separate from any one
// school's own sign-in page, since a visitor arriving from the marketing site
// doesn't yet know which school-specific URL to go to. Today there's exactly
// one row (St. Francis); this grows as more schools onboard. See the "SubMe
// dual branding" note — this page is SubMe-branded, not any one school's.
const SCHOOLS: { name: string; location: string; slug: string }[] = [
  { name: "St. Francis Episcopal School", location: "Houston, TX", slug: "stfrancishouston" },
];

export default function LoginPage() {
  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link
        href="https://fonts.googleapis.com/css2?family=Gabarito:wght@500;700;800&family=Source+Serif+4:opsz,wght@8..60,400;8..60,500;8..60,600&family=IBM+Plex+Mono:wght@500;600&display=swap"
        rel="stylesheet"
      />
      <style>{`
        .login-page {
          --ink: #0D1B2A;
          --paper: #F5F7FB;
          --paper-raised: #FFFFFF;
          --accent: #2563EB;
          --accent-soft: #DCE7FC;
          --slate: #59636F;
          --line: #DFE4EC;
          --font-display: 'Gabarito', ui-sans-serif, system-ui, sans-serif;
          --font-body: 'Source Serif 4', Georgia, 'Times New Roman', serif;
          --font-mono: 'IBM Plex Mono', ui-monospace, 'SFMono-Regular', Menlo, monospace;
        }
        @media (prefers-color-scheme: dark) {
          .login-page:not([data-theme="light"]) {
            --ink: #F1F4FA;
            --paper: #0B1522;
            --paper-raised: #13233A;
            --accent: #6E9BF7;
            --accent-soft: #1C304E;
            --slate: #93A0B3;
            --line: #223349;
          }
        }
        .login-page {
          min-height: 100dvh;
          background: var(--paper);
          color: var(--ink);
          font-family: var(--font-body);
          display: flex;
          flex-direction: column;
        }
        .login-page * { box-sizing: border-box; }
        .login-nav { padding: 1.5rem clamp(1.25rem, 4vw, 3rem); }
        .login-brand { display: inline-flex; align-items: center; gap: 0.6rem; text-decoration: none; color: var(--ink); flex-shrink: 0; }
        .login-brand img { display: block; height: 26px; width: auto; flex-shrink: 0; object-fit: contain; }
        .login-brand-word { font-family: var(--font-display); font-weight: 800; font-size: 1.1rem; }
        .login-main { flex: 1; display: flex; align-items: center; justify-content: center; padding: 2rem clamp(1.25rem, 4vw, 3rem) 4rem; }
        .login-card { width: 100%; max-width: 26rem; }
        .login-eyebrow {
          font-family: var(--font-mono); font-size: 0.75rem; font-weight: 600;
          letter-spacing: 0.12em; text-transform: uppercase; color: var(--accent);
        }
        .login-card h1 {
          font-family: var(--font-display); font-weight: 800; font-size: clamp(1.9rem, 4vw, 2.3rem);
          margin: 0.7rem 0 0.6rem; text-wrap: balance;
        }
        .login-card p.sub { color: var(--slate); font-size: 1.02rem; margin: 0 0 2rem; }
        .login-field-label {
          font-family: var(--font-mono); font-size: 0.75rem; font-weight: 600; color: var(--slate);
          display: block; margin-bottom: 0.5rem;
        }
        .login-input-row { display: flex; align-items: stretch; border: 1.5px solid var(--line); border-radius: 12px; overflow: hidden; background: var(--paper-raised); }
        .login-input-prefix { display: flex; align-items: center; padding: 0 0.5rem 0 0.9rem; font-family: var(--font-mono); font-size: 0.92rem; color: var(--slate); white-space: nowrap; }
        .login-input-row input {
          flex: 1; min-width: 0; border: none; outline: none; padding: 0.85rem 0.75rem 0.85rem 0;
          font-family: var(--font-mono); font-size: 0.92rem; color: var(--ink); background: transparent;
        }
        .login-go {
          border: none; background: var(--ink); color: var(--paper); font-family: var(--font-display); font-weight: 700;
          font-size: 0.9rem; padding: 0 1.2rem; cursor: pointer; transition: opacity 0.15s ease;
        }
        .login-go:hover { opacity: 0.85; }
        .login-divider { display: flex; align-items: center; gap: 0.75rem; margin: 2rem 0 1.5rem; color: var(--slate); font-family: var(--font-mono); font-size: 0.72rem; letter-spacing: 0.08em; text-transform: uppercase; }
        .login-divider::before, .login-divider::after { content: ''; flex: 1; height: 1px; background: var(--line); }
        .login-directory { display: flex; flex-direction: column; gap: 0.75rem; }
        .login-school {
          display: flex; align-items: center; justify-content: space-between; gap: 1rem;
          padding: 1rem 1.1rem; border: 1.5px solid var(--line); border-radius: 12px;
          background: var(--paper-raised); text-decoration: none; color: var(--ink);
          transition: border-color 0.15s ease, transform 0.15s ease;
        }
        .login-school:hover { border-color: var(--accent); transform: translateY(-1px); }
        .login-school-name { font-family: var(--font-display); font-weight: 700; font-size: 0.98rem; }
        .login-school-loc { font-family: var(--font-mono); font-size: 0.75rem; color: var(--slate); margin-top: 0.15rem; }
        .login-school-arrow { font-family: var(--font-mono); color: var(--accent); font-size: 1rem; }
        .login-fine { margin-top: 2.5rem; font-size: 0.85rem; color: var(--slate); }
        .login-fine a { color: var(--accent); text-decoration: none; }
        .login-fine a:hover { text-decoration: underline; }
      `}</style>

      <div className="login-page">
        <div className="login-nav">
          <Link className="login-brand" href="/" aria-label="SubMe home">
            <img src="/subme-icon.png" alt="" style={{ borderRadius: 6 }} />
            <span className="login-brand-word">SubMe</span>
          </Link>
        </div>

        <div className="login-main">
          <div className="login-card">
            <p className="login-eyebrow">Sign in</p>
            <h1>Find your school.</h1>
            <p className="sub">Enter your school&apos;s SubMe address, or pick it from the list below.</p>

            <label className="login-field-label" htmlFor="school-slug">Your school&apos;s address</label>
            <form
              action={async (formData: FormData) => {
                "use server";
                const raw = String(formData.get("slug") || "").trim().toLowerCase();
                const slug = raw.replace(/^https?:\/\/(www\.)?subme\.app\/?/, "").replace(/[^a-z0-9-]/g, "");
                redirect(slug ? `/${slug}` : "/login");
              }}
            >
              <div className="login-input-row">
                <span className="login-input-prefix">subme.app/</span>
                <input id="school-slug" name="slug" type="text" placeholder="yourschool" autoComplete="off" />
                <button className="login-go" type="submit">Continue</button>
              </div>
            </form>

            <div className="login-divider">Or choose from the list</div>

            <div className="login-directory">
              {SCHOOLS.map((school) => (
                <a key={school.slug} className="login-school" href={`/${school.slug}`}>
                  <div>
                    <div className="login-school-name">{school.name}</div>
                    <div className="login-school-loc">{school.location}</div>
                  </div>
                  <span className="login-school-arrow">→</span>
                </a>
              ))}
            </div>

            <p className="login-fine">
              Don&apos;t see your school? <a href="mailto:hello@subme.app">Email hello@subme.app</a>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
