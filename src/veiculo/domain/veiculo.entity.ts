import { Placa } from "./value-objects/placa.vo";
import { MarcaRequiredError } from "./errors/marca-required.error";
import { ModeloRequiredError } from "./errors/modelo-required.error";
import { InvalidAnoError } from "./errors/invalid-ano.error";

export interface CreateVeiculoProps {
  placa: string;
  marca: string;
  modelo: string;
  ano: number;
  clienteId: string;
}

export interface ReconstituteVeiculoProps {
  id: string;
  placa: string;
  marca: string;
  modelo: string;
  ano: number;
  clienteId: string;
  ativo: boolean;
}

export interface UpdateVeiculoProps {
  placa?: string;
  marca?: string;
  modelo?: string;
  ano?: number;
}

export class Veiculo {
  readonly id?: string;
  private _placa: Placa;
  private _marca: string;
  private _modelo: string;
  private _ano: number;
  private _clienteId: string;
  private _ativo: boolean;

  private constructor(
    props: {
      placa: Placa;
      marca: string;
      modelo: string;
      ano: number;
      clienteId: string;
      ativo: boolean;
    },
    id?: string,
  ) {
    this.id = id;
    this._placa = props.placa;
    this._marca = props.marca;
    this._modelo = props.modelo;
    this._ano = props.ano;
    this._clienteId = props.clienteId;
    this._ativo = props.ativo;
  }

  static create(props: CreateVeiculoProps): Veiculo {
    this.validateMarca(props.marca);
    this.validateModelo(props.modelo);
    this.validateAno(props.ano);

    return new Veiculo({
      placa: new Placa(props.placa),
      marca: props.marca,
      modelo: props.modelo,
      ano: props.ano,
      clienteId: props.clienteId,
      ativo: true,
    });
  }

  static reconstitute(props: ReconstituteVeiculoProps): Veiculo {
    return new Veiculo(
      {
        placa: new Placa(props.placa),
        marca: props.marca,
        modelo: props.modelo,
        ano: props.ano,
        clienteId: props.clienteId,
        ativo: props.ativo,
      },
      props.id,
    );
  }

  update(props: UpdateVeiculoProps): void {
    if (props.placa !== undefined) {
      this._placa = new Placa(props.placa);
    }
    if (props.marca !== undefined) {
      Veiculo.validateMarca(props.marca);
      this._marca = props.marca;
    }
    if (props.modelo !== undefined) {
      Veiculo.validateModelo(props.modelo);
      this._modelo = props.modelo;
    }
    if (props.ano !== undefined) {
      Veiculo.validateAno(props.ano);
      this._ano = props.ano;
    }
  }

  deactivate(): void {
    this._ativo = false;
  }
  activate(): void {
    this._ativo = true;
  }

  get placa(): Placa {
    return this._placa;
  }
  get marca(): string {
    return this._marca;
  }
  get modelo(): string {
    return this._modelo;
  }
  get ano(): number {
    return this._ano;
  }
  get clienteId(): string {
    return this._clienteId;
  }
  get ativo(): boolean {
    return this._ativo;
  }

  private static validateMarca(marca: string): void {
    if (!marca || marca.trim().length === 0) {
      throw new MarcaRequiredError();
    }
  }

  private static validateModelo(modelo: string): void {
    if (!modelo || modelo.trim().length === 0) {
      throw new ModeloRequiredError();
    }
  }

  private static validateAno(ano: number): void {
    const anoAtual = new Date().getFullYear();
    if (ano < 1886 || ano > anoAtual + 1) {
      throw new InvalidAnoError();
    }
  }
}
