// keep these two lists in sync with the safelist in index.css
export const spacingScale = ['0', 'px', '0.5', '1', '1.5', '2', '2.5', '3', '3.5', '4', '5', '6', '7', '8', '9', '10', '11', '12', '14', '16', '20', '24', '28', '32', '36', '40', '44', '48', '52', '56', '60', '64', '72', '80', '96']
export const fractions = ['1/2', '1/3', '2/3', '1/4', '3/4', '1/5', '2/5', '3/5', '4/5', '1/6', '5/6']

// attributes here are the starting tailwind classes of each element
export const elementList = [
  { label: 'div (row)', icon: 'view_column', attributes: { display: 'flex', 'flex-direction': 'flex-row', gap: 'gap-2', padding: 'p-2' } },
  { label: 'div (col)', icon: 'table_rows', attributes: { display: 'flex', 'flex-direction': 'flex-col', gap: 'gap-2', padding: 'p-2' } },
  { label: 'button', icon: 'left_click', attributes: { width: 'w-full', padding: 'p-2', background: 'bg-blue-500', color: 'text-white' } },
  { label: 'text', icon: 'text_fields', attributes: { padding: 'p-1', color: 'text-blue-900' } },
  { label: 'image', icon: 'image', attributes: { width: 'w-full', height: 'h-20', 'object-fit': 'object-cover' } },
  { label: 'input', icon: 'text_format', attributes: { width: 'w-full', padding: 'p-2', border: 'border', background: 'bg-white' } }
]

const textColors = ['text-slate-500', 'text-red-500', 'text-orange-500', 'text-yellow-500', 'text-green-500', 'text-blue-500', 'text-blue-900', 'text-indigo-500', 'text-purple-500', 'text-pink-500']
const backgroundColors = ['bg-transparent', 'bg-slate-500', 'bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500', 'bg-blue-500', 'bg-indigo-500', 'bg-purple-500', 'bg-pink-500']

// prefix builds classes like p-4 or w-1/2
// options are common classes and more are hidden behind advance
// scale uses spacingScale and fraction uses fractions
export const attributeList = [
  { category: 'layout', label: 'display', icon: 'view_quilt', options: ['block', 'flex', 'hidden'], more: ['inline', 'inline-block', 'inline-flex', 'grid', 'contents'] },
  { category: 'layout', label: 'width', icon: 'width', prefix: 'w', options: ['w-auto', 'w-full', 'w-fit'], more: ['w-screen', 'w-min', 'w-max'], scale: true, fraction: true },
  { category: 'layout', label: 'height', icon: 'height', prefix: 'h', options: ['h-auto', 'h-full', 'h-fit'], more: ['h-screen', 'h-min', 'h-max'], scale: true, fraction: true },
  { category: 'layout', label: 'margin', icon: 'arrows_output', prefix: 'm', options: ['m-auto', 'mx-auto'], sides: true },
  { category: 'layout', label: 'padding', icon: 'arrows_input', prefix: 'p', sides: true },
  { category: 'layout', label: 'position', icon: 'open_with', options: ['static', 'relative', 'absolute'], more: ['fixed', 'sticky'] },
  { category: 'layout', label: 'z-index', icon: 'layers', options: ['z-0', 'z-10', 'z-20', 'z-30', 'z-40', 'z-50'], more: ['z-auto'] },
  { category: 'element', label: 'flex-direction', icon: 'swap_horiz', only: ['div'], options: ['flex-row', 'flex-col'], more: ['flex-row-reverse', 'flex-col-reverse'] },
  { category: 'element', label: 'justify-content', icon: 'align_horizontal_center', only: ['div'], options: ['justify-start', 'justify-center', 'justify-end', 'justify-between'], more: ['justify-around', 'justify-evenly'] },
  { category: 'element', label: 'align-items', icon: 'align_vertical_center', only: ['div'], options: ['items-stretch', 'items-start', 'items-center', 'items-end'], more: ['items-baseline'] },
  { category: 'element', label: 'gap', icon: 'space_bar', only: ['div'], prefix: 'gap', scale: true },
  { category: 'element', label: 'src', icon: 'image', only: ['image'] },
  { category: 'element', label: 'alt', icon: 'short_text', only: ['image'] },
  { category: 'element', label: 'object-fit', icon: 'fit_screen', only: ['image'], options: ['object-cover', 'object-contain'], more: ['object-fill', 'object-none', 'object-scale-down'] },
  { category: 'element', label: 'type', icon: 'category', only: ['input'], options: ['text', 'number', 'email', 'password'] },
  { category: 'element', label: 'type', icon: 'category', only: ['button'], options: ['button', 'submit', 'reset'] },
  { category: 'element', label: 'placeholder', icon: 'edit_note', only: ['input'] },
  { category: 'element', label: 'value', icon: 'data_object', only: ['input'] },
  { category: 'element', label: 'name', icon: 'badge', only: ['input'] },
  { category: 'element', label: 'disabled', icon: 'block', only: ['input', 'button'], options: ['true', 'false'] },
  { category: 'typography', label: 'color', icon: 'format_color_text', only: ['text', 'button', 'input'], options: ['text-black', 'text-white'], more: textColors },
  { category: 'typography', label: 'font-size', icon: 'format_size', only: ['text', 'button', 'input'], options: ['text-sm', 'text-base', 'text-lg'], more: ['text-xs', 'text-xl', 'text-2xl', 'text-3xl', 'text-4xl', 'text-5xl'] },
  { category: 'typography', label: 'font-weight', icon: 'format_bold', only: ['text', 'button', 'input'], options: ['font-normal', 'font-bold'], more: ['font-thin', 'font-light', 'font-medium', 'font-semibold', 'font-extrabold', 'font-black'] },
  { category: 'typography', label: 'text-align', icon: 'format_align_center', only: ['text', 'button', 'input'], options: ['text-left', 'text-center', 'text-right'], more: ['text-justify', 'text-start', 'text-end'] },
  { category: 'typography', label: 'line-height', icon: 'format_line_spacing', only: ['text', 'button', 'input'], options: ['leading-none', 'leading-tight', 'leading-normal', 'leading-loose'], more: ['leading-snug', 'leading-relaxed'] },
  { category: 'visual', label: 'border', icon: 'border_style', options: ['border', 'border-2', 'border-0'], more: ['border-4', 'border-8'] },
  { category: 'visual', label: 'background', icon: 'background_replace', options: ['bg-white', 'bg-black'], more: backgroundColors },
  { category: 'visual', label: 'cursor', icon: 'arrow_selector_tool', options: ['cursor-pointer', 'cursor-default'], more: ['cursor-auto', 'cursor-text', 'cursor-not-allowed', 'cursor-grab', 'cursor-move'] },
  { category: 'identity', label: 'id', icon: 'tag' },
  { category: 'identity', label: 'class', icon: 'label' }
]
