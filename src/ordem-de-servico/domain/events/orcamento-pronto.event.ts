// Re-export do shared kernel para nao quebrar imports existentes.
// Codigo novo deve importar diretamente de '@/shared/domain/events/...'.
export { OrcamentoProntoEvent } from '../../../shared/domain/events/orcamento-pronto.event';
