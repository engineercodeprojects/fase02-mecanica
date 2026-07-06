export interface CreateAuditLogProps {
  ordemDeServicoId: string;
  acao: string;
  statusAnterior?: string | null;
  statusNovo?: string | null;
  usuarioId?: string | null;
  metadata?: Record<string, unknown> | null;
}

export interface ReconstituteAuditLogProps {
  id: string;
  ordemDeServicoId: string;
  acao: string;
  statusAnterior: string | null;
  statusNovo: string | null;
  usuarioId: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: Date;
}

export class OrdemDeServicoAuditLog {
  readonly id?: string;
  readonly ordemDeServicoId: string;
  readonly acao: string;
  readonly statusAnterior: string | null;
  readonly statusNovo: string | null;
  readonly usuarioId: string | null;
  readonly metadata: Record<string, unknown> | null;
  readonly createdAt?: Date;

  private constructor(props: ReconstituteAuditLogProps | (CreateAuditLogProps & { id?: string; createdAt?: Date })) {
    this.id = (props as ReconstituteAuditLogProps).id;
    this.ordemDeServicoId = props.ordemDeServicoId;
    this.acao = props.acao;
    this.statusAnterior = props.statusAnterior ?? null;
    this.statusNovo = props.statusNovo ?? null;
    this.usuarioId = props.usuarioId ?? null;
    this.metadata = props.metadata ?? null;
    this.createdAt = (props as ReconstituteAuditLogProps).createdAt;
  }

  static create(props: CreateAuditLogProps): OrdemDeServicoAuditLog {
    if (!props.acao || props.acao.trim().length === 0) {
      throw new Error('Acao do audit log eh obrigatoria');
    }
    return new OrdemDeServicoAuditLog(props);
  }

  static reconstitute(
    props: ReconstituteAuditLogProps,
  ): OrdemDeServicoAuditLog {
    return new OrdemDeServicoAuditLog(props);
  }
}
