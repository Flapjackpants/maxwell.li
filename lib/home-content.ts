/** Shared copy for the home page and the Y2K alternate view. */
export const PROFILE_IMAGE_URL = "https://via.placeholder.com/320x320";

export const navLinks = [
  { href: "#bio", label: "Bio" },
  { href: "#projects", label: "Projects" },
  { href: "#cv", label: "CV" },
  { href: "#socials", label: "Socials" },
] as const;

export const homeHero = {
  eyebrow: "Systems · Software · Strategy",
  title: "Maxwell Li",
  lede:
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer posuere erat a ante venenatis dapibus posuere velit aliquet. Cras mattis consectetur purus sit amet fermentum. Curabitur blandit tempus porttitor.",
} as const;

export const homeProjectsIntro = {
  heading: "Selected work",
  intro:
    "Lorem ipsum dolor sit amet — deployments, interfaces, and infrastructure at scale.",
} as const;

export const homeCv = {
  heading: "Curriculum vitae",
  lede:
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean lacinia bibendum nulla sed consectetur. Maecenas faucibus mollis interdum. Vestibulum id ligula porta felis euismod semper.",
  pdfHref: "/cv.pdf",
} as const;

export const homeFooter = {
  connectLabel: "Connect",
  copy: "Lorem ipsum — open to aligned missions and rigorous teams.",
  linkedinUrl: "https://linkedin.com",
  githubUrl: "https://github.com",
  mailHref: "mailto:hello@example.com",
} as const;
