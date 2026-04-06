/** Shared copy for the home page and the Y2K alternate view. */
export const PROFILE_IMAGE_URL = "/profile.png";

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
    "Hi! I am a computer science student at Cornell in the class of 2029. This website is the best place to see some of the projects I work on in my free time.",
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
