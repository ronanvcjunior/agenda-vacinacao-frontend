import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {Alergia} from "../domain/Alergia";
import {environment} from "../environments/environments";
import {Pagination} from "../domain/Pagination";

@Injectable({
  providedIn: 'root'
})
export class AlergiaService {
  constructor(private http: HttpClient) {}

  getAlergias(page: number, perPage: number): Observable<Pagination<Alergia>> {
    const url: string = `${environment.apiUrl}/alergia?page=${page}&perPage=${perPage}`;
    return this.http.get<Pagination<Alergia>>(url)
  }

  postAlergia(alergia: Alergia): Observable<Alergia> {
    const url: string = `${environment.apiUrl}/alergia`;
    console.log(url)
    console.log(alergia)
    return this.http.post<Alergia>(url, alergia)
  }

  putAlergia(alergia: Alergia): Observable<Alergia> {
    const url: string = `${environment.apiUrl}/alergia/${alergia.id}`;
    return this.http.put<Alergia>(url, alergia)
  }

  deleteAlergia(alergia: Alergia): Observable<void> {
    const url: string = `${environment.apiUrl}/alergia/${alergia.id}`;
    return this.http.delete<void>(url);
  }

  deleteAlergias(alergias: Alergia[]): Observable<void> {
    const url: string = `${environment.apiUrl}/alergia/list`;
    return this.http.post<void>(url, alergias);
  }
}
