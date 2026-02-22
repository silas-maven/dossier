import { Font } from "@react-pdf/renderer";

let registered = false;

export const ensurePdfFonts = () => {
  if (registered) return;

  Font.register({
    family: "DossierBody",
    fonts: [
      { src: "/fonts/dossier-lato-400.woff", fontWeight: 400 },
      { src: "/fonts/dossier-lato-400-italic.woff", fontWeight: 400, fontStyle: "italic" },
      { src: "/fonts/dossier-lato-700.woff", fontWeight: 700 },
      { src: "/fonts/dossier-lato-700-italic.woff", fontWeight: 700, fontStyle: "italic" }
    ]
  });

  Font.register({
    family: "DossierHeading",
    fonts: [
      { src: "/fonts/dossier-barlow-condensed-400.woff", fontWeight: 400 },
      { src: "/fonts/dossier-barlow-condensed-700.woff", fontWeight: 700 }
    ]
  });

  registered = true;
};
