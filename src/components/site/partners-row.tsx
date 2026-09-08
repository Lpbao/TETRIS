import Image from "next/image";
import { MovingLettersPop } from "@/components/site/moving-letters";
import { cn } from "@/lib/utils";

interface Partner {
  name: string;
  logo: string;
}

interface PartnersRowProps {
  title: string;
  partners: readonly Partner[];
  className?: string;
  headingEffect?: "ml2";
  logoEffect?: "text-focus-in";
  lettersSectionId?: string;
  forceLettersPlay?: boolean;
}

export function PartnersRow({
  title,
  partners,
  className,
  headingEffect,
  logoEffect,
  lettersSectionId = "about-brand-break",
  forceLettersPlay = false,
}: PartnersRowProps) {
  return (
    <section className={cn("py-12 pb-16", className)}>
      <h2
        data-section-title=""
        data-ml2-heading={headingEffect === "ml2" ? "" : undefined}
        className="text-center text-sm font-bold uppercase"
      >
        {headingEffect === "ml2" ? (
          <MovingLettersPop
            text={title}
            sectionId={lettersSectionId}
            forcePlay={forceLettersPlay}
          />
        ) : (
          title
        )}
      </h2>
      <ul
        data-section-body=""
        data-text-focus-in={logoEffect === "text-focus-in" ? "" : undefined}
        className="mt-10 grid grid-cols-3 items-center justify-items-center gap-6 md:mt-12 md:gap-16"
      >
        {partners.map((partner) => (
          <li
            key={partner.name}
            className="flex w-full items-center justify-center"
          >
            <div className="relative h-16 w-full md:h-24 lg:h-28">
              <Image
                src={partner.logo}
                alt={partner.name}
                fill
                className="object-contain object-center"
                sizes="(min-width: 1024px) 200px, (min-width: 768px) 160px, 30vw"
              />
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
