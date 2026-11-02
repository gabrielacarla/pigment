import type { Paleta } from '../services/paletaService'

const LARGURA = 1200
const MARGEM = 80
const COR_TEXTO = '#25241F'
const COR_SECUNDARIA = '#716C63'
const COR_DESTAQUE = '#D1495B'
const COR_FUNDO = '#F7F5F0'

function quebrarTexto(
  contexto: CanvasRenderingContext2D,
  texto: string,
  larguraMaxima: number,
): string[] {
  const linhas: string[] = []
  const palavras = texto.trim().split(/\s+/)
  let linhaAtual = ''

  for (const palavra of palavras) {
    const tentativa = linhaAtual ? `${linhaAtual} ${palavra}` : palavra

    if (
      contexto.measureText(tentativa).width > larguraMaxima &&
      linhaAtual
    ) {
      linhas.push(linhaAtual)
      linhaAtual = palavra
    } else {
      linhaAtual = tentativa
    }
  }

  if (linhaAtual) linhas.push(linhaAtual)
  return linhas
}

function desenharRetanguloArredondado(
  contexto: CanvasRenderingContext2D,
  x: number,
  y: number,
  largura: number,
  altura: number,
  raio: number,
  cor: string,
) {
  contexto.beginPath()
  contexto.roundRect(x, y, largura, altura, raio)
  contexto.fillStyle = cor
  contexto.fill()
}

function nomeArquivoSeguro(nome: string): string {
  const nomeNormalizado = nome
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

  return nomeNormalizado || 'paleta'
}

export async function exportarPaletaPNG(paleta: Paleta): Promise<void> {
  if (paleta.cores.length === 0) {
    throw new Error('A paleta não possui cores para exportar.')
  }

  const canvas = document.createElement('canvas')
  const contexto = canvas.getContext('2d')

  if (!contexto) {
    throw new Error('Não foi possível preparar a imagem.')
  }

  const larguraConteudo = LARGURA - MARGEM * 2

  contexto.font = 'bold 56px Arial, sans-serif'
  const linhasNome = quebrarTexto(contexto, paleta.nome, larguraConteudo)

  const descricao = paleta.descricao?.trim() ?? ''

  contexto.font = '28px Arial, sans-serif'
  const linhasDescricao = descricao
    ? quebrarTexto(contexto, descricao, larguraConteudo)
    : []

  const alturaNome = linhasNome.length * 68
  const alturaDescricao = linhasDescricao.length * 42

  const topoNome = 170
  const topoDescricao = topoNome + alturaNome + 16
  const topoCores =
    topoDescricao + alturaDescricao + (descricao ? 56 : 36)

  const alturaCores = 320
  const alturaTotal = topoCores + alturaCores + 180

  canvas.width = LARGURA
  canvas.height = alturaTotal

  contexto.fillStyle = COR_FUNDO
  contexto.fillRect(0, 0, LARGURA, alturaTotal)

  contexto.fillStyle = COR_DESTAQUE
  contexto.font = 'bold 34px Arial, sans-serif'
  contexto.fillText('pigment.', MARGEM, 85)

  contexto.fillStyle = COR_SECUNDARIA
  contexto.font = '22px Arial, sans-serif'
  contexto.textAlign = 'right'
  contexto.fillText('PALETA DE CORES', LARGURA - MARGEM, 85)
  contexto.textAlign = 'left'

  contexto.fillStyle = COR_TEXTO
  contexto.font = 'bold 56px Arial, sans-serif'

  linhasNome.forEach((linha, indice) => {
    contexto.fillText(linha, MARGEM, topoNome + indice * 68)
  })

  if (descricao) {
    contexto.fillStyle = COR_SECUNDARIA
    contexto.font = '28px Arial, sans-serif'

    linhasDescricao.forEach((linha, indice) => {
      contexto.fillText(linha, MARGEM, topoDescricao + indice * 42)
    })
  }

  const larguraCor = larguraConteudo / paleta.cores.length

  paleta.cores.forEach((cor, indice) => {
    const x = MARGEM + indice * larguraCor
    contexto.fillStyle = cor
    contexto.fillRect(x, topoCores, larguraCor, alturaCores)
  })

  contexto.font = 'bold 20px Arial, sans-serif'
  contexto.textAlign = 'center'

  paleta.cores.forEach((cor, indice) => {
    const x = MARGEM + indice * larguraCor + larguraCor / 2
    contexto.fillStyle = COR_TEXTO
    contexto.fillText(
      cor.toUpperCase(),
      x,
      topoCores + alturaCores + 42,
      Math.max(larguraCor - 8, 1),
    )
  })

  contexto.textAlign = 'left'

  desenharRetanguloArredondado(
    contexto,
    MARGEM,
    alturaTotal - 88,
    12,
    12,
    6,
    COR_DESTAQUE,
  )

  contexto.fillStyle = COR_SECUNDARIA
  contexto.font = '20px Arial, sans-serif'
  contexto.fillText(
    'Criado com Pigment',
    MARGEM + 25,
    alturaTotal - 77,
  )

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((resultado) => {
      if (resultado) {
        resolve(resultado)
      } else {
        reject(new Error('Não foi possível gerar o arquivo PNG.'))
      }
    }, 'image/png')
  })

  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')

  try {
    link.href = url
    link.download = `${nomeArquivoSeguro(paleta.nome)}.png`
    document.body.appendChild(link)
    link.click()
  } finally {
    link.remove()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }
}