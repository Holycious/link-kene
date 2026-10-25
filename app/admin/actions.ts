"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { login, logout, requireAdmin } from "@/lib/auth";
import { createLink, deleteLink, updateLink, type LinkInput } from "@/lib/db";

export async function loginAction(formData: FormData) {
  const ok = await login(String(formData.get("username") ?? ""), String(formData.get("password") ?? ""));
  redirect(ok ? "/admin" : "/admin?e=login");
}

export async function logoutAction() {
  await logout();
  redirect("/admin");
}

function parseLink(formData: FormData): LinkInput {
  const s = (k: string) => String(formData.get(k) ?? "").trim();
  return {
    id: s("id").toLowerCase(),
    label: s("label"),
    subtitle: s("subtitle") || null,
    url: s("url"),
    icon: s("icon").toLowerCase() || "link",
    sort_order: Number(s("sort_order")) || 0,
    active: formData.get("active") ? 1 : 0,
  };
}

export async function saveLinkAction(formData: FormData) {
  await requireAdmin();
  const link = parseLink(formData);
  if (!/^[a-z0-9-]+$/.test(link.id) || !link.label || !/^https?:\/\//.test(link.url)) {
    redirect("/admin?e=invalid");
  }
  try {
    if (formData.get("mode") === "create") createLink(link);
    else updateLink(link);
  } catch {
    redirect("/admin?e=duplicate");
  }
  revalidatePath("/admin");
  redirect("/admin?ok=1");
}

export async function deleteLinkAction(formData: FormData) {
  await requireAdmin();
  deleteLink(String(formData.get("id")));
  revalidatePath("/admin");
  redirect("/admin?ok=1");
}
