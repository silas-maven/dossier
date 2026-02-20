"use client";

import { useEffect, useMemo, useRef } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type RichTextEditorProps = {
  value: string;
  onChange: (value: string) => void;
  onAutoFormat?: () => void;
  onBlur?: () => void;
  onPasteText?: (text: string) => string;
  className?: string;
};

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

const lineToInlineHtml = (value: string) => {
  const escaped = escapeHtml(value);
  return escaped
    .replace(/\*\*\*([^*]+)\*\*\*/g, "<strong><em>$1</em></strong>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>");
};

const markdownToHtml = (value: string) => {
  const lines = value.replace(/\r/g, "\n").split("\n");
  if (lines.length === 0) return "<div><br></div>";

  return lines
    .map((rawLine) => {
      const line = rawLine ?? "";
      const bulletMatch = line.match(/^[-•*]\s+(.*)$/);
      if (bulletMatch) {
        const contentHtml = lineToInlineHtml(bulletMatch[1] || "");
        return `<div data-bullet="1"><span contenteditable="false">• </span><span data-content="1">${contentHtml || "<br>"}</span></div>`;
      }
      return `<div><span data-content="1">${lineToInlineHtml(line) || "<br>"}</span></div>`;
    })
    .join("");
};

const normalizeSpaces = (value: string) =>
  value.replace(/\u00a0/g, " ").replace(/\s+$/g, "");

const serializeInlineNode = (
  node: Node,
  state: { bold: boolean; italic: boolean } = { bold: false, italic: false }
): string => {
  if (node.nodeType === Node.TEXT_NODE) {
    const text = normalizeSpaces(node.textContent || "");
    if (!text) return "";
    if (state.bold && state.italic) return `***${text}***`;
    if (state.bold) return `**${text}**`;
    if (state.italic) return `*${text}*`;
    return text;
  }

  if (node.nodeType !== Node.ELEMENT_NODE) return "";
  const el = node as HTMLElement;
  const tag = el.tagName;
  const nextState = {
    bold: state.bold || tag === "B" || tag === "STRONG",
    italic: state.italic || tag === "I" || tag === "EM"
  };

  return Array.from(el.childNodes)
    .map((child) => serializeInlineNode(child, nextState))
    .join("");
};

const htmlToMarkdown = (root: HTMLElement) => {
  const blockNodes = Array.from(root.childNodes).filter((node) => {
    if (node.nodeType === Node.TEXT_NODE) return (node.textContent || "").trim().length > 0;
    return true;
  });

  if (blockNodes.length === 0) return "";

  const lines = blockNodes.map((node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      return normalizeSpaces(node.textContent || "");
    }
    const block = node as HTMLElement;
    const isBullet = block.dataset.bullet === "1";
    const target = (block.querySelector("[data-content='1']") as HTMLElement | null) ?? block;
    const serialized = serializeInlineNode(target).trim();
    if (!serialized) return "";
    return isBullet ? `- ${serialized}` : serialized;
  });

  return lines.join("\n").replace(/\n{3,}/g, "\n\n").trimEnd();
};

export default function RichTextEditor({
  value,
  onChange,
  onAutoFormat,
  onBlur,
  onPasteText,
  className
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement | null>(null);
  const htmlValue = useMemo(() => markdownToHtml(value || ""), [value]);

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;
    if (document.activeElement === editor) return;
    if (editor.innerHTML !== htmlValue) {
      editor.innerHTML = htmlValue;
    }
  }, [htmlValue]);

  const syncFromDom = () => {
    const editor = editorRef.current;
    if (!editor) return;
    onChange(htmlToMarkdown(editor));
  };

  const applyInlineFormat = (command: "bold" | "italic") => {
    const editor = editorRef.current;
    if (!editor) return;
    editor.focus();
    document.execCommand(command, false);
    syncFromDom();
  };

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-medium">Description</span>
        <span className="flex items-center gap-2">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => applyInlineFormat("bold")}
            aria-label="Bold selected text"
            className="font-semibold"
          >
            B
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => applyInlineFormat("italic")}
            aria-label="Italicize selected text"
            className="italic"
          >
            I
          </Button>
          {onAutoFormat ? (
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => {
                onAutoFormat();
                requestAnimationFrame(() => editorRef.current?.focus());
              }}
            >
              Auto format
            </Button>
          ) : null}
        </span>
      </div>

      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        className="min-h-24 w-full whitespace-pre-wrap rounded-md border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        onInput={syncFromDom}
        onBlur={() => {
          syncFromDom();
          onBlur?.();
        }}
        onPaste={(event) => {
          const pasted = event.clipboardData.getData("text/plain");
          if (!pasted) return;
          event.preventDefault();
          const text = onPasteText ? onPasteText(pasted) : pasted;
          document.execCommand("insertText", false, text);
          syncFromDom();
        }}
      />
    </div>
  );
}
