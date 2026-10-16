import { Fragment, useState } from 'react'
import { units, globalValues, elementList, attributeList } from './data'

const iconBtn = "aspect-square flex-none flex items-center justify-center text-white rounded-sm hover:bg-blue-700 transition-colors cursor-pointer"
const inputBox = "flex items-center gap-1 p-2 border border-blue-200 rounded-sm focus-within:border-blue-500"
const emptySide = { amount: '', unit: 'rem' }

const newId = () => Date.now() + Math.random()
const getTag = item => item.label.split(' ')[0]
const toCamelCase = name => name.replace(/-(\w)/g, (_, letter) => letter.toUpperCase())

// "12px" becomes { amount: '12', unit: 'px' }
const toAmount = text => {
  const [, amount, unit] = text.match(/^(-?[\d.]*)(.*)$/)
  return { amount, unit: unit || 'rem' }
}
const isNumberText = text => /^-?[\d.]+[a-z%]*$/.test(text)
const isSidesText = text => text.split(' ').every(isNumberText)
const isCommonValue = (attr, value) => attr.options?.includes(value) || (attr.number && isNumberText(value)) || (attr.sides && isSidesText(value))

const toSidesText = sides => {
  const sideList = [sides.top, sides.right, sides.bottom, sides.left]
  if (sideList.every(side => !side.amount)) return ''
  const sideTexts = sideList.map(side => (side.amount || 0) + side.unit)
  const isSame = new Set(sideTexts).size === 1
  return isSame ? sideTexts[0] : sideTexts.join(' ')
}

// these helpers work at any depth of nested divs
const flattenItems = items => items.flatMap(item => [item, ...flattenItems(item.children)])
const containsItem = (item, id) => item.children.some(child => child.id === id || containsItem(child, id))
const copyItem = item => ({ ...item, id: newId(), children: item.children.map(copyItem) })

const updateItem = (items, id, change) => items.map(item =>
  item.id === id ? change(item) : { ...item, children: updateItem(item.children, id, change) }
)

const removeItem = (items, id) => items
  .filter(item => item.id !== id)
  .map(item => ({ ...item, children: removeItem(item.children, id) }))

// parentId null means the top level of the phone
const insertItem = (items, newItem, parentId, index) => {
  const insertAt = list => [...list.slice(0, index), newItem, ...list.slice(index)]
  if (parentId === null) return insertAt(items)
  return updateItem(items, parentId, item => ({ ...item, children: insertAt(item.children) }))
}

// the div that holds this id or null for top level
const findParent = (items, id) => {
  for (const item of items) {
    if (item.children.some(child => child.id === id)) return item
    const found = findParent(item.children, id)
    if (found) return found
  }
  return null
}

// find which slot the mouse is over inside a container
const getDropIndex = (e, container) => {
  const isRow = getComputedStyle(container).flexDirection.startsWith('row')
  const itemEls = Array.from(container.querySelectorAll(':scope > [data-item]'))
  const index = itemEls.findIndex(itemEl => {
    const rect = itemEl.getBoundingClientRect()
    return isRow ? e.clientX < rect.left + rect.width / 2 : e.clientY < rect.top + rect.height / 2
  })
  return index === -1 ? itemEls.length : index
}

// saved attributes become html props or inline styles
const elementProps = (item, className) => {
  const { class: userClass = '', disabled, ...attributes } = item.attributes ?? {}
  const htmlNames = ['id', 'src', 'alt', 'type', 'placeholder', 'value', 'name']
  const props = { style: {}, className: `${className} ${userClass} ${disabled === 'true' ? 'opacity-50' : ''}` }
  for (const [name, value] of Object.entries(attributes)) {
    if (!value) continue
    if (htmlNames.includes(name)) props[name] = value
    else props.style[toCamelCase(name)] = value
  }
  return props
}

const radioRow = (key, isChecked, onPick, content) => (
  <label key={key} className="flex items-center gap-2 p-1 cursor-pointer">
    <input type="radio" checked={isChecked} onChange={onPick} className="accent-blue-500" />
    {content}
  </label>
)

const unitSelect = (value, onChange, unitList = units) => (
  <select value={value} onChange={(e) => onChange(e.target.value)} className="outline-none cursor-pointer">
    {unitList.map(unit => <option key={unit}>{unit}</option>)}
  </select>
)

