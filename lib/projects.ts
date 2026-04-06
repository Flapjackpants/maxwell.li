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

export const PROJECTS = [
  {
    id: "alpha",
    title: "test1",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    detail:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    imageUrl: "/project-1.png",
    githubUrl: "https://github.com",
    tags: ["TypeScript", "Rust", "gRPC", "Kafka"],
  },
  {
    id: "bravo",
    title: "test2",
    description:
      "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat duis aute.",
    detail:
      "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat duis aute.",
    imageUrl: "/project-2.png",
    githubUrl: "https://github.com",
    tags: ["React", "D3", "PostgreSQL", "Next.js"],
  },
  {
    id: "charlie",
    title: "test3",
    description:
      "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur excepteur sint.",
    detail:
      "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur excepteur sint.",
    imageUrl: "/project-3.png",
    githubUrl: "https://github.com",
    tags: ["Go", "AWS", "Terraform", "OpenTelemetry"],
  },
  {
    id: "delta",
    title: "test4",
    description:
      "Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum sed ut.",
    detail:
      "Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum sed ut.",
    imageUrl: "/project-4.png",
    githubUrl: "https://github.com",
    tags: ["Python", "FastAPI", "Redis", "WebSockets"],
  },
  {
    id: "echo",
    title: "test5",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque habitant morbi tristique senectus et netus.",
    detail:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque habitant morbi tristique senectus et netus.",
    imageUrl: "/project-5.png",
    githubUrl: "https://github.com",
    tags: ["C++", "ONNX", "CUDA", "gRPC"],
  },
  {
    id: "foxtrot",
    title: "test6",
    description:
      "Integer nec odio praesent libero sed cursus ante dapibus diam sed nisi nulla quis sem at nibh elementum imperdiet.",
    detail:
      "Integer nec odio praesent libero sed cursus ante dapibus diam sed nisi nulla quis sem at nibh elementum imperdiet.",
    imageUrl: "/project-6.png",
    githubUrl: "https://github.com",
    tags: ["Scala", "Kafka", "S3", "Protobuf"],
  },
] as const satisfies readonly Project[];

export type ProjectId = (typeof PROJECTS)[number]["id"];

export function getProjectById(id: string): Project | undefined {
  return PROJECTS.find((p) => p.id === id);
}

export function getAllProjectIds(): string[] {
  return PROJECTS.map((p) => p.id);
}
