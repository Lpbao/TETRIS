import Link from "next/link";
import { Mail } from "lucide-react";
import { FaBehance, FaFacebookF, FaPhone, FaTiktok } from "react-icons/fa6";
import { RiInstagramLine } from "react-icons/ri";
import { siteBrand, siteContact, siteSocial } from "@/lib/site-content";
import { cn } from "@/lib/utils";

interface SiteFooterProps {
  className?: string;
}

const iconClass = "h-4 w-4";

const socialItems = [
  {
    key: "phone",
    href: `tel:${siteContact.phone.replace(/\s/g, "")}`,
    label: "Gọi điện",
    icon: <FaPhone className={iconClass} aria-hidden />,
  },
  {
    key: "email",
    href: `mailto:${siteContact.email}`,
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

export function SiteFooter({ className }: SiteFooterProps) {
  return (
    <footer
      id="site-footer"
      className={cn("border-t border-border/60 py-10", className)}
    >
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-4">
        <div className="flex flex-wrap items-center justify-center gap-5">
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
              className="flex h-9 w-9 items-center justify-center text-foreground transition-colors hover:text-brand-red"
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
