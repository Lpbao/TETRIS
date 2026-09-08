import Link from "next/link";
import { Mail } from "lucide-react";
import { FaBehance, FaFacebookF, FaPhone, FaTiktok } from "react-icons/fa6";
import { RiInstagramLine } from "react-icons/ri";
import { getSiteContact } from "@/lib/get-site-contact";
import { siteBrand, siteSocial } from "@/lib/site-content";
import { cn } from "@/lib/utils";

interface SiteFooterProps {
  className?: string;
}

const iconClass = "h-4 w-4";

export async function SiteFooter({ className }: SiteFooterProps) {
  const contact = await getSiteContact();

  const socialItems = [
    {
      key: "phone",
      href: `tel:${contact.phone.replace(/\s/g, "")}`,
      label: "Gọi điện",
      icon: <FaPhone className={iconClass} aria-hidden />,
    },
    {
      key: "email",
      href: `mailto:${contact.email}`,
      label: "Email",
      icon: <Mail className={iconClass} strokeWidth={1.5} aria-hidden />,
    },
    {
      key: "facebook",
      href: siteSocial.facebook,
      label: "Facebook",
      icon: <FaFacebookF className={iconClass} aria-hidden />,
    },
    {
      key: "instagram",
      href: siteSocial.instagram,
      label: "Instagram",
      icon: <RiInstagramLine className={iconClass} aria-hidden />,
    },
    {
      key: "tiktok",
      href: siteSocial.tiktok,
      label: "TikTok",
      icon: <FaTiktok className={iconClass} aria-hidden />,
    },
    ...(siteSocial.behance
      ? [
          {
            key: "behance",
            href: siteSocial.behance,
            label: "Behance",
            icon: <FaBehance className={iconClass} aria-hidden />,
          },
        ]
      : []),
  ];

  return (
    <footer id="site-footer" className={cn("site-footer", className)}>
      <div className="site-footer-bar mx-auto flex h-[var(--site-footer-height)] max-w-6xl flex-col items-center justify-center gap-1.5 px-4">
        <div className="flex items-center justify-center gap-5">
          {socialItems.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              target={
                item.key === "phone" || item.key === "email" ? undefined : "_blank"
              }
              rel={
                item.key === "phone" || item.key === "email"
                  ? undefined
                  : "noopener noreferrer"
              }
              aria-label={item.label}
              className="flex h-8 w-8 shrink-0 items-center justify-center text-foreground transition-colors touch-manipulation hover:text-brand-red"
            >
              {item.icon}
            </Link>
          ))}
        </div>
        <p className="text-xs tracking-wide text-muted-foreground">
          {siteBrand.copyright}
        </p>
      </div>
    </footer>
  );
}
