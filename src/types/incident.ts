export type Priority = "low" | "medium" | "high";
export type Status = "open" | "paused" | "closed";

export type IncidentUser = {
  id?: string;
  name: string;
  email?: string;
  avatarUrl: string;
};

export type IncidentTag = {
  id?: string;
  name: string;
  color: string;
};

export type IncidentMedia = {
  id?: string;
  name: string;
  type: string;
  format?: string;
  size?: number;
  status?: string;
  url?: string;
};

export type Incident = {
  id: string;
  sequenceId: string;
  order?: number;
  title: string;
  description: string;
  type: { id?: string; key: string; name: string; name_en?: string };
  priority: Priority;
  status: Status;
  approval?: boolean;
  project?: { id?: string; name: string };
  owner: IncidentUser;
  whatsappOwner?: IncidentUser | null;
  assignees: IncidentUser[];
  observers?: IncidentUser[];
  coordinates: { lat: number; lng: number };
  locationDescription: string;
  dueDate: string | null;
  closingDate: string | null;
  media?: IncidentMedia[];
  tags: IncidentTag[];
  deleted?: unknown;
  createdAt: string;
  updatedAt: string;
};
