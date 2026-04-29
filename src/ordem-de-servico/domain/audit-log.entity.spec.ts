import { OrdemDeServicoAuditLog } from './audit-log.entity';

describe('OrdemDeServicoAuditLog', () => {
  describe('create', () => {
    it('cria com defaults para campos opcionais', () => {
      const log = OrdemDeServicoAuditLog.create({
        ordemDeServicoId: 'os-1',
        acao: 'CRIAR',
      });

      expect(log.ordemDeServicoId).toBe('os-1');
      expect(log.acao).toBe('CRIAR');
      expect(log.statusAnterior).toBeNull();
      expect(log.statusNovo).toBeNull();
      expect(log.usuarioId).toBeNull();
      expect(log.metadata).toBeNull();
    });

    it('preserva todos os campos preenchidos', () => {
      const log = OrdemDeServicoAuditLog.create({
        ordemDeServicoId: 'os-1',
        acao: 'APROVAR_ORCAMENTO',
        statusAnterior: 'AGUARDANDO_APROVACAO',
        statusNovo: 'EM_EXECUCAO',
        usuarioId: 'u-1',
        metadata: { foo: 'bar' },
      });

      expect(log.statusAnterior).toBe('AGUARDANDO_APROVACAO');
      expect(log.statusNovo).toBe('EM_EXECUCAO');
      expect(log.usuarioId).toBe('u-1');
      expect(log.metadata).toEqual({ foo: 'bar' });
    });

    it('lanca erro quando acao eh vazia', () => {
      expect(() =>
        OrdemDeServicoAuditLog.create({ ordemDeServicoId: 'os-1', acao: '' }),
      ).toThrow(/Acao/);
      expect(() =>
        OrdemDeServicoAuditLog.create({ ordemDeServicoId: 'os-1', acao: '   ' }),
      ).toThrow(/Acao/);
    });
  });

  describe('reconstitute', () => {
    it('restaura entidade do banco com createdAt', () => {
      const createdAt = new Date('2026-04-29T10:00:00Z');
      const log = OrdemDeServicoAuditLog.reconstitute({
        id: 'log-1',
        ordemDeServicoId: 'os-1',
        acao: 'CRIAR',
        statusAnterior: null,
        statusNovo: 'RECEBIDA',
        usuarioId: 'u-1',
        metadata: { x: 1 },
        createdAt,
      });

      expect(log.id).toBe('log-1');
      expect(log.createdAt).toEqual(createdAt);
    });
  });
});
