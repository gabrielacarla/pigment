import { useState, type FormEvent } from 'react'
import {
  atualizarPaleta,
  criarPaleta,
  type NovaPaleta,
  type Paleta,
} from '../services/paletaService'
import {
  gerarPaleta,
  hexValido,
  tiposHarmonia,
  type TipoHarmonia,
} from '../utils/geradorCores'

interface FormularioPaletaProps {
  aoSalvar: (paleta: Paleta) => void
  paletaEmEdicao?: Paleta | null
  aoCancelar?: () => void
}

const coresIniciais = ['#D1495B', '#EDAE49', '#F4E285']
const corBaseInicial = '#3975B3'

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
  const [tipoHarmonia, setTipoHarmonia] =
    useState<TipoHarmonia>('aleatoria')
  const [usarCorBase, setUsarCorBase] = useState(false)
  const [corBase, setCorBase] = useState(corBaseInicial)
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
    setErro(null)

    try {
      const base =
        tipoHarmonia !== 'aleatoria' && usarCorBase
          ? corBase
          : undefined

      setCores(gerarPaleta(tipoHarmonia, base))
    } catch {
      setErro(
        'Informe uma cor-base válida no formato #RRGGBB.',
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
        setTipoHarmonia('aleatoria')
        setUsarCorBase(false)
        setCorBase(corBaseInicial)
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
      className="min-w-0 rounded-2xl bg-[#F7F5F0] p-4 sm:p-6 md:p-8"
    >
      <div className="mb-8">
        <h3 className="text-2xl font-medium tracking-tight">
          {paletaEmEdicao ? 'Editar paleta' : 'Criar paleta'}
        </h3>

        <p className="mt-2 text-sm text-[#625B52]">
          {paletaEmEdicao
            ? 'Altere as informações e as cores da paleta.'
            : 'Escolha as cores, gere combinações harmoniosas e dê um nome à sua paleta.'}
        </p>
      </div>

      <div className="grid min-w-0 gap-5">
        <label className="grid min-w-0 gap-2 text-sm">
          <span>Nome da paleta</span>
          <input
            type="text"
            value={nome}
            onChange={(evento) => setNome(evento.target.value)}
            placeholder="Ex.: Jardim de inverno"
            maxLength={80}
            required
            disabled={salvando}
            className="w-full rounded-xl border border-[#DCD7CD] bg-white px-4 py-3 outline-none focus:border-[#A73545]"
          />
        </label>

        <label className="grid min-w-0 gap-2 text-sm">
          <span>Descrição (opcional)</span>
          <textarea
            value={descricao}
            onChange={(evento) => setDescricao(evento.target.value)}
            placeholder="O que inspirou essa paleta?"
            rows={3}
            maxLength={300}
            disabled={salvando}
            className="w-full resize-none rounded-xl border border-[#DCD7CD] bg-white px-4 py-3 outline-none focus:border-[#A73545]"
          />
        </label>

        <div>
          <p className="mb-3 text-sm font-medium">Cores</p>

          <div className="mb-5 grid gap-4">
            <label className="grid min-w-0 gap-2 text-sm">
              <span>Tipo de harmonia</span>

              <select
                value={tipoHarmonia}
                onChange={(evento) =>
                  setTipoHarmonia(
                    evento.target.value as TipoHarmonia,
                  )
                }
                disabled={salvando}
                className="w-full cursor-pointer rounded-xl border border-[#DCD7CD] bg-white px-4 py-3 outline-none focus:border-[#A73545] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {tiposHarmonia.map((tipo) => (
                  <option key={tipo.valor} value={tipo.valor}>
                    {tipo.nome}
                  </option>
                ))}
              </select>
            </label>

            {tipoHarmonia !== 'aleatoria' && (
              <div className="rounded-xl border border-[#DCD7CD] bg-white p-4">
                <label className="flex cursor-pointer items-center gap-3 text-sm">
                  <input
                    type="checkbox"
                    checked={usarCorBase}
                    onChange={(evento) =>
                      setUsarCorBase(evento.target.checked)
                    }
                    disabled={salvando}
                    className="h-4 w-4 accent-[#D1495B]"
                  />

                  Usar uma cor-base personalizada
                </label>

                {usarCorBase && (
                  <div className="mt-4 flex flex-wrap items-end gap-4">
                    <label className="grid min-w-0 gap-2 text-sm">
                      <span>Selecionar cor-base</span>
                      <input
                        type="color"
                        value={
                          hexValido(corBase)
                            ? corBase
                            : corBaseInicial
                        }
                        onChange={(evento) =>
                          setCorBase(
                            evento.target.value.toUpperCase(),
                          )
                        }
                        disabled={salvando}
                        className="h-12 w-16 cursor-pointer"
                      />
                    </label>

                    <label className="grid min-w-0 flex-1 basis-40 gap-2 text-sm">
                      <span>Código HEX</span>
                      <input
                        type="text"
                        value={corBase}
                        onChange={(evento) =>
                          setCorBase(evento.target.value)
                        }
                        maxLength={7}
                        spellCheck={false}
                        disabled={salvando}
                        placeholder="#3975B3"
                        className="w-full rounded-xl border border-[#DCD7CD] px-4 py-3 font-mono uppercase outline-none focus:border-[#A73545]"
                      />
                    </label>
                  </div>
                )}
              </div>
            )}

            <button
              type="button"
              onClick={gerarCores}
              disabled={salvando}
              className="cursor-pointer rounded-xl bg-[#A73545] px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-[#A73545] disabled:cursor-not-allowed disabled:opacity-50"
            >
              Gerar paleta
            </button>
          </div>

          <div
            className="flex h-20 overflow-hidden rounded-xl"
            role="img"
            aria-label="Prévia das cores da paleta"
          >
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
                className="flex min-w-0 flex-wrap items-center gap-3 rounded-xl border border-[#DCD7CD] bg-white p-3 sm:flex-nowrap"
              >
                <input
                  type="color"
                  value={hexValido(cor) ? cor : '#FFFFFF'}
                  onChange={(evento) =>
                    alterarCor(indice, evento.target.value)
                  }
                  aria-label={`Selecionar cor ${indice + 1}`}
                  disabled={salvando}
                  className="h-11 w-12 shrink-0 cursor-pointer"
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
                  className="min-w-0 flex-1 rounded-lg border border-[#DCD7CD] px-3 py-2 font-mono text-sm uppercase outline-none focus:border-[#A73545]"
                />

                <button
                  type="button"
                  onClick={() => removerCor(indice)}
                  disabled={cores.length === 1 || salvando}
                  aria-label={`Remover cor ${indice + 1}`}
                  className="shrink-0 cursor-pointer text-xs text-[#625B52] hover:text-[#A73545] disabled:cursor-not-allowed disabled:opacity-40"
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
            className="mt-4 cursor-pointer text-sm font-medium text-[#A73545] disabled:cursor-not-allowed disabled:opacity-40"
          >
            + Adicionar cor
          </button>
        </div>
      </div>

      {erro && (
        <p role="alert" className="mt-5 text-sm text-[#A73545]">
          {erro}
        </p>
      )}

      <div className="mt-8 flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={salvando}
          className="cursor-pointer rounded-full bg-[#25241F] px-7 py-3 text-sm font-medium text-white transition-colors hover:bg-[#A73545] disabled:cursor-not-allowed disabled:opacity-50"
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
            className="cursor-pointer rounded-full border border-[#DCD7CD] px-7 py-3 text-sm font-medium transition-colors hover:bg-[#EAE5DB] disabled:opacity-50"
          >
            Cancelar
          </button>
        )}
      </div>
    </form>
  )
}

export default FormularioPaleta