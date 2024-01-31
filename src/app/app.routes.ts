import { Routes } from '@angular/router';
import {InfoTabelaComponent} from "./info-tabela/info-tabela.component";
import {InfoAlergiaComponent} from "./info-alergia/info-alergia.component";
import {InfoUsuarioComponent} from "./info-usuario/info-usuario.component";
import {InfoVacinaComponent} from "./info-vacina/info-vacina.component";

export const routes: Routes = [
  { path: 'info/:path', component: InfoTabelaComponent },
  { path: 'alergia', component: InfoAlergiaComponent },
  { path: 'usuario', component: InfoUsuarioComponent },
  { path: 'vacina', component: InfoVacinaComponent }
];
