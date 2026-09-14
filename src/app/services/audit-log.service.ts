import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuditLog } from '../models/audit-log.model';

@Injectable({
  providedIn: 'root'
})
export class AuditLogService {

  private apiUrl = 'https://projetgestionmarchesbackend-production.up.railway.app/api/audit-logs'; // Ajustez le port si nécessaire

  constructor(private http: HttpClient) { }

  getTousLesLogs(): Observable<AuditLog[]> {
    return this.http.get<AuditLog[]>(this.apiUrl);
  }
}
