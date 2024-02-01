import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Vacina } from '../../domain/Vacina';
import { VacinaService } from '../../services/vacina.service';
import {PeriodicidadeEnum} from "../../enum/periodicidade-enum.enum";
import {ToastModule} from "primeng/toast";
import {ToolbarModule} from "primeng/toolbar";
import {TableLazyLoadEvent, TableModule} from "primeng/table";
import {ButtonModule} from "primeng/button";
import {RippleModule} from "primeng/ripple";
import {DialogModule} from "primeng/dialog";
import {ConfirmDialogModule} from "primeng/confirmdialog";
import {DatePipe, NgForOf, NgIf} from "@angular/common";
import {CalendarModule} from "primeng/calendar";
import {DropdownModule} from "primeng/dropdown";
import {InputTextModule} from "primeng/inputtext";
import {MultiSelectModule} from "primeng/multiselect";
import {PaginatorModule} from "primeng/paginator";
import {TagModule} from "primeng/tag";

@Component({
  selector: 'app-info-vacina',
  templateUrl: './info-vacina.component.html',
  styleUrls: ['./info-vacina.component.scss'],
  standalone: true,
  imports: [
    ToastModule,
    ToolbarModule,
    TableModule,
    ButtonModule,
    RippleModule,
    DialogModule,
    ConfirmDialogModule,
    NgIf,
    CalendarModule,
    DatePipe,
    DropdownModule,
    InputTextModule,
    MultiSelectModule,
    NgForOf,
    PaginatorModule,
    TagModule
  ],
  providers: [MessageService, ConfirmationService]
})
export class InfoVacinaComponent implements OnInit {
  loading: boolean = true;

  mostrarInput: boolean = true;

  vacinaDialog: boolean = false;
  vacinas!: Vacina[];
  vacina!: Vacina;
  selectedVacinas!: Vacina[] | null;
  submitted: boolean = false;
  totalRecords: number = 0;
  first: number = 0;
  rows: number = 10;
  periodicidadeOptions: string[] = [
    PeriodicidadeEnum.DIA,
    PeriodicidadeEnum.SEMANA,
    PeriodicidadeEnum.MES,
    PeriodicidadeEnum.ANO
  ];

  constructor(
    private vacinaService: VacinaService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.carregarVacinas();
  }

  carregarVacinas() {
    this.loading = true;
    const pagina: number = Math.ceil(this.first / this.rows) + 1;
    this.vacinaService.getVacinas(pagina, this.rows).subscribe(
      (data) => {
        this.vacinas = data.content;
        this.totalRecords = data.totalRecords;
        this.loading = false;
        this.cdr.detectChanges();
        console.log(this.vacinas)
      },
      (error) => {
        this.vacinas = [];
        if (error.status != 404)
          console.error('Erro ao carregar vacinas:', error);
        this.loading = false;
        this.cdr.detectChanges();
      }
    );
  }

  onLazyLoad(event: TableLazyLoadEvent) {
    this.first = event.first || 0;
    this.rows = event.rows || 10;
    this.carregarVacinas();
  }

  abrirNovo() {
    this.vacina = {
      id: '',
      titulo: '',
      dose: 0,
      periodicidade: PeriodicidadeEnum.DIA,
      intervalo: 0
    };
    console.log(this.vacina)
    this.submitted = false;
    this.vacinaDialog = true;
  }

