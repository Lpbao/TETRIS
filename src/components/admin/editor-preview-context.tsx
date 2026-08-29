"use client";

import { createContext, useContext } from "react";

type EditorPreviewContextValue = {
  onImageResize: (src: string, widthPx: number) => void;
};

export const EditorPreviewContext =
  createContext<EditorPreviewContextValue | null>(null);

export function useEditorPreview() {
  return useContext(EditorPreviewContext);
}
