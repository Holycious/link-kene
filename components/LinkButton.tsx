"use client";

import { useState } from "react";
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
  const [ripples, setRipples] = useState<{ k: number; x: number; y: number }[]>([]);
  const [imgFailed, setImgFailed] = useState(false);

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

  function onClick(e: React.MouseEvent<HTMLAnchorElement>) {
    const r = e.currentTarget.getBoundingClientRect();
    const k = Date.now();
    setRipples((rs) => [...rs, { k, x: e.clientX - r.left, y: e.clientY - r.top }]);
    setTimeout(() => setRipples((rs) => rs.filter((p) => p.k !== k)), 700);
    track();
  }

  function onPointerMove(e: React.PointerEvent<HTMLAnchorElement>) {
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`);
    e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`);
  }

  return (
    <a
      id={`link-${id}`}
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={onClick}
      onPointerMove={onPointerMove}
      data-icon={icon}
      className="card reveal"
      style={{ "--d": `${delay}ms` } as React.CSSProperties}
    >
      <span className={`badge${imgFailed ? "" : " has-img"}`}>
        {imgFailed ? (
          Icon && <Icon />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={`/icons/${icon}.png`}
            alt=""
            onError={() => setImgFailed(true)}
            ref={(el) => {
              if (el?.complete && !el.naturalWidth) setImgFailed(true);
            }}
          />
        )}
      </span>
      <span className="card-text">
        <span className="card-label">{label}</span>
        {subtitle && <span className="card-sub">{subtitle}</span>}
      </span>
      <span className="arrow" aria-hidden="true">
        <ArrowIcon />
        <ArrowIcon />
      </span>
      {ripples.map((p) => (
        <span key={p.k} className="ripple" style={{ left: p.x, top: p.y }} />
      ))}
    </a>
  );
}
