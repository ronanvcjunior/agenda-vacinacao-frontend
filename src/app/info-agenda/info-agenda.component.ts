import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Agenda } from '../../domain/Agenda';
import { Usuario } from '../../domain/Usuario';
import { Vacina } from '../../domain/Vacina';
import { AgendaService } from '../../services/agenda.service';
import { UsuarioService } from '../../services/usuario.service';
import { VacinaService } from '../../services/vacina.service';
import {DialogModule} from "primeng/dialog";
import {ConfirmDialogModule} from "primeng/confirmdialog";
import {ToastModule} from "primeng/toast";
import {ToolbarModule} from "primeng/toolbar";
import {TableModule} from "primeng/table";
import {DatePipe, NgClass, NgForOf, NgIf} from "@angular/common";
import {TagModule} from "primeng/tag";
import {CalendarModule} from "primeng/calendar";
import {DropdownModule} from "primeng/dropdown";
import {InputTextModule} from "primeng/inputtext";
import {MultiSelectModule} from "primeng/multiselect";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {RippleModule} from "primeng/ripple";
import {InputTextareaModule} from "primeng/inputtextarea";

@Component({
  selector: 'app-info-agenda',
  templateUrl: './info-agenda.component.html',
  styleUrls: ['./info-agenda.component.scss'],
  standalone: true,
  imports: [
    DialogModule,
    ConfirmDialogModule,
    ToastModule,
    ToolbarModule,
    TableModule,
    DatePipe,
    NgClass,
    TagModule,
    CalendarModule,
    DropdownModule,
    InputTextModule,
    MultiSelectModule,
    NgForOf,
    NgIf,
    ReactiveFormsModule,
    RippleModule,
    FormsModule,
    InputTextareaModule
  ],
  providers: [MessageService, ConfirmationService]
})
export class InfoAgendaComponent implements OnInit {
  loading: boolean = true;
  mostrarInput: boolean = true;
  mostrarNovo: boolean = true;
  agendaDialog: boolean = false;
  agendas!: Agenda[];
  agenda!: Agenda;
  selectedAgendas!: Agenda[] | null;
  submitted: boolean = false;
  totalRecords: number = 0;
  first: number = 0;
  rows: number = 10;
  statusOptions: any[] = [
    { label: 'Agendado', value: 'Agendado', styleClass: 'status-agendado' },
    { label: 'Cancelado', value: 'Cancelado', styleClass: 'status-cancelado' },
    { label: 'Realizado', value: 'Realizado', styleClass: 'status-realizado' }
  ];
  usuariosOptions: { label: string; value: Usuario }[] = [];
  vacinasOptions: { label: any; value: Vacina }[] = [];
  situacaoOptions = [
    { label: 'Agendado', value: 'AGENDADO' },
    { label: 'Cancelado', value: 'CANCELADO' },
    { label: 'Realizado', value: 'REALIZADO' }
  ];


  constructor(
    private agendaService: AgendaService,
    private usuarioService: UsuarioService,
    private vacinaService: VacinaService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.carregarUsuarios();
    this.carregarVacinas();
  }

  carregarAgendas() {
    this.loading = true;
    const pagina: number = Math.ceil(this.first / this.rows) + 1;
    this.agendaService.getAgendas(pagina, this.rows).subscribe(
      (data) => {
        this.agendas = data.content;
        this.totalRecords = data.totalRecords;
        this.loading = false;
        this.cdr.detectChanges();
      },
      (error) => {
        this.agendas = [];
        if (error.status != 404)
          console.error("Erro ao carregar agendas:", error);
        this.loading = false;
        this.cdr.detectChanges();
      }
    );
  }

  carregarUsuarios() {
    this.usuarioService.getUsuarios(1, 9999).subscribe(
      (data) => {
        this.usuariosOptions = data.content.map((usuario) => ({
          label: usuario.nome,
          value: usuario,
        }));
        this.cdr.detectChanges();
      },
      (error) => {
        this.usuariosOptions = [];
        if (error.status != 404)
          console.error("Erro ao carregar usuários:", error);
        this.cdr.detectChanges();
      }
    );
  }

  carregarVacinas() {
    this.vacinaService.getVacinas(1, 9999).subscribe(
      (data) => {
        this.vacinasOptions = data.content.map((vacina) => ({
          label: vacina.titulo,
          value: vacina,
        }));
        this.cdr.detectChanges();
      },
      (error) => {
        this.vacinasOptions = [];
        if (error.status != 404)
          console.error("Erro ao carregar vacinas:", error);
        this.cdr.detectChanges();
      }
    );
  }

  onLazyLoad(event: any) {
    this.first = event.first || 0;
    this.rows = event.rows || 10;
    this.carregarAgendas();
  }

  abrirNovo() {
    this.mostrarInput = true;
    this.mostrarNovo = false;
    this.agenda = { id: '', data: new Date(), hora: new Date(), situacao: 'AGENDADO', vacina: {} as Vacina, usuario: {} as Usuario };
    this.submitted = false;
    this.agendaDialog = true;
  }

