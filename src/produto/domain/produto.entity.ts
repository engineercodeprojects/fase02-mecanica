import { NameRequiredError } from './errors/name-required.error';
import { InvalidQuantityError } from './errors/invalid-quantity.error';
import { InsufficientStockError } from './errors/insufficient-stock.error';
import { Preco } from './value-objects/preco.vo';

export interface CreateProdutoProps {
  nome: string;
  descricao?: string;
  precoUnitario: number;
  quantidadeEstoque: number;
  estoqueMinimo: number;
}

export interface ReconstituteProdutoProps {
  id: string;
  nome: string;
  descricao?: string | null;
  precoUnitario: number;
  quantidadeEstoque: number;
  quantidadeReservada: number;
  estoqueMinimo: number;
  ativo: boolean;
}

export interface UpdateProdutoProps {
  nome?: string;
  descricao?: string;
  precoUnitario?: number;
  estoqueMinimo?: number;
}

export class Produto {
  readonly id?: string;
  private _nome: string;
  private _descricao?: string | null;
  private _precoUnitario: Preco;
  private _quantidadeEstoque: number;
  private _quantidadeReservada: number;
  private _estoqueMinimo: number;
  private _ativo: boolean;

  private constructor(
    props: {
      nome: string;
      descricao?: string | null;
      precoUnitario: Preco;
      quantidadeEstoque: number;
      quantidadeReservada: number;
      estoqueMinimo: number;
      ativo: boolean;
    },
    id?: string,
  ) {
    this.id = id;
    this._nome = props.nome;
    this._descricao = props.descricao;
    this._precoUnitario = props.precoUnitario;
    this._quantidadeEstoque = props.quantidadeEstoque;
    this._quantidadeReservada = props.quantidadeReservada;
    this._estoqueMinimo = props.estoqueMinimo;
    this._ativo = props.ativo;
  }

  static create(props: CreateProdutoProps): Produto {
    this.validateNome(props.nome);
    this.validateQuantity(props.quantidadeEstoque, 'Quantidade em estoque');
    this.validateQuantity(props.estoqueMinimo, 'Estoque minimo');

    return new Produto({
      nome: props.nome,
      descricao: props.descricao,
      precoUnitario: new Preco(props.precoUnitario),
      quantidadeEstoque: props.quantidadeEstoque,
      quantidadeReservada: 0,
      estoqueMinimo: props.estoqueMinimo,
      ativo: true,
    });
  }

  static reconstitute(props: ReconstituteProdutoProps): Produto {
    return new Produto(
      {
        nome: props.nome,
        descricao: props.descricao,
        precoUnitario: new Preco(props.precoUnitario),
        quantidadeEstoque: props.quantidadeEstoque,
        quantidadeReservada: props.quantidadeReservada,
        estoqueMinimo: props.estoqueMinimo,
        ativo: props.ativo,
      },
      props.id,
    );
  }

  update(props: UpdateProdutoProps): void {
    if (props.nome !== undefined) {
      Produto.validateNome(props.nome);
      this._nome = props.nome;
    }
    if (props.descricao !== undefined) {
      this._descricao = props.descricao;
    }
    if (props.precoUnitario !== undefined) {
      this._precoUnitario = new Preco(props.precoUnitario);
    }
    if (props.estoqueMinimo !== undefined) {
      Produto.validateQuantity(props.estoqueMinimo, 'Estoque minimo');
      this._estoqueMinimo = props.estoqueMinimo;
    }
  }

  reserve(quantity: number): void {
    if (quantity > this.quantidadeDisponivel) {
      throw new InsufficientStockError(this._nome, quantity, this.quantidadeDisponivel);
    }
    this._quantidadeReservada += quantity;
  }

  release(quantity: number): void {
    this._quantidadeReservada = Math.max(0, this._quantidadeReservada - quantity);
  }

  deduct(quantity: number): void {
    this._quantidadeEstoque -= quantity;
    this._quantidadeReservada = Math.max(0, this._quantidadeReservada - quantity);
  }

  addStock(quantity: number): void {
    this._quantidadeEstoque += quantity;
  }

  isLowStock(): boolean {
    return this._quantidadeEstoque <= this._estoqueMinimo;
  }

  deactivate(): void {
    this._ativo = false;
  }

  activate(): void {
    this._ativo = true;
  }

  get nome(): string { return this._nome; }
  get descricao(): string | null | undefined { return this._descricao; }
  get precoUnitario(): Preco { return this._precoUnitario; }
  get quantidadeEstoque(): number { return this._quantidadeEstoque; }
  get quantidadeReservada(): number { return this._quantidadeReservada; }
  get quantidadeDisponivel(): number { return this._quantidadeEstoque - this._quantidadeReservada; }
  get estoqueMinimo(): number { return this._estoqueMinimo; }
  get ativo(): boolean { return this._ativo; }

  private static validateNome(nome: string): void {
    if (!nome || nome.trim().length === 0) {
      throw new NameRequiredError();
    }
  }

  private static validateQuantity(value: number, field: string): void {
    if (value < 0) {
      throw new InvalidQuantityError(field);
    }
  }
}
