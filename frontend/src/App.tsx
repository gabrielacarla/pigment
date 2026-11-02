import { useEffect, useState } from 'react'
import { listarPaletas, type Paleta } from './services/paletaService'

function App() {
  const [paletas, setPaletas] = useState<Paleta[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState<string | null>(null)

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

  return (
    <div className="min-h-screen bg-[#F7F5F0] text-[#25241F]">
      <header className="border-b border-[#E5E1D8]">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6 md:px-10">
          <a href="/" className="text-2xl font-semibold tracking-tight">
            pigment<span className="text-[#D1495B]">.</span>
          </a>

          <div className="flex items-center gap-8 text-sm">
            <a href="#explorar" className="hover:text-[#D1495B]">
              Explorar
            </a>
            <a href="#sobre" className="hover:text-[#D1495B]">
              Sobre
            </a>
          </div>
        </nav>
      </header>

      <main>
        <section className="mx-auto grid max-w-7xl items-center gap-14 px-6 py-24 md:grid-cols-2 md:px-10 md:py-36">
          <div>
            <span className="text-xs font-medium uppercase tracking-[0.25em] text-[#8A8177]">
              Um espaço para criar
            </span>

            <h1 className="mt-6 max-w-xl text-5xl font-medium leading-[1.08] tracking-tight md:text-7xl">
              Toda ideia começa com uma{' '}
              <span className="font-serif italic text-[#D1495B]">
                cor.
              </span>
            </h1>

            <p className="mt-8 max-w-md text-lg leading-relaxed text-[#716C63]">
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
            className="grid h-[420px] grid-cols-5 overflow-hidden rounded-2xl md:h-[520px]"
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
          className="border-t border-[#E5E1D8] bg-[#F0EDE6] px-6 py-24 md:px-10"
        >
          <div className="mx-auto max-w-7xl">
            <span className="text-xs font-medium uppercase tracking-[0.25em] text-[#8A8177]">
              Sua coleção
            </span>

            <h2 className="mt-4 text-4xl font-medium tracking-tight">
              Paletas para explorar.
            </h2>

            <p className="mt-4 max-w-lg leading-relaxed text-[#716C63]">
              Um lugar para reunir combinações de cores e encontrar
              inspiração sempre que precisar.
            </p>

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
            ) : (
              <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {paletas.map((paleta) => (
                  <article
                    key={paleta.id}
                    className="overflow-hidden rounded-2xl bg-[#F7F5F0]"
                  >
                    <div className="flex h-44">
                      {paleta.cores.map((cor, indice) => (
                        <div
                          key={`${paleta.id}-${indice}`}
                          className="flex-1"
                          style={{ backgroundColor: cor }}
                          title={cor}
                        />
                      ))}
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

                      <p className="mt-5 text-xs text-[#8A8177]">
                        {paleta.cores.length}{' '}
                        {paleta.cores.length === 1 ? 'cor' : 'cores'}
                      </p>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>

        <section id="sobre" className="px-6 py-20 md:px-10">
          <div className="mx-auto max-w-7xl">
            <p className="max-w-2xl text-2xl leading-relaxed tracking-tight md:text-3xl">
              Pigment é um espaço para experimentar, organizar e
              descobrir novas possibilidades através das cores.
            </p>
          </div>
        </section>
      </main>

      <footer className="border-t border-[#E5E1D8] px-6 py-8 md:px-10">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <span className="font-semibold tracking-tight">
            pigment.
          </span>

          <span className="text-xs text-[#8A8177]">
            Feito para explorar cores.
          </span>
        </div>
      </footer>
    </div>
  )
}

export default App