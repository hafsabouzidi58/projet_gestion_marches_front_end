import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface DocumentModel {
  id: number;
  marcheId: number;
  uploadePar: number;
  nomFichier: string;
  typeDocument?: string;
  cheminFichier: string;
  tailleKo: number;
  createdAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class DocumentService {

  private apiUrl = 'https://projetgestionmarchesbackend-production.up.railway.app/api/documents';

  constructor(private http: HttpClient) {}

  getByMarche(marcheId: number): Observable<DocumentModel[]> {
    return this.http.get<DocumentModel[]>(`${this.apiUrl}/marche/${marcheId}`);
  }

  /**
   * Upload d'un document (sans typeDocument)
   */
upload(marcheId: number, file: File, typeDocument: string = 'PIECE_JOINTE'): Observable<DocumentModel> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('marcheId', marcheId.toString());
  formData.append('typeDocument', typeDocument); // Fonctionne désormais sans erreur !

  return this.http.post<DocumentModel>(`${this.apiUrl}/upload`, formData);
}
  download(id: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/download/${id}`, {
      responseType: 'blob'
    });
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
