// Types compartilhados pelos services (Query e Command) de OrdemDeServico.

export interface OsStatusServico {
  servicoId: string;
  nome: string;
  quantidade: number;
  precoUnitario: number;
  subtotal: number;
}

export interface OsStatusProduto {
  produtoId: string;
  nome: string;
  quantidade: number;
  precoUnitario: number;
  subtotal: number;
}

export interface OsStatusView {
  id: string;
  numero: string;
  status: string;
  descricaoInicial: string;
  diagnostico: string | null;
  servicos: OsStatusServico[];
  produtos: OsStatusProduto[];
  valorTotalServicos: number;
  valorTotalProdutos: number;
  valorTotal: number;
  createdAt: Date | undefined;
  updatedAt: Date | undefined;
}

export interface OsHistoryItem {
  numero: string;
  status: string;
  descricaoInicial: string;
  createdAt: Date | undefined;
  updatedAt: Date | undefined;
}

export interface OsDetalhesClienteView {
  id: string;
  nome: string;
  cpfCnpj: string;
  email: string | null | undefined;
  telefone: string;
}

export interface OsDetalhesVeiculoView {
  id: string;
  placa: string;
  marca: string;
  modelo: string;
  ano: number;
}

export interface OsDetalhesServicoItem {
  servicoId: string;
  descricaoServico: string;
  quantidade: number;
  precoUnitario: number;
  valorTotalDesseServico: number;
}

export interface OsDetalhesProdutoItem {
  produtoId: string;
  descricaoProduto: string;
  quantidade: number;
  precoUnitario: number;
  valorTotalDesseProduto: number;
}

export interface OsDetalhesView {
  cabecalho: {
    dadosCliente: OsDetalhesClienteView;
    dadosVeiculo: OsDetalhesVeiculoView;
    status: string;
    mecanicoAtribuido: string | null;
    dataHoraAbertura: string | null;
    dataHoraUltimaAtualizacao: string | null;
  };
  corpo: {
    diagnostico: string | null;
    servicos: OsDetalhesServicoItem[];
    produtos: OsDetalhesProdutoItem[];
  };
  rodape: {
    valorTotalServicos: number;
    valorTotalProdutos: number;
    valorTotalOrdemServico: number;
  };
}
