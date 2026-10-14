import { useState } from 'react'

const iconBtn = "aspect-square flex-none flex items-center justify-center bg-blue-600 text-white rounded-sm hover:bg-blue-700 transition-colors cursor-pointer"

function App() {
  const [activeTab, setActiveTab] = useState('design')
  const [drawerTab, setDrawerTab] = useState(0)
  const [sheetTab, setSheetTab] = useState('basic')

  return (
    <div className="relative h-full flex flex-col overflow-hidden font-sans text-xs text-blue-900 bg-white border border-blue-200">

      <header className="h-[8%] flex gap-2 p-2 bg-blue-500">
        <button className={iconBtn}>
          <span className="material-symbols-outlined text-lg">arrow_back</span>
        </button>
        <div className="flex-1 flex items-center justify-center text-white font-medium truncate">project name</div>
        {['undo', 'redo', 'save', 'menu'].map(icon =>
          <button key={icon} className={iconBtn}>
            <span className="material-symbols-outlined text-lg">{icon}</span>
          </button>
        )}
      </header>

      <nav className="h-[6%] flex">
        {['design', 'code'].map(tab =>
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 flex items-center justify-center cursor-pointer transition-colors ${activeTab === tab ? 'bg-blue-500 text-white' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'}`}
          >
            {tab}
          </button>
        )}
      </nav>

      <main className="flex-1 min-h-0 flex gap-2 p-2">
        <aside className="w-1/3 flex-none flex flex-col gap-2 p-2 overflow-hidden justify-start border border-blue-200 rounded-sm">
          <div className="h-[8%] flex-none flex">
            {['components', 'layers'].map((label, i) =>
              <button
                key={label}
                onClick={() => setDrawerTab(i)}
                className={`flex-1 flex items-center justify-center cursor-pointer transition-colors ${drawerTab === i ? 'bg-blue-500 text-white' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'}`}
              >
                {label}
              </button>
            )}
          </div>
          {Array.from({ length: 7 }, (_, i) =>
            <div key={i} className="h-[8%] flex-none flex items-center justify-center border border-blue-100 rounded-sm bg-white hover:bg-blue-50 cursor-pointer transition-colors">
              item {i + 1}
            </div>
          )}
        </aside>

        <div className="flex-1 min-w-0 flex items-center justify-center overflow-hidden border border-blue-200 rounded-sm bg-blue-50" style={{ containerType: 'size' }}>
          <div
            className="aspect-[9/16] flex-none flex items-center justify-center self-start bg-white border border-blue-200 rounded-sm text-blue-400"
            style={{ width: 'min(100cqw, 100cqh * 9 / 16)' }}
          >
            phone layout
          </div>
        </div>
      </main>

      <section className="absolute left-0 right-0 bottom-0 h-[30%] z-20 flex flex-col gap-2 p-2 bg-white border-t-2 border-blue-300 shadow-[0_-2px_8px_rgba(0,0,0,0.08)]">
        <div className="h-[22%] flex-none flex gap-2 p-2">
          <div className={iconBtn}>
            <span className="material-symbols-outlined text-lg">tune</span>
          </div>
          <div className="flex-1 flex items-center justify-center font-medium">header</div>
          <div className={iconBtn}>
            <span className="material-symbols-outlined text-lg">save</span>
          </div>
        </div>

        <div className="h-[20%] flex-none flex justify-start">
          {['basic', 'options', 'advanced'].map(tab =>
            <button
              key={tab}
              onClick={() => setSheetTab(tab)}
              className={`w-[22%] flex items-center justify-center cursor-pointer transition-colors ${sheetTab === tab ? 'bg-blue-500 text-white' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'}`}
            >
              {tab}
            </button>
          )}
        </div>

        <div className="flex-1 min-h-0 flex gap-2 p-2 overflow-x-auto justify-start [scrollbar-width:none]">
          {Array.from({ length: 6 }, (_, i) =>
            <div key={i} className="aspect-square h-full flex-none flex items-center justify-center bg-blue-50 border border-blue-200 rounded-sm hover:bg-blue-100 cursor-pointer transition-colors">
              item {i + 1}
            </div>
          )}
          <div className="aspect-square h-full flex-none flex items-center justify-center bg-blue-500 text-white rounded-sm sticky right-2 z-30 cursor-pointer hover:bg-blue-600 transition-colors">
            see all
          </div>
        </div>
      </section>

    </div>
  )
}

export default App
