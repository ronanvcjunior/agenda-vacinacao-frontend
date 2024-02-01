import {Vacina} from "./Vacina";
import {Usuario} from "./Usuario";

export interface Agenda {
  id: string;
  data: Date;
  hora: Date;
  situacao: string;
  dataSituacao?: Date;
  observacoes?: string;
  vacina: Vacina;
  usuario: Usuario;
}
