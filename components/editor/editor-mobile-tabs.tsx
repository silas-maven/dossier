"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type EditorPanelTab = "style" | "content" | "preview";

type EditorMobileTabsProps = {
  activeTab: EditorPanelTab;
  onTabChange: (tab: EditorPanelTab) => void;
};

export default function EditorMobileTabs({ activeTab, onTabChange }: EditorMobileTabsProps) {
  const tabs: Array<{ id: EditorPanelTab; label: string }> = [
    { id: "style", label: "Style" },
    { id: "content", label: "Content" },
    { id: "preview", label: "Preview" }
  ];

  return (
    <div
      role="tablist"
      aria-label="Editor panels"
      className="grid grid-cols-3 gap-2 rounded-lg border bg-card/50 p-1"
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <Button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            variant={isActive ? "default" : "secondary"}
            size="sm"
            className={cn("w-full", !isActive && "text-muted-foreground")}
            onClick={() => onTabChange(tab.id)}
          >
            {tab.label}
          </Button>
        );
      })}
    </div>
  );
}
