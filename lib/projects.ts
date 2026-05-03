export type Project = {
  id: string;
  title: string;
  description: string;
  /** Rich copy for `/projects/[id]` */
  detail: string;
  imageUrl: string;
  githubUrl: string;
  tags: readonly string[];
};

const GH = "https://github.com/Flapjackpants";

export const PROJECTS = [
  {
    id: "image2banners",
    title: "Image2Banners",
    description:
      "Contributed to this project by adding Mac support and improving the UI. This app takes images and converts them into complex banners, And shows crafting steps for each banner, or saves as NBT to build using a structure block. You can also save them as JSON file, so you don't have to regenerate complex banners from the image each time.",
    detail:
      "Contributed to this project by adding Mac support and improving the UI. This app takes images and converts them into complex banners, And shows crafting steps for each banner, or saves as NBT to build using a structure block. You can also save them as JSON file, so you don't have to regenerate complex banners from the image each time. Uses scikit-learn for matching the best banner to each subsection of the image and Electron for the desktop app. I changed the UI to be more consistent with the rest of the app and removed windows-exclusive features to make the app compatible with Mac. I also added more robust concurrency and some quality of life improvements.",
    imageUrl: "/image2banners.png",
    githubUrl: "https://github.com/Flapjackpants/Image2Banners-Mac-Edition",
    tags: ["Python", "scikit-learn", "Electron", "Shell"],
  },
  {
    id: "asciiify",
    title: "ASCIIify",
    description:
      "ASCIIify is a tool that converts videos to ASCII art. It uses FFMPEG to convert the video to a series of images, and then uses a custom algorithm to convert the images to ASCII art.",
    detail:
      "ASCIIify is a tool that converts videos to ASCII art. It uses FFMPEG to convert the video to a series of images, and then uses a custom algorithm to convert the images to ASCII art. It is written in C++ for efficient memory management and concurrency and uses FFMPEG for video processing. Working on potentially integrating this into a downloadable plugin for DaVinci Resolve so it can be used direcly as an effect. Demo video [here](https://youtu.be/-28ysRzY3lc?si=eVkLyBYAxTIc7xui).",
    imageUrl: "/asciiify.png",
    githubUrl: "https://github.com/Flapjackpants/ASCIIify",
    tags: ["C++", "FFMPEG", "CMake", "Shell", "OpenCV"],
  },
  {
    id: "burger-ai",
    title: "Burger.AI",
    description:
      "Finalist at the 2026 Cornell AI NYC Hackathon — automated pipeline to stress-test agentic financial AI against OWASP-style expectations.",
    detail:
      "Burger.AI was a Cornell AI NYC Hackathon (February 2026) project that became a finalist. The system implements an automated pipeline for testing agentic financial AI: models that plan and call tools in a loop rather than returning a single reply.\n\nA central idea was bridging the intent–action gap with explicit guardrails. I used pre-tool and post-tool hooks to validate JSON payloads, redact PII before it left controlled paths, and keep tool use aligned with policy.\n\nAgainst that harness, baseline pass rates of 36% (Claude Sonnet 4.6) and 59% (GPT-4o-mini) improved to about 98% when measured against the OWASP-oriented criteria we targeted — a concrete signal that structure around tool calls matters as much as model choice.",
    imageUrl: "/anthropic_post.png",
    githubUrl: "https://github.com/Flapjackpants/Burger.AI",
    tags: ["Python", "React", "OpenAI API", "Anthropic API", "Shell"],
  },
  {
    id: "medexplain",
    title: "MedExplain",
    description:
      "Hack4Impact Cornell — led backend and UI overhaul for a nonprofit platform that delivers free, accessible medical information.",
    detail:
      "MedExplain is a nonprofit-facing product: a platform for delivering free, accessible medical information to people who need it in plain language. I work on it as a software developer with Hack4Impact Cornell (November 2025–present).\n\nOn the frontend, I rebuilt major surfaces in React and TypeScript with mobile layouts and accessibility in mind — high contrast, predictable focus, and flows that still work on small screens.\n\nDay to day that has meant an Agile rhythm: design sprints, code review, and turning stakeholder constraints from the nonprofit into shippable software.",
    imageUrl: "/medexplain.png",
    githubUrl: "https://github.com/MedExplain/MedExplainWeb",
    tags: ["TypeScript", "React", "REST APIs", "Accessibility"],
  },
  {
    id: "critterland",
    title: "Critterland",
    description:
    "A game simulating critter habitats and critter evolution. Made as a final project for CS 2112 at Cornell.",
    detail:
    "Critter World is a simulation game in which programmable critters move, eat, reproduce, and mutate in a shared world. You define their behavior; the world runs step by step while evolutionary pressure emerges from competition for energy, survival, and offspring. Over time, populations can diverge as mutations stack and successful strategies spread.",
    imageUrl: "/critterland.png",
    githubUrl: "https://github.com/Flapjackpants/CritterLand",
    tags: ["Java", "JavaFX", "Gradle", "Maven"],
  },
  {
    id: "debately",
    title: "Debately",
    description:
      "Claude Builder's Club Hackathon 2025 — structured, fact-based debate with Claude summaries, source checks, and Tavily-backed verification.",
    detail:
      "Debately was built for the Claude Builder's Club Hackathon in November 2025. The goal was to let people contribute to structured, fact-based debates instead of unstructured argument threads.\n\nClaude ingests claims and counter-claims, then produces summaries, flags where sources disagree, surfaces consensus when it exists, and highlights direct rebuttals.\n\nFactual claims are not taken on trust: a Tavily-powered web layer fetches and normalizes sources, and Claude synthesizes what those sources actually support. SQLite holds session and debate state so the experience stays fast and cheap to host.",
    imageUrl: "/debately.webp",
    githubUrl: "https://github.com/mdelriolanse/Debately",
    tags: ["TypeScript", "React", "Claude API", "SQLite", "Tavily API"],
  },
  {
    id: "ka-ching",
    title: "Ka-Ching!",
    description:
      "BigRed//Hacks 2025 — gamify Google Calendar into a tycoon experience with Flask, MongoDB, and Gemini.",
    detail:
      "Ka-Ching! was my September 2025 project for BigRed//Hacks: a playful take on productivity where your real Google Calendar becomes the economy of a lightweight tycoon game.\n\nEvents are scored by inferred difficulty — sentiment and heuristics over titles and descriptions — and those scores map to different XP rewards so a brutal week actually levels you up in-game.\n\nThe stack split cleanly: TypeScript and React on the client, Flask services behind the scenes for persistence, game rules, and the OAuth calendar bridge, with MongoDB as the document store and Google's Gemini API for the NLP-heavy scoring path.",
    imageUrl: "/kaching.png",
    githubUrl: "https://github.com/mdelriolanse/ka-ching",
    tags: ["TypeScript", "React", "Flask", "Google Gemini API", "MongoDB"],
  },
  {
    id: "hypathiabot",
    title: "HypathiaBot",
    description:
      "Modular Discord moderation bot using NLTK sentiment plus OpenAI, deployed on three servers (100+ users, 800+ messages/week).",
    detail:
      "HypathiaBot is a modular Python Discord bot I shipped between May and July 2025 to help communities moderate themselves without burning out human mods.\n\nThe architecture is deliberately pluggable: Redis caches hot paths, Docker packages predictable deploys, and discord.py handles the gateway and slash-command surface.\n\nModeration blends classical NLP with models: NLTK does fast sentiment and lexical signals, while the OpenAI API handles edge cases that need richer judgment. At peak it ran in three servers covering more than a hundred active users and north of eight hundred messages per week.",
    imageUrl: "/hypathiabot.png",
    githubUrl: "https://github.com/Flapjackpants/HypathiaBot",
    tags: ["Python", "NLTK", "OpenAI", "Redis", "Docker", "discord.py"],
  },
  {
    id: "daylite",
    title: "Daylite",
    description:
      "Minecraft Fabric mod that rewrites the lighting engine for dynamic brightness — 175+ downloads on Modrinth.",
    detail:
      "Daylite (May–July 2025) is a client-side Fabric mod that replaces slices of Minecraft's lighting engine so brightness can respond to in-game state instead of staying clamped to vanilla gamma rules.\n\nThe implementation stays careful about frame time: hot paths avoid allocations and unnecessary chunk redraws, and ModMenu exposes toggles for pack makers who want predictable defaults.\n\nThe build is published on Modrinth and has passed 175 downloads — small by AAA standards, but a nice signal that other players wanted the same quality-of-life tweak. You can download it [here](https://modrinth.com/mod/daylite).",
    imageUrl: "/daylite.gif",
    githubUrl: "https://github.com/Flapjackpants/Daylite",
    tags: ["Java", "Fabric API", "ModMenu API"],
  },
  {
    id: "independent-research",
    title: "Independent research — DDoS amplification",
    description:
      "May–July 2024 analysis of CIC-DDoS2019: supervised ML for amplification traffic at 99%+ accuracy, Vaex plots over 5M rows.",
    detail:
      "During the summer of 2024 I ran an independent research project on the CIC-DDoS2019 capture, focused specifically on DDoS amplification traffic — the kind of reflection-heavy floods that show up in misconfigured UDP services.\n\nI trained a supervised classifier in scikit-learn with careful train/validation splits so metrics reflected generalization, not leakage across time windows. The final model cleared 99% accuracy on the held-out slices I reserved.\n\nExploratory work at five-million-row scale used Vaex for lazy, out-of-core aggregates and Matplotlib for the figures that convinced me which features actually separated amplification from benign bursts. Java handled some of the heavier preprocessing glue where the Python scientific stack was awkward.",
    imageUrl: "/ddos.png",
    githubUrl: GH,
    tags: ["Python", "scikit-learn", "pandas", "NumPy", "Vaex", "Matplotlib"],
  },
] as const satisfies readonly Project[];

export type ProjectId = (typeof PROJECTS)[number]["id"];

export function getProjectById(id: string): Project | undefined {
  return PROJECTS.find((p) => p.id === id);
}

export function getAllProjectIds(): string[] {
  return PROJECTS.map((p) => p.id);
}
