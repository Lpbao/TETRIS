import { cn } from "@/lib/utils";
import type { ContactPageContent } from "@/lib/validations/site-page";

interface ContactInfoProps {
  contact: ContactPageContent;
  className?: string;
}

export function ContactInfo({ contact, className }: ContactInfoProps) {
  const phoneHref = contact.phone.replace(/\s/g, "");

  return (
    <section className={cn("py-12 text-center md:py-16", className)}>
      <div className="mx-auto max-w-md space-y-3 px-4 text-sm text-muted-foreground">
        <p>
          <span className="sr-only">Email: </span>
          <a
            href={`mailto:${contact.email}`}
            className="transition-colors hover:text-brand-red"
          >
            {contact.email}
          </a>
        </p>
        <p>
          <span className="text-foreground">Số điện thoại: </span>
          <a
            href={`tel:${phoneHref}`}
            className="transition-colors hover:text-brand-red"
          >
            {contact.phone}
          </a>
        </p>
        <p>
          <span className="text-foreground">Địa chỉ: </span>
          {contact.address}
        </p>
      </div>
    </section>
  );
}
