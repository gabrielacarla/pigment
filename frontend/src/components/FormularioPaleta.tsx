import { useState, type FormEvent } from 'react'
import {
  atualizarPaleta,
  criarPaleta,
  type NovaPaleta,
  type Paleta,
} from '../services/paletaService'

interface FormularioPaletaProps {
  aoSalvar: (paleta: Paleta) => void
  paletaEmEdicao?: Paleta | null
  aoCancelar?: () => void
}

const coresIniciais = ['#D1495B', '#EDAE49', '#F4E285']

function hexValido(valor: string) {
  return /^#[0-9a-fA-F]{6}$/.test(valor)
}

function gerarCorAleatoria() {
  const bytes = new Uint8Array(3)
  crypto.getRandomValues(bytes)

  return (
    '#' +
    Array.from(bytes, (byte) =>
      byte.toString(16).padStart(2, '0'),
    )
      .join('')
      .toUpperCase()
  )
}

function gerarPaletaAleatoria() {
  const coresGeradas = new Set<string>()

  while (coresGeradas.size < 5) {
    coresGeradas.add(gerarCorAleatoria())
  }

  return Array.from(coresGeradas)
}

function FormularioPaleta({
  aoSalvar,
  paletaEmEdicao,
  aoCancelar,
}: FormularioPaletaProps) {
  const [nome, setNome] = useState(paletaEmEdicao?.nome ?? '')
  const [descricao, setDescricao] = useState(
    paletaEmEdicao?.descricao ?? '',
  )
  const [cores, setCores] = useState<string[]>(
    () => [...(paletaEmEdicao?.cores ?? coresIniciais)],
  )
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  function alterarCor(indice: number, valor: string) {
    setCores((anteriores) =>
      anteriores.map((cor, posicao) =>
        posicao === indice ? valor : cor,
      ),
    )
  }

  function adicionarCor() {
    if (cores.length < 8) {
      setCores((anteriores) => [...anteriores, '#A7B5A0'])
    }
  }

  function removerCor(indice: number) {
    if (cores.length > 1) {
      setCores((anteriores) =>
        anteriores.filter((_, posicao) => posicao !== indice),
      )
    }
  }

  function gerarCores() {
    setCores(gerarPaletaAleatoria())
    setErro(null)
  }

  async function salvar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    setErro(null)

    if (!nome.trim()) {
      setErro('Informe um nome para a paleta.')
      return
    }

    if (cores.some((cor) => !hexValido(cor))) {
      setErro('Confira os códigos HEX antes de salvar.')
      return
    }

    const dados: NovaPaleta = {
      nome: nome.trim(),
      descricao: descricao.trim(),
      cores: cores.map((cor) => cor.toUpperCase()),
    }

    setSalvando(true)

    try {
      const paleta = paletaEmEdicao
        ? await atualizarPaleta(paletaEmEdicao.id, dados)
        : await criarPaleta(dados)

      aoSalvar(paleta)

      if (!paletaEmEdicao) {
        setNome('')
        setDescricao('')
        setCores([...coresIniciais])
      }
    } catch {
      setErro('Não foi possível salvar a paleta. Tente novamente.')
    } finally {
      setSalvando(false)
    }
  }

  return (
    <form
      onSubmit={salvar}
      className="rounded-2xl bg-[#F7F5F0] p-6 md:p-8"
    >
      <div className="mb-8">
        <h3 className="text-2xl font-medium tracking-tight">
          {paletaEmEdicao ? 'Editar paleta' : 'Criar paleta'}
        </h3>

        <p className="mt-2 text-sm text-[#716C63]">
          {paletaEmEdicao
            ? 'Altere as informações e as cores da paleta.'
            : 'Escolha as cores, gere uma combinação aleatória e dê um nome à sua paleta.'}
        </p>
      </div>

      <div className="grid gap-5">
        <label className="grid gap-2 text-sm">
          <span>Nome da paleta</span>
          <input
            type="text"
            value={nome}
            onChange={(evento) => setNome(evento.target.value)}
            placeholder="Ex.: Jardim de inverno"
            maxLength={80}
            required
            disabled={salvando}
            className="w-full rounded-xl border border-[#DCD7CD] bg-white px-4 py-3 outline-none focus:border-[#D1495B]"
          />
        </label>

        <label className="grid gap-2 text-sm">
          <span>Descrição (opcional)</span>
          <textarea
            value={descricao}
            onChange={(evento) => setDescricao(evento.target.value)}
            placeholder="O que inspirou essa paleta?"
            rows={3}
            maxLength={300}
            disabled={salvando}
            className="w-full resize-none rounded-xl border border-[#DCD7CD] bg-white px-4 py-3 outline-none focus:border-[#D1495B]"
          />
        </label>

        <div>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm">Cores</p>

            <button
              type="button"
              onClick={gerarCores}
              disabled={salvando}
              className="cursor-pointer rounded-full border border-[#D1495B] px-5 py-2 text-sm font-medium text-[#D1495B] transition-colors hover:bg-[#D1495B] hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              Gerar cores aleatórias
            </button>
          </div>

          <div className="flex h-20 overflow-hidden rounded-xl">
            {cores.map((cor, indice) => (
              <div
                key={indice}
                className="flex-1"
                style={{
                  backgroundColor: hexValido(cor)
                    ? cor
                    : '#E5E1D8',
                }}
              />
            ))}
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {cores.map((cor, indice) => (
              <div
                key={indice}
                className="flex items-center gap-3 rounded-xl border border-[#DCD7CD] bg-white p-3"
              >
                <input
                  type="color"
                  value={hexValido(cor) ? cor : '#FFFFFF'}
                  onChange={(evento) =>
                    alterarCor(indice, evento.target.value)
                  }
                  aria-label={`Selecionar cor ${indice + 1}`}
                  disabled={salvando}
                  className="h-10 w-12 cursor-pointer"
                />

                <input
                  type="text"
                  value={cor}
                  onChange={(evento) =>
                    alterarCor(indice, evento.target.value)
                  }
                  aria-label={`Código HEX da cor ${indice + 1}`}
                  maxLength={7}
                  spellCheck={false}
                  disabled={salvando}
                  className="min-w-0 flex-1 rounded-lg border border-[#DCD7CD] px-3 py-2 font-mono text-sm uppercase outline-none focus:border-[#D1495B]"
                />

                <button
                  type="button"
                  onClick={() => removerCor(indice)}
                  disabled={cores.length === 1 || salvando}
                  aria-label={`Remover cor ${indice + 1}`}
                  className="cursor-pointer text-xs text-[#8A8177] hover:text-[#D1495B] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Remover
                </button>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={adicionarCor}
            disabled={cores.length >= 8 || salvando}
            className="mt-4 cursor-pointer text-sm font-medium text-[#D1495B] disabled:cursor-not-allowed disabled:opacity-40"
          >
            + Adicionar cor
          </button>
        </div>
      </div>

      {erro && (
        <p role="alert" className="mt-5 text-sm text-[#D1495B]">
          {erro}
        </p>
      )}

      <div className="mt-8 flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={salvando}
          className="cursor-pointer rounded-full bg-[#25241F] px-7 py-3 text-sm font-medium text-white transition-colors hover:bg-[#D1495B] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {salvando
            ? 'Salvando...'
            : paletaEmEdicao
              ? 'Salvar alterações'
              : 'Salvar paleta'}
        </button>

        {paletaEmEdicao && (
          <button
            type="button"
            onClick={aoCancelar}
            disabled={salvando}
            className="cursor-pointer rounded-full border border-[#DCD7CD] px-7 py-3 text-sm font-medium transition-colors hover:bg-[#EAE5DB] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancelar
          </button>
        )}
      </div>
    </form>
  )
}

export default FormularioPaleta