import {Component} from '@angular/core';
import {RouterLink, RouterOutlet} from '@angular/router';
import {MenubarModule} from "primeng/menubar";
import {MenuItem} from "primeng/api";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, MenubarModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  items: MenuItem[];

  constructor() {
    this.items = [
      { label: 'Vacina', routerLink: ['/vacina'], styleClass: 'fw-bold' },
      { label: 'Alergia', routerLink: ['/alergia'], styleClass: 'fw-bold' },
      { label: 'Usuário', routerLink: ['/usuario'], styleClass: 'fw-bold' },
      { label: 'Agenda', routerLink: ['/agenda'], styleClass: 'fw-bold' }
    ];
  }
}
