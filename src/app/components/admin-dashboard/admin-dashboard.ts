import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuditLogService } from '../../services/audit-log.service';
import { UserService, UserDTO } from '../../services/user.service';
import { AuditLog } from '../../models/audit-log.model';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-dashboard.html',
  styleUrls: ['./admin-dashboard.css']
})
export class AdminDashboard implements OnInit {
  logs: AuditLog[] = [];
  users: UserDTO[] = [];

  searchTerm: string = '';

  // Variables de filtrage style Agenda / Dates
  startDate: string = ''; // Format 'YYYY-MM-DD'
  endDate: string = '';   // Format 'YYYY-MM-DD'

  isLoading: boolean = true;
  errorMessage: string = '';

  constructor(
    private auditLogService: AuditLogService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.chargerDonneesReelles();
  }

  chargerDonneesReelles(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.auditLogService.getTousLesLogs().subscribe({
      next: (data) => {
        this.logs = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erreur lors de la récupération des logs :', err);
        this.errorMessage = 'Impossible de charger les journaux d\'audit depuis le serveur.';
        this.isLoading = false;
      }
    });

    this.userService.getAllUsers().subscribe({
      next: (data) => {
        this.users = data;
      },
      error: (err) => {
        console.error('Erreur lors de la récupération des utilisateurs :', err);
      }
    });
  }

  // Remet les filtres de date à zéro
  reinitialiserDates(): void {
    this.startDate = '';
    this.endDate = '';
  }

  // Filtrage combiné (Texte + Calendrier Agenda)
  get filteredLogs(): AuditLog[] {
    const query = this.searchTerm.toLowerCase().trim();

    return this.logs.filter(log => {
      // 1. Filtre par recherche textuelle
      const matchesSearch = !query ||
        log.username?.toLowerCase().includes(query) ||
        log.description?.toLowerCase().includes(query) ||
        log.userRole?.toLowerCase().includes(query) ||
        log.action?.toLowerCase().includes(query) ||
        log.ipAddress?.toLowerCase().includes(query);

      // 2. Filtre par sélection d'agenda (Date Début & Date Fin)
      if (!log.timestamp) return matchesSearch;

      const logDate = new Date(log.timestamp);
      let matchesDate = true;

      if (this.startDate) {
        const start = new Date(this.startDate);
        start.setHours(0, 0, 0, 0); // Début de journée
        matchesDate = matchesDate && logDate >= start;
      }

      if (this.endDate) {
        const end = new Date(this.endDate);
        end.setHours(23, 59, 59, 999); // Fin de journée
        matchesDate = matchesDate && logDate <= end;
      }

      return matchesSearch && matchesDate;
    });
  }

  // --- STATISTIQUES EN TEMPS RÉEL ---

  get totalAudits(): number {
    return this.filteredLogs.length;
  }

  get uniqueUsersCount(): number {
    const usersInLogs = this.filteredLogs.map(log => log.username).filter(Boolean);
    return new Set(usersInLogs).size;
  }

  get totalRegisteredUsers(): number {
    return this.users.length;
  }

  get activeRegisteredUsers(): number {
    return this.users.filter(u => u.actif).length;
  }

  get todayAuditsCount(): number {
    const today = new Date().toDateString();
    return this.logs.filter(log => log.timestamp && new Date(log.timestamp).toDateString() === today).length;
  }
}
