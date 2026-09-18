/** MIT — adapted from Codrops Infinite Canvas */

import * as THREE from "three";
import {
  CANVAS_PREVIEW_QUALITY,
  CANVAS_PREVIEW_WIDTH,
  canvasImageSrc,
} from "./image-src";
import type { MediaItem } from "./types";

type Phase = "loading" | "preview" | "full";

const textureCache = new Map<string, THREE.Texture>();
const phaseByUrl = new Map<string, Phase>();
const previewCallbacks = new Map<string, Set<(tex: THREE.Texture) => void>>();
const imageLoader = new THREE.ImageLoader();
imageLoader.setCrossOrigin("anonymous");

const isPreviewReady = (url: string): boolean => {
  const phase = phaseByUrl.get(url);
  return phase === "preview" || phase === "full";
};

const loadImage = (src: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    imageLoader.load(
      src,
      (image) => resolve(image),
      undefined,
      () => reject(new Error(`Image load failed: ${src}`)),
    );
  });

const configureTexture = (
  tex: THREE.Texture,
  image: HTMLImageElement,
  mode: "preview" | "full",
) => {
  tex.image = image;
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.magFilter = THREE.LinearFilter;
  tex.anisotropy = mode === "full" ? 4 : 1;
  if (mode === "full") {
    tex.minFilter = THREE.LinearMipmapLinearFilter;
    tex.generateMipmaps = true;
  } else {
    tex.minFilter = THREE.LinearFilter;
    tex.generateMipmaps = false;
  }
  tex.needsUpdate = true;
};

const applyWhenIdle = (fn: () => void) => {
  if (typeof requestIdleCallback !== "undefined") {
    requestIdleCallback(fn, { timeout: 1500 });
    return;
  }
  setTimeout(fn, 0);
};

const emitPreview = (url: string, tex: THREE.Texture) => {
  const callbacks = previewCallbacks.get(url);
  previewCallbacks.delete(url);
  callbacks?.forEach((cb) => {
    try {
      cb(tex);
    } catch (err) {
      console.error("Texture callback failed:", err);
    }
  });
};

const upgradeToFull = async (url: string, tex: THREE.Texture) => {
  if (phaseByUrl.get(url) === "full") return;

  // Full = storage URL (no /_next/image re-encode @ 1200).
  const fullSrc = url;
  const previewSrc = canvasImageSrc(
    url,
    CANVAS_PREVIEW_WIDTH,
    CANVAS_PREVIEW_QUALITY,
  );
  if (fullSrc === previewSrc) {
    phaseByUrl.set(url, "full");
    return;
  }

  const applyFull = (image: HTMLImageElement) => {
    applyWhenIdle(() => {
      if (phaseByUrl.get(url) === "full") return;
      configureTexture(tex, image, "full");
      phaseByUrl.set(url, "full");
    });
  };

  try {
    applyFull(await loadImage(fullSrc));
  } catch (err) {
    console.error("Texture full load failed:", url, err);
  }
};

const loadPreview = async (url: string, tex: THREE.Texture) => {
  const previewSrc = canvasImageSrc(
    url,
    CANVAS_PREVIEW_WIDTH,
    CANVAS_PREVIEW_QUALITY,
  );

  try {
    const image = await loadImage(previewSrc);
    configureTexture(tex, image, "preview");
    phaseByUrl.set(url, "preview");
    emitPreview(url, tex);
    void upgradeToFull(url, tex);
  } catch (err) {
    if (previewSrc === url) {
      console.error("Texture load failed:", url, err);
      previewCallbacks.delete(url);
      return;
    }

    try {
      const image = await loadImage(url);
      // Original can be 2560px — skip mipmaps so the fallback does not hitch.
      configureTexture(tex, image, "preview");
      phaseByUrl.set(url, "full");
      emitPreview(url, tex);
    } catch (fallbackErr) {
      console.error("Texture load failed:", url, fallbackErr);
      previewCallbacks.delete(url);
    }
  }
};

export const unwatchTexture = (
  url: string,
  onLoad: (texture: THREE.Texture) => void,
) => {
  previewCallbacks.get(url.trim())?.delete(onLoad);
};

/** Preview (640) first so planes can fade in, then swap the same texture to storage original. */
export const getTexture = (
  item: MediaItem,
  onLoad?: (texture: THREE.Texture) => void,
): THREE.Texture => {
  const url = item.url.trim();
  const existing = textureCache.get(url);

  if (existing) {
    if (onLoad) {
      if (isPreviewReady(url)) {
        onLoad(existing);
      } else {
        previewCallbacks.get(url)?.add(onLoad);
      }
    }
    return existing;
  }

  const callbacks = new Set<(tex: THREE.Texture) => void>();
  if (onLoad) callbacks.add(onLoad);
  previewCallbacks.set(url, callbacks);
  phaseByUrl.set(url, "loading");

  const texture = new THREE.Texture();
  texture.colorSpace = THREE.SRGBColorSpace;
  textureCache.set(url, texture);

  if (url) {
    void loadPreview(url, texture);
  }

  return texture;
};
