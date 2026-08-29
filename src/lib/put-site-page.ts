import type { SitePageSlug } from "@/lib/validations/site-page";

export async function putSitePage(slug: SitePageSlug, content: unknown) {
  const response = await fetch(`/api/site-pages/${slug}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(content),
  });

  const result = await response.json().catch(() => ({}));

  if (!response.ok) {
    const details =
      result.details?.fieldErrors &&
      Object.entries(result.details.fieldErrors as Record<string, string[]>)
        .map(([key, messages]) => `${key}: ${messages?.join(", ")}`)
        .join("; ");
    throw new Error(details || result.error || "Không lưu được nội dung");
  }

  return result;
}
