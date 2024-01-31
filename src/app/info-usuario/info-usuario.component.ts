import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import { ConfirmationService, LazyLoadEvent, MessageService } from "primeng/api";
import { Usuario } from "../../domain/Usuario";
import { UsuarioService } from "../../services/usuario.service";
import { ToastModule } from "primeng/toast";
import { ToolbarModule } from "primeng/toolbar";
import { ButtonModule } from "primeng/button";
import { RippleModule } from "primeng/ripple";
import { FileUploadModule } from "primeng/fileupload";
import { TableLazyLoadEvent, TableModule } from "primeng/table";
import { ChipsModule } from "primeng/chips";
import { DialogModule } from "primeng/dialog";
import { FormsModule } from "@angular/forms";
import {DatePipe, NgForOf, NgIf} from "@angular/common";
import { ConfirmDialogModule } from "primeng/confirmdialog";
import { DropdownModule } from 'primeng/dropdown';
import {CalendarModule} from "primeng/calendar";
import {MultiSelectModule} from "primeng/multiselect";
import {Alergia} from "../../domain/Alergia";
import {AlergiaService} from "../../services/alergia.service";
import {TagModule} from "primeng/tag";

@Component({
  selector: 'app-info-usuario',
  standalone: true,
  imports: [
    ToastModule,
    ToolbarModule,
    ButtonModule,
    RippleModule,
    FileUploadModule,
    TableModule,
    ChipsModule,
    DialogModule,
    FormsModule,
    NgIf,
    ConfirmDialogModule,
    DropdownModule,
    CalendarModule,
    DatePipe,
    MultiSelectModule,
    TagModule,
    NgForOf
  ],
  templateUrl: './info-usuario.component.html',
  styleUrl: './info-usuario.component.scss',
  providers: [MessageService, ConfirmationService]
})
export class InfoUsuarioComponent implements OnInit {
  loading: boolean = true;

  mostrarInput: boolean = true;

  usuarioDialog: boolean = false;

  usuarios!: Usuario[];

  usuario!: Usuario;

  selectedUsuarios!: Usuario[] | null;

  submitted: boolean = false;

  totalRecords: number = 0;
  first: number = 0;
  rows: number = 10;

  sexoOptions: string[] = ['M', 'F'];

  ufOptions: string[] = ['AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'];

  alergiasOptions!: any[];

  constructor(
    private usuarioService: UsuarioService,
    private alergiaService: AlergiaService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.carregarAlergias();
  }

  carregarUsuarios() {
    this.loading = true;
    const pagina: number = Math.ceil(this.first / this.rows) + 1;
    this.usuarioService.getUsuarios(pagina, this.rows).subscribe(
      (data) => {
        this.usuarios = data.content;
        this.totalRecords = data.totalRecords;
        this.loading = false;
        this.cdr.detectChanges();
      },
      (error) => {
        this.usuarios = [];
        if(error.status != 404)
          console.error("Erro ao carregar usuários:", error);
        this.loading = false;
        this.cdr.detectChanges();
      }
    );
  }

  carregarAlergias() {
    this.alergiaService.getAlergias(null, null).subscribe(
      (data) => {
        this.alergiasOptions = data.content.map((alergia) => ({
          label: alergia.nome,
          value: alergia,
        }));
        this.cdr.detectChanges();
      },
      (error) => {
        this.alergiasOptions = [];
        if(error.status != 404)
          console.error("Erro ao carregar alergias:", error);
        this.cdr.detectChanges();
      }
    );
  }

  onLazyLoad(event: TableLazyLoadEvent) {
    this.first = event.first || 0;
    this.rows = event.rows || 10;
    this.carregarUsuarios();
  }

  abrirNovo() {
    this.mostrarInput = true;

    this.usuario = { id: '', nome: '', dataNascimento: new Date(), sexo: '', logradouro: '', setor: '', cidade: '', uf: '' };
    this.submitted = false;
    this.usuarioDialog = true;
  }

