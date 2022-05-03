let window_resize_timeout

window.addEventListener('resize', ()=>{
  toggleNotifyMessage('The desktop is being resized, so the windows will be repositioned', 0, 1)
  if (window_resize_timeout) clearTimeout(window_resize_timeout)

  window_resize_timeout = setTimeout(()=>{
    toggleNotifyMessage('0', 1)

    let desktop_size = getDesktopSize()
    
    $('.window-frame').each(function() {

      if (windows[$(this).attr('id')]['isMaximized']) {
        toggleMaximize(this, 1)
      }
      setTimeout(()=> {
        let window_size = [$(this).width(), $(this).height()]

        $(this).css('left', ((desktop_size[0]/2)-(window_size[0]/2))+'px')
        $(this).css('top', ((desktop_size[1]/2)-(window_size[1]/2))+'px')
      }, 600)
    })
  }, 800)
}) // end - addEventListener resize


function toggleNotifyMessage(new_message='', hide=0, important=0) {
  const notify_text_el = getElById('notify-text')

  if (hide) {
    notify_text_el.parentElement.style.zIndex = 1;
    notify_text_el.style.opacity = 0;
    return 0
  } 

  notify_text_el.style.opacity = 1

  if (important) {
    notify_text_el.parentElement.style.zIndex = 6;
    notify_text_el.style.width = '100%'
    notify_text_el.style.height = '100%'
  } else {
    notify_text_el.parentElement.style.zIndex = 1;
    notify_text_el.style.width = 'auto'
    notify_text_el.style.height = 'auto'
  }
  notify_text_el.firstElementChild.innerHTML = new_message
} // end - toggleNotifyMessage


function ghostMaximizePreview(the_window=undefined, direction='', hide=0) {
  const ghost_maximize_element = getElById('ghost-maximize-preview')
  const maximize_element_style = ghost_maximize_element.style

  if (hide) {
    maximize_element_style.opacity = 0
    maximize_element_style.height = '0vh'
    maximize_element_style.transition = '400ms 400ms cubic-bezier(.57,.01,.27,1)'
    return 0
  }
  
  maximize_element_style.opacity = 1
  maximize_element_style.height = '100vh'
  maximize_element_style.transition = '400ms cubic-bezier(.57,.01,.27,1)'
  void ghost_maximize_element.offsetWidth

  let desktop_size = getDesktopSize()
  
  if (direction == 'full') {
    maximize_element_style.width = '100vw'
    maximize_element_style.left = 0+'px'

  } else if (direction == 'right') {
    maximize_element_style.width = desktop_size[0]/2+'px'
    maximize_element_style.left = desktop_size[0]/2+'px'
    
  } else if (direction == 'left') {
    maximize_element_style.width = desktop_size[0]/2+'px'
    maximize_element_style.left = 0+'px'
    
  } else {
    let computed_style_window = getComputedStyle(the_window)
    maximize_element_style.left = the_window.style.left
    maximize_element_style.width = computed_style_window.width
  }
} // end - ghostMaximizePreview