import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TestService {

  private apiUrl = 'https://projetgestionmarchesbackend-production.up.railway.app/api';

  constructor(private http: HttpClient) {}

  test(): Observable<string> {
    return this.http.get(
      `${this.apiUrl}/test`,
      { responseType: 'text' }
    );
  }
}
