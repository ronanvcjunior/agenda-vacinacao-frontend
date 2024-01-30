import { Routes } from '@angular/router';
import {InfoTabelaComponent} from "./info-tabela/info-tabela.component";
import {InfoAlergiaComponent} from "./info-alergia/info-alergia.component";

export const routes: Routes = [
  { path: 'info/:path', component: InfoTabelaComponent },
  { path: 'alergia', component: InfoAlergiaComponent }
];
