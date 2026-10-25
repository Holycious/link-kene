"use client";

import { ArrowIcon, ShopeeIcon, TikTokIcon, WhatsAppIcon } from "./Icons";

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  shopee: ShopeeIcon,
  tiktok: TikTokIcon,
  whatsapp: WhatsAppIcon,
};

export function LinkButton({
  id,
  label,
  subtitle,
  url,
  icon,
  delay = 0,
}: {
  id: string;
  label: string;
  subtitle?: string | null;
  url: string;
  icon: string;
  delay?: number;
}) {
  const Icon = ICONS[icon];

  function track() {
    fetch("/api/click", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
      keepalive: true,
    }).catch(() => {
      /* tracking is best-effort; never block navigation */
    });
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={track}
      style={{ animationDelay: `${delay}ms` }}
      className="enter group flex items-center gap-4 rounded-sm border border-[var(--color-ink)]
                 bg-transparent px-5 py-4 transition-colors duration-200
                 hover:bg-[var(--color-ink)] focus-visible:bg-[var(--color-ink)]
                 outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-wood)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-cream)]"
    >
      {Icon && (
        <Icon className="h-5 w-5 shrink-0 text-[var(--color-ink)] transition-colors duration-200 group-hover:text-[var(--color-cream)]" />
      )}
      <span className="flex-1 text-left">
        <span className="block font-[family-name:var(--font-body)] text-[15px] font-medium tracking-tight text-[var(--color-ink)] transition-colors duration-200 group-hover:text-[var(--color-cream)]">
          {label}
        </span>
        {subtitle && (
          <span className="mt-0.5 block text-[12.5px] text-[var(--color-ink-soft)] transition-colors duration-200 group-hover:text-[var(--color-cream-deep)]">
            {subtitle}
          </span>
        )}
      </span>
      <ArrowIcon className="h-4 w-4 shrink-0 text-[var(--color-wood)] transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-[var(--color-cream)]" />
    </a>
  );
}
