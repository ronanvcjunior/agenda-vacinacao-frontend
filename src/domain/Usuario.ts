import {Alergia} from "./Alergia";

export interface Usuario {
  id: string;
  nome: string;
  dataNascimento: Date;
  sexo: string;
  logradouro: string;
  numero?: number;
  setor: string;
  cidade: string;
  uf: string;
  alergias?: Alergia[];
}