  deletarAgendasSelecionadas() {
    this.confirmationService.confirm({
      message: 'Tem certeza de que deseja excluir as agendas selecionadas?',
      header: 'Confirmar',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        if (this.selectedAgendas && this.selectedAgendas.length > 0) {
          this.agendaService.deleteAgendas(this.selectedAgendas)
            .subscribe(
              () => {
                this.agendas = this.agendas.filter((val) => !this.selectedAgendas?.includes(val));
                this.selectedAgendas = null;
                this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Agendas Excluídas', life: 3000 });
                this.carregarAgendas();
              },
              (error) => {
                console.error('Erro ao excluir agendas:', error);
              }
            );
        } else {
          console.warn('Nenhuma agenda selecionada para exclusão.');
        }
      }
    });
  }

  editarAgenda(agenda: Agenda) {
    this.mostrarInput = true;
    this.mostrarNovo = true;

    this.agenda = { ...agenda };
    this.agenda.data = new Date(`${agenda.data}T00:00:00`);
    if (agenda.dataSituacao)
      this.agenda.dataSituacao = new Date(`${agenda.dataSituacao}T00:00:00`);
    else
      this.agenda.dataSituacao = undefined
    this.agenda.hora = new Date(`1999-02-28T${agenda.hora}`);

    this.agendaDialog = true;
  }

  deletarAgenda(agenda: Agenda) {
    this.confirmationService.confirm({
      message: 'Tem certeza de que deseja excluir esta agenda?',
      header: 'Confirmar',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.agendaService.deleteAgenda(agenda)
          .subscribe(
            () => {
              this.agendas = this.agendas.filter((val) => val.id !== agenda.id);
              this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Agenda Excluída', life: 3000 });
              this.carregarAgendas();
            },
            (error) => {
              console.error('Erro ao excluir agenda:', error);
            }
          );
      }
    });
  }

  esconderDialog() {
    this.agendaDialog = false;
    this.submitted = false;
  }

  salvarOuAtualizarAgenda() {
    this.submitted = true;

    if (!this.isFormValid()) {
      return;
    }

    this.agenda.data.setTime(this.agenda.data.getTime() - 3 * 60 * 60 * 1000)
    this.agenda.hora.setTime(this.agenda.hora.getTime() - 3 * 60 * 60 * 1000)
    this.agenda.hora.setSeconds(0)
    this.agenda.dataSituacao?.setTime(this.agenda.dataSituacao?.getTime() - 3 * 60 * 60 * 1000)

    if (this.agenda.id) {
      this.atualizarAgenda();
    } else {
      this.salvarAgenda();
    }
  }

  private isFormValid(): boolean {
    if (!this.agenda.usuario.nome?.trim()) {
      this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Usuário é obrigatório.', life: 3000 });
      return false;
    }

    if (!this.agenda.vacina.titulo?.trim()) {
      this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Vacina é obrigatório.', life: 3000 });
      return false;
    }

    if (!this.agenda.data) {
      this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Data do atendimento é obrigatório.', life: 3000 });
      return false;
    }

    if (!this.agenda.hora) {
      this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Hora do atendimento é obrigatório.', life: 3000 });
      return false;
    }

    if (this.agenda.situacao != 'AGENDADO') {
      if (!this.agenda.dataSituacao) {
        this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Data da Situação é obrigatório.', life: 3000 });
        return false;
      }
    }

    return true;
  }

  private salvarAgenda() {
    this.agendaService.postAgenda(this.agenda).subscribe(
      (data) => {
        this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Agenda Criada', life: 3000 });
        this.resetarDialog();
      },
      (error) => {
        console.error('Erro ao salvar agenda:', error);
        this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Falha ao criar agenda', life: 3000 });
      }
    );
  }

  private atualizarAgenda() {
    this.agendaService.putAgenda(this.agenda).subscribe(
      (data) => {
        this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Agenda Atualizada', life: 3000 });
        this.resetarDialog();
      },
      (error) => {
        console.error('Erro ao atualizar agenda:', error);
        this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Falha ao atualizar agenda', life: 3000 });
      }
    );
  }

  private resetarDialog() {
    this.agendaDialog = false;
    this.agenda = { id: '', data: new Date(), hora: new Date(), situacao: 'AGENDADO', vacina: {} as Vacina, usuario: {} as Usuario };
    this.carregarAgendas()
  }

  getStatusSeverity(status: string){
    console.log(status)
    switch (status) {
      case 'AGENDADO':
        return 'warning';
      case 'REALIZADO':
        return 'success';
      case 'CANCELADO':
        return 'danger'
      default:
        return ''
    }
  }

  editarDialog() {
    this.mostrarInput = true;
    this.mostrarNovo = true;
  }

  viewDialog(agenda: Agenda) {
    this.mostrarInput = false;

    this.agenda = { ...agenda };
    this.agenda.data = new Date(`${agenda.data}T00:00:00`);
    if (agenda.dataSituacao)
      this.agenda.dataSituacao = new Date(`${agenda.dataSituacao}T00:00:00`);
    else
      this.agenda.dataSituacao = undefined
    this.agenda.hora = new Date(`1999-02-28T${agenda.hora}`);

    this.agendaDialog = true;
  }
}
