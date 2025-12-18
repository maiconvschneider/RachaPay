// Função para obter o início da semana (domingo)
export function getInicioSemana(data = new Date()) {
  const date = new Date(data)
  const dia = date.getDay() // 0 = domingo, 6 = sábado
  const diff = date.getDate() - dia // Ajusta para domingo
  const inicioSemana = new Date(date.setDate(diff))
  inicioSemana.setHours(0, 0, 0, 0)
  return inicioSemana
}

// Função para obter o fim da semana (sábado)
export function getFimSemana(data = new Date()) {
  const inicio = getInicioSemana(data)
  const fimSemana = new Date(inicio)
  fimSemana.setDate(fimSemana.getDate() + 6) // Adiciona 6 dias para chegar no sábado
  fimSemana.setHours(23, 59, 59, 999)
  return fimSemana
}

// Função para verificar se uma data está na semana atual
export function estaNaSemanaAtual(dataStr) {
  const data = new Date(dataStr + 'T00:00:00')
  data.setHours(0, 0, 0, 0)
  
  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)
  
  const inicioSemana = getInicioSemana(hoje)
  inicioSemana.setHours(0, 0, 0, 0)
  
  const fimSemana = getFimSemana(hoje)
  fimSemana.setHours(23, 59, 59, 999)
  
  return data >= inicioSemana && data <= fimSemana
}

// Função para formatar data para YYYY-MM-DD
export function formatarDataISO(data) {
  return data.toISOString().split('T')[0]
}

