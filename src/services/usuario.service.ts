import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { Usuario } from "../domain/Usuario";
import { Pagination } from "../domain/Pagination";
import {environment} from "../environments/environments";

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  constructor(private http: HttpClient) {}

  getUsuarios(page: number, perPage: number): Observable<Pagination<Usuario>> {
    const url: string = `${environment.apiUrl}/usuario?page=${page}&perPage=${perPage}`;
    return this.http.get<Pagination<Usuario>>(url);
  }

  postUsuario(usuario: Usuario): Observable<Usuario> {
    const url: string = `${environment.apiUrl}/usuario`;
    return this.http.post<Usuario>(url, usuario);
  }

  putUsuario(usuario: Usuario): Observable<Usuario> {
    const url: string = `${environment.apiUrl}/usuario/${usuario.id}`;
    return this.http.put<Usuario>(url, usuario);
  }

  deleteUsuario(usuario: Usuario): Observable<void> {
    const url: string = `${environment.apiUrl}/usuario/${usuario.id}`;
    return this.http.delete<void>(url);
  }

  deleteUsuarios(usuarios: Usuario[]): Observable<void> {
    const url: string = `${environment.apiUrl}/usuario/list`;
    return this.http.post<void>(url, usuarios);
  }
}
