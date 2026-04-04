/** Shared copy for the home page and the Y2K alternate view. */
export const PROFILE_IMAGE_URL = "https://i.imgur.com/ZtXPoiq.png";

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
    "Deployments, interfaces, and fun projects.",
} as const;

export const homeCv = {
  heading: "Download my resume",
  lede:
    "A synopsis of my work experience and projects.",
  pdfHref: "/cv.pdf",
} as const;

export const homeFooter = {
  connectLabel: "Connect",
  copy: "Open to aligned missions and rigorous teams.",
  linkedinUrl: "https://www.linkedin.com/in/maxwell-kaiyang-li",
  githubUrl: "https://github.com/Flapjackpants",
  mailHref: "mailto:maxkli2007@gmail.com",
} as const;
