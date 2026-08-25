import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "SubMe — Substitute Coverage, Simplified",
  description: "SubMe fills an empty classroom in minutes, not phone calls. See how schools use SubMe to request, confirm, and manage substitute coverage.",
};

// The SubMe marketing site — a separate brand identity from the St. Francis
// white-labeled portal the rest of this app serves. Deliberately self-contained
// (own fonts, own design tokens, own markup) rather than reusing any portal
// components, since this page will eventually pitch SubMe to schools that
// aren't St. Francis. See the "SubMe dual branding" note: portal stays
// white-labeled per-school; this page carries the actual SubMe brand.
const BODY_HTML = `<script>document.documentElement.classList.add('js');</script>

<style>
  :root {
    --ink: #0D1B2A;
    --paper: #F5F7FB;
    --paper-raised: #FFFFFF;
    --accent: #2563EB;
    --accent-btn: #2563EB;
    --accent-soft: #DCE7FC;
    --accent-soft-strong: #AFC7F7;
    --slate: #59636F;
    --line: #DFE4EC;
    --shadow: 220 45% 20%;

    --font-display: 'Gabarito', ui-sans-serif, system-ui, sans-serif;
    --font-body: 'Source Serif 4', Georgia, 'Times New Roman', serif;
    --font-mono: 'IBM Plex Mono', ui-monospace, 'SFMono-Regular', Menlo, monospace;
  }

  @media (prefers-color-scheme: dark) {
    :root:not([data-theme="light"]) {
      --ink: #F1F4FA;
      --paper: #0B1522;
      --paper-raised: #12203380;
      --paper-raised: #13233A;
      --accent: #6E9BF7;
      --accent-btn: #4C7FF0;
      --accent-soft: #1C304E;
      --accent-soft-strong: #2A4470;
      --slate: #93A0B3;
      --line: #223349;
    }
  }
  :root[data-theme="dark"] {
    --ink: #F1F4FA;
    --paper: #0B1522;
    --paper-raised: #13233A;
    --accent: #6E9BF7;
    --accent-btn: #4C7FF0;
    --accent-soft: #1C304E;
    --accent-soft-strong: #2A4470;
    --slate: #93A0B3;
    --line: #223349;
  }

  * { box-sizing: border-box; }
  html { -webkit-text-size-adjust: 100%; }
  body {
    margin: 0;
    background: var(--paper);
    color: var(--ink);
    font-family: var(--font-body);
    font-size: 1.0625rem;
    line-height: 1.6;
    -webkit-font-smoothing: antialiased;
  }
  img, svg { display: block; max-width: 100%; }
  a { color: inherit; }
  h1, h2, h3 { font-family: var(--font-display); text-wrap: balance; margin: 0; letter-spacing: -0.01em; }
  p { margin: 0; }
  .wrap {
    width: 100%;
    max-width: 78rem;
    margin: 0 auto;
    padding-left: clamp(1.25rem, 4vw, 3rem);
    padding-right: clamp(1.25rem, 4vw, 3rem);
  }
  .eyebrow {
    font-family: var(--font-mono);
    font-size: 0.75rem;
    font-weight: 600;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--accent);
  }
  .btn {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    font-family: var(--font-display);
    font-weight: 700;
    font-size: 0.95rem;
    padding: 0.75rem 1.4rem;
    border-radius: 999px;
    text-decoration: none;
    white-space: nowrap;
    border: 1px solid transparent;
    transition: transform 0.15s ease, box-shadow 0.15s ease, background 0.15s ease;
    cursor: pointer;
  }
  .btn:focus-visible { outline: 2px solid var(--accent); outline-offset: 3px; }
  .btn-primary { background: var(--accent-btn); color: #fff; }
  .btn-primary:hover { transform: translateY(-1px); box-shadow: 0 10px 24px -10px hsl(var(--shadow) / 0.55); }
  .btn-ghost { background: transparent; color: var(--ink); border-color: var(--line); }
  .btn-ghost:hover { border-color: var(--accent); color: var(--accent); }

  /* ---------- Nav ---------- */
  header.site {
    position: sticky; top: 0; z-index: 20;
    background: color-mix(in srgb, var(--paper) 88%, transparent);
    backdrop-filter: blur(10px);
    border-bottom: 1px solid var(--line);
  }
  .nav-row {
    display: flex; align-items: center; justify-content: space-between;
    padding-top: 1.1rem; padding-bottom: 1.1rem;
    gap: 1.5rem;
  }
  .brand { display: flex; align-items: center; gap: 0.6rem; text-decoration: none; }
  .brand-word { font-family: var(--font-display); font-weight: 800; font-size: 1.25rem; color: var(--ink); }
  /* The flattened wordmark asset has fixed dark-navy lettering baked in, so
     it only reads on a light ground — swap to the icon + live (theme-aware)
     text below on a dark ground rather than let the brand disappear. */
  .brand-lockup-dark { display: none; align-items: center; gap: 0.6rem; }
  .brand-lockup-light img { display: block; width: auto; }
  header.site .brand-lockup-light img { height: 28px; }
  footer.site .brand-lockup-light img { height: 24px; }
  @media (prefers-color-scheme: dark) {
    :root:not([data-theme="light"]) .brand-lockup-light { display: none; }
    :root:not([data-theme="light"]) .brand-lockup-dark { display: flex; }
  }
  :root[data-theme="dark"] .brand-lockup-light { display: none; }
  :root[data-theme="dark"] .brand-lockup-dark { display: flex; }
  .nav-links { display: flex; align-items: center; gap: 2rem; }
  .nav-links a { text-decoration: none; font-family: var(--font-mono); font-size: 0.8rem; font-weight: 500; letter-spacing: 0.04em; color: var(--slate); }
  .nav-links a:hover { color: var(--accent); }
  .nav-cta { display: flex; align-items: center; gap: 1.5rem; }
  @media (max-width: 720px) { .nav-links { display: none; } }

  /* ---------- Hero ---------- */
  .hero {
    padding-top: clamp(3rem, 8vw, 6rem);
    padding-bottom: clamp(2.5rem, 6vw, 4rem);
    display: grid;
    grid-template-columns: minmax(0, 1.05fr) minmax(0, 0.95fr);
    gap: clamp(2rem, 5vw, 4rem);
    align-items: center;
  }
  @media (max-width: 900px) { .hero { grid-template-columns: 1fr; } }
  .hero h1 {
    font-size: clamp(2.6rem, 5.4vw, 4.1rem);
    font-weight: 800;
    line-height: 1.14;
    margin-top: 1rem;
  }
  .hero h1 em { font-style: normal; color: var(--accent); }
  .hero-sub {
    margin-top: 1.4rem;
    max-width: 34rem;
    font-size: clamp(1.1rem, 1.6vw, 1.25rem);
    color: var(--slate);
  }
  .hero-actions { display: flex; align-items: center; gap: 1.1rem; margin-top: 2.1rem; flex-wrap: wrap; }
  .hero-note { font-family: var(--font-mono); font-size: 0.78rem; color: var(--slate); }

  /* ---------- Hero screenshot ---------- */
  .rail-card {
    background: var(--paper-raised);
    border: 1px solid var(--line);
    border-radius: 20px;
    padding: 0.5rem;
    box-shadow: 0 30px 60px -30px hsl(var(--shadow) / 0.35);
  }
  .rail-card img { width: 100%; height: auto; border-radius: 14px; }

  /* ---------- Section rhythm ---------- */
  section { padding-top: clamp(3.5rem, 7vw, 5.5rem); padding-bottom: clamp(3.5rem, 7vw, 5.5rem); }
  .divider { border: none; border-top: 1px solid var(--line); margin: 0; }
  .section-head { max-width: 42rem; }
  .section-head h2 { font-size: clamp(1.9rem, 3.4vw, 2.5rem); margin-top: 0.7rem; }

  /* ---------- Problem / solution statements ---------- */
  .statement-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: clamp(2rem, 5vw, 4rem);
  }
  @media (max-width: 780px) { .statement-grid { grid-template-columns: 1fr; gap: 2.5rem; } }
  .statement p {
    font-size: clamp(1.15rem, 1.8vw, 1.4rem);
    font-family: var(--font-body);
    font-weight: 500;
    line-height: 1.5;
  }
  .statement em { color: var(--accent); font-style: italic; }

  /* ---------- How it works ---------- */
  .steps {
    margin-top: 2.5rem;
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 0;
    border-top: 1px solid var(--line);
    border-left: 1px solid var(--line);
  }
  @media (max-width: 860px) { .steps { grid-template-columns: repeat(2, 1fr); } }
  @media (max-width: 520px) { .steps { grid-template-columns: 1fr; } }
  .step {
    padding: 1.75rem 1.5rem;
    border-right: 1px solid var(--line);
    border-bottom: 1px solid var(--line);
  }
  .step .num {
    font-family: var(--font-mono);
    font-size: 0.8rem;
    color: var(--accent);
    font-weight: 600;
  }
  .step h3 { font-size: 1.15rem; margin-top: 0.75rem; }
  .step p { margin-top: 0.55rem; color: var(--slate); font-size: 0.95rem; }

  /* ---------- Personas ---------- */
  .personas {
    margin-top: 2.5rem;
    display: grid;
    grid-template-columns: 1fr 1fr 1.1fr;
    gap: 1.25rem;
  }
  @media (max-width: 860px) { .personas { grid-template-columns: 1fr; } }
  .persona {
    border-radius: 16px;
    padding: 1.75rem;
    border: 1px solid var(--line);
  }
  .persona.lead { background: var(--ink); color: var(--paper); border-color: var(--ink); }
  .persona.lead .persona-tag { color: var(--accent-soft-strong); }
  .persona:not(.lead) { background: var(--paper-raised); }
  .persona-tag { font-family: var(--font-mono); font-size: 0.72rem; letter-spacing: 0.08em; text-transform: uppercase; color: var(--accent); }
  .persona h3 { font-size: 1.35rem; margin-top: 0.6rem; }
  .persona ul { list-style: none; margin: 1.1rem 0 0; padding: 0; display: flex; flex-direction: column; gap: 0.65rem; }
  .persona li { font-size: 0.92rem; padding-left: 1.1rem; position: relative; }
  .persona:not(.lead) li { color: var(--slate); }
  .persona.lead li { color: color-mix(in srgb, var(--paper) 82%, transparent); }
  .persona li::before {
    content: '';
    position: absolute; left: 0; top: 0.55em;
    width: 0.4rem; height: 0.4rem;
    background: var(--accent);
    border-radius: 1px;
    transform: rotate(45deg);
  }
  .persona.lead li::before { background: var(--accent-soft-strong); }

  /* ---------- Trust band ---------- */
  .trust {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 3rem;
    align-items: start;
  }
  @media (max-width: 860px) { .trust { grid-template-columns: 1fr; gap: 2rem; } }
  .trust-copy p { color: var(--slate); margin-top: 1rem; font-size: 1.05rem; max-width: 34rem; }
  .trust-list { display: flex; flex-direction: column; gap: 1.25rem; }
  .trust-item { display: flex; gap: 1rem; align-items: flex-start; padding-bottom: 1.25rem; border-bottom: 1px solid var(--line); }
  .trust-item:last-child { border-bottom: none; padding-bottom: 0; }
  .trust-item .mark { font-family: var(--font-mono); color: var(--accent); font-size: 0.85rem; padding-top: 0.2rem; }
  .trust-item h4 { font-family: var(--font-display); font-size: 1.02rem; font-weight: 700; }
  .trust-item p { color: var(--slate); font-size: 0.92rem; margin-top: 0.35rem; }

  /* ---------- CTA band ---------- */
  .cta-band {
    border-radius: 24px;
    background: var(--ink);
    color: var(--paper);
    padding: clamp(2.5rem, 6vw, 4rem);
    display: grid;
    grid-template-columns: 1.3fr 1fr;
    gap: 2rem;
    align-items: center;
  }
  @media (max-width: 780px) { .cta-band { grid-template-columns: 1fr; } }
  .cta-band h2 { font-size: clamp(1.8rem, 3.4vw, 2.4rem); color: var(--paper); }
  .cta-band p { color: color-mix(in srgb, var(--paper) 78%, transparent); margin-top: 0.9rem; max-width: 30rem; font-size: 1.02rem; }
  .cta-form { display: flex; flex-direction: column; gap: 0.75rem; }
  .cta-form-row { display: flex; gap: 0.6rem; flex-wrap: wrap; }
  .cta-email {
    flex: 1 1 14rem;
    padding: 0.85rem 1rem;
    border-radius: 10px;
    border: 1px solid color-mix(in srgb, var(--paper) 30%, transparent);
    background: color-mix(in srgb, var(--paper) 8%, transparent);
    color: var(--paper);
    font-family: var(--font-body);
    font-size: 0.95rem;
  }
  .cta-email::placeholder { color: color-mix(in srgb, var(--paper) 55%, transparent); }
  .cta-band .btn-primary { background: var(--accent); }
  .cta-fine { font-family: var(--font-mono); font-size: 0.72rem; color: color-mix(in srgb, var(--paper) 60%, transparent); }

  /* ---------- Footer ---------- */
  footer.site { padding-top: 3rem; padding-bottom: 3rem; border-top: 1px solid var(--line); }
  .foot-row { display: flex; justify-content: space-between; align-items: flex-start; gap: 2rem; flex-wrap: wrap; }
  .foot-tag { color: var(--slate); font-size: 0.92rem; margin-top: 0.6rem; max-width: 20rem; }
  .foot-links { display: flex; gap: 2.5rem; flex-wrap: wrap; }
  .foot-col h5 { font-family: var(--font-mono); font-size: 0.7rem; letter-spacing: 0.08em; text-transform: uppercase; color: var(--slate); margin: 0 0 0.75rem; }
  .foot-col a { display: block; text-decoration: none; color: var(--ink); font-size: 0.92rem; margin-bottom: 0.55rem; }
  .foot-col a:hover { color: var(--accent); }
  .foot-bottom { margin-top: 2.5rem; padding-top: 1.5rem; border-top: 1px solid var(--line); display: flex; justify-content: space-between; flex-wrap: wrap; gap: 1rem; }
  .foot-bottom span { font-family: var(--font-mono); font-size: 0.75rem; color: var(--slate); }

  /* ---------- Reveal on scroll ----------
     Visible by default (no-JS / crawlers / slow connections never lose
     content) — only hidden-then-fades-in once html.js confirms the
     IntersectionObserver script actually ran. */
  .reveal { opacity: 1; transform: none; }
  html.js .reveal { opacity: 0; transform: translateY(14px); transition: opacity 0.6s ease, transform 0.6s ease; }
  html.js .reveal.in { opacity: 1; transform: translateY(0); }
  @media (prefers-reduced-motion: reduce) {
    html.js .reveal { opacity: 1; transform: none; transition: none; }
  }
</style>

<header class="site">
  <div class="wrap nav-row">
    <a class="brand" href="#top" aria-label="SubMe home">
      <span class="brand-lockup-light"><img src="/subme-wordmark.png" alt="SubMe" height="28"></span><span class="brand-lockup-dark"><img src="/subme-icon.png" alt="" width="30" height="30" style="border-radius:8px"><span class="brand-word">SubMe</span></span>
    </a>
    <nav class="nav-links">
      <a href="#how">How it works</a>
      <a href="#who">For schools</a>
      <a href="#contact">Contact</a>
    </nav>
    <div class="nav-cta">
      <a class="btn btn-ghost" href="/login">School login</a>
      <a class="btn btn-primary" href="#contact">Request a demo</a>
    </div>
  </div>
</header>

<main id="top">
  <div class="wrap hero">
    <div>
      <p class="eyebrow">Substitutes, simplified</p>
      <h1>The right person.<br><em>When it matters.</em></h1>
      <p class="hero-sub">SubMe fills an empty classroom in minutes, not phone calls. Request coverage, get a real answer from a real substitute, and know before the first bell rings.</p>
      <div class="hero-actions">
        <a class="btn btn-primary" href="#contact">Request a demo</a>
        <a class="btn btn-ghost" href="#how">See how it works</a>
      </div>
      <p class="hero-note">No app to install for substitutes — every request goes out by real email, one tap to accept.</p>
    </div>

    <div class="rail-card">
      <img src="/subme-admin-preview.png" alt="SubMe's admin dashboard showing real-time substitute availability across the week" width="900" height="267" />
    </div>
  </div>

  <div class="wrap"><hr class="divider"></div>

  <section class="statement">
    <div class="wrap statement-grid reveal">
      <div>
        <p class="eyebrow">The morning scramble</p>
        <p style="margin-top:1rem">A teacher wakes up sick. The office starts calling down a list, one number at a time, hoping someone picks up before homeroom. <em>By the time a sub is confirmed, the first two periods have already gone uncovered</em> — and nobody arrives knowing what they were supposed to teach.</p>
      </div>
      <div>
        <p class="eyebrow">No double-booking, ever</p>
        <p style="margin-top:1rem">Once a substitute accepts, every calendar updates itself instantly. <em>Confirm coverage in a few clicks</em>, not a few calls — and the same sub can never get booked twice by two different teachers.</p>
      </div>
    </div>
  </section>

  <div class="wrap"><hr class="divider"></div>

  <section id="how">
    <div class="wrap">
      <div class="section-head reveal">
        <p class="eyebrow">How it works</p>
        <h2>Four steps, no phone tree.</h2>
      </div>
      <div class="steps reveal">
        <div class="step">
          <span class="num">01</span>
          <h3>Request</h3>
          <p>The office — or the teacher themself — picks a substitute, a date, and what the day covers. Takes under a minute.</p>
        </div>
        <div class="step">
          <span class="num">02</span>
          <h3>Notify</h3>
          <p>The substitute gets a real email instantly, with Accept and Decline built right in. No login, no app, no second step.</p>
        </div>
        <div class="step">
          <span class="num">03</span>
          <h3>Confirm</h3>
          <p>Once accepted, every calendar updates on its own. No double-booking, no crossed wires between office and classroom.</p>
        </div>
        <div class="step">
          <span class="num">04</span>
          <h3>Show up</h3>
          <p>The substitute arrives with the lesson plan, schedule, and attendance notes already waiting for them.</p>
        </div>
      </div>
    </div>
  </section>

  <div class="wrap"><hr class="divider"></div>

  <section id="who">
    <div class="wrap">
      <div class="section-head reveal">
        <p class="eyebrow">Built for the whole building</p>
        <h2>Three people, one shared calendar.</h2>
      </div>
      <div class="personas reveal">
        <div class="persona">
          <p class="persona-tag">Teachers</p>
          <h3>Request coverage fast</h3>
          <ul>
            <li>Book a substitute for any date in under a minute</li>
            <li>Leave lesson plans and notes right on the booking</li>
            <li>Message the substitute directly, no phone tag</li>
          </ul>
        </div>
        <div class="persona">
          <p class="persona-tag">Substitutes</p>
          <h3>Answer from anywhere</h3>
          <ul>
            <li>Accept or decline straight from a text or email</li>
            <li>See a full month of assignments at a glance</li>
            <li>Tap to call or text the teacher before the day starts</li>
          </ul>
        </div>
        <div class="persona lead">
          <p class="persona-tag">Admin</p>
          <h3>Full visibility, real approval</h3>
          <ul>
            <li>See every booking across the school in one view</li>
            <li>Approve, decline, or reassign a substitute in two clicks</li>
            <li>Cancellations route through you, never around you</li>
          </ul>
        </div>
      </div>
    </div>
  </section>

  <div class="wrap"><hr class="divider"></div>

  <section>
    <div class="wrap trust">
      <div class="trust-copy reveal">
        <p class="eyebrow">Approval, not automation</p>
        <h2 style="margin-top:0.7rem; font-size: clamp(1.9rem, 3.4vw, 2.5rem);">Built the way schools actually run their day.</h2>
        <p>SubMe doesn't try to take the office out of the loop — it gives them a clearer one. Every decision that matters still passes through a person who can say yes or no.</p>
      </div>
      <div class="trust-list reveal">
        <div class="trust-item">
          <span class="mark">→</span>
          <div>
            <h4>Cancellations need a yes</h4>
            <p>A teacher or substitute can ask to cancel, but the booking stays live until the office approves it.</p>
          </div>
        </div>
        <div class="trust-item">
          <span class="mark">→</span>
          <div>
            <h4>One-click, no account required</h4>
            <p>Substitutes accept or decline from the email itself — the portal is there if they want more detail, never required.</p>
          </div>
        </div>
        <div class="trust-item">
          <span class="mark">→</span>
          <div>
            <h4>Every message stays with the booking</h4>
            <p>Teacher and substitute can talk directly on a date, so nothing gets lost between the office and the classroom.</p>
          </div>
        </div>
      </div>
    </div>
  </section>

  <section id="contact">
    <div class="wrap reveal">
      <div class="cta-band">
        <div>
          <h2>Bring SubMe to your school.</h2>
          <p>We'll walk you through a live demo with your own schedule, your own substitutes, and no obligation.</p>
        </div>
        <form class="cta-form" onsubmit="return false;">
          <div class="cta-form-row">
            <input class="cta-email" type="email" placeholder="you@yourschool.org" aria-label="Work email">
            <a class="btn btn-primary" href="mailto:hello@subme.app">Request a demo</a>
          </div>
          <span class="cta-fine">Or email us directly at hello@subme.app</span>
        </form>
      </div>
    </div>
  </section>
</main>

<footer class="site">
  <div class="wrap">
    <div class="foot-row">
      <div>
        <a class="brand" href="#top" aria-label="SubMe home">
          <span class="brand-lockup-light"><img src="/subme-wordmark.png" alt="SubMe" height="24"></span><span class="brand-lockup-dark"><img src="/subme-icon.png" alt="" width="26" height="26" style="border-radius:7px"><span class="brand-word">SubMe</span></span>
        </a>
        <p class="foot-tag">The right person. When it matters.</p>
      </div>
      <div class="foot-links">
        <div class="foot-col">
          <h5>Product</h5>
          <a href="#how">How it works</a>
          <a href="#who">For schools</a>
        </div>
        <div class="foot-col">
          <h5>Talk to us</h5>
          <a href="mailto:hello@subme.app">hello@subme.app</a>
          <a href="#contact">Request a demo</a>
        </div>
      </div>
    </div>
    <div class="foot-bottom">
      <span>© 2026 SubMe</span>
      <span>Coverage, support, and continuity for every school day.</span>
    </div>
  </div>
</footer>

<script>
  (function () {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      document.querySelectorAll('.reveal').forEach(function (el) { el.classList.add('in'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    document.querySelectorAll('.reveal').forEach(function (el) { io.observe(el); });
  })();
</script>`;

export default function SchoolsPage() {
  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link
        href="https://fonts.googleapis.com/css2?family=Gabarito:wght@500;700;800&family=Source+Serif+4:opsz,wght@8..60,400;8..60,500;8..60,600&family=Source+Serif+4:ital,opsz,wght@1,8..60,500&family=IBM+Plex+Mono:wght@500;600&display=swap"
        rel="stylesheet"
      />
      <div dangerouslySetInnerHTML={{ __html: BODY_HTML }} />
    </>
  );
}
