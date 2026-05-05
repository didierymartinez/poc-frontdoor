// mockPartidas removed — table now maps from AgregadoOxpExtracto via mapPartidas()

export const FILTER_CHIPS = [
  { label: 'Todos', count: 250 },
  { label: 'Sin conciliar', count: 80 },
  { label: 'Conciliados', count: 25 },
];

export const filterBadgeColors: Record<string, { active: { bg: string; text: string }; inactive: { bg: string; text: string } }> = {
  Todos: { active: { bg: '#2f43d0', text: '#ffffff' }, inactive: { bg: '#eaebec', text: 'rgba(16,24,64,0.6)' } },
  'Sin conciliar': { active: { bg: '#8d9bfc', text: '#ffffff' }, inactive: { bg: '#eaebec', text: 'rgba(16,24,64,0.6)' } },
  Conciliados: { active: { bg: '#96cfe2', text: '#ffffff' }, inactive: { bg: '#eaebec', text: 'rgba(16,24,64,0.6)' } },
};
