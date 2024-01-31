import {PeriodicidadeEnum} from "../enum/periodicidade-enum.enum";

export interface Vacina {
  id?: string;
  titulo: string;
  dose: number;
  periodicidade?: string;
  intervalo?: number;
}
