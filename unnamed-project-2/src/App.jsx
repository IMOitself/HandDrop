import { Fragment, useState } from 'react'

const units = ['rem', 'px', 'em', '%', 'vh', 'vw', 'vmin', 'vmax', 'ch']
const globalValues = ['inherit', 'initial', 'revert', 'revert-layer', 'unset']
const emptySide = { amount: '', unit: 'rem' }
const emptySides = { top: emptySide, right: emptySide, bottom: emptySide, left: emptySide }
const emptyDrafts ={ number: { amount: '', unit: 'rem' }, percentage: { amount: '', unit: '%' } }
const iconBtn ="aspect-square flex-none flex items-center justify-center text-white rounded-sm hover:bg-blue-700 transition-colors cursor-pointer"

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
  const [dialogAttr, setDialogAttr] = useState(null)
  const [dialogValue, setDialogValue] = useState('')
  const [isAllSides, setIsAllSides] = useState(true)
  const [numberDrafts, setNumberDrafts] = useState(emptyDrafts)
  const [isAdvanced, setIsAdvanced] = useState(false)
  const [customDraft, setCustomDraft] = useState('')
  const [sidesDraft, setSidesDraft] = useState(emptySides)

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

  const elementProps = (item, baseClass) => {
    const { class: userClass = '', disabled, ...attributes } = item.attributes ?? {}
    const htmlNames = ['id', 'src', 'alt', 'type', 'placeholder', 'value', 'name']
    const setEntries = Object.entries(attributes).filter(([, value]) => value)
    const htmlProps = Object.fromEntries(setEntries.filter(([name]) => htmlNames.includes(name)))
    const styleEntries = setEntries.filter(([name]) => !htmlNames.includes(name)).map(([name, value]) => [name.replace(/-(\w)/g, (_, letter) => letter.toUpperCase()), value])
    return { ...htmlProps, style: Object.fromEntries(styleEntries), className: `${baseClass} ${userClass} ${disabled === 'true' ? 'opacity-50' : ''}` }
  }

  const renderElement = (item, dragHandlers, stateClass, children) => {
    const props = baseClass => ({
      ...dragHandlers,
      draggable: true,
      onClick: (e) => {
        e.stopPropagation()
        setSelectedId(item.id)
        setShowSheet(true)
      },
      onDragEnd: () => resetDrag(),
      ...elementProps(item, `${baseClass} cursor-grab active:cursor-grabbing ${selectedId === item.id ? 'ring-2 ring-yellow-300' : ''} ${stateClass}`)
    })
    if (item.label === 'button') return <button {...props('w-full p-2 bg-blue-500 text-white rounded-sm')}>button</button>
    if (item.label === 'text') return <p {...props('p-1 text-blue-900')}>text</p>
    if (item.label === 'input') return <input readOnly placeholder="input" {...props('w-full p-2 border border-blue-200 rounded-sm bg-white')} />
    if (item.label === 'image' && item.attributes?.src) return <img {...props('w-full h-20 object-cover rounded-sm')} />
    if (item.label === 'image') return <div {...props('w-full h-20 bg-blue-100 rounded-sm flex items-center justify-center text-blue-400')}><span className="material-symbols-outlined text-2xl pointer-events-none">image</span></div>
    return <div {...props(`p-2 border border-dashed border-blue-300 rounded-sm min-h-12 flex ${item.label === 'div (row)' ? 'flex-row' : 'flex-col'} gap-2`)}>{children}</div>
  }

  const isNumberText = text => /^-?[\d.]+[a-z%]*$/.test(text)
  const toAmount = text => {
    const [, amount, unit] = text.match(/^(-?[\d.]*)(.*)$/)
    return { amount, unit: unit || 'rem' }
  }

  const isSidesText = text => text.split(' ').every(isNumberText)
  const toSidesText = draft => {
    const sides = ['top', 'right', 'bottom', 'left'].map(side => draft[side])
    if (sides.every(side => !side.amount)) return ''
    const sideTexts = sides.map(side => `${side.amount || 0}${side.unit}`)
    return new Set(sideTexts).size === 1 ? sideTexts[0] : sideTexts.join(' ')
  }

  const savedValue = selectedItem?.attributes?.[dialogAttr?.label] ?? ''
  const isTextOnly = dialogAttr && !dialogAttr.sides && !dialogAttr.options && !dialogAttr.number
  const isCommonValue = (attr, value) => attr.options?.includes(value) || (attr.number && isNumberText(value)) || (attr.sides && isSidesText(value))
  const isUncoveredValue = savedValue && !dialogAttr?.more?.includes(savedValue) && !globalValues.includes(savedValue) && !isCommonValue(dialogAttr, savedValue)
  const keywordValues = [...(dialogAttr?.options ?? []), ...(isAdvanced ? dialogAttr?.more ?? [] : []), ...(isUncoveredValue ? [savedValue] : [])]
  const sidesText = toSidesText(sidesDraft)

  const setNumber = (category, change) => {
    const nextNumber = { ...numberDrafts[category], ...change }
    setNumberDrafts({ ...numberDrafts, [category]: nextNumber })
    setDialogValue(nextNumber.amount ? nextNumber.amount + nextNumber.unit : '')
  }

  const openDialog = (attr) => {
    const value = selectedItem?.attributes?.[attr.label] ?? ''
    const numberCategory = value.endsWith('%') ? 'percentage' : 'number'
    setDialogAttr(attr)
    setDialogValue(value)
    setCustomDraft('')
    setNumberDrafts(isNumberText(value) ? { ...emptyDrafts, [numberCategory]: toAmount(value) } : emptyDrafts)
    setIsAdvanced(Boolean(value) && !isCommonValue(attr, value))
    const sideParts = attr.sides && isSidesText(value) ? value.split(' ').filter(Boolean) : []
    const [top = '', right = top, bottom = top, left = right] = sideParts
    setSidesDraft({ top: toAmount(top), right: toAmount(right), bottom: toAmount(bottom), left: toAmount(left) })
    setIsAllSides(top === right && top === bottom && top === left)
  }

  const setSide = (side, change) => {
    const nextSide = { ...sidesDraft[isAllSides ? 'top' : side], ...change }
    const nextDraft = isAllSides ? { top: nextSide, right: nextSide, bottom: nextSide, left: nextSide } : { ...sidesDraft, [side]: nextSide }
    setSidesDraft(nextDraft)
    setDialogValue(toSidesText(nextDraft))
  }

  const saveDialog = (value) => {
    const update = item => item.id === selectedId ? { ...item, attributes: { ...item.attributes, [dialogAttr.label]: value } } : item
    setDroppedItems(droppedItems.map(d => ({ ...update(d), children: d.children.map(update) })))
    setDialogAttr(null)
  }

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
            {droppedItems.map((item, i) => {
              const isDiv = item.label.startsWith('div')
              const isChildSelf = childDrag?.parentId === item.id && (childDropIndex === childDrag.index || childDropIndex === childDrag.index + 1)
              const showEndShadow = hoverDivId === item.id && draggedItem && !isChildSelf && (childDropIndex === null || childDropIndex >= item.children.length)
              return (
                <Fragment key={item.id}>
                  {isOverPhone && !hoverDivId && !isSelfDrop && dropIndex === i && (
                    <div
                      onDragOver={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                      }}
                      className={`${getShadowSize(draggedItem?.label, false)} border-2 border-dashed border-blue-300 bg-blue-50/60 rounded-sm shadow-inner shrink-0`}
                    />
                  )}
                  {renderElement(item, {
                    onDragStart: (e) => {
                      e.stopPropagation()
                      setDraggedItem(item)
                      setDragIndex(i)
                    },
                    onDragOver: (e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      setIsOverPhone(true)
                      if (!isDiv) {
                        setHoverDivId(null)
                        const rect = e.currentTarget.getBoundingClientRect()
                        const isBottom = (e.clientY - rect.top) > (rect.height / 2)
                        return setDropIndex(isBottom ? i + 1 : i)
                      }
                      const isSelf = draggedItem?.id === item.id
                      if (isSelf) return
                      setDropIndex(null)
                      setHoverDivId(item.id)
                      const isRow = getComputedStyle(e.currentTarget).flexDirection.startsWith('row')
                      const mousePos = isRow ? e.clientX : e.clientY
                      const childEls = Array.from(e.currentTarget.querySelectorAll(':scope > [data-child]'))
                      const target = childEls.findIndex(childEl => {
                        const rect = childEl.getBoundingClientRect()
                        return mousePos < (isRow ? rect.left + rect.width / 2 : rect.top + rect.height / 2)
                      })
                      setChildDropIndex(target === -1 ? childEls.length : target)
                    },
                    onDragLeave: (e) => {
                      const leaving = isDiv && !e.currentTarget.contains(e.relatedTarget)
                      if (!leaving) return
                      setHoverDivId(null)
                      setChildDropIndex(null)
                    },
                    onDrop: (e) => {
                      if (!isDiv) return
                      e.preventDefault()
                      e.stopPropagation()
                      const isSelf = draggedItem?.id === item.id
                      if (isSelf || !draggedItem) return resetDrag()
                      const nextItems = [...droppedItems]
                      if (childDrag) {
                        const parentDiv = nextItems.find(d => d.id === childDrag.parentId)
                        if (parentDiv) parentDiv.children.splice(childDrag.index, 1)
                      }
                      const isReorder = dragIndex !== null
                      if (isReorder) nextItems.splice(dragIndex, 1)
                      const targetDiv = nextItems.find(d => d.id === item.id)
                      if (targetDiv) {
                        const children = [...targetDiv.children]
                        let pos = childDropIndex !== null ? childDropIndex : children.length
                        if (childDrag && childDrag.parentId === item.id && childDrag.index < pos) pos -= 1
                        children.splice(pos, 0, draggedItem)
                        targetDiv.children = children
                      }
                      setDroppedItems(nextItems)
                      resetDrag()
                    }
                  }, `${dragIndex === i ? 'opacity-40' : ''} ${hoverDivId === item.id ? 'bg-blue-100/40 border-blue-500' : ''}`, isDiv && (
                    <>
                      {item.children.map((child, ci) =>
                        <Fragment key={child.id}>
                          {hoverDivId === item.id && draggedItem && !isChildSelf && childDropIndex === ci && (
                            <div className={`${getShadowSize(draggedItem?.label, item.label === 'div (row)')} border-2 border-dashed border-blue-300 bg-blue-50/60 rounded-sm shadow-inner shrink-0 pointer-events-none`} />
                          )}
                          {renderElement(child, {
                            'data-child': true,
                            onDragStart: (e) => {
                              e.stopPropagation()
                              setDraggedItem(child)
                              setChildDrag({ parentId: item.id, index: ci })
                            }
                          }, childDrag?.parentId === item.id && childDrag.index === ci ? 'opacity-40' : '')}
                        </Fragment>
                      )}
                      {showEndShadow && (
                        <div className={`${getShadowSize(draggedItem?.label, item.label === 'div (row)')} border-2 border-dashed border-blue-300 bg-blue-50/60 rounded-sm shadow-inner shrink-0 pointer-events-none`} />
                      )}
                    </>
                  ))}
                </Fragment>
              )
            })}
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
                { category: 'layout', label: 'display', icon: 'view_quilt', options: ['block', 'flex', 'none'], more: ['inline', 'inline-block', 'inline-flex', 'grid', 'contents'] },
                { category: 'layout', label: 'width', icon: 'width', options: ['auto', 'fit-content'], more: ['max-content', 'min-content', 'stretch'], number: true },
                { category: 'layout', label: 'height', icon: 'height', options: ['auto', 'fit-content'], more: ['max-content', 'min-content', 'stretch'], number: true },
                { category: 'layout', label: 'margin', icon: 'arrows_output', sides: true },
                { category: 'layout', label: 'padding', icon: 'arrows_input', sides: true },
                { category: 'layout', label: 'position', icon: 'open_with', options: ['static', 'relative', 'absolute'], more: ['fixed', 'sticky'] },
                { category: 'layout', label: 'z-index', icon: 'layers' },
                { category: 'element', label: 'flex-direction', icon: 'swap_horiz', only: ['div'], options: ['row', 'column'], more: ['row-reverse', 'column-reverse'] },
                { category: 'element', label: 'justify-content', icon: 'align_horizontal_center', only: ['div'], options: ['flex-start', 'center', 'flex-end', 'space-between'], more: ['space-around', 'space-evenly'] },
                { category: 'element', label: 'align-items', icon: 'align_vertical_center', only: ['div'], options: ['stretch', 'flex-start', 'center', 'flex-end'], more: ['baseline'] },
                { category: 'element', label: 'gap', icon: 'space_bar', only: ['div'], number: true },
                { category: 'element', label: 'src', icon: 'image', only: ['image'] },
                { category: 'element', label: 'alt', icon: 'short_text', only: ['image'] },
                { category: 'element', label: 'object-fit', icon: 'fit_screen', only: ['image'], options: ['cover', 'contain'], more: ['fill', 'none', 'scale-down'] },
                { category: 'element', label: 'type', icon: 'category', only: ['input'], options: ['text', 'number', 'email', 'password'] },
                { category: 'element', label: 'type', icon: 'category', only: ['button'], options: ['button', 'submit', 'reset'] },
                { category: 'element', label: 'placeholder', icon: 'edit_note', only: ['input'] },
                { category: 'element', label: 'value', icon: 'data_object', only: ['input'] },
                { category: 'element', label: 'name', icon: 'badge', only: ['input'] },
                { category: 'element', label: 'disabled', icon: 'block', only: ['input', 'button'], options: ['true', 'false'] },
                { category: 'typography', label: 'color', icon: 'format_color_text', only: ['text', 'button', 'input'] },
                { category: 'typography', label: 'font-size', icon: 'format_size', only: ['text', 'button', 'input'], more: ['small', 'medium', 'large', 'x-large', 'smaller', 'larger'], number: true },
                { category: 'typography', label: 'font-weight', icon: 'format_bold', only: ['text', 'button', 'input'], options: ['normal', 'bold'], more: ['lighter', 'bolder', '300', '500', '600'] },
                { category: 'typography', label: 'text-align', icon: 'format_align_center', only: ['text', 'button', 'input'], options: ['left', 'center', 'right'], more: ['justify', 'start', 'end'] },
                { category: 'typography', label: 'line-height', icon: 'format_line_spacing', only: ['text', 'button', 'input'], options: ['normal'], number: true },
                { category: 'visual', label: 'border', icon: 'border_style' },
                { category: 'visual', label: 'background', icon: 'background_replace' },
                { category: 'visual', label: 'cursor', icon: 'arrow_selector_tool', options: ['pointer', 'default'], more: ['auto', 'text', 'not-allowed', 'grab', 'move'] },
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
                  onClick={sheetTab === 'attributes' ? () => openDialog(sheetItem) : sheetItem.action}
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

      {dialogAttr && (
        <div onClick={() => setDialogAttr(null)} className="absolute inset-0 z-20 flex items-center justify-center bg-blue-900/40">
          <div onClick={(e) => e.stopPropagation()} className="w-[80%] max-w-sm max-h-[90%] flex flex-col overflow-hidden bg-white rounded-sm">
            <h2 className="flex items-center gap-2 p-3 text-sm font-bold text-blue-500">
              <span className="material-symbols-outlined text-lg">{dialogAttr.icon}</span>
              {dialogAttr.label}
            </h2>

            <div className="min-h-0 flex flex-col gap-2 px-3 pb-3 overflow-y-auto">
              {!isTextOnly && (
                <>
                  {dialogAttr.sides && (
                    <details open>
                      <summary className="cursor-pointer text-blue-400">sides</summary>
                      <label className="flex items-center gap-2 p-1 cursor-pointer">
                        <input type="radio" checked={Boolean(sidesText) && dialogValue === sidesText} onChange={() => setDialogValue(sidesText)} className="accent-blue-500" />
                        <div className={`flex-1 grid gap-2 ${isAllSides ? 'grid-cols-1' : 'grid-cols-2'}`}>
                          {(isAllSides ? ['all sides'] : ['left', 'right', 'top', 'bottom']).map(side => {
                            const sideValue = sidesDraft[isAllSides ? 'top' : side]
                            return (
                              <div key={side} className="flex flex-col gap-1">
                                {side}
                                <div className="flex items-center gap-1 p-2 border border-blue-200 rounded-sm focus-within:border-blue-500">
                                  <input value={sideValue.amount} onChange={(e) => setSide(side, { amount: e.target.value })} placeholder="0" className="w-full min-w-0 outline-none" />
                                  <select value={sideValue.unit} onChange={(e) => setSide(side, { unit: e.target.value })} className="outline-none cursor-pointer">
                                    {units.map(unit => <option key={unit}>{unit}</option>)}
                                  </select>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </label>
                      <label className="flex items-center gap-2 p-1 cursor-pointer">
                        <input type="checkbox" checked={isAllSides} onChange={(e) => setIsAllSides(e.target.checked)} className="accent-blue-500" />
                        {dialogAttr.label} on all sides
                      </label>
                    </details>
                  )}

                  {dialogAttr.number && ['number', 'percentage'].map(category => {
                    const draft = numberDrafts[category]
                    const draftText = draft.amount + draft.unit
                    return (
                      <details key={category} open>
                        <summary className="cursor-pointer text-blue-400">{category}</summary>
                        <label className="flex items-center gap-2 p-1 cursor-pointer">
                          <input type="radio" checked={Boolean(draft.amount) && dialogValue === draftText} onChange={() => setDialogValue(draft.amount ? draftText : '')} className="accent-blue-500" />
                          <div className="flex-1 flex items-center gap-1 p-2 border border-blue-200 rounded-sm focus-within:border-blue-500">
                            <input value={draft.amount} onChange={(e) => setNumber(category, { amount: e.target.value })} placeholder="0" className="w-full min-w-0 outline-none" />
                            {category === 'percentage' ? '%' : (
                              <select value={draft.unit} onChange={(e) => setNumber(category, { unit: e.target.value })} className="outline-none cursor-pointer">
                                {units.filter(unit => unit !== '%').map(unit => <option key={unit}>{unit}</option>)}
                              </select>
                            )}
                          </div>
                        </label>
                      </details>
                    )
                  })}

                  {isAdvanced && (
                    <details open={globalValues.includes(savedValue)}>
                      <summary className="cursor-pointer text-blue-400">global</summary>
                      {globalValues.map(option =>
                        <label key={option} className="flex items-center gap-2 p-1 cursor-pointer">
                          <input type="radio" checked={dialogValue === option} onChange={() => setDialogValue(option)} className="accent-blue-500" />
                          {option}
                        </label>
                      )}
                    </details>
                  )}

                  {keywordValues.length > 0 && (
                    <details open>
                      <summary className="cursor-pointer text-blue-400">keyword</summary>
                      {keywordValues.map(option =>
                        <label key={option} className="flex items-center gap-2 p-1 cursor-pointer">
                          <input type="radio" checked={dialogValue === option} onChange={() => setDialogValue(option)} className="accent-blue-500" />
                          {option}
                        </label>
                      )}
                    </details>
                  )}

                  {isAdvanced && (
                    <details open>
                      <summary className="cursor-pointer text-blue-400">custom</summary>
                      <label className="flex items-center gap-2 p-1 cursor-pointer">
                        <input type="radio" checked={Boolean(customDraft) && dialogValue === customDraft} onChange={() => setDialogValue(customDraft)} className="accent-blue-500" />
                        <input
                          value={customDraft}
                          onChange={(e) => {
                            setCustomDraft(e.target.value)
                            setDialogValue(e.target.value)
                          }}
                          placeholder="enter custom value"
                          className="flex-1 min-w-0 p-2 border border-blue-200 rounded-sm outline-none focus:border-blue-500"
                        />
                      </label>
                    </details>
                  )}

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={isAdvanced} onChange={(e) => setIsAdvanced(e.target.checked)} className="accent-blue-500" />
                    advance
                  </label>
                </>
              )}

              {isTextOnly && (
                <input
                  autoFocus
                  value={dialogValue}
                  onChange={(e) => setDialogValue(e.target.value)}
                  placeholder={`enter ${dialogAttr.label} value`}
                  className="p-2 border border-blue-200 rounded-sm outline-none focus:border-blue-500"
                />
              )}
            </div>

            <footer className="flex gap-2 p-2 bg-blue-500 text-white">
              {savedValue && <button onClick={() => saveDialog('')} className="px-3 py-2 rounded-sm cursor-pointer hover:bg-blue-400">REMOVE</button>}
              <div className="flex-1" />
              <button onClick={() => setDialogAttr(null)} className="px-3 py-2 rounded-sm cursor-pointer hover:bg-blue-400">CANCEL</button>
              <button onClick={() => saveDialog(dialogValue)} className="px-3 py-2 rounded-sm cursor-pointer hover:bg-blue-400">SAVE</button>
            </footer>
          </div>
        </div>
      )}

    </div>
  )
}

export default App
