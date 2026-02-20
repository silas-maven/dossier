"use client";

import type { ReactNode } from "react";
import { CheckCircle2, Circle } from "lucide-react";

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
  children: ReactNode;
  className?: string;
};

export default function EditorContentPanel({
  tabs,
  activeTab,
  onTabChange,
  children,
  className
}: EditorContentPanelProps) {
  return (
    <div className={cn("space-y-4", className)}>
      <div className="sticky top-0 z-20 -mx-1 rounded-xl border border-border/70 bg-card/90 p-2 backdrop-blur">
        <div role="tablist" aria-label="Content sections" className="scrollbar-none flex gap-2 overflow-x-auto px-1">
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
                  "shrink-0 gap-2 rounded-full",
                  !isActive && "text-muted-foreground",
                  tab.complete && !isActive && "border-emerald-500/35 bg-emerald-500/10 text-emerald-300"
                )}
                onClick={() => onTabChange(tab.key)}
              >
                {tab.complete ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Circle className="h-3 w-3" />}
                <span className="max-w-[11rem] truncate">{tab.label}</span>
              </Button>
            );
          })}
        </div>
      </div>

      <div className="space-y-6">{children}</div>
    </div>
  );
}
