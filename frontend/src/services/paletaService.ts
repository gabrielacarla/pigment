export interface Paleta {
  id: string
  nome: string
  descricao: string | null
  cores: string[]
}

export async function listarPaletas(): Promise<Paleta[]> {
  const resposta = await fetch('/api/paletas')

  if (!resposta.ok) {
    throw new Error('Não foi possível carregar as paletas.')
  }

  return resposta.json() as Promise<Paleta[]>
}