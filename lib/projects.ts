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
    title: "Distributed Telemetry Core",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    detail:
      "This project spans a multi-region telemetry plane: collectors at the edge, aggregation tiers, and a query API backed by columnar storage. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer posuere erat a ante venenatis dapibus posuere velit aliquet.\n\nWe focused on tail latency under bursty load, deterministic backpressure, and schema evolution without downtime. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
    imageUrl: "https://via.placeholder.com/1200x675",
    githubUrl: "https://github.com",
    tags: ["TypeScript", "Rust", "gRPC", "Kafka"],
  },
  {
    id: "bravo",
    title: "Operational Graph Studio",
    description:
      "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat duis aute.",
    detail:
      "A graph-centric operations UI for dependency mapping, blast-radius analysis, and live health overlays. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.\n\nThe front end uses canvas and WebGL for large graphs while keeping accessibility and keyboard navigation first-class. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
    imageUrl: "https://via.placeholder.com/1200x675",
    githubUrl: "https://github.com",
    tags: ["React", "D3", "PostgreSQL", "Next.js"],
  },
  {
    id: "charlie",
    title: "Secure Ingest Pipeline",
    description:
      "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur excepteur sint.",
    detail:
      "End-to-end ingest with encryption, attestable workers, and policy-driven routing into lake and warehouse targets. Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium.\n\nWe shipped canary deployments, automated key rotation, and replay-safe consumers for exactly-once semantics where the sink allows it.",
    imageUrl: "https://via.placeholder.com/1200x675",
    githubUrl: "https://github.com",
    tags: ["Go", "AWS", "Terraform", "OpenTelemetry"],
  },
  {
    id: "delta",
    title: "Mission Control Dashboard",
    description:
      "Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum sed ut.",
    detail:
      "Real-time mission metrics, incident timelines, and runbook hooks in one surface. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit.\n\nLatency budgets drove WebSocket fan-out, incremental aggregation, and optimistic UI patterns for operator confidence.",
    imageUrl: "https://via.placeholder.com/1200x675",
    githubUrl: "https://github.com",
    tags: ["Python", "FastAPI", "Redis", "WebSockets"],
  },
  {
    id: "echo",
    title: "Edge Inference Mesh",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque habitant morbi tristique senectus et netus.",
    detail:
      "Orchestrated model deployment across heterogeneous edge nodes with graceful degradation and centralized observability. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit.\n\nThe mesh supports ONNX and custom runtimes, with autoscaling tied to queue depth and SLO burn rates.",
    imageUrl: "https://via.placeholder.com/1200x675",
    githubUrl: "https://github.com",
    tags: ["C++", "ONNX", "CUDA", "gRPC"],
  },
  {
    id: "foxtrot",
    title: "Audit Ledger Service",
    description:
      "Integer nec odio praesent libero sed cursus ante dapibus diam sed nisi nulla quis sem at nibh elementum imperdiet.",
    detail:
      "Append-only audit trail with cryptographic linking, export APIs, and retention policies for regulated workloads. At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti.\n\nWe benchmarked throughput against Kafka and object storage backends and documented recovery drills for regional failure.",
    imageUrl: "https://via.placeholder.com/1200x675",
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
