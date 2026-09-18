import Image, { type ImageProps } from "next/image";
import { isSvgSrc, SITE_IMAGE_BLUR } from "@/lib/site-image";
import { cn } from "@/lib/utils";

type SiteImageProps = Omit<ImageProps, "placeholder" | "blurDataURL"> & {
  grayscale?: boolean;
  blur?: boolean;
  /** Hover: opacity 100% + cursor pointer + Animista text-shadow-drop-center */
  popOnHover?: boolean;
};

export function SiteImage({
  className,
  grayscale,
  blur = true,
  popOnHover = false,
  src,
  alt,
  unoptimized,
  ...props
}: SiteImageProps) {
  const srcString = typeof src === "string" ? src : "";
  const useBlur = blur && srcString && !isSvgSrc(srcString);
  const skipOptimize =
    unoptimized ?? (Boolean(srcString) && !isSvgSrc(srcString));

  return (
    <Image
      src={src}
      alt={alt}
      unoptimized={skipOptimize}
      className={cn(
        grayscale && "grayscale",
        popOnHover && "site-image--pop-hover",
        className,
      )}
      placeholder={useBlur ? "blur" : "empty"}
      blurDataURL={useBlur ? SITE_IMAGE_BLUR : undefined}
      {...props}
    />
  );
}
