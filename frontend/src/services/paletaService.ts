export interface Paleta {
  id: string
  nome: string
  descricao: string | null
  cores: string[]
}

export interface NovaPaleta {
  nome: string
  descricao: string
  cores: string[]
}

export async function listarPaletas(): Promise<Paleta[]> {
  const resposta = await fetch('/api/paletas')

  if (!resposta.ok) {
    throw new Error('Não foi possível carregar as paletas.')
  }

  return resposta.json() as Promise<Paleta[]>
}

export async function criarPaleta(
  dados: NovaPaleta,
): Promise<Paleta> {
  const resposta = await fetch('/api/paletas', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(dados),
  })

  if (!resposta.ok) {
    throw new Error('Não foi possível criar a paleta.')
  }

  return resposta.json() as Promise<Paleta>
}