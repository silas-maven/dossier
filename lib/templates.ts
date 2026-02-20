export type CvTemplate = {
  id: string;
  name: string;
  category: string;
  previewImage: string;
  description: string;
};

export const cvTemplates: CvTemplate[] = [
  {
    id: "banded-grey",
    name: "Banded Grey",
    category: "Classic",
    description: "Centered header with soft banded section headings and traditional spacing.",
    previewImage: "/card-images/banded-grey.jpg"
  },
  {
    id: "gutter-minimal",
    name: "Gutter Minimal",
    category: "Minimal",
    description: "Date gutter layout with clean typography and airy structure.",
    previewImage: "/card-images/gutter-minimal.jpg"
  },
  {
    id: "blue-rules",
    name: "Blue Rules",
    category: "Finance",
    description: "Blue rule lines, bold section headers, and fast scanning for structured CVs.",
    previewImage: "/card-images/blue-rules.jpg"
  },
  {
    id: "sidebar-light",
    name: "Sidebar Light",
    category: "Two Column",
    description: "Light sidebar for details and skills with a clean main content column.",
    previewImage: "/card-images/sidebar-light.jpg"
  },
  {
    id: "sidebar-navy-right",
    name: "Sidebar Navy (Right)",
    category: "Fintech",
    description: "High-contrast right sidebar for details/skills with a modern fintech tone.",
    previewImage: "/card-images/sidebar-navy-right.jpg"
  },
  {
    id: "sidebar-icons",
    name: "Sidebar Icons",
    category: "Consulting",
    description: "Icon-led sidebar with clean separators and a strong vertical rhythm.",
    previewImage: "/card-images/sidebar-icons.jpg"
  },
  {
    id: "sidebar-tan-dots",
    name: "Sidebar Tan Dots",
    category: "General",
    description: "Warm accent with skill ratings rendered as dots in the sidebar.",
    previewImage: "/card-images/sidebar-tan-dots.jpg"
  },
  {
    id: "skills-right-red",
    name: "Skills Right (Red)",
    category: "Consulting",
    description: "Two-column layout with a dedicated skills column and red accent.",
    previewImage: "/card-images/skills-right-red.jpg"
  },
  {
    id: "boxed-header-dots",
    name: "Boxed Header Dots",
    category: "Two Column",
    description: "Framed header block with dot-rated skills in the sidebar.",
    previewImage: "/card-images/boxed-header-dots.jpg"
  },
  {
    id: "skills-right-pink",
    name: "Skills Right (Pink)",
    category: "General",
    description: "Two-column layout with a skills column and a soft pink accent.",
    previewImage: "/card-images/skills-right-pink.jpg"
  }
];
