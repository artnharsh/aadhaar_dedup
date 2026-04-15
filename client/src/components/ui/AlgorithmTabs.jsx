import { motion } from 'framer-motion';

export default function AlgorithmTabs({ tabs, activeTab, setActiveTab }) {
  return (
    <div className="panel-card flex gap-1.5 overflow-x-auto p-2">
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`relative flex flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-xl px-3 py-3 text-xs font-mono transition-all ${
            activeTab === tab.id ? 'text-bg shadow-[0_14px_30px_rgba(99,210,231,0.2)]' : 'text-slate-400 hover:text-white'
          }`}
        >
          {activeTab === tab.id && (
            <motion.div
              layoutId="tab-bg"
              className="absolute inset-0 rounded-xl bg-gradient-to-r from-accent to-[#a7def5]"
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            />
          )}
          <span className="relative z-10 text-sm">{tab.icon}</span>
          <span className="relative z-10 hidden sm:inline">{tab.label}</span>
        </button>
      ))}
    </div>
  );
}
