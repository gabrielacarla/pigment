import type { Paleta } from '../services/paletaService'

export function gerarCSSPaleta(paleta: Paleta): string {
  const variaveis = paleta.cores
    .map((cor, indice) => `  --pigment-${indice + 1}: ${cor.toUpperCase()};`)
    .join('\n')

  return `:root {\n${variaveis}\n}\n`
}

function nomeArquivoSeguro(nome: string): string {
  return (
    nome
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'paleta'
  )
}

export function baixarPaletaCSS(paleta: Paleta): void {
  const arquivo = new Blob([gerarCSSPaleta(paleta)], {
    type: 'text/css;charset=utf-8',
  })
  const url = URL.createObjectURL(arquivo)

  try {
    const link = document.createElement('a')
    link.href = url
    link.download = `pigment-${nomeArquivoSeguro(paleta.nome)}.css`
    document.body.appendChild(link)

    try {
      link.click()
    } finally {
      link.remove()
    }
  } finally {
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }
}
