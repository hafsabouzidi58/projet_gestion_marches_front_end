
export interface AuditLog {
  id: number;
  username: string;
  userRole: string;
  action: string;
  description: string;
  timestamp: string;
  ipAddress: string;
}
