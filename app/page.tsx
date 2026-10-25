import { getActiveLinks } from "@/lib/db";
import { LinkButton } from "@/components/LinkButton";
import { PatternDivider } from "@/components/PatternDivider";

// Rendered per-request so link edits made via scripts/manage-links.mjs
// show up immediately without a rebuild/redeploy.
export const dynamic = "force-dynamic";

export default function Home() {
  const links = getActiveLinks();

  return (
    <main id="page-root" className="flex min-h-screen justify-center px-6 py-16">
      <div className="w-full max-w-[420px]">
        <div className="enter flex flex-col items-center text-center">
          <span
            className="font-[family-name:var(--font-display)] text-[34px] italic leading-none text-[var(--color-ink)]"
          >
            kene.
          </span>
          <p className="mt-3 max-w-[280px] text-[13.5px] leading-relaxed text-[var(--color-ink-soft)]">
            Homedress premium untuk hari-hari santai di rumah — lembut di kulit, elegan dipakai siapa saja.
          </p>
        </div>

        <div className="my-8">
          <PatternDivider />
        </div>

        <div className="flex flex-col gap-3">
          {links.map((link, i) => (
            <LinkButton
              key={link.id}
              id={link.id}
              label={link.label}
              subtitle={link.subtitle}
              url={link.url}
              icon={link.icon}
              delay={i * 80}
            />
          ))}
        </div>

        <footer className="mt-12 text-center">
          <p className="text-[11.5px] tracking-wide text-[var(--color-ink-soft)]">
            kene.studio — dibuat dengan bahan pilihan
          </p>
        </footer>
      </div>
    </main>
  );
}
