function App() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F5F2EC]">
      <div className="text-center">
        <h1 className="text-6xl font-semibold tracking-tight text-[#292620]">
          Pigment
        </h1>
        <p className="mt-4 text-lg text-[#756F66]">
          Um espaço para explorar cores.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <div className="h-12 w-12 rounded-full bg-[#D1495B]" />
          <div className="h-12 w-12 rounded-full bg-[#EDAE49]" />
          <div className="h-12 w-12 rounded-full bg-[#8E9AAF]" />
        </div>
      </div>
    </main>
  )
}

export default App