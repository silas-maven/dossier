import { Font } from "@react-pdf/renderer";

let registered = false;

export const ensurePdfFonts = (baseUrl = "") => {
  if (registered) return;
  const source = (path: string) => `${baseUrl.replace(/\/$/, "")}${path}`;

  Font.register({
    family: "DossierBody",
    fonts: [
      { src: source("/fonts/dossier-lato-400.woff"), fontWeight: 400 },
      { src: source("/fonts/dossier-lato-400-italic.woff"), fontWeight: 400, fontStyle: "italic" },
      { src: source("/fonts/dossier-lato-700.woff"), fontWeight: 700 },
      { src: source("/fonts/dossier-lato-700-italic.woff"), fontWeight: 700, fontStyle: "italic" }
    ]
  });

  Font.register({
    family: "DossierHeading",
    fonts: [
      { src: source("/fonts/dossier-barlow-condensed-400.woff"), fontWeight: 400 },
      { src: source("/fonts/dossier-barlow-condensed-700.woff"), fontWeight: 700 }
    ]
  });

  // ATS and text extractors can treat automatic line-break hyphens as real
  // characters ("web-hooks"). Keep keywords intact and wrap them as whole words.
  Font.registerHyphenationCallback((word) => [word]);

  registered = true;
};
