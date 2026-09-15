import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AvancementService, AvancementResponse, PenalitePrediction } from '../../services/avancement.service';

@Component({
  selector: 'app-consultation-avancement',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './consultation-avancement.component.html'
})
export class ConsultationAvancementComponent implements OnInit {

  marches: any[] = [];
  selectedMarcheId: number | null = null;

  historique: AvancementResponse[] = [];
  prediction?: PenalitePrediction;
  searchKeyword: string = '';
  isLoading: boolean = false;

  constructor(private avancementService: AvancementService) {}

  ngOnInit(): void {
    this.chargerMarches();
  }

  chargerMarches(): void {
    this.avancementService.getMarches().subscribe({
      next: (data) => this.marches = data,
      error: (err) => console.error('Erreur chargement marchés', err)
    });
  }

  onMarcheChange(): void {
    if (this.selectedMarcheId) {
      this.selectedMarcheId = Number(this.selectedMarcheId);
      this.chargerHistorique();
      this.chargerPrediction();
    } else {
      this.historique = [];
      this.prediction = undefined;
    }
  }

  chargerHistorique(): void {
    if (!this.selectedMarcheId) return;
    this.isLoading = true;
    this.avancementService.getHistorique(this.selectedMarcheId).subscribe({
      next: (data) => {
        this.historique = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erreur lors de la récupération de l\'historique', err);
        this.isLoading = false;
      }
    });
  }

  chargerPrediction(): void {
    if (!this.selectedMarcheId) return;
    this.avancementService.getPrediction(this.selectedMarcheId).subscribe({
      next: (data) => this.prediction = data,
      error: (err) => console.error('Erreur lors du calcul des prédictions', err)
    });
  }

  onSearch(): void {
    if (!this.selectedMarcheId) return;
    if (!this.searchKeyword.trim()) {
      this.chargerHistorique();
      return;
    }
    this.avancementService.rechercher(this.selectedMarcheId, this.searchKeyword).subscribe({
      next: (data) => this.historique = data,
      error: (err) => console.error('Erreur recherche', err)
    });
  }

  telechargerFichier(nomFichier: string): void {
    this.avancementService.telechargerFichier(nomFichier).subscribe({
      next: (blob: Blob) => {
        const blobUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = nomFichier;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(blobUrl);
      },
      error: (err) => console.error('Erreur téléchargement fichier', err)
    });
  }
}