const group = (title, isOpen, content) => (
  <details open={isOpen}>
    <summary className="cursor-pointer text-blue-400">{title}</summary>
    {content}
  </details>
)

function App() {
  const [activeTab, setActiveTab] = useState('VIEW')
  const [drawerTab, setDrawerTab] = useState(0)
  const [sheetTab, setSheetTab] = useState('attributes')
  const [showSheet, setShowSheet] = useState(false)
  const [droppedItems, setDroppedItems] = useState([])
  const [selectedId, setSelectedId] = useState(null)

  // drag is { item, parentId, index } and index is null for new elements
  const [drag, setDrag] = useState(null)
  // dropTarget is { parentId, index } where the item will land
  const [dropTarget, setDropTarget] = useState(null)
  const [hoverZone, setHoverZone] = useState(null)

  const [dialogAttr, setDialogAttr] = useState(null)
  const [dialogValue, setDialogValue] = useState('')
  const [isAdvanced, setIsAdvanced] = useState(false)
  const [isAllSides, setIsAllSides] = useState(true)
  const [sidesDraft, setSidesDraft] = useState({ top: emptySide, right: emptySide, bottom: emptySide, left: emptySide })
  const [numberDraft, setNumberDraft] = useState(emptySide)
  const [percentDraft, setPercentDraft] = useState('')
  const [customDraft, setCustomDraft] = useState('')

  const allItems = flattenItems(droppedItems)
  const selectedItem = allItems.find(item => item.id === selectedId)
  const selectedTag = selectedItem && getTag(selectedItem)
  const nextId = label => getTag({ label }) + (allItems.filter(item => item.label === label).length + 1)
  const isDraggingDropped = drag && drag.index !== null

  const savedValue = selectedItem?.attributes?.[dialogAttr?.label] ?? ''
  const isTextOnly = dialogAttr && !dialogAttr.sides && !dialogAttr.options && !dialogAttr.number
  const isUncoveredValue = savedValue && !dialogAttr.more?.includes(savedValue) && !globalValues.includes(savedValue) && !isCommonValue(dialogAttr, savedValue)
  const keywordValues = [...(dialogAttr?.options ?? []), ...(isAdvanced ? dialogAttr?.more ?? [] : []), ...(isUncoveredValue ? [savedValue] : [])]
  const sidesText = toSidesText(sidesDraft)
  const numberText = numberDraft.amount + numberDraft.unit
  const percentText = percentDraft + '%'

  const selectItem = id => {
    setSelectedId(id)
    setShowSheet(id !== null)
  }

  const resetDrag = () => {
    setDrag(null)
    setDropTarget(null)
    setHoverZone(null)
  }

  const dropDragged = () => {
    if (!drag || !dropTarget) return resetDrag()
    const isSameList = drag.index !== null && drag.parentId === dropTarget.parentId
    const index = isSameList && drag.index < dropTarget.index ? dropTarget.index - 1 : dropTarget.index
    setDroppedItems(insertItem(removeItem(droppedItems, drag.item.id), drag.item, dropTarget.parentId, index))
    resetDrag()
  }

  const dupeSelected = (offset) => {
    if (!selectedItem) return
    const parent = findParent(droppedItems, selectedId)
    const list = parent ? parent.children : droppedItems
    const index = list.findIndex(item => item.id === selectedId)
    const copy = { ...copyItem(selectedItem), attributes: { ...selectedItem.attributes, id: nextId(selectedItem.label) } }
    setDroppedItems(insertItem(droppedItems, copy, parent ? parent.id : null, index + offset))
  }

  const openDialog = (attr) => {
    const value = selectedItem.attributes?.[attr.label] ?? ''
    const isPercent = isNumberText(value) && value.endsWith('%')
    const sideParts = attr.sides && isSidesText(value) ? value.split(' ') : []
    const [top = '', right = top, bottom = top, left = right] = sideParts
    setDialogAttr(attr)
    setDialogValue(value)
    setIsAdvanced(value !== '' && !isCommonValue(attr, value))
    setIsAllSides(top === right && top === bottom && top === left)
    setSidesDraft({ top: toAmount(top), right: toAmount(right), bottom: toAmount(bottom), left: toAmount(left) })
    setNumberDraft(isNumberText(value) && !isPercent ? toAmount(value) : emptySide)
    setPercentDraft(isPercent ? value.slice(0, -1) : '')
    setCustomDraft('')
  }

  const saveDialog = (value) => {
    setDroppedItems(updateItem(droppedItems, selectedId, item => ({ ...item, attributes: { ...item.attributes, [dialogAttr.label]: value } })))
    setDialogAttr(null)
  }

  const setSide = (side, change) => {
    const nextSide = { ...sidesDraft[isAllSides ? 'top' : side], ...change }
    const nextDraft = isAllSides ? { top: nextSide, right: nextSide, bottom: nextSide, left: nextSide } : { ...sidesDraft, [side]: nextSide }
    setSidesDraft(nextDraft)
    setDialogValue(toSidesText(nextDraft))
  }

  const setNumber = (change) => {
    const nextNumber = { ...numberDraft, ...change }
    setNumberDraft(nextNumber)
    setDialogValue(nextNumber.amount ? nextNumber.amount + nextNumber.unit : '')
  }

  const renderShadow = (parentId, index, isRow) => {
    const isTarget = drag && dropTarget?.parentId === parentId && dropTarget.index === index
    const isOwnSpot = drag?.index !== null && drag?.parentId === parentId && (index === drag?.index || index === drag?.index + 1)
    if (!isTarget || isOwnSpot) return null
    const height = { image: 'h-20', text: 'h-6', div: 'min-h-12' }[getTag(drag.item)] ?? 'h-8'
    return <div className={`${height} ${isRow ? 'flex-1' : 'w-full shrink-0'} border-2 border-dashed border-blue-300 bg-blue-50/60 rounded-sm shadow-inner pointer-events-none`} />
  }

  const renderElement = (item, parentId, index) => {
    const tag = getTag(item)
    const direction = item.attributes?.['flex-direction'] || (item.label === 'div (row)' ? 'row' : 'column')
    const isRow = direction.startsWith('row')
    const stateClass = `cursor-grab active:cursor-grabbing ${selectedId === item.id ? 'ring-2 ring-yellow-300' : ''} ${drag?.item.id === item.id ? 'opacity-40' : ''}`
    const props = className => ({
      ...elementProps(item, `${className} ${stateClass}`),
      'data-item': true,
      draggable: true,
      onDragEnd: resetDrag,
      onClick: (e) => {
        e.stopPropagation()
        selectItem(item.id)
      },
      onDragStart: (e) => {
        e.stopPropagation()
        setDrag({ item, parentId, index })
      }
    })

    if (tag === 'button') return <button {...props('w-full p-2 bg-blue-500 text-white rounded-sm')}>button</button>
    if (tag === 'text') return <p {...props('p-1 text-blue-900')}>text</p>
    if (tag === 'input') return <input readOnly placeholder="input" {...props('w-full p-2 border border-blue-200 rounded-sm bg-white')} />
    if (tag === 'image' && item.attributes?.src) return <img {...props('w-full h-20 object-cover rounded-sm')} />
    if (tag === 'image') return (
      <div {...props('w-full h-20 bg-blue-100 rounded-sm flex items-center justify-center text-blue-400')}>
        <span className="material-symbols-outlined text-2xl pointer-events-none">image</span>
      </div>
    )

    return (
      <div
        {...props(`p-2 border border-dashed border-blue-300 rounded-sm min-h-12 flex ${isRow ? 'flex-row' : 'flex-col'} gap-2 ${dropTarget?.parentId === item.id ? 'bg-blue-100/40 border-blue-500' : ''}`)}
        onDragOver={(e) => {
          // a div cannot go inside itself so let its parent handle it
          const isInsideDragged = drag && (drag.item.id === item.id || containsItem(drag.item, item.id))
          if (isInsideDragged) return
          e.preventDefault()
          e.stopPropagation()
          setDropTarget({ parentId: item.id, index: getDropIndex(e, e.currentTarget) })
        }}
      >
        {item.children.map((child, childIndex) =>
          <Fragment key={child.id}>
            {renderShadow(item.id, childIndex, isRow)}
            {renderElement(child, item.id, childIndex)}
          </Fragment>
        )}
        {renderShadow(item.id, item.children.length, isRow)}
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col lg:gap-2 overflow-hidden font-sans text-xs text-blue-900 relative">

      <div className="flex flex-col lg:overflow-hidden">
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
              { label: 'DELETE', icon: 'delete', highlight: 'bg-red-500' }
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
                  if (zone.label === 'DELETE') setDroppedItems(removeItem(droppedItems, drag.item.id))
                  if (zone.label === 'DELETE' && selectedId === drag.item.id) selectItem(null)
                  resetDrag()
                }}
                className={`flex-1 flex gap-2 p-3 items-center justify-center font-medium border-b-6 border-transparent text-white transition-colors ${hoverZone === zone.label ? zone.highlight : 'bg-blue-500'}`}
              >
                <span className="material-symbols-outlined text-lg">{zone.icon}</span>
                {zone.label}
              </div>
            )}
          </nav>
        ) : (
          <nav className="flex">
            {['VIEW', 'CODE'].map(tab =>
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 flex p-3 items-center justify-center cursor-pointer font-medium border-b-6 bg-blue-500 hover:bg-blue-400 text-white ${activeTab === tab ? 'border-yellow-300' : 'border-transparent'}`}
              >
                {tab}
              </button>
            )}
          </nav>
        )}
      </div>

      <main className="flex-1 min-h-0 flex lg:px-16 lg:gap-8">
        <aside className="w-1/3 h-full flex-none flex flex-col gap-2 p-2 overflow-hidden border border-blue-200 lg:rounded-sm">
          <div className="flex-none flex gap-2">
            {[
              { label: 'Elements', icon: 'add_box' },
              { label: 'Templates', icon: 'widgets' }
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
          {elementList.map(element =>
            <div
              key={element.label}
              draggable
              onDragStart={() => {
                const newItem = { ...element, id: newId(), attributes: { ...element.attributes, id: nextId(element.label) }, children: [] }
                setDrag({ item: newItem, parentId: null, index: null })
              }}
              onDragEnd={resetDrag}
              className="flex items-center p-2 gap-2 lg:justify-center border border-blue-100 rounded-sm bg-white hover:bg-blue-50 cursor-grab active:cursor-grabbing transition-colors"
            >
              <span className="material-symbols-outlined text-lg">{element.icon}</span>
              {element.label}
            </div>
          )}
        </aside>

        <div
          onClick={() => selectItem(null)}
          className="flex-1 h-full min-w-0 flex items-start justify-center p-2 overflow-hidden border border-blue-200 lg:rounded-sm bg-blue-50"
          style={{ containerType: 'size' }}
        >
          <div
            onDragOver={(e) => {
              e.preventDefault()
              setDropTarget({ parentId: null, index: getDropIndex(e, e.currentTarget) })
            }}
            onDragLeave={(e) => {
              const isLeavingPhone = !e.currentTarget.contains(e.relatedTarget)
              if (isLeavingPhone) setDropTarget(null)
            }}
            onDrop={(e) => {
              e.preventDefault()
              dropDragged()
            }}
            onClick={(e) => {
              e.stopPropagation()
              selectItem(null)
            }}
            className="aspect-9/16 flex flex-col p-2 gap-2 bg-white border border-blue-200 rounded-sm text-blue-400 overflow-y-auto"
            style={{ width: 'min(calc(100cqw - 1rem), calc((100cqh - 1rem) * 9 / 16))' }}
          >
            {droppedItems.length === 0 && !dropTarget && <div className="m-auto">phone layout</div>}
            {droppedItems.map((item, i) =>
              <Fragment key={item.id}>
                {renderShadow(null, i, false)}
                {renderElement(item, null, i)}
              </Fragment>
            )}
            {renderShadow(null, droppedItems.length, false)}
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
            <span className="material-symbols-outlined text-lg">arrow_drop_down</span>
            <div className="flex-1" />
            <button onClick={() => selectItem(null)} className={`${iconBtn} h-full`}>
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
              attributes: attributeList.filter(attr => !attr.only || attr.only.includes(selectedTag)),
              options: [
                { label: 'dupe before', icon: 'add_row_above', action: () => dupeSelected(0) },
                { label: 'dupe after', icon: 'add_row_below', action: () => dupeSelected(1) }
              ],
              events: [
                { label: 'on click', icon: 'touch_app' }
              ]
            }[sheetTab].map((sheetItem, i, list) => {
              const isNewCategory = sheetItem.category && list[i - 1]?.category !== sheetItem.category
              const value = selectedItem?.attributes?.[sheetItem.label]
              return (
                <Fragment key={sheetItem.label}>
                  {isNewCategory && (
                    <div className="flex-none flex items-center justify-center p-1 border border-blue-200 rounded-sm rotate-180 [writing-mode:vertical-rl]">
                      {sheetItem.category === 'element' ? selectedTag : sheetItem.category}
                    </div>
                  )}
                  <button
                    onClick={sheetTab === 'attributes' ? () => openDialog(sheetItem) : sheetItem.action}
                    className="size-24 flex-none flex flex-col p-1 items-center justify-center text-center leading-tight bg-white border border-blue-200 rounded-sm hover:bg-blue-100 cursor-pointer transition-colors"
                  >
                    <span className="material-symbols-outlined text-lg text-blue-500">{sheetItem.icon}</span>
                    {sheetItem.label}
                    {value && <span className="max-w-full truncate text-blue-400">{value}</span>}
                  </button>
                </Fragment>
              )
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
              {isTextOnly && (
                <input
                  autoFocus
                  value={dialogValue}
                  onChange={(e) => setDialogValue(e.target.value)}
                  placeholder={`enter ${dialogAttr.label} value`}
                  className="p-2 border border-blue-200 rounded-sm outline-none focus:border-blue-500"
                />
              )}

              {dialogAttr.sides && group('sides', true, <>
                {radioRow('sides', Boolean(sidesText) && dialogValue === sidesText, () => setDialogValue(sidesText),
                  <div className={`flex-1 grid gap-2 ${isAllSides ? 'grid-cols-1' : 'grid-cols-2'}`}>
                    {(isAllSides ? ['all sides'] : ['left', 'right', 'top', 'bottom']).map(side => {
                      const sideValue = sidesDraft[isAllSides ? 'top' : side]
                      return (
                        <div key={side} className="flex flex-col gap-1">
                          {side}
                          <div className={inputBox}>
                            <input value={sideValue.amount} onChange={(e) => setSide(side, { amount: e.target.value })} placeholder="0" className="w-full min-w-0 outline-none" />
                            {unitSelect(sideValue.unit, unit => setSide(side, { unit }))}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
                <label className="flex items-center gap-2 p-1 cursor-pointer">
                  <input type="checkbox" checked={isAllSides} onChange={(e) => setIsAllSides(e.target.checked)} className="accent-blue-500" />
                  {dialogAttr.label} on all sides
                </label>
              </>)}

              {dialogAttr.number && group('number', true,
                radioRow('number', Boolean(numberDraft.amount) && dialogValue === numberText, () => setDialogValue(numberDraft.amount ? numberText : ''),
                  <div className={`flex-1 ${inputBox}`}>
                    <input value={numberDraft.amount} onChange={(e) => setNumber({ amount: e.target.value })} placeholder="0" className="w-full min-w-0 outline-none" />
                    {unitSelect(numberDraft.unit, unit => setNumber({ unit }), units.filter(unit => unit !== '%'))}
                  </div>
                )
              )}

              {dialogAttr.number && group('percentage', true,
                radioRow('percentage', Boolean(percentDraft) && dialogValue === percentText, () => setDialogValue(percentDraft ? percentText : ''),
                  <div className={`flex-1 ${inputBox}`}>
                    <input
                      value={percentDraft}
                      onChange={(e) => {
                        setPercentDraft(e.target.value)
                        setDialogValue(e.target.value ? e.target.value + '%' : '')
                      }}
                      placeholder="0"
                      className="w-full min-w-0 outline-none"
                    />
                    %
                  </div>
                )
              )}

              {isAdvanced && group('global', globalValues.includes(savedValue),
                globalValues.map(option => radioRow(option, dialogValue === option, () => setDialogValue(option), option))
              )}

              {keywordValues.length > 0 && group('keyword', true,
                keywordValues.map(option => radioRow(option, dialogValue === option, () => setDialogValue(option), option))
              )}

              {isAdvanced && group('custom', true,
                radioRow('custom', Boolean(customDraft) && dialogValue === customDraft, () => setDialogValue(customDraft),
                  <input
                    value={customDraft}
                    onChange={(e) => {
                      setCustomDraft(e.target.value)
                      setDialogValue(e.target.value)
                    }}
                    placeholder="enter custom value"
                    className="flex-1 min-w-0 p-2 border border-blue-200 rounded-sm outline-none focus:border-blue-500"
                  />
                )
              )}

              {!isTextOnly && (
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={isAdvanced} onChange={(e) => setIsAdvanced(e.target.checked)} className="accent-blue-500" />
                  advance
                </label>
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