  deletarVacinasSelecionadas() {
    this.confirmationService.confirm({
      message: 'Tem certeza de que deseja excluir as vacinas selecionadas?',
      header: 'Confirmar',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        if (this.selectedVacinas && this.selectedVacinas.length > 0) {
          this.vacinaService.deleteVacinas(this.selectedVacinas).subscribe(
            () => {
              this.vacinas = this.vacinas.filter(
                (val) => !this.selectedVacinas?.includes(val)
              );
              this.selectedVacinas = null;
              this.messageService.add({
                severity: 'success',
                summary: 'Sucesso',
                detail: 'Vacinas Excluídas',
                life: 3000
              });
              this.carregarVacinas();
            },
            (error) => {
              console.error('Erro ao excluir vacinas:', error);
            }
          );
        } else {
          console.warn('Nenhuma vacina selecionada para exclusão.');
        }
      }
    });
  }

  editarVacina(vacina: Vacina) {
    this.vacina = { ...vacina };

    if (this.vacina.periodicidade)
      this.vacina.periodicidade = this.getPeriodicidadeText(this.vacina.periodicidade);

    this.vacinaDialog = true;
  }

  deletarVacina(vacina: Vacina) {
    this.confirmationService.confirm({
      message: 'Tem certeza de que deseja excluir ' + vacina.titulo + '?',
      header: 'Confirmar',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.vacinaService.deleteVacina(vacina).subscribe(
          () => {
            this.vacinas = this.vacinas.filter((val) => val.id !== vacina.id);
            this.vacina = {
              id: '',
              titulo: '',
              dose: 0,
              periodicidade: PeriodicidadeEnum.DIA,
              intervalo: 0
            };
            this.messageService.add({
              severity: 'success',
              summary: 'Sucesso',
              detail: 'Vacina Excluída',
              life: 3000
            });
            this.carregarVacinas();
          },
          (error) => {
            console.error('Erro ao excluir vacina:', error);
          }
        );
      }
    });
  }

  esconderDialog() {
    this.vacinaDialog = false;
    this.submitted = false;
  }

  salvarOuAtualizarVacina() {
    this.submitted = true;

    if (!this.isFormValid()) {
      return;
    }

    if (this.vacina.id) {
      this.atualizarVacina();
    } else {
      this.salvarVacina();
    }
  }

  private isFormValid(): boolean {
    if (!this.vacina.titulo?.trim()) {
      this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Título é obrigatório.', life: 3000 });
      return false;
    }

    if (this.isVacinaNomeDuplicado()) {
      this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Já existe uma vacina com este título.', life: 3000 });
      return false;
    }

    if (this.vacina.dose < 1) {
      this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Número de doses tem de ser maior do que 1.', life: 3000 });
      return false;
    }

    if (this.vacina.dose > 1) {
      if (!this.vacina.intervalo || this.vacina.intervalo < 1) {
        this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Intervalo tem de ser maior do que 1.', life: 3000 });
        return false;
      }
      switch (this.vacina.periodicidade) {
        case 'Dia(s)':
          this.vacina.periodicidade = 'DIA';
          break;
        case 'Semana(s)':
          this.vacina.periodicidade = 'SEMANA';
          break;
        case 'Mês(es)':
          this.vacina.periodicidade = 'MES';
          break;
        case 'Ano(s)':
          this.vacina.periodicidade = 'ANO';
          break;
        default:
          this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Periodicidade não é valida', life: 3000 });
          return false;
      }

    } else {
      this.vacina.intervalo = undefined
      this.vacina.periodicidade = undefined
    }
    return true;
  }

  private isVacinaNomeDuplicado(): boolean {
    const tituloVacina = this.vacina.titulo.trim().toLowerCase();

    return this.vacinas.some(a => a.titulo.trim().toLowerCase() === tituloVacina && a.id !== this.vacina.id);
  }


  private salvarVacina() {
    this.vacinaService.postVacina(this.vacina).subscribe(
      (data) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Sucesso',
          detail: 'Vacina Criada',
          life: 3000
        });
        this.resetarDialog();
      },
      (error) => {
        console.error('Erro ao salvar vacina:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Falha ao criar vacina',
          life: 3000
        });
      }
    );
  }

  private atualizarVacina() {
    this.vacinaService.putVacina(this.vacina).subscribe(
      (data) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Sucesso',
          detail: 'Vacina Atualizada',
          life: 3000
        });
        this.resetarDialog();
      },
      (error) => {
        console.error('Erro ao atualizar vacina:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Falha ao atualizar vacina',
          life: 3000
        });
      }
    );
  }

  private resetarDialog() {
    this.vacinaDialog = false;
    this.vacina = {
      id: '',
      titulo: '',
      dose: 0,
      periodicidade: PeriodicidadeEnum.DIA,
      intervalo: 0
    };
    this.carregarVacinas();
  }

  getPeriodicidadeText(periodicidade: string): string {
    switch (periodicidade) {
      case 'DIA':
        return 'Dia(s)';
      case 'SEMANA':
        return 'Semana(s)';
      case 'MES':
        return 'Mês(es)';
      case 'ANO':
        return 'Ano(s)';
      default:
        return '';
    }
  }

  protected readonly PeriodicidadeEnum = PeriodicidadeEnum;
}
