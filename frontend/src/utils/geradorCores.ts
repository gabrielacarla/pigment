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

function gerarComplementar(): string[] {
  const matiz = numeroAleatorio(360)
  const oposta = normalizarMatiz(matiz + 180)

  return [
    hslParaHex(matiz, 70, 35),
    hslParaHex(matiz, 65, 50),
    hslParaHex(matiz, 55, 70),
    hslParaHex(oposta, 70, 45),
    hslParaHex(oposta, 65, 65),
  ]
}

function gerarAnaloga(): string[] {
  const matiz = numeroAleatorio(360)

  return [
    hslParaHex(matiz - 40, 60, 45),
    hslParaHex(matiz - 20, 65, 55),
    hslParaHex(matiz, 70, 50),
    hslParaHex(matiz + 20, 65, 60),
    hslParaHex(matiz + 40, 55, 70),
  ]
}

function gerarMonocromatica(): string[] {
  const matiz = numeroAleatorio(360)
  const saturacao = 45 + numeroAleatorio(36)

  return [
    hslParaHex(matiz, saturacao, 25),
    hslParaHex(matiz, saturacao, 38),
    hslParaHex(matiz, saturacao, 50),
    hslParaHex(matiz, saturacao, 65),
    hslParaHex(matiz, saturacao, 80),
  ]
}

export function gerarPaleta(tipo: TipoHarmonia): string[] {
  switch (tipo) {
    case 'complementar':
      return gerarComplementar()

    case 'analoga':
      return gerarAnaloga()

    case 'monocromatica':
      return gerarMonocromatica()

    case 'aleatoria':
      return gerarAleatoria()
  }
}