interface LoadingFallbackProps {
  height?: string
}

export function LoadingFallback({ height = "h-24" }: LoadingFallbackProps) {
  return (
    <div className={`flex ${height} items-center justify-center bg-[#0f172a] rounded-lg border border-slate-800`}>
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent"></div>
      <span className="ml-2 text-white">Loading...</span>
    </div>
  )
}
