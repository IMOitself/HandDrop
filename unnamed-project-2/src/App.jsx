import { useState } from 'react'

const iconBtn = "aspect-square flex-none flex items-center justify-center text-white rounded-sm hover:bg-blue-700 transition-colors cursor-pointer"

function App() {
  const [activeTab, setActiveTab] = useState('view')
  const [drawerTab, setDrawerTab] = useState(0)
  const [sheetTab, setSheetTab] = useState('basic')
  const [showSheet, setShowSheet] = useState(true)
  const [droppedItems, setDroppedItems] = useState([])
  const [draggedItem, setDraggedItem] = useState(null)
  const [dragIndex, setDragIndex] = useState(null)
  const [childDrag, setChildDrag] = useState(null)
  const [dropIndex, setDropIndex] = useState(null)
  const [hoverDivId, setHoverDivId] = useState(null)
  const [childDropIndex, setChildDropIndex] = useState(null)
  const [selectedId, setSelectedId] = useState(null)
  const [isOverPhone, setIsOverPhone] = useState(false)

  const resetDrag = () => {
    setDraggedItem(null)
    setDragIndex(null)
    setChildDrag(null)
    setDropIndex(null)
    setChildDropIndex(null)
    setHoverDivId(null)
    setIsOverPhone(false)
  }

  const getShadowSize = (label, inRow) => {
    const width = inRow ? 'flex-1' : 'w-full'
    if (label === 'image') return `${inRow ? 'h-16' : 'h-20'} ${width}`
    if (label === 'text') return `h-6 ${width}`
    if (label?.startsWith('div')) return `min-h-12 ${width}`
    return `h-8 ${width}`
  }

  const isSelfDrop = dragIndex !== null && (dropIndex === dragIndex || dropIndex === dragIndex + 1)

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
          {[
            { label: 'div (row)', icon: 'view_column' },
            { label: 'div (col)', icon: 'table_rows' },
            { label: 'button', icon: 'smart_button' },
            { label: 'text', icon: 'text_fields' },
            { label: 'image', icon: 'image' },
            { label: 'input', icon: 'edit_note' }
          ].map((el, i) =>
            <div
              key={i}
              draggable
              onDragStart={() => {
                setDraggedItem({ ...el, id: Date.now() + Math.random(), children: [] })
                setDragIndex(null)
              }}
              onDragEnd={() => resetDrag()}
              className="flex items-center p-2 gap-2 justify-center border border-blue-100 rounded-sm bg-white hover:bg-blue-50 active:cursor-grabbing transition-colors"
            >
              <span className="material-symbols-outlined text-lg">{el.icon}</span>
              {el.label}
            </div>
          )}
        </aside>

        <div
          onClick={() => {
            setSelectedId(null)
            setShowSheet(false)
          }}
          className="flex-1 h-full min-w-0 flex items-center justify-center p-2 overflow-hidden border border-blue-200 rounded-sm bg-blue-50"
          style={{ containerType: 'size' }}
        >
          <div
            onDragOver={(e) => {
              e.preventDefault()
              setIsOverPhone(true)
              const rect = e.currentTarget.getBoundingClientRect()
              const isTop = (e.clientY - rect.top) < 36
              if (isTop) {
                setDropIndex(0)
                setHoverDivId(null)
              } else if (e.target === e.currentTarget) {
                setDropIndex(droppedItems.length)
                setHoverDivId(null)
              }
            }}
            onDragLeave={(e) => {
              const leavingTarget = !e.currentTarget.contains(e.relatedTarget)
              if (leavingTarget) {
                setIsOverPhone(false)
                setDropIndex(null)
              }
            }}
            onDrop={(e) => {
              e.preventDefault()
              const hasItem = draggedItem !== null
              if (hasItem) {
                const nextItems = [...droppedItems]
                if (childDrag) {
                  const parentDiv = nextItems.find(d => d.id === childDrag.parentId)
                  if (parentDiv) parentDiv.children.splice(childDrag.index, 1)
                }
                const isReorder = dragIndex !== null
                if (isReorder) nextItems.splice(dragIndex, 1)
                let targetPosition = dropIndex !== null ? dropIndex : nextItems.length
                if (isReorder && dragIndex < targetPosition) targetPosition -= 1
                nextItems.splice(targetPosition, 0, draggedItem)
                setDroppedItems(nextItems)
              }
              resetDrag()
            }}
            className="aspect-9/16 flex flex-col p-2 gap-2 bg-white border border-blue-200 rounded-sm text-blue-400 overflow-y-auto"
            style={{ width: 'min(calc(100cqw - 1rem), calc((100cqh - 1rem) * 9 / 16))' }}
            onClick={() => {
              setSelectedId(null)
              setShowSheet(false)
            }}
          >
            {droppedItems.length === 0 && !isOverPhone && (
              <div className="m-auto">phone layout</div>
            )}
            {droppedItems.map((item, i) =>
              <div key={i} className="flex flex-col gap-2">
                {isOverPhone && !hoverDivId && !isSelfDrop && dropIndex === i && (
                  <div
                    onDragOver={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                    }}
                    className={`${getShadowSize(draggedItem?.label, false)} border-2 border-dashed border-blue-300 bg-blue-50/60 rounded-sm shadow-inner shrink-0`}
                  />
                )}
                <div
                  draggable
                  onClick={(e) => {
                    e.stopPropagation()
                    setSelectedId(item.id)
                    setShowSheet(true)
                  }}
                  onDragStart={() => {
                    setDraggedItem(item)
                    setDragIndex(i)
                  }}
                  onDragEnd={() => resetDrag()}
                  onDragOver={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    setIsOverPhone(true)
                    setHoverDivId(null)
                    const rect = e.currentTarget.getBoundingClientRect()
                    const isBottom = (e.clientY - rect.top) > (rect.height / 2)
                    setDropIndex(isBottom ? i + 1 : i)
                  }}
                  className={`active:cursor-grabbing rounded-sm ${selectedId === item.id ? 'ring-2 ring-blue-500' : ''} ${dragIndex === i ? 'opacity-40' : ''}`}
                >
                  {item.label === 'button' && <button className="w-full p-2 bg-blue-500 text-white rounded-sm pointer-events-none">button</button>}
                  {item.label === 'text' && <p className="p-1 text-blue-900">text</p>}
                  {item.label === 'image' && <div className="h-20 bg-blue-100 rounded-sm flex items-center justify-center text-blue-400"><span className="material-symbols-outlined text-2xl">image</span></div>}
                  {item.label === 'input' && <input readOnly placeholder="input" className="w-full p-2 border border-blue-200 rounded-sm bg-white pointer-events-none" />}
                  {item.label.startsWith('div') && (
                    <div
                      onDragOver={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        const isSelf = draggedItem?.id === item.id
                        if (isSelf) return
                        setIsOverPhone(true)
                        setDropIndex(null)
                        setHoverDivId(item.id)
                        const isRow = item.label === 'div (row)'
                        const mousePos = isRow ? e.clientX : e.clientY
                        const childEls = Array.from(e.currentTarget.querySelectorAll(':scope > [data-child]'))
                        let target = childEls.length
                        for (let ci = 0; ci < childEls.length; ci++) {
                          const rect = childEls[ci].getBoundingClientRect()
                          const mid = isRow ? (rect.left + rect.width / 2) : (rect.top + rect.height / 2)
                          if (mousePos < mid) {
                            target = ci
                            break
                          }
                        }
                        setChildDropIndex(target)
                      }}
                      onDragLeave={(e) => {
                        const leaving = !e.currentTarget.contains(e.relatedTarget)
                        if (leaving) {
                          setHoverDivId(null)
                          setChildDropIndex(null)
                        }
                      }}
                      onDrop={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        const isSelf = draggedItem?.id === item.id
                        if (isSelf) return
                        const hasItem = draggedItem !== null
                        if (hasItem) {
                          const nextItems = [...droppedItems]
                          if (childDrag) {
                            const parentDiv = nextItems.find(d => d.id === childDrag.parentId)
                            if (parentDiv) parentDiv.children.splice(childDrag.index, 1)
                          }
                          const isReorder = dragIndex !== null
                          if (isReorder) nextItems.splice(dragIndex, 1)
                          const targetDiv = nextItems.find(d => d.id === item.id)
                          if (targetDiv) {
                            const children = [...(targetDiv.children || [])]
                            let pos = childDropIndex !== null ? childDropIndex : children.length
                            if (childDrag && childDrag.parentId === item.id && childDrag.index < pos) pos -= 1
                            children.splice(pos, 0, draggedItem)
                            targetDiv.children = children
                          }
                          setDroppedItems(nextItems)
                        }
                        resetDrag()
                      }}
                      className={`p-2 border border-dashed border-blue-300 rounded-sm min-h-12 flex ${item.label === 'div (row)' ? 'flex-row' : 'flex-col'} gap-2 ${hoverDivId === item.id ? 'bg-blue-100/40 border-blue-500' : ''}`}
                    >
                      {item.children?.map((child, ci) => {
                        const isRow = item.label === 'div (row)'
                        const isChildSelf = childDrag?.parentId === item.id && (childDropIndex === childDrag.index || childDropIndex === childDrag.index + 1)
                        const showChildShadow = hoverDivId === item.id && draggedItem && !isChildSelf && childDropIndex === ci
                        return (
                          <div key={ci} data-child className={`flex ${isRow ? 'flex-row' : 'flex-col'} gap-2 ${isRow ? 'flex-1 min-w-0' : 'w-full'}`}>
                            {showChildShadow && (
                              <div className={`${getShadowSize(draggedItem?.label, isRow)} border-2 border-dashed border-blue-300 bg-blue-50/60 rounded-sm shadow-inner shrink-0 pointer-events-none`} />
                            )}
                            <div
                              draggable
                              onClick={(e) => {
                                e.stopPropagation()
                                setSelectedId(child.id)
                                setShowSheet(true)
                              }}
                              onDragStart={(e) => {
                                e.stopPropagation()
                                setDraggedItem(child)
                                setChildDrag({ parentId: item.id, index: ci })
                              }}
                              onDragEnd={() => resetDrag()}
                              className={`active:cursor-grabbing flex-1 min-w-0 rounded-sm ${selectedId === child.id ? 'ring-2 ring-blue-500' : ''} ${childDrag?.parentId === item.id && childDrag.index === ci ? 'opacity-40' : ''}`}
                            >
                              {child.label === 'button' && <button className="w-full p-2 bg-blue-500 text-white rounded-sm pointer-events-none">button</button>}
                              {child.label === 'text' && <p className="p-1 text-blue-900 pointer-events-none">text</p>}
                              {child.label === 'image' && <div className="h-16 bg-blue-100 rounded-sm flex items-center justify-center text-blue-400 pointer-events-none"><span className="material-symbols-outlined text-2xl">image</span></div>}
                              {child.label === 'input' && <input readOnly placeholder="input" className="w-full p-2 border border-blue-200 rounded-sm bg-white pointer-events-none" />}
                              {child.label.startsWith('div') && <div className={`p-2 border border-dashed border-blue-300 rounded-sm min-h-12 flex ${child.label === 'div (row)' ? 'flex-row' : 'flex-col'} gap-2 w-full pointer-events-none`} />}
                            </div>
                          </div>
                        )
                      })}
                      {hoverDivId === item.id && draggedItem && !(childDrag?.parentId === item.id && (childDropIndex === childDrag.index || childDropIndex === childDrag.index + 1)) && (childDropIndex === null || childDropIndex >= (item.children?.length || 0)) && (
                        <div className={`${getShadowSize(draggedItem?.label, item.label === 'div (row)')} border-2 border-dashed border-blue-300 bg-blue-50/60 rounded-sm shadow-inner shrink-0 pointer-events-none`} />
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
            {isOverPhone && draggedItem && !hoverDivId && !isSelfDrop && (dropIndex === null || dropIndex >= droppedItems.length) && (
              <div
                onDragOver={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                }}
                className={`${getShadowSize(draggedItem?.label, false)} border-2 border-dashed border-blue-300 bg-blue-50/60 rounded-sm shadow-inner shrink-0`}
              />
            )}
          </div>
        </div>
      </main>

      {showSheet && (
        <section
          onClick={(e) => e.stopPropagation()}
          className="h-[28%] flex-none flex flex-col gap-2 p-2 bg-white border border-blue-200 rounded-sm absolute bottom-0 left-2 right-2 z-10"
        >
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
