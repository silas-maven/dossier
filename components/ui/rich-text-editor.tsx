"use client";

import { useEffect, useMemo } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

import { Button } from "@/components/ui/button";
import {
  descriptionToEditorHtml,
  normalizeStoredDescriptionHtml
} from "@/lib/description-format";
import { cn } from "@/lib/utils";

type RichTextEditorProps = {
  value: string;
  onChange: (value: string) => void;
  onAutoFormat?: () => void;
  onBlur?: () => void;
  onPasteText?: (text: string) => string;
  className?: string;
};

export default function RichTextEditor({
  value,
  onChange,
  onAutoFormat,
  onBlur,
  onPasteText,
  className
}: RichTextEditorProps) {
  const incomingHtml = useMemo(() => descriptionToEditorHtml(value), [value]);
  const incomingStored = useMemo(
    () => normalizeStoredDescriptionHtml(incomingHtml),
    [incomingHtml]
  );

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: false,
        blockquote: false,
        codeBlock: false,
        horizontalRule: false
      })
    ],
    content: incomingHtml,
    editorProps: {
      attributes: {
        class:
          "min-h-24 w-full whitespace-pre-wrap rounded-md border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:my-1 [&_ul]:list-disc [&_ul]:pl-5"
      }
    },
    onUpdate: ({ editor: nextEditor }) => {
      const sanitized = normalizeStoredDescriptionHtml(nextEditor.getHTML());
      onChange(sanitized);
    },
    onBlur: () => {
      onBlur?.();
    }
  });

  useEffect(() => {
    if (!editor) return;
    const currentStored = normalizeStoredDescriptionHtml(editor.getHTML());
    if (currentStored === incomingStored) return;
    editor.commands.setContent(incomingHtml || "<p></p>", { emitUpdate: false });
  }, [editor, incomingHtml, incomingStored]);

  const applyCommand = (fn: () => void) => {
    if (!editor) return;
    fn();
  };

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-medium">Description</span>
        <span className="flex items-center gap-2">
          <Button
            type="button"
            variant={editor?.isActive("bold") ? "default" : "secondary"}
            size="sm"
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => applyCommand(() => editor?.chain().focus().toggleBold().run())}
            aria-label="Bold selected text"
            className="font-semibold"
          >
            B
          </Button>
          <Button
            type="button"
            variant={editor?.isActive("italic") ? "default" : "secondary"}
            size="sm"
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => applyCommand(() => editor?.chain().focus().toggleItalic().run())}
            aria-label="Italicize selected text"
            className="italic"
          >
            I
          </Button>
          <Button
            type="button"
            variant={editor?.isActive("underline") ? "default" : "secondary"}
            size="sm"
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => applyCommand(() => editor?.chain().focus().toggleUnderline().run())}
            aria-label="Underline selected text"
            className="underline"
          >
            U
          </Button>
          <Button
            type="button"
            variant={editor?.isActive("bulletList") ? "default" : "secondary"}
            size="sm"
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => applyCommand(() => editor?.chain().focus().toggleBulletList().run())}
            aria-label="Toggle bullet list"
          >
            • List
          </Button>
          <Button
            type="button"
            variant={editor?.isActive("orderedList") ? "default" : "secondary"}
            size="sm"
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => applyCommand(() => editor?.chain().focus().toggleOrderedList().run())}
            aria-label="Toggle numbered list"
          >
            1. List
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onMouseDown={(event) => event.preventDefault()}
            onClick={() =>
              applyCommand(() => editor?.chain().focus().unsetAllMarks().clearNodes().run())
            }
            aria-label="Clear formatting"
          >
            Clear
          </Button>
          {onAutoFormat ? (
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => {
                onAutoFormat();
                requestAnimationFrame(() => editor?.commands.focus());
              }}
            >
              Auto format
            </Button>
          ) : null}
        </span>
      </div>

      <EditorContent
        editor={editor}
        onPaste={(event) => {
          if (!editor || !onPasteText) return;
          const pasted = event.clipboardData.getData("text/plain");
          if (!pasted) return;
          const transformed = onPasteText(pasted);
          if (transformed === pasted) return;
          event.preventDefault();
          editor.chain().focus().insertContent(transformed.replace(/\r/g, "\n")).run();
        }}
      />
    </div>
  );
}
