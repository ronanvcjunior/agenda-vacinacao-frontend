import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { Agenda } from "../domain/Agenda";
import { Pagination } from "../domain/Pagination";
import { environment } from "../environments/environments";

@Injectable({
  providedIn: 'root'
})
export class AgendaService {
  constructor(private http: HttpClient) {}

  getAgendas(page: number, perPage: number): Observable<Pagination<Agenda>> {
    const url: string = `${environment.apiUrl}/agenda?page=${page}&perPage=${perPage}`;
    return this.http.get<Pagination<Agenda>>(url);
  }

  postAgenda(agenda: Agenda): Observable<Agenda[]> {
    const url: string = `${environment.apiUrl}/agenda`;
    return this.http.post<Agenda[]>(url, agenda);
  }

  putAgenda(agenda: Agenda): Observable<Agenda> {
    const url: string = `${environment.apiUrl}/agenda/${agenda.id}`;
    return this.http.put<Agenda>(url, agenda);
  }

  deleteAgenda(agenda: Agenda): Observable<void> {
    const url: string = `${environment.apiUrl}/agenda/${agenda.id}`;
    return this.http.delete<void>(url);
  }

  deleteAgendas(agendas: Agenda[]): Observable<void> {
    const url: string = `${environment.apiUrl}/agenda/list`;
    return this.http.post<void>(url, agendas);
  }
}
