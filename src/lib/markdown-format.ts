export type TextAlign = "left" | "center" | "right";

const MD_IMAGE_REGEX = /^!\[([^\]]*)\]\(([^)]+)\)$/;
const HTML_IMG_REGEX = /<img\s+[^>]*\/?>/i;
const ALIGN_DIV_REGEX =
  /^<div\s+style="text-align:\s*(left|center|right);?\s*">\s*([\s\S]*?)\s*<\/div>$/i;

export function wrapWithAlignment(content: string, align: TextAlign): string {
  const trimmed = content.trim();
  if (!trimmed) {
    return `<div style="text-align: ${align}">\n\n</div>`;
  }

  if (MD_IMAGE_REGEX.test(trimmed)) {
    return convertMarkdownImageToHtml(trimmed, align, "100%");
  }

  if (HTML_IMG_REGEX.test(trimmed)) {
    const alignMatch = trimmed.match(ALIGN_DIV_REGEX);
    if (alignMatch) {
      return `<div style="text-align: ${align}">\n${alignMatch[2].trim()}\n</div>`;
    }
    return `<div style="text-align: ${align}">\n${trimmed}\n</div>`;
  }

  const alignMatch = trimmed.match(ALIGN_DIV_REGEX);
  if (alignMatch) {
    return `<div style="text-align: ${align}">\n${alignMatch[2].trim()}\n</div>`;
  }

  return `<div style="text-align: ${align}">\n${trimmed}\n</div>`;
}

export function convertMarkdownImageToHtml(
  markdown: string,
  align: TextAlign = "center",
  width = "100%",
): string {
  const match = markdown.trim().match(MD_IMAGE_REGEX);
  if (!match) return markdown;

  const [, alt, src] = match;
  return `<div style="text-align: ${align}">\n<img src="${src}" alt="${alt}" style="width: ${width}; height: auto;" />\n</div>`;
}

export function updateImageWidthBySrc(
  content: string,
  src: string,
  width: string,
): string {
  const escapedSrc = src.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  let result = content.replace(
    new RegExp(`!\\[([^\\]]*)\\]\\(${escapedSrc}\\)`, "g"),
    (_, alt) =>
      `<div style="text-align: center">\n<img src="${src}" alt="${alt}" style="width: ${width}; height: auto;" />\n</div>`,
  );

  result = result.replace(
    new RegExp(`<img\\s+[^>]*src="${escapedSrc}"[^>]*/?>`, "gi"),
    (match) => {
      if (/style="[^"]*"/i.test(match)) {
        return match.replace(/style="([^"]*)"/i, (_, styles: string) => {
          const cleaned = styles
            .replace(/width:\s*[^;]+;?/gi, "")
            .replace(/height:\s*auto;?/gi, "")
            .trim();
          return `style="width: ${width}; height: auto;${cleaned ? ` ${cleaned}` : ""}"`;
        });
      }
      return match.replace(/\/?>$/, ` style="width: ${width}; height: auto;" />`);
    },
  );

  return result;
}
