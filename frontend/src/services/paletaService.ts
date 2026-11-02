export interface Paleta {
  id: string
  nome: string
  descricao: string | null
  cores: string[]
  favorita: boolean
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

export async function atualizarPaleta(
  id: string,
  dados: NovaPaleta,
): Promise<Paleta> {
  const resposta = await fetch(
    `/api/paletas/${encodeURIComponent(id)}`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(dados),
    },
  )

  if (!resposta.ok) {
    throw new Error('Não foi possível atualizar a paleta.')
  }

  return resposta.json() as Promise<Paleta>
}

export async function alternarFavorita(
  id: string,
): Promise<Paleta> {
  const resposta = await fetch(
    `/api/paletas/${encodeURIComponent(id)}/favorita`,
    {
      method: 'PATCH',
    },
  )

  if (!resposta.ok) {
    throw new Error(
      'Não foi possível atualizar o favorito. Tente novamente.',
    )
  }

  return resposta.json() as Promise<Paleta>
}

export async function excluirPaleta(
  id: string,
): Promise<void> {
  const resposta = await fetch(
    `/api/paletas/${encodeURIComponent(id)}`,
    {
      method: 'DELETE',
    },
  )

  if (!resposta.ok) {
    throw new Error('Não foi possível excluir a paleta.')
  }
}