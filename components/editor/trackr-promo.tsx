"use client";

import { Check, ExternalLink } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";

const TRACKR_BASE_URL = "https://trackr-pro.com/dossier";

// Tagged link so Dossier -> Trackr referrals are measurable.
export const trackrUrl = (campaign: string) =>
  `${TRACKR_BASE_URL}?utm_source=dossier&utm_medium=referral&utm_campaign=${campaign}`;

const SEEN_KEY = "dossier:trackr-promo-seen:v1";

// The pop-up appears at most once per browser session (after a PDF download), so a
// returning job-seeker gets one nudge each work session without being spammed on every
// re-export. sessionStorage clears when the tab/session ends; the side link is always there.
export const hasSeenTrackrPromo = () => {
  if (typeof window === "undefined") return true;
  try {
    return window.sessionStorage.getItem(SEEN_KEY) === "1";
  } catch {
    return true;
  }
};

export const markTrackrPromoSeen = () => {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(SEEN_KEY, "1");
  } catch {
    // sessionStorage unavailable (private mode); just skip persistence.
  }
};

type TrackrPromoDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function TrackrPromoDialog({ open, onOpenChange }: TrackrPromoDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Your CV is ready.</DialogTitle>
          <DialogDescription>
            Dossier handles the document. Trackr Pro is the separate app by the same maker for everything after it.
          </DialogDescription>
        </DialogHeader>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li className="flex gap-2">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <span>
              Keep every application, deadline, contact, and next action in one place
            </span>
          </li>
          <li className="flex gap-2">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <span>
              Review your <strong className="text-foreground">application strength</strong> and prepare for interviews
            </span>
          </li>
          <li className="flex gap-2">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <span>Save roles from the web with the Trackr browser extension</span>
          </li>
        </ul>
        <DialogFooter className="mt-2 gap-2 sm:gap-2">
          <Button type="button" variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
            Maybe later
          </Button>
          <Button asChild size="sm">
            <a href={trackrUrl("pdf_download")} target="_blank" rel="noopener noreferrer">
              Continue with Trackr Pro
              <ExternalLink className="h-4 w-4" />
            </a>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Slim, always-available link in the editor side panel. Visible but not in your face.
export function TrackrSideLink() {
  return (
    <a
      href={trackrUrl("editor_sidelink")}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5 transition hover:border-white/20 hover:bg-white/[0.06]"
    >
      <span className="flex flex-col">
        <span className="text-sm font-medium text-white/90">Your CV is one part of the search</span>
        <span className="text-xs text-white/55">Continue in Trackr Pro — a separate application by the same maker.</span>
      </span>
      <ExternalLink className="h-4 w-4 shrink-0 text-white/50 transition group-hover:text-white/80" />
    </a>
  );
}
