import { motion } from 'framer-motion';

export default function AlgorithmTabs({ tabs, activeTab, setActiveTab }) {
  return (
    <div className="flex gap-1 bg-surface border border-border rounded-xl p-1 overflow-x-auto">
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`relative flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-mono whitespace-nowrap transition-colors flex-1 justify-center ${
            activeTab === tab.id ? 'text-bg' : 'text-muted hover:text-white'
          }`}
        >
          {activeTab === tab.id && (
            <motion.div
              layoutId="tab-bg"
              className="absolute inset-0 bg-accent rounded-lg"
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            />
          )}
          <span className="relative z-10">{tab.icon}</span>
          <span className="relative z-10 hidden sm:inline">{tab.label}</span>
        </button>
      ))}
    </div>
  );
}
