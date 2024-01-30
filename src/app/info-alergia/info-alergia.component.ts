import {Component, OnInit} from '@angular/core';
import {ConfirmationService, LazyLoadEvent, MessageService} from "primeng/api";
import {Alergia} from "../../domain/Alergia";
import {AlergiaService} from "../../services/alergia.service";
import {ToastModule} from "primeng/toast";
import {ToolbarModule} from "primeng/toolbar";
import {ButtonModule} from "primeng/button";
import {RippleModule} from "primeng/ripple";
import {FileUploadModule} from "primeng/fileupload";
import {TableLazyLoadEvent, TableModule} from "primeng/table";
import {ChipsModule} from "primeng/chips";
import {DialogModule} from "primeng/dialog";
import {FormsModule} from "@angular/forms";
import {NgIf} from "@angular/common";
import {ConfirmDialogModule} from "primeng/confirmdialog";

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
    this.loadAlergias();
  }

  loadAlergias() {
    this.loading = true
    const page: number = Math.ceil(this.first / this.rows) + 1;
    this.alergiaService.getAlergias(page, this.rows).subscribe((data) => {
      this.alergias = data.content;
      this.totalRecords = data.totalRecords;
      this.loading = false
    });
  }


  onLazyLoad(event: TableLazyLoadEvent) {
    this.first = event.first || 0;
    this.rows = event.rows || 10;
    this.loadAlergias();
  }


  openNew() {
    this.alergia = { id: '', nome: '' };
    this.submitted = false;
    this.alergiaDialog = true;
  }

  deleteSelectedAlergias() {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete the selected alergias?',
      header: 'Confirm',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        if (this.selectedAlergias && this.selectedAlergias.length > 0) {
          this.alergiaService.deleteAlergias(this.selectedAlergias)
            .subscribe(
              () => {
                this.alergias = this.alergias.filter((val) => !this.selectedAlergias?.includes(val));
                this.selectedAlergias = null;
                this.messageService.add({ severity: 'success', summary: 'Successful', detail: 'Alergias Deleted', life: 3000 });
                this.loadAlergias();
              },
              (error) => {
                console.error('Error deleting alergias:', error);
              }
            );
        } else {
          console.warn('No alergias selected for deletion.');
        }
      }
    });
  }


  editAlergia(alergia: Alergia) {
    this.alergia = { ...alergia };
    this.alergiaDialog = true;
  }

  deleteAlergia(alergia: Alergia) {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete ' + alergia.nome + '?',
      header: 'Confirm',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.alergiaService.deleteAlergia(alergia)
          .subscribe(
            () => {
              this.alergias = this.alergias.filter((val) => val.id !== alergia.id);
              this.alergia = { id: '', nome: '' };
              this.messageService.add({ severity: 'success', summary: 'Successful', detail: 'Alergia Deleted', life: 3000 });
              this.loadAlergias();
            },
            (error) => {
              console.error('Error deleting alergias:', error);
            }
          );
      }
    });
  }

  hideDialog() {
    this.alergiaDialog = false;
    this.submitted = false;
  }

  saveOrUpdateAlergia() {
    this.submitted = true;

    if (!this.isFormValid()) {
      // Se o formulário não for válido, não fecha o diálogo
      return;
    }

    if (this.alergia.id) {
      this.updateAlergia();
    } else {
      this.saveAlergia();
    }
  }

  private isFormValid(): boolean {
    if (!this.alergia.nome?.trim()) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Name is required.', life: 3000 });
      return false;
    }

    if (this.isAlergiaNameDuplicate()) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Alergia with this name already exists.', life: 3000 });
      return false;
    }

    return true;
  }

  private isAlergiaNameDuplicate(): boolean {
    const alergiaName = this.alergia.nome.trim().toLowerCase(); // Normaliza o nome da alergia

    return this.alergias.some(a => a.nome.trim().toLowerCase() === alergiaName && a.id !== this.alergia.id);
  }

  private saveAlergia() {
    this.alergiaService.postAlergia(this.alergia).subscribe(
      (data) => {
        this.messageService.add({ severity: 'success', summary: 'Successful', detail: 'Alergia Created', life: 3000 });
        this.resetDialog();
      },
      (error) => {
        console.error('Error saving alergia:', error);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to create alergia', life: 3000 });
      }
    );
  }

  private updateAlergia() {
    this.alergiaService.putAlergia(this.alergia).subscribe(
      (data) => {
        this.messageService.add({ severity: 'success', summary: 'Successful', detail: 'Alergia Updated', life: 3000 });
        this.resetDialog();
      },
      (error) => {
        console.error('Error updating alergia:', error);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to update alergia', life: 3000 });
      }
    );
  }


  private resetDialog() {
    this.alergiaDialog = false;
    this.alergia = { id: '', nome: '' };
    this.loadAlergias()
  }

}
