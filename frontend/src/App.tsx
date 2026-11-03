import { useEffect, useRef, useState } from 'react'
import FormularioPaleta from './components/FormularioPaleta'
import { exportarPaletaPNG } from './utils/exportarPaleta'
import { baixarPaletaCSS, gerarCSSPaleta } from './utils/exportarCSS'
import {
  alternarFavorita,
  excluirPaleta,
  listarPaletas,
  type Paleta,
} from './services/paletaService'

function normalizarTexto(texto: string) {
  return texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
}

function App() {
  const [paletas, setPaletas] = useState<Paleta[]>([])
  const [pesquisa, setPesquisa] = useState('')
  const [somenteFavoritas, setSomenteFavoritas] = useState(false)
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState<string | null>(null)
  const [paletaEmEdicao, setPaletaEmEdicao] = useState<Paleta | null>(null)
  const [paletaParaExcluir, setPaletaParaExcluir] = useState<Paleta | null>(null)
  const [excluindo, setExcluindo] = useState(false)
  const [erroExclusao, setErroExclusao] = useState<string | null>(null)
  const [corCopiada, setCorCopiada] = useState<string | null>(null)
  const [erroCopia, setErroCopia] = useState<string | null>(null)
  const [erroFavorito, setErroFavorito] = useState<string | null>(null)
  const [erroExportacao, setErroExportacao] = useState<string | null>(null)
  const [cssCopiado, setCssCopiado] = useState<string | null>(null)
  const [paletaExportando, setPaletaExportando] = useState<string | null>(null)
  const [favoritoEmAtualizacao, setFavoritoEmAtualizacao] = useState<string | null>(null)

  const formularioRef = useRef<HTMLDivElement>(null)
  const temporizadorCopiaRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const temporizadorCSSRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const favoritoEmAtualizacaoRef = useRef<string | null>(null)

  const paletasFiltradas = paletas.filter((paleta) => {
    const correspondePesquisa = normalizarTexto(paleta.nome).includes(
      normalizarTexto(pesquisa.trim()),
    )

    return correspondePesquisa && (!somenteFavoritas || paleta.favorita)
  })

  function salvarPaleta(paleta: Paleta) {
    if (paletaEmEdicao) {
      setPaletas((anteriores) =>
        anteriores.map((atual) =>
          atual.id === paleta.id ? paleta : atual,
        ),
      )

      setPaletaEmEdicao(null)
    } else {
      setPaletas((anteriores) => [paleta, ...anteriores])
    }
  }

  function editarPaleta(paleta: Paleta) {
    setPaletaEmEdicao(paleta)

    formularioRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    })
  }

  function cancelarEdicao() {
    setPaletaEmEdicao(null)
  }

  function solicitarExclusao(paleta: Paleta) {
    setPaletaParaExcluir(paleta)
    setErroExclusao(null)
  }

  function cancelarExclusao() {
    if (excluindo) return

    setPaletaParaExcluir(null)
    setErroExclusao(null)
  }

  async function confirmarExclusao() {
    if (!paletaParaExcluir || excluindo) return

    const id = paletaParaExcluir.id

    setExcluindo(true)
    setErroExclusao(null)

    try {
      await excluirPaleta(id)

      setPaletas((anteriores) =>
        anteriores.filter((paleta) => paleta.id !== id),
      )

      if (paletaEmEdicao?.id === id) {
        setPaletaEmEdicao(null)
      }

      setPaletaParaExcluir(null)
    } catch {
      setErroExclusao(
        'Não foi possível excluir a paleta. Tente novamente.',
      )
    } finally {
      setExcluindo(false)
    }
  }

  async function atualizarFavorito(id: string) {
    if (favoritoEmAtualizacaoRef.current !== null) return

    favoritoEmAtualizacaoRef.current = id
    setFavoritoEmAtualizacao(id)
    setErroFavorito(null)

    try {
      const paletaAtualizada = await alternarFavorita(id)

      setPaletas((anteriores) =>
        anteriores.map((paleta) =>
          paleta.id === id ? paletaAtualizada : paleta,
        ),
      )

      setPaletaEmEdicao((atual) =>
        atual?.id === id ? paletaAtualizada : atual,
      )
    } catch {
      setErroFavorito(
        'Não foi possível atualizar o favorito. Tente novamente.',
      )
    } finally {
      favoritoEmAtualizacaoRef.current = null
      setFavoritoEmAtualizacao(null)
    }
  }

  async function baixarPaleta(paleta: Paleta) {
    if (paletaExportando !== null) return

    setErroExportacao(null)
    setPaletaExportando(paleta.id)

    try {
      await exportarPaletaPNG(paleta)
    } catch {
      setErroExportacao(
        'Não foi possível baixar a imagem PNG. Tente novamente.',
      )
    } finally {
      setPaletaExportando(null)
    }
  }

  async function copiarCSS(paleta: Paleta) {
    try {
      await navigator.clipboard.writeText(gerarCSSPaleta(paleta))
      setErroExportacao(null)
      setCssCopiado(paleta.id)

      if (temporizadorCSSRef.current !== null) {
        clearTimeout(temporizadorCSSRef.current)
      }

      temporizadorCSSRef.current = setTimeout(() => {
        setCssCopiado(null)
        temporizadorCSSRef.current = null
      }, 2000)
    } catch {
      setErroExportacao(
        'Não foi possível copiar o CSS. Verifique a permissão do navegador.',
      )
    }
  }

  function baixarCSS(paleta: Paleta) {
    try {
      baixarPaletaCSS(paleta)
      setErroExportacao(null)
    } catch {
      setErroExportacao('Não foi possível baixar o arquivo CSS. Tente novamente.')
    }
  }

  async function copiarCor(cor: string, identificador: string) {
    try {
      await navigator.clipboard.writeText(cor)

      if (temporizadorCopiaRef.current !== null) {
        clearTimeout(temporizadorCopiaRef.current)
      }

      setCorCopiada(identificador)
      setErroCopia(null)

      temporizadorCopiaRef.current = setTimeout(() => {
        setCorCopiada(null)
        temporizadorCopiaRef.current = null
      }, 2000)
    } catch {
      setErroCopia(
        'Não foi possível copiar a cor. Verifique a permissão do navegador.',
      )
    }
  }

  useEffect(() => {
    let ativo = true

    async function carregarPaletas() {
      try {
        const dados = await listarPaletas()

        if (ativo) {
          setPaletas(dados)
        }
      } catch {
        if (ativo) {
          setErro('Não foi possível carregar as paletas.')
        }
      } finally {
        if (ativo) {
          setCarregando(false)
        }
      }
    }

    carregarPaletas()

    return () => {
      ativo = false
    }
  }, [])

  useEffect(() => {
    return () => {
      if (temporizadorCopiaRef.current !== null) {
        clearTimeout(temporizadorCopiaRef.current)
      }
      if (temporizadorCSSRef.current !== null) {
        clearTimeout(temporizadorCSSRef.current)
      }
    }
  }, [])

  return (
    <div className="min-h-screen min-w-0 bg-[#F7F5F0] text-[#25241F]">
      <header className="border-b border-[#E5E1D8]">
        <nav className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-5 sm:px-6 md:px-10 md:py-6">
          <a href="/" className="text-2xl font-semibold tracking-tight">
            pigment<span className="text-[#D1495B]">.</span>
          </a>

          <div className="flex flex-wrap items-center gap-4 text-sm sm:gap-8">
            <a
              href="#explorar"
              className="transition-colors hover:text-[#D1495B]"
            >
              Explorar
            </a>

            <a
              href="#sobre"
              className="transition-colors hover:text-[#D1495B]"
            >
              Sobre
            </a>
          </div>
        </nav>
      </header>

      <main>
        <section className="mx-auto grid w-full max-w-7xl min-w-0 grid-cols-1 items-center gap-10 px-4 py-16 sm:px-6 sm:py-20 md:grid-cols-2 md:gap-14 md:px-10 md:py-36">
          <div className="min-w-0">
            <span className="block max-w-full text-[11px] font-medium uppercase tracking-[0.15em] text-[#8A8177] sm:text-xs sm:tracking-[0.25em]">
              Um espaço para criar
            </span>

            <h1 className="mt-6 max-w-xl text-[clamp(2.4rem,10vw,4rem)] font-medium leading-[1.1] tracking-tight [overflow-wrap:break-word] md:text-6xl lg:text-7xl">
              Toda ideia começa com uma{' '}
              <span className="font-serif italic text-[#D1495B]">
                cor.
              </span>
            </h1>

            <p className="mt-8 max-w-md text-base leading-relaxed text-[#716C63] sm:text-lg">
              Crie paletas, descubra combinações e guarde as cores que
              inspiram suas próximas ideias.
            </p>

            <a
              href="#explorar"
              className="mt-10 inline-flex items-center gap-3 rounded-full bg-[#25241F] px-7 py-4 text-sm font-medium text-white transition-colors hover:bg-[#D1495B]"
            >
              Explorar paletas
              <span aria-hidden="true">↗</span>
            </a>
          </div>

          <div
            className="grid h-64 min-w-0 grid-cols-5 overflow-hidden rounded-2xl sm:h-[360px] md:h-[520px]"
            aria-label="Composição de cinco cores"
          >
            <div className="bg-[#D1495B]" />
            <div className="bg-[#E7A977]" />
            <div className="bg-[#F0D8A8]" />
            <div className="bg-[#A7B5A0]" />
            <div className="bg-[#677C83]" />
          </div>
        </section>

        <section
          id="explorar"
          className="border-t border-[#E5E1D8] bg-[#F0EDE6] px-4 py-16 sm:px-6 sm:py-20 md:px-10 md:py-24"
        >
          <div className="mx-auto w-full max-w-7xl min-w-0">
            <span className="text-xs font-medium uppercase tracking-[0.25em] text-[#8A8177]">
              Sua coleção
            </span>

            <h2 className="mt-4 text-3xl font-medium tracking-tight sm:text-4xl">
              Paletas para explorar.
            </h2>

            <p className="mt-4 max-w-lg leading-relaxed text-[#716C63]">
              Um lugar para reunir combinações de cores e encontrar
              inspiração sempre que precisar.
            </p>

            <div ref={formularioRef} className="mt-12 scroll-mt-8">
              <FormularioPaleta
                key={paletaEmEdicao?.id ?? 'nova'}
                aoSalvar={salvarPaleta}
                paletaEmEdicao={paletaEmEdicao}
                aoCancelar={cancelarEdicao}
              />
            </div>

            <div className="mt-12">
              <label
                htmlFor="pesquisa-paletas"
                className="mb-3 block text-sm font-medium"
              >
                Buscar paletas
              </label>

              <input
                id="pesquisa-paletas"
                type="search"
                value={pesquisa}
                onChange={(evento) =>
                  setPesquisa(evento.target.value)
                }
                placeholder="Pesquise pelo nome da paleta..."
                className="w-full rounded-xl border border-[#DCD7CD] bg-[#F7F5F0] px-5 py-4 text-sm outline-none transition-colors placeholder:text-[#8A8177] focus:border-[#D1495B]"
              />

              <label className="mt-5 inline-flex cursor-pointer items-center gap-3 text-sm font-medium">
                <input
                  type="checkbox"
                  checked={somenteFavoritas}
                  onChange={(evento) =>
                    setSomenteFavoritas(evento.target.checked)
                  }
                  className="h-4 w-4 cursor-pointer accent-[#D1495B]"
                />
                Somente favoritas
              </label>
            </div>

            {erroFavorito && (
              <p role="alert" className="mt-6 text-sm text-[#D1495B]">
                {erroFavorito}
              </p>
            )}

            {erroCopia && (
              <p role="alert" className="mt-6 text-sm text-[#D1495B]">
                {erroCopia}
              </p>
            )}

            {erroExportacao && (
              <p role="alert" className="mt-6 text-sm text-[#D1495B]">
                {erroExportacao}
              </p>
            )}

            {carregando ? (
              <p className="mt-12 text-[#716C63]">
                Carregando paletas...
              </p>
            ) : erro ? (
              <p role="alert" className="mt-12 text-[#D1495B]">
                {erro}
              </p>
            ) : paletas.length === 0 ? (
              <div className="mt-12 rounded-2xl border border-dashed border-[#CBC5BA] px-6 py-16 text-center">
                <p className="text-[#716C63]">
                  Nenhuma paleta cadastrada ainda.
                </p>
              </div>
            ) : paletasFiltradas.length === 0 ? (
              <div className="mt-12 rounded-2xl border border-dashed border-[#CBC5BA] px-6 py-16 text-center">
                <p className="text-[#716C63]">
                  {somenteFavoritas
                    ? 'Nenhuma paleta favorita encontrada.'
                    : `Nenhuma paleta encontrada para "${pesquisa}".`}
                </p>
              </div>
            ) : (
              <div className="mt-12 grid min-w-0 grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {paletasFiltradas.map((paleta) => (
                  <article
                    key={paleta.id}
                    className="min-w-0 overflow-hidden rounded-2xl bg-[#F7F5F0]"
                  >
                    <div className="relative">
                      <div className="flex h-44">
                        {paleta.cores.map((cor, indice) => {
                          const identificador = `${paleta.id}-${indice}`
                          const copiada = corCopiada === identificador

                          return (
                            <button
                              key={identificador}
                              type="button"
                              onClick={() =>
                                copiarCor(cor, identificador)
                              }
                              title={`Copiar ${cor}`}
                              aria-label={`Copiar cor ${cor}`}
                              className="group relative flex min-w-0 flex-1 cursor-pointer items-center justify-center overflow-hidden focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-white"
                              style={{ backgroundColor: cor }}
                            >
                              <span
                                className={`rounded-full bg-[#25241F]/80 px-3 py-2 text-xs font-medium text-white shadow-sm transition-opacity ${
                                  copiada
                                    ? 'opacity-100'
                                    : 'opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100'
                                }`}
                              >
                                {copiada
                                  ? 'Copiado!'
                                  : cor.toUpperCase()}
                              </span>
                            </button>
                          )
                        })}
                      </div>

                      <button
                        type="button"
                        onClick={() => atualizarFavorito(paleta.id)}
                        disabled={favoritoEmAtualizacao !== null}
                        aria-label={
                          paleta.favorita
                            ? `Desfavoritar ${paleta.nome}`
                            : `Favoritar ${paleta.nome}`
                        }
                        aria-pressed={paleta.favorita}
                        title={
                          paleta.favorita
                            ? 'Remover dos favoritos'
                            : 'Adicionar aos favoritos'
                        }
                        className="absolute right-4 top-4 z-10 flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-[#F7F5F0] text-[#D1495B] shadow-md transition-transform hover:scale-105 disabled:cursor-wait disabled:opacity-60"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="22"
                          height="22"
                          viewBox="0 0 24 24"
                          fill={paleta.favorita ? 'currentColor' : 'none'}
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78Z" />
                        </svg>
                      </button>
                    </div>

                    <div className="p-6">
                      <h3 className="text-xl font-medium">
                        {paleta.nome}
                      </h3>

                      {paleta.descricao && (
                        <p className="mt-2 text-sm leading-relaxed text-[#716C63]">
                          {paleta.descricao}
                        </p>
                      )}

                      <div className="mt-5">
                        <button
                          type="button"
                          onClick={() => baixarPaleta(paleta)}
                          disabled={paletaExportando !== null}
                          aria-label={`Baixar paleta ${paleta.nome} como PNG`}
                          className="w-full cursor-pointer rounded-full border border-[#D1495B] px-4 py-2.5 text-sm font-medium text-[#D1495B] transition-colors hover:bg-[#D1495B] hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {paletaExportando === paleta.id
                            ? 'Preparando PNG...'
                            : 'Baixar PNG'}
                        </button>
                      </div>

                      <div className="mt-3 grid grid-cols-1 gap-3 min-[350px]:grid-cols-2">
                        <button
                          type="button"
                          onClick={() => copiarCSS(paleta)}
                          aria-label={`Copiar CSS da paleta ${paleta.nome}`}
                          className="cursor-pointer rounded-full border border-[#DCD7CD] px-3 py-2.5 text-sm font-medium transition-colors hover:border-[#D1495B] hover:text-[#D1495B]"
                        >
                          {cssCopiado === paleta.id ? 'CSS copiado!' : 'Copiar CSS'}
                        </button>

                        <button
                          type="button"
                          onClick={() => baixarCSS(paleta)}
                          aria-label={`Baixar CSS da paleta ${paleta.nome}`}
                          className="cursor-pointer rounded-full border border-[#DCD7CD] px-3 py-2.5 text-sm font-medium transition-colors hover:border-[#D1495B] hover:text-[#D1495B]"
                        >
                          Baixar CSS
                        </button>
                      </div>

                      <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
                        <p className="text-xs text-[#8A8177]">
                          {paleta.cores.length}{' '}
                          {paleta.cores.length === 1
                            ? 'cor'
                            : 'cores'}
                        </p>

                        <div className="flex items-center gap-4">
                          <button
                            type="button"
                            onClick={() => editarPaleta(paleta)}
                            className="cursor-pointer text-sm font-medium text-[#D1495B] transition-colors hover:text-[#A73545]"
                          >
                            Editar
                          </button>

                          <button
                            type="button"
                            onClick={() => solicitarExclusao(paleta)}
                            className="cursor-pointer text-sm font-medium text-[#8A8177] transition-colors hover:text-[#D1495B]"
                          >
                            Excluir
                          </button>
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>

        <section id="sobre" className="px-4 py-16 sm:px-6 md:px-10 md:py-20">
          <div className="mx-auto w-full max-w-7xl min-w-0">
            <p className="max-w-2xl text-2xl leading-relaxed tracking-tight md:text-3xl">
              Pigment é um espaço para experimentar, organizar e
              descobrir novas possibilidades através das cores.
            </p>
          </div>
        </section>
      </main>

      <footer className="border-t border-[#E5E1D8] px-4 py-8 sm:px-6 md:px-10">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3">
          <span className="font-semibold tracking-tight">
            pigment.
          </span>

          <span className="text-xs text-[#8A8177]">
            Feito para explorar cores.
          </span>
        </div>
      </footer>

      {paletaParaExcluir && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-6">
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="titulo-exclusao"
            aria-describedby="descricao-exclusao"
            className="w-full max-w-md rounded-2xl bg-[#F7F5F0] p-8 shadow-xl"
          >
            <h2
              id="titulo-exclusao"
              className="text-2xl font-medium tracking-tight"
            >
              Excluir paleta?
            </h2>

            <p
              id="descricao-exclusao"
              className="mt-4 leading-relaxed text-[#716C63]"
            >
              Tem certeza de que deseja excluir a paleta{' '}
              <strong className="text-[#25241F]">
                {paletaParaExcluir.nome}
              </strong>
              ? Essa ação não poderá ser desfeita.
            </p>

            {erroExclusao && (
              <p role="alert" className="mt-4 text-sm text-[#D1495B]">
                {erroExclusao}
              </p>
            )}

            <div className="mt-8 flex flex-wrap justify-end gap-3">
              <button
                type="button"
                onClick={cancelarExclusao}
                disabled={excluindo}
                className="cursor-pointer rounded-full border border-[#DCD7CD] px-6 py-3 text-sm font-medium transition-colors hover:bg-[#EAE5DB] disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={confirmarExclusao}
                disabled={excluindo}
                className="cursor-pointer rounded-full bg-[#D1495B] px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-[#A73545] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {excluindo ? 'Excluindo...' : 'Excluir paleta'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App