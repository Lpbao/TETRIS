import {
  siteAbout,
  siteContact,
  siteHeroSlides,
  siteServices,
} from "@/lib/site-content";
import {
  aboutPageSchema,
  contactPageSchema,
  homePageSchema,
  servicesPageSchema,
  type AboutPageContent,
  type ContactPageContent,
  type HomePageContent,
  type ServicesPageContent,
} from "@/lib/validations/site-page";

function cloneJson<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

export function getSitePageFallback(slug: "home"): HomePageContent;
export function getSitePageFallback(slug: "about"): AboutPageContent;
export function getSitePageFallback(slug: "services"): ServicesPageContent;
export function getSitePageFallback(slug: "contact"): ContactPageContent;
export function getSitePageFallback(
  slug: "home" | "about" | "services" | "contact",
) {
  switch (slug) {
    case "home":
      return homePageSchema.parse({ slides: cloneJson(siteHeroSlides) });
    case "about":
      return aboutPageSchema.parse(cloneJson(siteAbout));
    case "services":
      return servicesPageSchema.parse({ items: cloneJson(siteServices) });
    case "contact":
      return contactPageSchema.parse({
        email: siteContact.email,
        phone: siteContact.phone,
        address: siteContact.address,
      });
  }
}

export function resolveSitePageContent(
  slug: "home",
  content: unknown,
): HomePageContent;
export function resolveSitePageContent(
  slug: "about",
  content: unknown,
): AboutPageContent;
export function resolveSitePageContent(
  slug: "services",
  content: unknown,
): ServicesPageContent;
export function resolveSitePageContent(
  slug: "contact",
  content: unknown,
): ContactPageContent;
export function resolveSitePageContent(
  slug: "home" | "about" | "services" | "contact",
  content: unknown,
) {
  switch (slug) {
    case "home": {
      const parsed = homePageSchema.safeParse(content);
      return parsed.success ? parsed.data : getSitePageFallback("home");
    }
    case "about": {
      const parsed = aboutPageSchema.safeParse(content);
      return parsed.success ? parsed.data : getSitePageFallback("about");
    }
    case "services": {
      const parsed = servicesPageSchema.safeParse(content);
      return parsed.success ? parsed.data : getSitePageFallback("services");
    }
    case "contact": {
      const parsed = contactPageSchema.safeParse(content);
      return parsed.success ? parsed.data : getSitePageFallback("contact");
    }
  }
}
