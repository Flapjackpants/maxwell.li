export type AuthProvider = "google" | "slack" | "discord" | "canvas" | "none";

export type ModuleConfigField = {
  key: string;
  label: string;
  type: "text" | "textarea" | "password";
  placeholder?: string;
  help?: string;
};

export type ModuleMeta = {
  id: string;
  title: string;
  description: string;
  authProvider: AuthProvider;
  defaultEnabled: boolean;
  configFields?: ModuleConfigField[];
};

export type ModuleSettingsEntry = {
  enabled: boolean;
  config: Record<string, string>;
};

export type ModulesSettingsMap = Record<string, ModuleSettingsEntry>;

export type DashboardModuleContext = {
  userId: number;
  config: Record<string, string>;
  getAccessToken: (provider: AuthProvider) => Promise<string | null>;
};

export type DashboardModuleDefinition = ModuleMeta & {
  fetchData: (ctx: DashboardModuleContext) => Promise<unknown>;
};

/** Providers that participate in connect-all (external or in-app credential). */
export const CONNECTABLE_PROVIDERS: AuthProvider[] = [
  "google",
  "slack",
  "discord",
  "canvas",
];

export const PROVIDER_LABELS: Record<
  Exclude<AuthProvider, "none">,
  string
> = {
  google: "Google (Gmail, Calendar, YouTube)",
  slack: "Slack",
  discord: "Discord channels",
  canvas: "Canvas LMS",
};
