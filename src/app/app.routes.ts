import { Routes } from '@angular/router';
import {InfoAlergiaComponent} from "./info-alergia/info-alergia.component";
import {InfoUsuarioComponent} from "./info-usuario/info-usuario.component";
import {InfoVacinaComponent} from "./info-vacina/info-vacina.component";
import {InfoAgendaComponent} from "./info-agenda/info-agenda.component";

export const routes: Routes = [
  { path: 'alergia', component: InfoAlergiaComponent },
  { path: 'usuario', component: InfoUsuarioComponent },
  { path: 'vacina', component: InfoVacinaComponent },
  { path: 'agenda', component: InfoAgendaComponent }
];
