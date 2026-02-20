"use client";

import CvPreviewPane from "@/app/editor/cv-preview-pane";
import type { CvProfile } from "@/lib/cv-profile";
import { cn } from "@/lib/utils";

type EditorPreviewPanelProps = {
  profile: CvProfile;
  templateName: string;
  className?: string;
};

export default function EditorPreviewPanel({ profile, templateName, className }: EditorPreviewPanelProps) {
  return (
    <div className={cn("space-y-3", className)}>
      <CvPreviewPane
        profile={profile}
        templateName={templateName}
        defaultMode="pdf"
        variant="editorDark"
      />
    </div>
  );
}
