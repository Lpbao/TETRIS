import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface BlogCoverImageProps {
  src: string;
  alt: string;
  href: string;
  className?: string;
}

export function BlogCoverImage({
  src,
  alt,
  href,
  className,
}: BlogCoverImageProps) {
  return (
    <Link href={href} className={cn("block", className)}>
      <div className="relative aspect-[2/1] w-full overflow-hidden bg-muted">
        <Image
          src={src}
          alt={alt}
          fill
          className="object-cover grayscale transition-transform duration-300 hover:scale-[1.02]"
          sizes="(max-width: 768px) 100vw, 768px"
        />
      </div>
    </Link>
  );
}
