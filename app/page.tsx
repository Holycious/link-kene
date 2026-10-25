import { getActiveLinks } from "@/lib/db";
import { LinkButton } from "@/components/LinkButton";
import { PatternDivider } from "@/components/PatternDivider";

// Rendered per-request so link edits made via scripts/manage-links.mjs
// show up immediately without a rebuild/redeploy.
export const dynamic = "force-dynamic";

const PETALS = [
  { left: "8%", dur: 26, delay: 0 },
  { left: "22%", dur: 32, delay: 6 },
  { left: "41%", dur: 29, delay: 12 },
  { left: "63%", dur: 34, delay: 3 },
  { left: "78%", dur: 27, delay: 9 },
  { left: "92%", dur: 31, delay: 15 },
];

const MARQUEE = [
  "homedress premium",
  "lembut di kulit",
  "adem dipakai seharian",
  "elegan dipakai siapa saja",
  "santai di rumah",
];

export default function Home() {
  const links = getActiveLinks();

  return (
    <>
      <div className="backdrop" aria-hidden="true">
        <div className="blob blob-1" />
        <div className="blob blob-2" />
        <div className="blob blob-3" />
        <div className="lattice" />
        {PETALS.map((p, i) => (
          <span
            key={i}
            className="petal"
            style={{ left: p.left, animationDuration: `${p.dur}s`, animationDelay: `${p.delay}s` }}
          />
        ))}
        <div className="grain" />
      </div>

      <main id="page-root" className="page">
        <div className="shell">
          <header className="hero">
            <div className="monogram reveal" style={{ "--d": "0ms" } as React.CSSProperties}>
              <svg viewBox="0 0 132 132" className="monogram-ring" aria-hidden="true">
                <defs>
                  <path id="ring" d="M66,66 m-56,0 a56,56 0 1,1 112,0 a56,56 0 1,1 -112,0" />
                </defs>
                <text>
                  <textPath href="#ring" textLength="350" lengthAdjust="spacing">
                    HOMEDRESS PREMIUM · KENE.STUDIO ·
                  </textPath>
                </text>
              </svg>
              <div className="monogram-core">
                <span>k.</span>
              </div>
            </div>

            <h1 className="brand" aria-label="kene.">
              {"kene".split("").map((c, i) => (
                <span key={i} className="ch" style={{ animationDelay: `${200 + i * 70}ms` }} aria-hidden="true">
                  {c}
                </span>
              ))}
              <span className="ch dot" style={{ animationDelay: "500ms" }} aria-hidden="true">
                .
              </span>
            </h1>

            <p className="tagline reveal" style={{ "--d": "450ms" } as React.CSSProperties}>
              Homedress premium untuk hari-hari santai di rumah. Lembut di kulit, elegan dipakai siapa saja.
            </p>

          </header>

          <PatternDivider />

          <nav className="links" aria-label="Tautan toko kene.">
            {links.map((link, i) => (
              <LinkButton
                key={link.id}
                id={link.id}
                label={link.label}
                subtitle={link.subtitle}
                url={link.url}
                icon={link.icon}
                delay={800 + i * 110}
              />
            ))}
          </nav>

          <div
            className="marquee reveal"
            style={{ "--d": `${900 + links.length * 110}ms` } as React.CSSProperties}
            aria-hidden="true"
          >
            <div className="marquee-track">
              {[0, 1].map((n) =>
                MARQUEE.map((t, i) => (
                  <span key={`${n}-${i}`} style={{ display: "contents" }}>
                    <span>{t}</span>
                    <span className="sep">✦</span>
                  </span>
                )),
              )}
            </div>
          </div>

          <footer
            className="footer reveal"
            style={{ "--d": `${1000 + links.length * 110}ms` } as React.CSSProperties}
          >
            © {new Date().getFullYear()} <a href="https://kene.studio">kene.studio</a>
          </footer>
        </div>
      </main>
    </>
  );
}
