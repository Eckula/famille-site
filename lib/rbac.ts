export type Role = "viewer" | "editor" | "admin";
export type Action = "view" | "download" | "upload" | "move" | "delete";

export const ROLE_PERMISSIONS: Record<Role, Action[]> = {
  viewer: ["view", "download"],
  editor: ["view", "download", "upload", "move"],
  admin:  ["view", "download", "upload", "move", "delete"],
};

export function hasPermission(role: Role, action: Action) {
  return ROLE_PERMISSIONS[role]?.includes(action);
}



