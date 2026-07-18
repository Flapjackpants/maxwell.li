export type Project = {
  id: string;
  title: string;
  description: string;
  /** Rich copy for `/projects/[id]` */
  detail: string;
  imageUrl: string;
  githubUrl: string;
  tags: readonly string[];
  /** YouTube watch / youtu.be / embed URL — rendered as an iframe on the detail page when set */
  demoYoutubeUrl?: string;
  /** Live deployment or download page — shown as a second CTA when set */
  liveUrl?: string;
};

/** Extract a YouTube video id from common URL shapes, or null if unrecognized. */
export function getYoutubeVideoId(url: string): string | null {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, "");
    if (host === "youtu.be") {
      const id = parsed.pathname.split("/").filter(Boolean)[0];
      return id || null;
    }
    if (host === "youtube.com" || host === "m.youtube.com") {
      if (parsed.pathname === "/watch") {
        return parsed.searchParams.get("v");
      }
      const embed = parsed.pathname.match(/^\/(?:embed|shorts|live)\/([^/?#]+)/);
      return embed?.[1] ?? null;
    }
  } catch {
    return null;
  }
  return null;
}

const GH = "https://github.com/Flapjackpants";
const PLACEHOLDER = "/project-placeholder.png";

export const PROJECTS = [
  {
    id: "captain",
    title: "Captain",
    description:
      "Lightweight AI-driven DaVinci Resolve plugin — local Whisper transcription, text-edit cuts, and apply back to the timeline on Free or Studio.",
    detail:
      "Captain turns a Resolve clip into a word-level transcript so you can delete, reorder, and auto-trim like editing a document, then apply those cuts back into DaVinci Resolve — replace in place, ripple, or a new timeline.\n\nTranscription runs entirely offline with faster-whisper, so footage never leaves your machine. A Lua bridge owns the live Resolve API while a PySide6 UI handles the transcript editor, silence markers, retake detection, and optional script compare against imported .txt / .fountain / .srt / .vtt.\n\nI built the install path for macOS (venv + FFmpeg + Whisper model), the file-based JSON-RPC bridge between Lua and Python, and the keep-range assembly that maps edited words into timeline ops.",
    imageUrl: "/captain.png",
    githubUrl: `${GH}/Captain`,
    tags: ["Python", "Lua", "PySide6", "Whisper", "FFmpeg"],
  },
  {
    id: "majorscout",
    title: "MajorScout",
    description:
      "College major matching site — a categorized quiz maps you to ~2,000 programs across 25 top U.S. universities with real acceptance rates.",
    detail:
      "MajorScout helps prospective students find a tailor-fit college program. A short quiz covers extracurriculars and stats, interests, personality, and preferences, then ranks programs drawn from about two thousand offerings across twenty-five universities.\n\nMatching builds a student vector from quiz answers (including SAT/ACT) and scores programs by cosine similarity blended with selectivity and campus preference fit, capped at two programs per school. Free users see ranks #2–#8; premium unlocks AI follow-ups, rank #1 and #9+, and per-school essay guidance via OpenAI.\n\nThe stack is Flask + SQLAlchemy (SQLite) and pandas on the backend, React + Tailwind via Vite on the frontend, with Google OAuth and Stripe subscriptions for auth and billing.",
    imageUrl: "/majorScout.png",
    githubUrl: `${GH}/majorScout`,
    tags: ["Python", "Flask", "React", "Stripe", "OpenAI"],
  },
  {
    id: "susping",
    title: "SusPing",
    description:
      "[sp]1itKGeejJItN4GCGae1vb7D5Kol_pOvSpLiXWZXVzqHHirQ4bR4mhBBWGH90bFPkAM8STp90JSDEgg",
    detail:
      "We reject the light at the tunnel's apex. We reject the lust of capital. We reject the pride of the stars. \n\nWe fight to the last man.",
    imageUrl: PLACEHOLDER,
    githubUrl: `${GH}/susPing`,
    tags: ["Java", "Fabric API", "Memetic Warfare", "Shendigladon", "Eidpan Death"]
  },
  {
    id: "umazing",
    title: "umazing",
    description:
      "In-site Minecraft SMP shop for the Prairie community — Discord auth, cart/checkout, Litematica imports, good deals, and good times 😎",
    detail:
      "umazing is the shopping experience built into this site for the Prairie SMP: browse listings, add to cart with chest/stack/item quantities, check out, and track orders — or walk to Susland Plaza (-266, 92, -288) for the brick-and-mortar version.\n\nPlayers sign in with Discord (guild membership required). Admins manage listings, crafting suggestions from recipe data, and order status with Discord DM notifications. Litematica material lists can be imported to fill the cart from a schematic export.\n\nBuilt with Next.js, TypeScript, Discord OAuth, and Drizzle. Visit the live shop at /shop. Hothlica please lmk when you send in the test order. I've been here for years.",
    imageUrl: PLACEHOLDER,
    githubUrl: `${GH}/maxwell.li`,
    tags: ["TypeScript", "Next.js", "Discord OAuth", "Drizzle"],
    liveUrl: "/shop",
  },
  {
    id: "hvtp",
    title: "Hudson Valley Textile Project",
    description:
      "Hack4Impact Cornell — software for HVTP / NEFX, a nonprofit building a sustainable Northeast fiber supply chain.",
    detail:
      "The Hudson Valley Textile Project is a nonprofit strengthening the regional fiber economy; through Northeast Fiber Exchange (NEFX) it connects farmers and consumers around wool and related inventory. I work on the platform as a developer with Hack4Impact Cornell.\n\nMy contributions include multi-field inventory sorting (shear date, updated date, quantity, grade, wool type) for admin and public inventory tables, a dashboard chart PNG export utility, and sales-history surfaces for individual items.\n\nDay to day that means TypeScript and React in an Agile team shipping tools the nonprofit can actually run warehouse and marketplace operations with.",
    imageUrl: "/hvtp.png",
    githubUrl: "https://github.com/cornellh4i/HVTP",
    tags: ["TypeScript", "React", "Firebase", "Rest APIs"],
  },
  {
    id: "stacksquing",
    title: "stackSquing",
    description:
      "Interactive terminal utility for Litematica ASCII material lists — stacks, chests, filter groups, and fulfillment tracking.",
    detail:
      "stackSquing is a C++/ncurses tool for Minecraft builders who live in Litematica exports. Open a material_list_*.txt (or a folder and pick the newest), view totals in raw or chest/stack/item format, organize items into filter-based groups, and mark lines fulfilled — saved back with an a suffix.\n\nThe TUI supports reload when Litematica writes a newer timestamped file, scrollable help, and a one-line install script that builds with CMake and drops the binary in ~/.local/bin.\n\nI wrote it because having an accounting calculator on the desk shouldn't be a requirement to play fucking Minecraft, and I wanted something fast that stays in the terminal next to the game.",
    imageUrl: "/stackSquing.png",
    githubUrl: `${GH}/stackSquing`,
    tags: ["C++", "CMake", "ncurses"],
  },
  {
    id: "enchantping",
    title: "enchantPing",
    description:
      "Minecraft Fabric client mod — configurable XP-level ping plus enchanting-table hover previews.",
    detail:
      "enchantPing is a client-side Fabric mod for Minecraft 26.1+ that plays a configurable sound when you hit a target XP level.\n\nConfiguration goes through Cloth Config with a Mod Menu entry. The implementation uses client mixins against the modern loader stack (Fabric API, Java 25 toolchain).\n\nSmall quality-of-life, shipped so Susland could grind enchants to #FREESOLON.",
    imageUrl: PLACEHOLDER,
    githubUrl: `${GH}/enchantPing`,
    tags: ["Java", "Fabric API", "Cloth Config", "ModMenu"],
  },
  {
    id: "historical-textures",
    title: "Historical Textures",
    description:
      "Fabric mod that lets you pick historical textures and sounds per block, item, entity, and sound event.",
    detail:
      "Historical Textures indexes assets documented on minecraft.wiki and bundles them so you can restore older looks and sounds without hunting packs by hand. In Mod Menu you pick a target, choose a historical variant, and Apply & Reload writes a dynamic overlay resource pack.\n\nA build-time wiki-indexer crawls MediaWiki pages and downloads catalog assets into the mod JAR. At runtime HistoricalCatalog, ModConfig, and OverlayPackManager keep selections offline-safe after the first build.\n\nTargeted at Minecraft 26.1+ with Fabric Loader and Fabric API — a deliberate nostalgia tool for old school chuddies 😣.",
    imageUrl: PLACEHOLDER,
    githubUrl: `${GH}/Historical-Textures`,
    tags: ["Java", "Fabric API", "ModMenu"],
  },
  {
    id: "prairiemap",
    title: "PrairieMap",
    description:
      "Mapping video creation tool — import map frames, draw territories, document events, and compile timelapse video.",
    detail:
      "PrairieMap is a chronological map tool. Import a folder of map images, draw faction territories on a Konva canvas, add labels and per-frame intel, then play back or export a timelapse.\n\nThe frontend is React 19, Vite, TypeScript, and Tailwind; the backend is FastAPI with Shapely for polygon overlap transfer and ffmpeg for MP4 compile. Map image bytes stay in the browser via the folder picker; project JSON and geometry mutations go through the API.\n\nFeatures include a three-panel timeline/canvas/intel layout, duplicate and reorder frames, markdown notes, faction stats, and JSON import/export — so war history becomes a shareable video instead of a paragraph.",
    imageUrl: PLACEHOLDER,
    githubUrl: `${GH}/prairieMap`,
    tags: ["TypeScript", "React", "FastAPI", "Konva", "Shapely"],
  },
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
      "ASCIIify is a tool that converts videos to ASCII art. It can be used as a CLI or integrated into DaVinci Resolve through OpenFX.",
    detail:
      "ASCIIify is a tool that converts videos to ASCII art. It uses FFMPEG to convert the video to a series of images, and then uses a custom algorithm to convert the images to ASCII art. It is written in C++ for efficient memory management and concurrency and uses FFMPEG for video processing. It can be used as a CLI or integrated into DaVinci Resolve through OpenFX.",
    imageUrl: "/asciiify.png",
    githubUrl: "https://github.com/Flapjackpants/ASCIIify",
    tags: ["C++", "FFMPEG", "CMake", "Shell", "OpenCV"],
    demoYoutubeUrl: "https://youtu.be/-28ysRzY3lc?si=eVkLyBYAxTIc7xui",
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
      "Daylite (May–July 2025) is a client-side Fabric mod that replaces slices of Minecraft's lighting engine so brightness can respond to in-game state instead of staying clamped to vanilla gamma rules.\n\nThe implementation stays careful about frame time: hot paths avoid allocations and unnecessary chunk redraws, and ModMenu exposes toggles for pack makers who want predictable defaults.\n\nThe build is published on Modrinth and has passed 175 downloads — small by AAA standards, but a nice signal that other players wanted the same quality-of-life tweak.",
    imageUrl: "/daylite.gif",
    githubUrl: "https://github.com/Flapjackpants/Daylite",
    tags: ["Java", "Fabric API", "ModMenu API"],
    liveUrl: "https://modrinth.com/mod/daylite",
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

export const PINNED_PROJECT_IDS = [
  "hvtp",
  "medexplain",
  "majorscout",
  "captain",
  "burger-ai",
  "prairiemap",
] as const satisfies readonly ProjectId[];

export function getProjectById(id: string): Project | undefined {
  return PROJECTS.find((p) => p.id === id);
}

export function getAllProjectIds(): string[] {
  return PROJECTS.map((p) => p.id);
}

export function isProjectPinned(id: string): boolean {
  return (PINNED_PROJECT_IDS as readonly string[]).includes(id);
}

export function getPinnedProjects(): Project[] {
  return PINNED_PROJECT_IDS.map((id) => getProjectById(id)!);
}

/** Pinned first (pin order), then unpinned in chronological PROJECTS order. */
export function getArchiveProjects(): Project[] {
  const pinned = getPinnedProjects();
  const pinnedIds = new Set<string>(PINNED_PROJECT_IDS);
  const unpinned = PROJECTS.filter((p) => !pinnedIds.has(p.id));
  return [...pinned, ...unpinned];
}
