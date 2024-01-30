import { Component, OnInit } from '@angular/core';
import { ConfirmationService, LazyLoadEvent, MessageService } from "primeng/api";
import { Alergia } from "../../domain/Alergia";
import { AlergiaService } from "../../services/alergia.service";
import { ToastModule } from "primeng/toast";
import { ToolbarModule } from "primeng/toolbar";
import { ButtonModule } from "primeng/button";
import { RippleModule } from "primeng/ripple";
import { FileUploadModule } from "primeng/fileupload";
import { TableLazyLoadEvent, TableModule } from "primeng/table";
import { ChipsModule } from "primeng/chips";
import { DialogModule } from "primeng/dialog";
import { FormsModule } from "@angular/forms";
import { NgIf } from "@angular/common";
import { ConfirmDialogModule } from "primeng/confirmdialog";

@Component({
  selector: 'app-info-alergia',
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
    ConfirmDialogModule
  ],
  templateUrl: './info-alergia.component.html',
  styleUrl: './info-alergia.component.scss',
  providers: [MessageService, ConfirmationService]
})
export class InfoAlergiaComponent implements OnInit {
  loading: boolean = true;

  alergiaDialog: boolean = false;

  alergias!: Alergia[];

  alergia!: Alergia;

  selectedAlergias!: Alergia[] | null;

  submitted: boolean = false;

  totalRecords: number = 0;
  first: number = 0;
  rows: number = 10;

  constructor(private alergiaService: AlergiaService, private messageService: MessageService, private confirmationService: ConfirmationService) {}

  ngOnInit() {
    this.carregarAlergias();
  }

  carregarAlergias() {
    this.loading = true
    const pagina: number = Math.ceil(this.first / this.rows) + 1;
    this.alergiaService.getAlergias(pagina, this.rows).subscribe((data) => {
      this.alergias = data.content;
      this.totalRecords = data.totalRecords;
      this.loading = false
    });
  }

  onLazyLoad(event: TableLazyLoadEvent) {
    this.first = event.first || 0;
    this.rows = event.rows || 10;
    this.carregarAlergias();
  }

  abrirNovo() {
    this.alergia = { id: '', nome: '' };
    this.submitted = false;
    this.alergiaDialog = true;
  }

  deletarAlergiasSelecionadas() {
    this.confirmationService.confirm({
      message: 'Tem certeza de que deseja excluir as alergias selecionadas?',
      header: 'Confirmar',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        if (this.selectedAlergias && this.selectedAlergias.length > 0) {
          this.alergiaService.deleteAlergias(this.selectedAlergias)
            .subscribe(
              () => {
                this.alergias = this.alergias.filter((val) => !this.selectedAlergias?.includes(val));
                this.selectedAlergias = null;
                this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Alergias Excluídas', life: 3000 });
                this.carregarAlergias();
              },
              (error) => {
                console.error('Erro ao excluir alergias:', error);
              }
            );
        } else {
          console.warn('Nenhuma alergia selecionada para exclusão.');
        }
      }
    });
  }

  editarAlergia(alergia: Alergia) {
    this.alergia = { ...alergia };
    this.alergiaDialog = true;
  }

  deletarAlergia(alergia: Alergia) {
    this.confirmationService.confirm({
      message: 'Tem certeza de que deseja excluir ' + alergia.nome + '?',
      header: 'Confirmar',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.alergiaService.deleteAlergia(alergia)
          .subscribe(
            () => {
              this.alergias = this.alergias.filter((val) => val.id !== alergia.id);
              this.alergia = { id: '', nome: '' };
              this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Alergia Excluída', life: 3000 });
              this.carregarAlergias();
            },
            (error) => {
              console.error('Erro ao excluir alergias:', error);
            }
          );
      }
    });
  }

  esconderDialog() {
    this.alergiaDialog = false;
    this.submitted = false;
  }

  salvarOuAtualizarAlergia() {
    this.submitted = true;

    if (!this.isFormValid()) {
      return;
    }

    if (this.alergia.id) {
      this.atualizarAlergia();
    } else {
      this.salvarAlergia();
    }
  }

  private isFormValid(): boolean {
    if (!this.alergia.nome?.trim()) {
      this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Nome é obrigatório.', life: 3000 });
      return false;
    }

    if (this.isAlergiaNomeDuplicado()) {
      this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Já existe uma alergia com este nome.', life: 3000 });
      return false;
    }

    return true;
  }

  private isAlergiaNomeDuplicado(): boolean {
    const nomeAlergia = this.alergia.nome.trim().toLowerCase();

    return this.alergias.some(a => a.nome.trim().toLowerCase() === nomeAlergia && a.id !== this.alergia.id);
  }

  private salvarAlergia() {
    this.alergiaService.postAlergia(this.alergia).subscribe(
      (data) => {
        this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Alergia Criada', life: 3000 });
        this.resetarDialog();
      },
      (error) => {
        console.error('Erro ao salvar alergia:', error);
        this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Falha ao criar alergia', life: 3000 });
      }
    );
  }

  private atualizarAlergia() {
    this.alergiaService.putAlergia(this.alergia).subscribe(
      (data) => {
        this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Alergia Atualizada', life: 3000 });
        this.resetarDialog();
      },
      (error) => {
        console.error('Erro ao atualizar alergia:', error);
        this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Falha ao atualizar alergia', life: 3000 });
      }
    );
  }

  private resetarDialog() {
    this.alergiaDialog = false;
    this.alergia = { id: '', nome: '' };
    this.carregarAlergias()
  }

}
