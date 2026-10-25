import type { Metadata } from "next";
import { getAdmin } from "@/lib/auth";
import { getAllLinks, type LinkRow } from "@/lib/db";
import { deleteLinkAction, loginAction, logoutAction, saveLinkAction } from "./actions";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Admin — kene.",
  robots: { index: false, follow: false },
};

const MESSAGES: Record<string, string> = {
  login: "Username atau password salah.",
  invalid: "Data tidak valid. ID hanya huruf kecil/angka/strip, label wajib, URL harus diawali http(s)://",
  duplicate: "ID sudah dipakai link lain.",
};

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ e?: string; ok?: string }>;
}) {
  const { e, ok } = await searchParams;
  const admin = await getAdmin();

  if (!admin) {
    return (
      <main className="admin admin-center">
        <form action={loginAction} className="admin-panel admin-login">
          <h1>
            kene<span className="dot">.</span> admin
          </h1>
          {e && <p className="admin-msg err">{MESSAGES[e]}</p>}
          <label>
            Username
            <input id="login-username" name="username" required autoComplete="username" />
          </label>
          <label>
            Password
            <input id="login-password" name="password" type="password" required autoComplete="current-password" />
          </label>
          <button id="login-submit" className="btn btn-primary">Masuk</button>
        </form>
      </main>
    );
  }

  const links = getAllLinks();

  return (
    <main className="admin">
      <div className="admin-wrap">
        <header className="admin-head">
          <h1>
            kene<span className="dot">.</span> admin
          </h1>
          <div className="admin-head-right">
            <a href="/" target="_blank" className="btn">Lihat halaman ↗</a>
            <form action={logoutAction}>
              <button id="logout" className="btn">Keluar ({admin})</button>
            </form>
          </div>
        </header>

        {e && <p className="admin-msg err">{MESSAGES[e]}</p>}
        {ok && <p className="admin-msg ok">Tersimpan.</p>}

        <section className="admin-list">
          {links.map((l) => (
            <LinkForm key={l.id} link={l} />
          ))}
        </section>

        <h2>Tambah link baru</h2>
        <LinkForm />
      </div>
    </main>
  );
}

function LinkForm({ link }: { link?: LinkRow }) {
  const isNew = !link;
  const key = link?.id ?? "new";
  return (
    <form action={saveLinkAction} className="admin-panel admin-form">
      <input type="hidden" name="mode" value={isNew ? "create" : "update"} />
      <div className="admin-grid">
        <label>
          ID
          {isNew ? (
            <input id="new-id" name="id" required pattern="[a-z0-9\-]+" placeholder="mis. instagram" />
          ) : (
            <input name="id" value={link.id} readOnly className="readonly" />
          )}
        </label>
        <label>
          Ikon
          <input id={`${key}-icon`} name="icon" defaultValue={link?.icon} placeholder="shopee / tiktok / whatsapp" />
        </label>
        <label className="span-2">
          Label
          <input id={`${key}-label`} name="label" defaultValue={link?.label} required />
        </label>
        <label className="span-2">
          Subtitle
          <input id={`${key}-subtitle`} name="subtitle" defaultValue={link?.subtitle ?? ""} />
        </label>
        <label className="span-2">
          URL
          <input id={`${key}-url`} name="url" type="url" defaultValue={link?.url} required placeholder="https://" />
        </label>
        <label>
          Urutan
          <input id={`${key}-order`} name="sort_order" type="number" defaultValue={link?.sort_order ?? 0} />
        </label>
        <label className="check">
          <input id={`${key}-active`} name="active" type="checkbox" defaultChecked={link ? !!link.active : true} />
          Aktif
        </label>
      </div>
      <div className="admin-actions">
        {!isNew && <span className="admin-clicks">{link.click_count} klik</span>}
        {!isNew && (
          <details className="admin-delete">
            <summary className="btn btn-danger">Hapus</summary>
            <button id={`${key}-delete`} formAction={deleteLinkAction} formNoValidate className="btn btn-danger solid">
              Yakin hapus?
            </button>
          </details>
        )}
        <button id={`${key}-save`} className="btn btn-primary">{isNew ? "Tambah" : "Simpan"}</button>
      </div>
    </form>
  );
}
