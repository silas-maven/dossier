"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { CheckCircle2, Circle, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type EditorContentTab = "import" | "basics" | `section:${string}`;

export type ContentTabStatus = {
  key: EditorContentTab;
  label: string;
  complete: boolean;
  disabled?: boolean;
};

type EditorContentPanelProps = {
  tabs: ContentTabStatus[];
  activeTab: EditorContentTab;
  onTabChange: (tab: EditorContentTab) => void;
  addSectionOptions?: Array<{
    value: string;
    label: string;
    hint?: string;
    disabled?: boolean;
  }>;
  onAddSection?: (sectionType: string) => void;
  children: ReactNode;
  className?: string;
};

export default function EditorContentPanel({
  tabs,
  activeTab,
  onTabChange,
  addSectionOptions,
  onAddSection,
  children,
  className
}: EditorContentPanelProps) {
  const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);
  const addMenuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isAddMenuOpen) return;
    const closeOnOutside = (event: MouseEvent) => {
      if (!addMenuRef.current?.contains(event.target as Node)) {
        setIsAddMenuOpen(false);
      }
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsAddMenuOpen(false);
    };
    document.addEventListener("mousedown", closeOnOutside);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("mousedown", closeOnOutside);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [isAddMenuOpen]);

  return (
    <div className={cn("space-y-4", className)}>
      <div className="sticky top-0 z-20 -mx-1 rounded-xl border border-border/70 bg-card/90 p-2 backdrop-blur">
        <div className="flex items-center gap-2">
          <div
            role="tablist"
            aria-label="Content sections"
            className="scrollbar-none flex min-w-0 flex-1 gap-2 overflow-x-auto px-1 pb-1 sm:flex-wrap sm:overflow-visible"
          >
            {tabs.map((tab) => {
              const isActive = tab.key === activeTab;
              return (
                <Button
                  key={tab.key}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  disabled={tab.disabled}
                  variant={isActive ? "default" : "secondary"}
                  size="sm"
                  className={cn(
                    "shrink-0 gap-2 rounded-full sm:shrink",
                    !isActive && "text-muted-foreground",
                    tab.complete && !isActive && "border-emerald-500/35 bg-emerald-500/10 text-emerald-300"
                  )}
                  onClick={() => onTabChange(tab.key)}
                >
                  {tab.complete ? (
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  ) : (
                    <Circle className="h-3 w-3" />
                  )}
                  <span className="max-w-[11rem] truncate">{tab.label}</span>
                </Button>
              );
            })}
          </div>

          {onAddSection && addSectionOptions && addSectionOptions.length > 0 ? (
            <div ref={addMenuRef} className="relative shrink-0">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                aria-haspopup="menu"
                aria-expanded={isAddMenuOpen}
                onClick={() => setIsAddMenuOpen((open) => !open)}
                className="rounded-full"
              >
                <Plus className="h-4 w-4" />
                Add
              </Button>
              {isAddMenuOpen ? (
                <div
                  role="menu"
                  className="absolute right-0 top-full z-30 mt-2 w-64 rounded-lg border border-border/70 bg-card p-1 shadow-lg"
                >
                  {addSectionOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      role="menuitem"
                      disabled={option.disabled}
                      className={cn(
                        "flex w-full flex-col items-start rounded-md px-2.5 py-2 text-left text-sm",
                        option.disabled
                          ? "cursor-not-allowed text-muted-foreground/70 opacity-60"
                          : "hover:bg-muted/70"
                      )}
                      onClick={() => {
                        if (option.disabled) return;
                        onAddSection(option.value);
                        setIsAddMenuOpen(false);
                      }}
                    >
                      <span className="font-medium text-foreground">{option.label}</span>
                      {option.hint ? (
                        <span className="text-xs text-muted-foreground">{option.hint}</span>
                      ) : null}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>

      <div className="space-y-6">{children}</div>
    </div>
  );
}
