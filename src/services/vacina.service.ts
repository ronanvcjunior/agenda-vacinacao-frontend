import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { Vacina } from "../domain/Vacina";
import { Pagination } from "../domain/Pagination";
import { environment } from "../environments/environments";

@Injectable({
  providedIn: 'root'
})
export class VacinaService {
  constructor(private http: HttpClient) {}

  getVacinas(page: number, perPage: number): Observable<Pagination<Vacina>> {
    const url: string = `${environment.apiUrl}/vacina?page=${page}&perPage=${perPage}`;
    return this.http.get<Pagination<Vacina>>(url);
  }

  postVacina(vacina: Vacina): Observable<Vacina> {
    const url: string = `${environment.apiUrl}/vacina`;
    return this.http.post<Vacina>(url, vacina);
  }

  putVacina(vacina: Vacina): Observable<Vacina> {
    const url: string = `${environment.apiUrl}/vacina/${vacina.id}`;
    return this.http.put<Vacina>(url, vacina);
  }

  deleteVacina(vacina: Vacina): Observable<void> {
    const url: string = `${environment.apiUrl}/vacina/${vacina.id}`;
    return this.http.delete<void>(url);
  }

  deleteVacinas(vacinas: Vacina[]): Observable<void> {
    const url: string = `${environment.apiUrl}/vacina/list`;
    return this.http.post<void>(url, vacinas);
  }
}
