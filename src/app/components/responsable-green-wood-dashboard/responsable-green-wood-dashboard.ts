import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AvancementService, PenalitePrediction } from '../../services/avancement.service';
import { MarcheService, Marche } from '../../services/marche.service';

@Component({
  selector: 'app-responsable-green-wood-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './responsable-green-wood-dashboard.html',
  styleUrl: './responsable-green-wood-dashboard.css',
})
export class ResponsableGreenWoodDashboard implements OnInit {
  // Alertes
  alertesPenalites: PenalitePrediction[] = [];
  chargementAlertes: boolean = true;
  erreurAlertes: string | null = null;

  // KPIs & Marchés
  marchesGreenWood: Marche[] = [];
  chargementMarches: boolean = true;

  // Stats KPI
  totalMarchesCount: number = 0;
  totalPenalitesEstimees: number = 0;
  alertesCritiquesCount: number = 0;

  constructor(
    private avancementService: AvancementService,
    private marcheService: MarcheService
  ) {}

  ngOnInit(): void {
    this.chargerAlertesPenalites();
    this.chargerMarchesGreenWood();
  }

  chargerAlertesPenalites(): void {
    this.chargementAlertes = true;
    this.avancementService.getToutesLesAlertesPenalites().subscribe({
      next: (alertes: PenalitePrediction[]) => {
        this.alertesPenalites = alertes;

        // Calcul des métriques KPI à partir des alertes
        this.totalPenalitesEstimees = alertes.reduce((sum, a) => sum + (a.montantPenaliteEstime || 0), 0);
        this.alertesCritiquesCount = alertes.filter(a => a.alertePrioritaire).length;

        this.chargementAlertes = false;
      },
      error: (err: unknown) => {
        console.error('Erreur chargement des alertes:', err);
        this.erreurAlertes = 'Impossible de charger les alertes de pénalités.';
        this.chargementAlertes = false;
      }
    });
  }

  chargerMarchesGreenWood(): void {
    this.chargementMarches = true;
    this.marcheService.getAll().subscribe({
      next: (marches: Marche[]) => {
        // Filtrer les marchés attribués ou liés à Green Wood si nécessaire
        this.marchesGreenWood = marches;
        this.totalMarchesCount = marches.length;
        this.chargementMarches = false;
      },
      error: (err: unknown) => {
        console.error('Erreur chargement des marchés:', err);
        this.chargementMarches = false;
      }
    });
  }

  getPourcentagePlafond(prediction: PenalitePrediction): number {
    if (!prediction.montantPlafondMax) return 0;
    const pct = (prediction.montantPenaliteEstime / prediction.montantPlafondMax) * 100;
    return Math.min(100, Math.round(pct));
  }
}
