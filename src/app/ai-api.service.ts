import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map, Observable, timeout } from 'rxjs';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AiApiService {
  private apiUrl = `/api`; // Updated to use the proxied URL

  /* 
  ng serve --proxy-config src/proxy.conf.json

  DEBUG:extract.server:  <Route: name=AI_Extract.ping path=ping>
DEBUG:extract.server:  <Route: name=AI_Extract.root path=/>
DEBUG:extract.server:  <Route: name=AI_Extract.favicon path=favicon.ico>
DEBUG:extract.server:  <Route: name=AI_Extract.part_number.nest_nodes_route path=part_number/nest_nodes>
DEBUG:extract.server:  <Route: name=AI_Extract.part_number.load_document_from_submittal path=part_number/load_document>
DEBUG:extract.server:  <Route: name=AI_Extract.part_number.query_invoice_route path=part_number/query_invoice>
DEBUG:extract.server:  <Route: name=AI_Extract.part_number.filter_nodes_route path=part_number/filter_nodes>
DEBUG:extract.server:  <Route: name=AI_Extract.part_number.query_part_number_segments_route path=part_number/query_part_number>
DEBUG:extract.server:  <Route: name=AI_Extract.part_number.process_query_results_invoice_route path=part_number/process_query_results_invoice>
DEBUG:extract.server:  <Route: name=AI_Extract.part_number.process_query_results_route path=part_number/process_query_results>
DEBUG:extract.server:  <Route: name=AI_Extract.part_number.convert_to_documents_route path=part_number/convert_to_documents>
DEBUG:extract.server:  <Route: name=AI_Extract.part_number.query_route path=part_number/query>
DEBUG:extract.server:  <Route: name=AI_Extract.part_number.parse_documents_route path=part_number/parse_documents>
DEBUG:extract.server:  <Route: name=AI_Extract.part_number_classifier.process_part_number path=part_number_classifier/process_part_number>
DEBUG:extract.server:  <Route: name=AI_Extract.invoice_processor.process_invoice path=invoice_processor/process_invoice>
DEBUG:extract.server:  <Route: name=AI_Extract.quotes.extract_quote path=quotes/extract>
DEBUG:extract.server:  <Route: name=AI_Extract.quotes.get_quotes path=quotes>
DEBUG:extract.server:  <Route: name=AI_Extract.key_parse.process_pdf path=key/key_parse>
DEBUG:extract.server:  <Route: name=AI_Extract.specs.extract_fixtures path=specs/extract>
DEBUG:extract.server:  <Route: name=AI_Extract.api.get_request path=api/fixturetype>
DEBUG:extract.server:  <Route: name=AI_Extract.api.post_request path=api/auth>
DEBUG:extract.server:  <Route: name=AI_Extract.api.update_request path=api/<path:str>>
DEBUG:extract.server:  <Route: name=AI_Extract.api.delete_request path=api/<path:str>>
  */

  constructor(private http: HttpClient) {}

  extractFixtures(file: File): Observable<any[]> {
    const formData: FormData = new FormData();
    formData.append('file', file, file.name);

    return this.http.post(`${this.apiUrl}/specs/extract`, formData).pipe(
      timeout(300000),
      map((response: any) => {
        console.log('Fixture:', response);
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

  pingServer(): Observable<any> {
    return this.http.get(`${this.apiUrl}/`);
  }

  // New method for processing part numbers
  processPartNumber(file: File, partNumber: string): Observable<any> {
    const formData: FormData = new FormData();
    formData.append('file', file, file.name);

    return this.http.post(`${this.apiUrl}/part_number_classifier/process_part_number`, formData, {
      params: { part_number: partNumber }
    }).pipe(
      timeout(300000),
      map((response: any) => {
        console.log('Part Number Processing:', response);
        return response.results;
      })
    );
  }

  // New method for processing invoices
  processInvoice(file: File): Observable<any> {
    const formData: FormData = new FormData();
    formData.append('file', file, file.name);

    return this.http.post(`${this.apiUrl}/invoice_processor/process_invoice`, formData).pipe(
      timeout(300000),
      map((response: any) => {
        console.log('Invoice Processing:', response);
        return response.results;
      })
    );
  }

  processQuote(file: File): Observable<any> {
    const formData: FormData = new FormData();
    formData.append('file', file, file.name);

    return this.http.post(`${this.apiUrl}/quotes/extract`, formData).pipe(
      timeout(300000),
      map((response: any) => {
        console.log('Quote Processing:', response);
        return response.results;
      })
    );
  }

  // New method for analyzing submittals
  analyzeSubmittal(file: File): Observable<any> {
    const formData: FormData = new FormData();
    formData.append('file', file, file.name);

    return this.http.post(`${this.apiUrl}/submittal_analysis/analyze`, formData).pipe(
      timeout(300000),
      map((response: any) => {
        console.log('Submittal Analysis:', response);
        return response.results;
      })
    );
  }
}