  deletarUsuariosSelecionados() {
    this.confirmationService.confirm({
      message: 'Tem certeza de que deseja excluir os usuários selecionados?',
      header: 'Confirmar',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        if (this.selectedUsuarios && this.selectedUsuarios.length > 0) {
          this.usuarioService.deleteUsuarios(this.selectedUsuarios)
            .subscribe(
              () => {
                this.usuarios = this.usuarios.filter((val) => !this.selectedUsuarios?.includes(val));
                this.selectedUsuarios = null;
                this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Usuários Excluídos', life: 3000 });
                this.carregarUsuarios();
              },
              (error) => {
                console.error('Erro ao excluir usuários:', error);
              }
            );
        } else {
          console.warn('Nenhum usuário selecionado para exclusão.');
        }
      }
    });
  }

  editarUsuario(usuario: Usuario) {
    this.mostrarInput = true;

    this.usuario = { ...usuario };
    this.usuario.dataNascimento = new Date(`${usuario.dataNascimento}T00:00:00`);

    this.usuarioDialog = true;
    console.log(this.mostrarInput)
  }

  deletarUsuario(usuario: Usuario) {
    this.confirmationService.confirm({
      message: 'Tem certeza de que deseja excluir ' + usuario.nome + '?',
      header: 'Confirmar',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.usuarioService.deleteUsuario(usuario)
          .subscribe(
            () => {
              this.usuarios = this.usuarios.filter((val) => val.id !== usuario.id);
              this.usuario = { id: '', nome: '', dataNascimento: new Date(), sexo: '', logradouro: '', setor: '', cidade: '', uf: '' };
              this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Usuário Excluído', life: 3000 });
              this.carregarUsuarios();
            },
            (error) => {
              console.error('Erro ao excluir usuário:', error);
            }
          );
      }
    });
  }

  esconderDialog() {
    this.usuarioDialog = false;
    this.submitted = false;
  }

  salvarOuAtualizarUsuario() {
    this.submitted = true;

    if (!this.isFormValid()) {
      return;
    }

    if (this.usuario.id) {
      this.atualizarUsuario();
    } else {
      this.salvarUsuario();
    }
  }

  private isFormValid(): boolean {
    if (!this.usuario.nome?.trim()) {
      this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Nome é obrigatório.', life: 3000 });
      return false;
    }

    if (!this.usuario.dataNascimento) {
      this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Data de nascimento é obrigatória.', life: 3000 });
      return false;
    }

    if (!this.usuario.sexo) {
      this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Sexo é obrigatório.', life: 3000 });
      return false;
    }

    if (!this.usuario.logradouro?.trim()) {
      this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Logradouro é obrigatório.', life: 3000 });
      return false;
    }

    if (!this.usuario.setor?.trim()) {
      this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Setor é obrigatório.', life: 3000 });
      return false;
    }

    if (!this.usuario.cidade?.trim()) {
      this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Cidade é obrigatória.', life: 3000 });
      return false;
    }

    if (!this.usuario.uf) {
      this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'UF é obrigatória.', life: 3000 });
      return false;
    }

    return true;
  }


  private salvarUsuario() {
    this.usuarioService.postUsuario(this.usuario).subscribe(
      (data) => {
        this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Usuário Criado', life: 3000 });
        this.resetarDialog();
      },
      (error) => {
        console.error('Erro ao salvar usuário:', error);
        this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Falha ao criar usuário', life: 3000 });
      }
    );
  }

  private atualizarUsuario() {
    this.usuarioService.putUsuario(this.usuario).subscribe(
      (data) => {
        this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Usuário Atualizado', life: 3000 });
        this.resetarDialog();
      },
      (error) => {
        console.error('Erro ao atualizar usuário:', error);
        this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Falha ao atualizar usuário', life: 3000 });
      }
    );
  }

  private resetarDialog() {
    this.usuarioDialog = false;
    this.usuario = { id: '', nome: '', dataNascimento: new Date(), sexo: '', logradouro: '', setor: '', cidade: '', uf: '' };
    this.carregarUsuarios()
  }

  editarDialog() {
    this.mostrarInput = true;
  }

  viewDialog(usuario: Usuario) {
    this.mostrarInput = false;

    this.usuario = { ...usuario };
    this.usuario.dataNascimento = new Date(`${usuario.dataNascimento}T00:00:00`);

    this.usuarioDialog = true;
  }

}
