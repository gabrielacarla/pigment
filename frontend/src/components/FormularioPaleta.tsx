import { useState, type FormEvent } from 'react'
import {
  criarPaleta,
  type Paleta,
} from '../services/paletaService'

interface FormularioPaletaProps {
  aoCriar: (paleta: Paleta) => void
}

function FormularioPaleta({ aoCriar }: FormularioPaletaProps) {
  const [nome, setNome] = useState('')
  const [descricao, setDescricao] = useState('')
  const [cores, setCores] = useState([
    '#D1495B',
    '#EDAE49',
    '#F4E285',
  ])
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

  async function salvar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    setErro(null)

    if (!nome.trim()) {
      setErro('Informe um nome para a paleta.')
      return
    }

    setSalvando(true)

    try {
      const paleta = await criarPaleta({
        nome: nome.trim(),
        descricao: descricao.trim(),
        cores,
      })

      aoCriar(paleta)
      setNome('')
      setDescricao('')
      setCores(['#D1495B', '#EDAE49', '#F4E285'])
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
          Criar paleta
        </h3>
        <p className="mt-2 text-sm text-[#716C63]">
          Escolha as cores e dê um nome à sua combinação.
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
            className="w-full resize-none rounded-xl border border-[#DCD7CD] bg-white px-4 py-3 outline-none focus:border-[#D1495B]"
          />
        </label>

        <div>
          <p className="mb-3 text-sm">Cores</p>

          <div className="flex h-20 overflow-hidden rounded-xl">
            {cores.map((cor, indice) => (
              <div
                key={indice}
                className="flex-1"
                style={{ backgroundColor: cor }}
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
                  value={cor}
                  onChange={(evento) =>
                    alterarCor(indice, evento.target.value)
                  }
                  aria-label={`Selecionar cor ${indice + 1}`}
                  className="h-10 w-12 cursor-pointer"
                />

                <span className="flex-1 text-sm uppercase">
                  {cor}
                </span>

                <button
                  type="button"
                  onClick={() => removerCor(indice)}
                  disabled={cores.length === 1}
                  aria-label={`Remover cor ${indice + 1}`}
                  className="cursor-pointer text-[#8A8177] hover:text-[#D1495B] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Remover
                </button>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={adicionarCor}
            disabled={cores.length >= 8}
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

      <button
        type="submit"
        disabled={salvando}
        className="mt-8 rounded-full bg-[#25241F] px-7 py-3 text-sm font-medium text-white transition-colors hover:bg-[#D1495B] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {salvando ? 'Salvando...' : 'Salvar paleta'}
      </button>
    </form>
  )
}

export default FormularioPaleta