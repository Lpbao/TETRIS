import { cn } from "@/lib/utils";
import type { ContactPageContent } from "@/lib/validations/site-page";

interface ContactInfoProps {
  contact: ContactPageContent;
  className?: string;
}

export function ContactInfo({ contact, className }: ContactInfoProps) {
  const phoneHref = contact.phone.replace(/\s/g, "");

  return (
    <section className={cn("contact-info", className)}>
      <div className="contact-info-list">
        <p>
          <span className="contact-info-label">Email: </span>
          <a
            href={`mailto:${contact.email}`}
            className="contact-info-value"
          >
            {contact.email}
          </a>
        </p>
        <p>
          <span className="contact-info-label">Số điện thoại: </span>
          <a href={`tel:${phoneHref}`} className="contact-info-value">
            {contact.phone}
          </a>
        </p>
        <p>
          <span className="contact-info-label">Địa chỉ: </span>
          <span className="contact-info-value">{contact.address}</span>
        </p>
      </div>
    </section>
  );
}
