export const units = ['rem', 'px', 'em', '%', 'vh', 'vw', 'vmin', 'vmax', 'ch']
export const globalValues = ['inherit', 'initial', 'revert', 'revert-layer', 'unset']

export const elementList = [
  { label: 'div (row)', icon: 'view_column', attributes: { display: 'flex', 'flex-direction': 'row' } },
  { label: 'div (col)', icon: 'table_rows', attributes: { display: 'flex', 'flex-direction': 'column' } },
  { label: 'button', icon: 'left_click' },
  { label: 'text', icon: 'text_fields' },
  { label: 'image', icon: 'image' },
  { label: 'input', icon: 'text_format' }
]

// options are common values and more are hidden behind advance
export const attributeList = [
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
]
