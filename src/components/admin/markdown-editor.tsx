"use client";

import {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import dynamic from "next/dynamic";
import rehypeRaw from "rehype-raw";
import { cn } from "@/lib/utils";
import {
  updateImageWidthBySrc,
  wrapWithAlignment,
  type TextAlign,
} from "@/lib/markdown-format";
import { EditorToolbar } from "@/components/admin/editor-toolbar";
import { EditorPreviewContext } from "@/components/admin/editor-preview-context";
import { ResizableImage } from "@/components/admin/resizable-image";
import "@uiw/react-md-editor/markdown-editor.css";

const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });

export interface MarkdownEditorHandle {
  insertAtCursor: (text: string) => void;
  focus: () => void;
}

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

function getTextarea(container: HTMLElement | null) {
  return container?.querySelector("textarea") ?? null;
}

export const MarkdownEditor = forwardRef<MarkdownEditorHandle, MarkdownEditorProps>(
  function MarkdownEditor({ value, onChange, className }, ref) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [selectionText, setSelectionText] = useState("");

    const updateSelection = useCallback(() => {
      const textarea = getTextarea(containerRef.current);
      if (!textarea) return;
      const { selectionStart, selectionEnd } = textarea;
      setSelectionText(value.slice(selectionStart, selectionEnd));
    }, [value]);

    const replaceSelection = useCallback(
      (newText: string) => {
        const textarea = getTextarea(containerRef.current);
        const current = value ?? "";

        if (!textarea) {
          onChange(current + newText);
          return;
        }

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const before = current.slice(0, start);
        const after = current.slice(end);
        const updated = before + newText + after;
        onChange(updated);

        requestAnimationFrame(() => {
          const el = getTextarea(containerRef.current);
          if (!el) return;
          el.focus();
          el.setSelectionRange(start, start + newText.length);
          setSelectionText(newText);
        });
      },
      [onChange, value],
    );

    const insertAtCursor = useCallback(
      (text: string) => {
        const textarea = getTextarea(containerRef.current);
        const current = value ?? "";

        if (!textarea) {
          const separator = current.trim() ? "\n\n" : "";
          onChange(`${current}${separator}${text}`);
          return;
        }

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const before = current.slice(0, start);
        const after = current.slice(end);

        const prefix =
          before.length > 0 && !before.endsWith("\n\n") && !before.endsWith("\n")
            ? before.endsWith("\n")
              ? "\n"
              : "\n\n"
            : "";
        const suffix =
          after.length > 0 && !after.startsWith("\n") ? "\n\n" : "";

        const insert = `${prefix}${text}${suffix}`;
        onChange(before + insert + after);

        requestAnimationFrame(() => {
          const el = getTextarea(containerRef.current);
          if (!el) return;
          const cursor = before.length + insert.length;
          el.focus();
          el.setSelectionRange(cursor, cursor);
        });
      },
      [onChange, value],
    );

    const focus = useCallback(() => {
      getTextarea(containerRef.current)?.focus();
    }, []);

    useImperativeHandle(ref, () => ({ insertAtCursor, focus }), [
      insertAtCursor,
      focus,
    ]);

    const handleImageResize = useCallback(
      (src: string, widthPx: number) => {
        onChange(updateImageWidthBySrc(value, src, `${widthPx}px`));
      },
      [onChange, value],
    );

    const previewContextValue = useMemo(
      () => ({ onImageResize: handleImageResize }),
      [handleImageResize],
    );

    const previewOptions = useMemo(
      () => ({
        rehypePlugins: [rehypeRaw],
        components: {
          img: (props: React.ImgHTMLAttributes<HTMLImageElement>) => (
            <ResizableImage {...props} />
          ),
        },
      }),
      [],
    );

    const handleAlign = (align: TextAlign) => {
      const textarea = getTextarea(containerRef.current);
      const selected =
        textarea && textarea.selectionStart !== textarea.selectionEnd
          ? value.slice(textarea.selectionStart, textarea.selectionEnd)
          : selectionText;

      if (selected) {
        replaceSelection(wrapWithAlignment(selected, align));
        return;
      }

      insertAtCursor(wrapWithAlignment("", align));
    };

    const handleDrop = (e: React.DragEvent) => {
      e.preventDefault();
      const markdown =
        e.dataTransfer.getData("application/x-media-markdown") ||
        e.dataTransfer.getData("text/plain");
      if (markdown) insertAtCursor(markdown);
    };

    return (
      <EditorPreviewContext.Provider value={previewContextValue}>
        <div
          ref={containerRef}
          className={cn(
            "rounded-md border border-input overflow-hidden",
            className,
          )}
          data-color-mode="light"
          onDragOver={(e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = "copy";
          }}
          onDrop={handleDrop}
        >
          <EditorToolbar onAlign={handleAlign} />
          <MDEditor
            value={value}
            onChange={(val) => onChange(val ?? "")}
            height={400}
            preview="live"
            previewOptions={previewOptions}
            textareaProps={{
              placeholder:
                "Viết nội dung... Kéo ảnh từ Media vào đây. Chỉnh kích thước ảnh ở khung Preview bên phải.",
              onSelect: updateSelection,
              onKeyUp: updateSelection,
              onMouseUp: updateSelection,
            }}
          />
        </div>
      </EditorPreviewContext.Provider>
    );
  },
);
