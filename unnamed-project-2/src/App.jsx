import { useState } from 'react'

const iconBtn = "aspect-square flex-none flex items-center justify-center text-white rounded-sm hover:bg-blue-700 transition-colors cursor-pointer"

function App() {
  const [activeTab, setActiveTab] = useState('view')
  const [drawerTab, setDrawerTab] = useState(0)
  const [sheetTab, setSheetTab] = useState('basic')
  const [showSheet, setShowSheet] = useState(true)

  return (
    <div className="h-full flex flex-col p-2 gap-2 overflow-hidden font-sans text-xs text-blue-900 bg-white border border-blue-200 relative">

      <div className='flex flex-col'>
      <header className="flex gap-2 p-2 bg-blue-500">
        <button className={iconBtn}>
          <span className="material-symbols-outlined text-lg">arrow_back</span>
        </button>
        <div className="flex-1 flex items-center justify-center text-white truncate">project name</div>
        {['undo', 'redo', 'save', 'menu'].map(icon =>
          <button key={icon} className={iconBtn}>
            <span className="material-symbols-outlined text-lg">{icon}</span>
          </button>
        )}
      </header>

      <nav className="flex">
        {['VIEW', 'CODE'].map(tab =>
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 flex p-3 items-center justify-center cursor-pointer font-medium border-b-6 bg-blue-500 text-white ${activeTab === tab ? 'border-yellow-300' : 'border-transparent hover:border-yellow-500'}`}
          >
            {tab}
          </button>
        )}
      </nav>
      </div>

      <main className="flex-1 min-h-0 flex">
        <aside className="w-1/3 h-full flex-none flex flex-col gap-2 p-2 overflow-hidden border border-blue-200 rounded-sm">
          <div className="h-7 flex-none flex gap-2">
            {[
              { label: 'components', icon: 'widgets' },
              { label: 'layers', icon: 'layers' }
            ].map((tab, i) =>
              <button
                key={tab.label}
                onClick={() => setDrawerTab(i)}
                className={`flex-1 flex items-center justify-center cursor-pointer rounded-sm transition-colors gap-2 ${drawerTab === i ? 'bg-blue-500 text-white' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'}`}
              >
                <span className="sm:hidden material-symbols-outlined text-lg">{tab.icon}</span>
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            )}
          </div>
          {Array.from({ length: 12 }, (_, i) =>
            <div key={i} className="flex items-center p-2 justify-center border border-blue-100 rounded-sm bg-white hover:bg-blue-50 cursor-pointer transition-colors">
              item {i + 1}
            </div>
          )}
        </aside>

        <div className="flex-1 h-full min-w-0 flex items-center justify-center p-2 overflow-hidden border border-blue-200 rounded-sm bg-blue-50" style={{ containerType: 'size' }}>
          <div
            className="aspect-9/16 flex items-center justify-center bg-white border border-blue-200 rounded-sm text-blue-400"
            style={{ width: 'min(calc(100cqw - 1rem), calc((100cqh - 1rem) * 9 / 16))' }}
          >
            phone layout
          </div>
        </div>
      </main>

      {showSheet && (
        <section className="h-[28%] flex-none flex flex-col gap-2 p-2 bg-white border border-blue-200 rounded-sm absolute bottom-0 left-2 right-2 z-10">
          {/* <div className='flex justify-center items-center w-full'>
            <div className="h-7 flex-none flex items-center gap-2">
              <span className="material-symbols-outlined flex items-center">table_rows</span>
              <div className="flex-1 flex items-center justify-center text-xl">divider</div>
            </div>
          </div> */}

          <div className="h-7 flex-none flex gap-2 justify-between items-center">
            <div className="flex gap-2 flex-1 h-full">
              {['basic', 'options', 'advanced'].map(tab =>
                <button
                  key={tab}
                  onClick={() => setSheetTab(tab)}
                  className={`w-[22%] flex items-center justify-center cursor-pointer rounded-sm transition-colors ${sheetTab === tab ? 'bg-blue-500 text-white' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'}`}
                >
                  {tab}
                </button>
              )}
            </div>
            <button
              onClick={() => setShowSheet(false)}
              className="h-full aspect-square flex items-center justify-center text-blue-600 hover:bg-blue-50 rounded-sm cursor-pointer transition-colors"
            >
              <span className="material-symbols-outlined text-lg">close</span>
            </button>
          </div>

          <div className="flex-1 min-h-0 flex gap-2 overflow-x-auto justify-start scrollbar-none">
            {Array.from({ length: 12 }, (_, i) =>
              <div key={i} className="aspect-square h-full flex-none flex items-center justify-center bg-blue-50 border border-blue-200 rounded-sm hover:bg-blue-100 cursor-pointer transition-colors">
                item {i + 1}
              </div>
            )}
            <div className="aspect-square h-full hidden flex-none items-center justify-center bg-blue-500 text-white rounded-sm sticky right-0 z-10 cursor-pointer hover:bg-blue-600 transition-colors">
              see all
            </div>
          </div>
        </section>
      )}

    </div>
  )
}

export default App
