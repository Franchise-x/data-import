import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AiApiService {
  private apiUrl = `/api`; // Updated to use the proxied URL

  constructor(private http: HttpClient) {}

  extractFixtures(file: File): Observable<any[]> {
    const formData: FormData = new FormData();
    formData.append('file', file, file.name);

    return this.http.post(`${this.apiUrl}/specs/extract`, formData).pipe(
      map((response: any) => {
        return response.fixtures.map((fixture: any) => ({
          'Fixture Type': fixture.name,
          'Part Number': fixture.part_number,
          Manufacturer: fixture.manufacturer,
          Quantity: fixture.quantity,
          Description: fixture.description,
          ...fixture.metadata,
        }));
      })
    );
  }
}
