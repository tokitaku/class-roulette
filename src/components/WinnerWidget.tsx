import { useEffect } from 'react'

type WinnerWidgetProps = {
    winnerName: string
    onClose: () => void
}

export const WinnerWidget = ({ winnerName, onClose }: WinnerWidgetProps) => {
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // ignore typing in inputs
            if (
                document.activeElement instanceof HTMLInputElement ||
                document.activeElement instanceof HTMLTextAreaElement ||
                document.activeElement instanceof HTMLSelectElement
            ) {
                return
            }

            if (e.key === ' ' || e.key === 'Enter' || e.key === 'Escape') {
                e.preventDefault()
                e.stopPropagation()
                onClose()
            }
        }

        // Use capture phase to make sure this fires before Controls Space handling
        window.addEventListener('keydown', handleKeyDown, { capture: true })
        return () => window.removeEventListener('keydown', handleKeyDown, { capture: true })
    }, [onClose])

    // Stop propagation for clicks to avoid triggering background buttons
    const handleClick = (e: React.MouseEvent) => {
        e.stopPropagation()
    }

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                className="flex w-full max-w-xl flex-col items-center justify-center rounded-[2rem] bg-white p-12 shadow-[0_20px_50px_rgba(8,_112,_184,_0.7)] transition-transform duration-300 ease-out transform scale-100"
                onClick={handleClick}
                style={{
                    animation: 'popIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards',
                }}
            >
                <p className="mb-6 text-2xl font-bold tracking-widest text-indigo-400 uppercase">
                    🎊 Winner 🎊
                </p>
                <h2 className="mb-12 text-center text-6xl md:text-7xl font-black text-slate-800 tracking-tight break-all">
                    {winnerName}
                </h2>
                <button
                    type="button"
                    onClick={onClose}
                    autoFocus
                    className="group flex items-center gap-3 rounded-2xl bg-indigo-600 px-12 py-5 text-2xl font-bold text-white shadow-xl transition-all hover:-translate-y-1 hover:bg-indigo-700 hover:shadow-2xl active:translate-y-0 active:shadow-md"
                >
                    <span>つぎへ</span>
                    <kbd className="hidden font-sans group-hover:bg-indigo-600 rounded-lg border border-indigo-400 bg-indigo-500 px-3 py-1.5 text-base font-medium text-white shadow-sm sm:inline-block transition-colors">
                        Space
                    </kbd>
                </button>
            </div>
            <style>{`
        @keyframes popIn {
          0% {
            opacity: 0;
            transform: scale(0.8) translateY(20px);
          }
          100% {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
      `}</style>
        </div>
    )
}
