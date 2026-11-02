export type TipoHarmonia =
  | 'aleatoria'
  | 'complementar'
  | 'analoga'
  | 'monocromatica'

export const tiposHarmonia: {
  valor: TipoHarmonia
  nome: string
}[] = [
  { valor: 'aleatoria', nome: 'Aleatória' },
  { valor: 'complementar', nome: 'Complementar' },
  { valor: 'analoga', nome: 'Análoga' },
  { valor: 'monocromatica', nome: 'Monocromática' },
]

interface CorHSL {
  matiz: number
  saturacao: number
  luminosidade: number
}

export function hexValido(valor: string): boolean {
  return /^#[0-9a-fA-F]{6}$/.test(valor)
}

function numeroAleatorio(maximo: number): number {
  const valores = new Uint32Array(1)
  crypto.getRandomValues(valores)

  return Math.floor((valores[0] / 4294967296) * maximo)
}

function limitar(valor: number, minimo: number, maximo: number) {
  return Math.min(maximo, Math.max(minimo, valor))
}

function normalizarMatiz(matiz: number) {
  return ((matiz % 360) + 360) % 360
}

function hslParaHex(
  matiz: number,
  saturacao: number,
  luminosidade: number,
): string {
  const h = normalizarMatiz(matiz)
  const s = limitar(saturacao, 0, 100) / 100
  const l = limitar(luminosidade, 0, 100) / 100

  const c = (1 - Math.abs(2 * l - 1)) * s
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1))
  const m = l - c / 2

  let r = 0
  let g = 0
  let b = 0

  if (h < 60) {
    r = c
    g = x
  } else if (h < 120) {
    r = x
    g = c
  } else if (h < 180) {
    g = c
    b = x
  } else if (h < 240) {
    g = x
    b = c
  } else if (h < 300) {
    r = x
    b = c
  } else {
    r = c
    b = x
  }

  const converter = (canal: number) =>
    Math.round((canal + m) * 255)
      .toString(16)
      .padStart(2, '0')
      .toUpperCase()

  return `#${converter(r)}${converter(g)}${converter(b)}`
}

function hexParaHsl(hex: string): CorHSL {
  if (!hexValido(hex)) {
    throw new Error('Código HEX inválido.')
  }

  const r = parseInt(hex.slice(1, 3), 16) / 255
  const g = parseInt(hex.slice(3, 5), 16) / 255
  const b = parseInt(hex.slice(5, 7), 16) / 255

  const maximo = Math.max(r, g, b)
  const minimo = Math.min(r, g, b)
  const diferenca = maximo - minimo

  let matiz = 0
  let saturacao = 0

  const luminosidade = (maximo + minimo) / 2

  if (diferenca !== 0) {
    saturacao =
      diferenca / (1 - Math.abs(2 * luminosidade - 1))

    switch (maximo) {
      case r:
        matiz = ((g - b) / diferenca) % 6
        break

      case g:
        matiz = (b - r) / diferenca + 2
        break

      default:
        matiz = (r - g) / diferenca + 4
    }

    matiz *= 60
  }

  return {
    matiz: normalizarMatiz(matiz),
    saturacao: saturacao * 100,
    luminosidade: luminosidade * 100,
  }
}

function gerarCorAleatoria(): string {
  const valores = new Uint8Array(3)
  crypto.getRandomValues(valores)

  return (
    '#' +
    Array.from(valores, (valor) =>
      valor.toString(16).padStart(2, '0'),
    )
      .join('')
      .toUpperCase()
  )
}

function gerarAleatoria(): string[] {
  const cores = new Set<string>()

  while (cores.size < 5) {
    cores.add(gerarCorAleatoria())
  }

  return Array.from(cores)
}

function obterCorBase(corBase?: string): CorHSL {
  if (corBase !== undefined) {
    return hexParaHsl(corBase)
  }

  return {
    matiz: numeroAleatorio(360),
    saturacao: 45 + numeroAleatorio(36),
    luminosidade: 50,
  }
}

function gerarComplementar(corBase?: string): string[] {
  const { matiz, saturacao, luminosidade } =
    obterCorBase(corBase)

  const oposta = normalizarMatiz(matiz + 180)

  return [
    hslParaHex(matiz, saturacao, limitar(luminosidade - 20, 10, 90)),
    hslParaHex(matiz, saturacao, limitar(luminosidade - 10, 10, 90)),
    corBase ? corBase.toUpperCase() : hslParaHex(matiz, saturacao, luminosidade),
    hslParaHex(oposta, saturacao, limitar(luminosidade - 5, 10, 90)),
    hslParaHex(oposta, saturacao, limitar(luminosidade + 15, 10, 90)),
  ]
}

function gerarAnaloga(corBase?: string): string[] {
  const { matiz, saturacao, luminosidade } =
    obterCorBase(corBase)

  return [
    hslParaHex(matiz - 40, saturacao, luminosidade),
    hslParaHex(matiz - 20, saturacao, luminosidade),
    corBase ? corBase.toUpperCase() : hslParaHex(matiz, saturacao, luminosidade),
    hslParaHex(matiz + 20, saturacao, luminosidade),
    hslParaHex(matiz + 40, saturacao, luminosidade),
  ]
}

function gerarMonocromatica(corBase?: string): string[] {
  const { matiz, saturacao, luminosidade } =
    obterCorBase(corBase)

  return [
    hslParaHex(matiz, saturacao, limitar(luminosidade - 30, 5, 95)),
    hslParaHex(matiz, saturacao, limitar(luminosidade - 15, 5, 95)),
    corBase ? corBase.toUpperCase() : hslParaHex(matiz, saturacao, luminosidade),
    hslParaHex(matiz, saturacao, limitar(luminosidade + 15, 5, 95)),
    hslParaHex(matiz, saturacao, limitar(luminosidade + 30, 5, 95)),
  ]
}

export function gerarPaleta(
  tipo: TipoHarmonia,
  corBase?: string,
): string[] {
  if (corBase !== undefined && !hexValido(corBase)) {
    throw new Error('Informe uma cor-base válida no formato #RRGGBB.')
  }

  switch (tipo) {
    case 'complementar':
      return gerarComplementar(corBase)

    case 'analoga':
      return gerarAnaloga(corBase)

    case 'monocromatica':
      return gerarMonocromatica(corBase)

    case 'aleatoria':
      return gerarAleatoria()
  }
}