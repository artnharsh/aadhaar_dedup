export default function PlaybackControls({ playback, label }) {
  const { playing, play, pause, reset, stepBack, stepForward, currentStep, totalSteps, speed, setSpeed, progress } = playback;

  return (
    <div className="bg-black/30 border border-border rounded-xl p-4 space-y-3">
      {/* Progress bar */}
      <div className="relative">
        <div className="w-full h-1.5 bg-border rounded-full overflow-hidden">
          <div
            className="h-full bg-accent rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <input
          type="range"
          min={0}
          max={totalSteps - 1}
          value={currentStep}
          onChange={e => playback.setCurrentStep(Number(e.target.value))}
          className="absolute inset-0 w-full opacity-0 cursor-pointer"
        />
      </div>

      <div className="flex items-center justify-between">
        {/* Controls */}
        <div className="flex items-center gap-2">
          <button onClick={reset} className="w-7 h-7 rounded border border-border hover:border-accent/50 text-muted hover:text-accent transition-colors flex items-center justify-center text-xs font-mono">
            ⟲
          </button>
          <button onClick={stepBack} disabled={currentStep === 0} className="w-7 h-7 rounded border border-border hover:border-accent/50 text-muted hover:text-accent transition-colors flex items-center justify-center text-xs disabled:opacity-30">
            ◀
          </button>
          <button
            onClick={playing ? pause : play}
            disabled={totalSteps === 0}
            className={`w-8 h-8 rounded font-mono text-sm transition-all flex items-center justify-center ${
              playing ? 'bg-accent/20 border border-accent text-accent' : 'bg-accent text-bg hover:bg-accent/90'
            } disabled:opacity-30`}
          >
            {playing ? '⏸' : '▶'}
          </button>
          <button onClick={stepForward} disabled={currentStep >= totalSteps - 1} className="w-7 h-7 rounded border border-border hover:border-accent/50 text-muted hover:text-accent transition-colors flex items-center justify-center text-xs disabled:opacity-30">
            ▶
          </button>
        </div>

        {/* Step counter */}
        <div className="font-mono text-xs text-muted">
          <span className="text-white">{currentStep + 1}</span>/{totalSteps || 1} steps
        </div>

        {/* Speed */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted font-mono">Speed:</span>
          {[0.5, 1, 2, 4].map(s => (
            <button
              key={s}
              onClick={() => setSpeed(s)}
              className={`px-2 py-0.5 rounded text-xs font-mono transition-colors ${
                speed === s ? 'bg-accent/20 text-accent border border-accent/50' : 'text-muted hover:text-white border border-transparent'
              }`}
            >
              {s}×
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
