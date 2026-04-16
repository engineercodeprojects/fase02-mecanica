import { NameRequiredError } from './errors/name-required.error';
import { InvalidEstimatedTimeError } from './errors/invalid-estimated-time.error';
import { Preco } from './value-objects/preco.vo';

export interface CreateServicoProps {
  nome: string;
  descricao?: string;
  precoBase: number;
  tempoEstimadoHoras: number;
}

export interface ReconstituteServicoProps {
  id: string;
  nome: string;
  descricao?: string | null;
  precoBase: number;
  tempoEstimadoHoras: number;
  ativo: boolean;
}

export interface UpdateServicoProps {
  nome?: string;
  descricao?: string;
  precoBase?: number;
  tempoEstimadoHoras?: number;
}

export class Servico {
  readonly id?: string;
  private _nome: string;
  private _descricao?: string | null;
  private _precoBase: Preco;
  private _tempoEstimadoHoras: number;
  private _ativo: boolean;

  private constructor(
    props: {
      nome: string;
      descricao?: string | null;
      precoBase: Preco;
      tempoEstimadoHoras: number;
      ativo: boolean;
    },
    id?: string,
  ) {
    this.id = id;
    this._nome = props.nome;
    this._descricao = props.descricao;
    this._precoBase = props.precoBase;
    this._tempoEstimadoHoras = props.tempoEstimadoHoras;
    this._ativo = props.ativo;
  }

  static create(props: CreateServicoProps): Servico {
    this.validateNome(props.nome);
    this.validateTempoEstimado(props.tempoEstimadoHoras);

    return new Servico({
      nome: props.nome,
      descricao: props.descricao,
      precoBase: new Preco(props.precoBase),
      tempoEstimadoHoras: props.tempoEstimadoHoras,
      ativo: true,
    });
  }

  static reconstitute(props: ReconstituteServicoProps): Servico {
    return new Servico(
      {
        nome: props.nome,
        descricao: props.descricao,
        precoBase: new Preco(props.precoBase),
        tempoEstimadoHoras: props.tempoEstimadoHoras,
        ativo: props.ativo,
      },
      props.id,
    );
  }

  update(props: UpdateServicoProps): void {
    if (props.nome !== undefined) {
      Servico.validateNome(props.nome);
      this._nome = props.nome;
    }
    if (props.descricao !== undefined) {
      this._descricao = props.descricao;
    }
    if (props.precoBase !== undefined) {
      this._precoBase = new Preco(props.precoBase);
    }
    if (props.tempoEstimadoHoras !== undefined) {
      Servico.validateTempoEstimado(props.tempoEstimadoHoras);
      this._tempoEstimadoHoras = props.tempoEstimadoHoras;
    }
  }

  deactivate(): void {
    this._ativo = false;
  }

  activate(): void {
    this._ativo = true;
  }

  get nome(): string {
    return this._nome;
  }

  get descricao(): string | null | undefined {
    return this._descricao;
  }

  get precoBase(): Preco {
    return this._precoBase;
  }

  get tempoEstimadoHoras(): number {
    return this._tempoEstimadoHoras;
  }

  get ativo(): boolean {
    return this._ativo;
  }

  private static validateNome(nome: string): void {
    if (!nome || nome.trim().length === 0) {
      throw new NameRequiredError();
    }
  }

  private static validateTempoEstimado(tempo: number): void {
    if (tempo <= 0) {
      throw new InvalidEstimatedTimeError();
    }
  }
}
