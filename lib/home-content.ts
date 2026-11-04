/** Shared copy for the home page and the Y2K alternate view. */
export const PROFILE_IMAGE_URL = "/profile.png";

export const navLinks = [
  { href: "#bio", label: "Bio" },
  { href: "#about", label: "About" },
  { href: "#projects", label: "Projects" },
  { href: "#cv", label: "CV" },
  { href: "#socials", label: "Socials" },
] as const;

/** `caption` shows in the tooltip when the image is hovered, clicked, or tapped. */
export type HomeAboutImage = { src: string; caption: string };

/** One “About me” band: copy plus a 2×(2–3) image grid; URLs are usually `/public` paths. */
export type HomeAboutBlock = {
  title: string;
  body: string;
  /** Exactly two rows; each row lists 2–3 images. */
  imageRows: readonly [readonly HomeAboutImage[], readonly HomeAboutImage[]];
};

export const homeAboutSection = {
  eyebrow: "About me",
  heading: "A little more context",
} as const;

export const homeAboutBlocks: readonly HomeAboutBlock[] = [
  {
    title: "My projects",
    body:
      "My projects are a reflection of my interests in the moment. Some are born out of a particular problem I'm facing, others are a way to explore a new technology or idea, some are a creative submission for a class project, and some others yet are just made for fun. ",
    imageRows: [
      [
        { src: "/hackathon.jpg", caption: "Cornell AI Hackathon: the event we made Burger.AI :)" },
        { src: "/muon2.webp", caption: "A monitor into a hatch of a particle accelerator..." },
      ],
      [
        { src: "/critterworld.png", caption: "I'm just a critter in this world... 😔" },
        { src: "/muon.webp", caption: "Checking readings from the muon detector" },
      ],
    ],
  },
  {
    title: "How did we get here?",
    body:
      "From a young age, I've always been interested in building things. It started with Lego and Minecraft, but when I started coding in middle school, it was love at first sight. After being accepted into my dream school, Cornell, I've been able to explore my interests in a more structured way, and I've been able to build some really cool things.",
    imageRows: [
      [
        { src: "/daylite.png", caption: "My first Minecraft Mod!" },
        { src: "/cornell.webp", caption: "Willard Straight hall in the spring!" },
      ],
      [
        { src: "/youngMax.webp", caption: "I visited Cornell in 2012 and I rang the bells!" },
        { src: "/nature.webp", caption: "Beebe lake in the fall" },
      ],
    ],
  },
  {
    title: "My hobbies",
    body:
      "In my free time, I like to hang out with my friends, play video games, learn new instruments, and explore the beauty of creation. Above all, I enjoy the process of creating and learning new things, and making meaningful connections with others.",
    imageRows: [
      [
        { src: "/hackathon2.png", caption: "BigRed//Hacks 2025: my first ever hackathon!" },
        { src: "/minecraft.png", caption: "I enjoy to build in Minecraft" },
      ],
      [
        { src: "/piano.png", caption: "I have been playing piano since I was eight years old." },
        { src: "/nature2.webp", caption: "The part of living on north I miss the most ❤️" },
      ],
    ],
  },
] as const;

export const homeHero = {
  eyebrow: "Systems · Software · Strategy",
  title: "Maxwell Li",
  lede:
    "Hi! I am a computer science student at Cornell in the class of 2028. This website is the best place to see some of the projects I work on in my free time.",
} as const;

export const homeProjectsIntro = {
  heading: "Featured projects",
  intro:
    "Some highlights from my time as a dev. Full list of projects below!",
  listAllLabel: "See all projects",
} as const;

export const homeCv = {
  heading: "Download my resume",
  lede:
    "A synopsis of my work experience and projects.",
  pdfHref: "resume.pdf",
} as const;

export const homeFooter = {
  connectLabel: "Connect",
  copy: "Open to aligned missions and rigorous teams.",
  linkedinUrl: "https://www.linkedin.com/in/maxwell-kaiyang-li",
  githubUrl: "https://github.com/Flapjackpants",
  mailHref: "mailto:maxkli2007@gmail.com",
} as const;
