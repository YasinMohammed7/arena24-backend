export interface User {
  roles: string[] | { name: string }[];
  permissions?: string[];
  // Add other properties as needed
}
