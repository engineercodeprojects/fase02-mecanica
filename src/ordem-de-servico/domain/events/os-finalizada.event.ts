// Re-export do shared kernel para nao quebrar imports existentes.
// Codigo novo deve importar diretamente de '@/shared/domain/events/...'.
export { OsFinalizadaEvent } from '../../../shared/domain/events/os-finalizada.event';
