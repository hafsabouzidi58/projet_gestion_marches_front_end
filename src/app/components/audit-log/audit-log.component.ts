import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuditLog } from '../../models/audit-log.model';
import { AuditLogService } from '../../services/audit-log.service';

@Component({
  selector: 'app-audit-log',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './audit-log.component.html',
  styleUrls: ['./audit-log.component.css']
})
export class AuditLogComponent implements OnInit {

  logs: AuditLog[] = [];
  logsFiltres: AuditLog[] = [];
  chargement: boolean = true;

  // Filtres
  termeRecherche: string = '';
  filtreAction: string = 'TOUT';
  filtreRole: string = 'TOUT';

  constructor(private auditLogService: AuditLogService) { }

  ngOnInit(): void {
    this.chargerLogs();
  }

  chargerLogs(): void {
    this.chargement = true;
    this.auditLogService.getTousLesLogs().subscribe({
      next: (data) => {
        this.logs = data;
        this.appliquerFiltres();
        this.chargement = false;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des journaux d\'audit :', err);
        this.chargement = false;
      }
    });
  }

  appliquerFiltres(): void {
    this.logsFiltres = this.logs.filter(log => {
      const matchRecherche = !this.termeRecherche ||
        log.username.toLowerCase().includes(this.termeRecherche.toLowerCase()) ||
        (log.description && log.description.toLowerCase().includes(this.termeRecherche.toLowerCase())) ||
        log.ipAddress.includes(this.termeRecherche);

      const matchAction = this.filtreAction === 'TOUT' || log.action === this.filtreAction;
      const matchRole = this.filtreRole === 'TOUT' || log.userRole === this.filtreRole;

      return matchRecherche && matchAction && matchRole;
    });
  }

  getBadgeClass(action: string): string {
    switch (action) {
      case 'CREATE_MARCHE':
        return 'badge-success';
      case 'UPDATE_AVANCEMENT':
        return 'badge-info';
      case 'CANCEL_PENALTY':
        return 'badge-warning';
      case 'DELETE_DOCUMENT':
      case 'DELETE_MARCHE':
        return 'badge-danger';
      default:
        return 'badge-secondary';
    }
  }
}
