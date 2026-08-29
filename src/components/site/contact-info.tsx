import { siteContact } from "@/lib/site-content";
import { cn } from "@/lib/utils";

interface ContactInfoProps {
  className?: string;
}

export function ContactInfo({ className }: ContactInfoProps) {
  const phoneHref = siteContact.phone.replace(/\s/g, "");

  return (
    <section className={cn("py-12 text-center md:py-16", className)}>
      <div className="mx-auto max-w-md space-y-3 px-4 text-sm text-muted-foreground">
        <p>
          <span className="sr-only">Email: </span>
          <a
            href={`mailto:${siteContact.email}`}
            className="transition-colors hover:text-brand-red"
          >
            {siteContact.email}
          </a>
        </p>
        <p>
          <span className="text-foreground">Số điện thoại: </span>
          <a
            href={`tel:${phoneHref}`}
            className="transition-colors hover:text-brand-red"
          >
            {siteContact.phone}
          </a>
        </p>
        <p>
          <span className="text-foreground">Địa chỉ: </span>
          {siteContact.address}
        </p>
      </div>
    </section>
  );
}
