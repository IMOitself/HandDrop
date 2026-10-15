import { useState } from 'react'

const iconBtn = "aspect-square flex-none flex items-center justify-center text-white rounded-sm hover:bg-blue-700 transition-colors cursor-pointer"

function App() {
  const [activeTab, setActiveTab] = useState('VIEW')
  const [drawerTab, setDrawerTab] = useState(0)
  const [sheetTab, setSheetTab] = useState('attributes')
  const [showSheet, setShowSheet] = useState(false)
  const [droppedItems, setDroppedItems] = useState([])
  const [draggedItem, setDraggedItem] = useState(null)
  const [dragIndex, setDragIndex] = useState(null)
  const [childDrag, setChildDrag] = useState(null)
  const [dropIndex, setDropIndex] = useState(null)
  const [hoverDivId, setHoverDivId] = useState(null)
  const [childDropIndex, setChildDropIndex] = useState(null)
  const [selectedId, setSelectedId] = useState(null)
  const [isOverPhone, setIsOverPhone] = useState(false)
  const [hoverZone, setHoverZone] = useState(null)

  const resetDrag = () => {
    setDraggedItem(null)
    setDragIndex(null)
    setChildDrag(null)
    setDropIndex(null)
    setChildDropIndex(null)
    setHoverDivId(null)
    setIsOverPhone(false)
    setHoverZone(null)
  }

  const getShadowSize = (label, inRow) => {
    const width = inRow ? 'flex-1' : 'w-full'
    if (label === 'image') return `${inRow ? 'h-16' : 'h-20'} ${width}`
    if (label === 'text') return `h-6 ${width}`
    if (label?.startsWith('div')) return `min-h-12 ${width}`
    return `h-8 ${width}`
  }

  const isDraggingDropped = dragIndex !== null || childDrag !== null
  const isSelfDrop =dragIndex !== null && (dropIndex === dragIndex || dropIndex === dragIndex + 1)
  const allItems = droppedItems.flatMap(d => [d, ...d.children])
  const selectedItem = allItems.find(d => d.id === selectedId)
  const selectedTag = selectedItem?.label.split(' ')[0]
  const nextId = (label) => label.split(' ')[0] + (allItems.filter(d => d.label === label).length + 1)

  const dupeSelected = (offset) => {
    const nextItems = [...droppedItems]
    const parentDiv = nextItems.find(d => d.children.some(c => c.id === selectedId))
    const list = parentDiv ? parentDiv.children : nextItems
    const index = list.findIndex(d => d.id === selectedId)
    if (index === -1) return
    const original = list[index]
    const copy = { ...original, id: Date.now() + Math.random(), attributes: { ...original.attributes, id: nextId(original.label) }, children: original.children.map(c => ({ ...c, id: Date.now() + Math.random() })) }
    list.splice(index + offset, 0, copy)
    setDroppedItems(nextItems)
  }

  return (
    <div className="h-full flex flex-col lg:gap-2 overflow-hidden font-sans text-xs text-blue-900 relative">

      <div className='flex flex-col lg:overflow-hidden'>
        <header className="flex gap-2 p-2 bg-blue-500">
          <button className={iconBtn}>
            <span className="material-symbols-outlined text-lg">arrow_back</span>
          </button>
          <div className="flex-1 flex items-center justify-center text-white truncate text-lg font-semibold">project name</div>
          {['undo', 'redo', 'menu'].map(icon =>
            <button key={icon} className={iconBtn}>
              <span className="material-symbols-outlined text-lg">{icon}</span>
            </button>
          )}
        </header>

        {isDraggingDropped ? (
          <nav className="flex">
            {[
              { label: 'SAVE AS TEMPLATE', icon: 'bookmark_add', highlight: 'bg-blue-400' },
              { label: 'DELETE', icon: 'delete', highlight: 'bg-red-500', action: () => {
                setDroppedItems(droppedItems.filter(d => d.id !== draggedItem.id).map(d => ({ ...d, children: d.children.filter(c => c.id !== draggedItem.id) })))
                if (selectedId === draggedItem.id) setShowSheet(false)
              } }
            ].map(zone =>
              <div
                key={zone.label}
                onDragOver={(e) => {
                  e.preventDefault()
                  setHoverZone(zone.label)
                }}
                onDragLeave={() => setHoverZone(null)}
                onDrop={(e) => {
                  e.preventDefault()
                  zone.action?.()
                  resetDrag()
                }}
                className={`flex-1 flex gap-2 p-3 items-center justify-center font-medium border-b-6 border-transparent text-white transition-colors ${hoverZone === zone.label ? zone.highlight : 'bg-blue-500'}`}
              >
                <span className="material-symbols-outlined text-lg">{zone.icon}</span>
                {zone.label}
              </div>
            )}
          </nav>
        ) : <nav className="flex">
          {['VIEW', 'CODE'].map(tab =>
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 flex p-3 items-center justify-center cursor-pointer font-medium border-b-6 bg-blue-500 hover:bg-blue-400 text-white  ${activeTab === tab ? 'border-yellow-300' : 'border-transparent'}`}
            >
              {tab}
            </button>
          )}
        </nav>}
      </div>

      <main className="flex-1 min-h-0 flex lg:px-16 lg:gap-8">
        <aside className="w-1/3 h-full flex-none flex flex-col gap-2 p-2 overflow-hidden border border-blue-200 lg:rounded-sm">
          <div className="flex-none flex gap-2">
            {[
              { label: ' Elements', icon: 'add_box' },
              { label: ' Templates', icon: 'widgets' }
            ].map((tab, i) =>
              <button
                key={tab.label}
                onClick={() => setDrawerTab(i)}
                className={`flex-1 flex items-center justify-center cursor-pointer rounded-sm transition-colors gap-2 p-2 ${drawerTab === i ? 'bg-blue-500 text-white' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'}`}
              >
                <span className="sm:hidden material-symbols-outlined text-lg">{tab.icon}</span>
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            )}
          </div>
          {[
            { label: 'div (row)', icon: 'view_column', attributes: { display: 'flex', 'flex-direction': 'row' } },
            { label: 'div (col)', icon: 'table_rows', attributes: { display: 'flex', 'flex-direction': 'column' } },
            { label: 'button', icon: 'left_click' },
            { label: 'text', icon: 'text_fields' },
            { label: 'image', icon: 'image' },
            { label: 'input', icon: 'text_format' }
          ].map((el, i) =>
            <div
              key={i}
              draggable
              onDragStart={() => {
                setDraggedItem({ ...el, id: Date.now() + Math.random(), attributes: { ...el.attributes, id: nextId(el.label) }, children: [] })
                setDragIndex(null)
              }}
              onDragEnd={() => resetDrag()}
              className="flex items-center p-2 gap-2 lg:justify-center border border-blue-100 rounded-sm bg-white hover:bg-blue-50 cursor-grab active:cursor-grabbing transition-colors"
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
          className="flex-1 h-full min-w-0 flex items-start justify-center p-2 overflow-hidden border border-blue-200 lg:rounded-sm bg-blue-50"
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
          className="flex-none flex flex-col overflow-hidden bg-white border border-blue-200 rounded-t-sm absolute bottom-0 w-full z-10"
        >
          <header className="h-9 flex-none flex items-center gap-2 px-2 bg-blue-500 text-white">
            <span className="material-symbols-outlined text-lg">{selectedItem?.icon ?? 'select'}</span>
            <div className="truncate text-sm">{selectedItem?.attributes?.id ?? 'no selection'}</div>
            {selectedItem?.attributes?.class && <div className="truncate opacity-75">.{selectedItem.attributes.class}</div>}
            <span className="material-symbols-outlined text-lg">arrow_drop_down</span>            <div className="flex-1" />
            <button
              onClick={() => {
                setSelectedId(null)
                setShowSheet(false)
              }}
              className={`${iconBtn} h-full`}
            >
              <span className="material-symbols-outlined text-lg">close</span>
            </button>
          </header>

          <nav className="h-9 flex-none flex gap-2 px-2 pt-2">
            {['attributes', 'options', 'events'].map(tab =>
              <button
                key={tab}
                onClick={() => setSheetTab(tab)}
                className={`w-[22%] flex items-center justify-center cursor-pointer rounded-t-sm transition-colors ${sheetTab === tab ? 'bg-blue-500 text-white' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'}`}
              >
                {tab}
              </button>
            )}
          </nav>

          <div className="flex-1 min-h-0 flex gap-1 p-1 overflow-x-auto bg-blue-50 scrollbar-none">
            {{
              attributes: [
                { category: 'layout', label: 'display', icon: 'view_quilt' },
                { category: 'layout', label: 'width', icon: 'width' },
                { category: 'layout', label: 'height', icon: 'height' },
                { category: 'layout', label: 'margin', icon: 'arrows_output' },
                { category: 'layout', label: 'padding', icon: 'arrows_input' },
                { category: 'layout', label: 'position', icon: 'open_with' },
                { category: 'layout', label: 'z-index', icon: 'layers' },
                { category: 'element', label: 'flex-direction', icon: 'swap_horiz', only: ['div'] },
                { category: 'element', label: 'justify-content', icon: 'align_horizontal_center', only: ['div'] },
                { category: 'element', label: 'align-items', icon: 'align_vertical_center', only: ['div'] },
                { category: 'element', label: 'gap', icon: 'space_bar', only: ['div'] },
                { category: 'element', label: 'src', icon: 'image', only: ['image'] },
                { category: 'element', label: 'alt', icon: 'short_text', only: ['image'] },
                { category: 'element', label: 'object-fit', icon: 'fit_screen', only: ['image'] },
                { category: 'element', label: 'type', icon: 'category', only: ['input', 'button'] },
                { category: 'element', label: 'placeholder', icon: 'edit_note', only: ['input'] },
                { category: 'element', label: 'value', icon: 'data_object', only: ['input'] },
                { category: 'element', label: 'name', icon: 'badge', only: ['input'] },
                { category: 'element', label: 'disabled', icon: 'block', only: ['input', 'button'] },
                { category: 'typography', label: 'color', icon: 'format_color_text', only: ['text', 'button', 'input'] },
                { category: 'typography', label: 'font-size', icon: 'format_size', only: ['text', 'button', 'input'] },
                { category: 'typography', label: 'font-weight', icon: 'format_bold', only: ['text', 'button', 'input'] },
                { category: 'typography', label: 'text-align', icon: 'format_align_center', only: ['text', 'button', 'input'] },
                { category: 'typography', label: 'line-height', icon: 'format_line_spacing', only: ['text', 'button', 'input'] },
                { category: 'visual', label: 'border', icon: 'border_style' },
                { category: 'visual', label: 'background', icon: 'background_replace' },
                { category: 'visual', label: 'cursor', icon: 'arrow_selector_tool' },
                { category: 'identity', label: 'id', icon: 'tag' },
                { category: 'identity', label: 'class', icon: 'label' }
              ],
              options: [
                { label: 'dupe before', icon: 'add_row_above', action: () => dupeSelected(0) },
                { label: 'dupe after', icon: 'add_row_below', action: () => dupeSelected(1) }
              ],
              events: [
                { label: 'on click', icon: 'touch_app' }
              ]
            }[sheetTab].filter(sheetItem => !sheetItem.only || sheetItem.only.includes(selectedTag)).map((sheetItem, i, list) => {
              const categoryName = sheetItem.category === 'element' ? selectedTag : sheetItem.category
              const isNewCategory = sheetItem.category && list[i - 1]?.category !== sheetItem.category
              return [
                isNewCategory && (
                  <div key={`${sheetItem.category}-divider`} className="flex-none flex items-center justify-center p-1 border border-blue-200 rounded-sm rotate-180 [writing-mode:vertical-rl]">
                    {categoryName}
                  </div>
                ),
                <button
                  key={sheetItem.label}
                  onClick={sheetItem.action}
                  className="size-24 flex-none flex flex-col p-1 items-center justify-center text-center leading-tight bg-white border border-blue-200 rounded-sm hover:bg-blue-100 cursor-pointer transition-colors"
                >
                  <span className="material-symbols-outlined text-lg text-blue-500">{sheetItem.icon}</span>
                  {sheetItem.label}
                  {selectedItem?.attributes?.[sheetItem.label] && <span className="max-w-full truncate text-blue-400">{selectedItem.attributes[sheetItem.label]}</span>}
                </button>
              ]
            })}
          </div>
        </section>
      )}

    </div>
  )
}

export default App
