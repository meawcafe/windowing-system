let windows = {}
let current_focused_window_id = ''
const desktop_container = getElById('desktop-container')
const random_windows = [
  'wzRHgMWlWHk', 'DG2NyQ7C0rM'
]


function transparentWindowOnDrag(the_window, mouse_down) {
  if (mouse_down) {
    // the_window.css("opacity", "0.7")
    the_window.css("transition", "transform 200ms, opacity 200ms")
  } else {
    // the_window.css("opacity", "1")
    the_window.css("transition", "400ms cubic-bezier(.57,.01,.27,1)")
  }
} // end - transparentWindowOnDrag


function getDesktopSize() {
  return [desktop_container.offsetWidth, desktop_container.offsetHeight]
} // end - getDesktopSize


function getWindowSize(the_window) {
  return [the_window.offsetWidth, the_window.offsetHeight]
} // end - getWindowSize


function choiceARandomContent() {
  let random_choice = Math.floor(Math.random() * 2)

  if (random_choice) {
    random_choice = Math.floor(Math.random() * (random_windows.length))
    return [
      `<iframe src="https://www.youtube.com/embed/${random_windows[random_choice]}" title="YouTube video player" frameborder="0" allow="autoplay; clipboard-write; encrypted-media;"></iframe>`,
      true
    ]
  } else {
    return ['<span class="span-text">yay ♡</span>', false]
  }
} // end - choiceARandomContent


function createWindow() {
  let new_window_id = `window${Object.keys(windows).length}`
  let window_content = choiceARandomContent()

  windows[new_window_id] = {
    'isMaximized': false,    // status se a janela está maximizada ou não
    'beforeSize': [0, 0],    // salva o tamanho antes de maximizar
    'beforePosition': [0, 0] // salva a posicao x,y antes de maximizar
  }

  let new_window_HTML = `
    <div class="window-frame" id=${new_window_id}>
      <div class="title-bar">
        <span class="span-text">${new_window_id}.exe</span>
        <div class="dots">
          <span></span>
          <span onclick="toggleMaximize(this)"></span>
          <span onclick="destroyWindow(this)"></span>
        </div>
      </div>
      <div class="window-body">
        <div class="iframe-fix"></div>
        ${window_content[0]}
      </div>
    </div>
  `
  desktop_container.innerHTML += new_window_HTML

  let created_window = getElById(new_window_id)
  let desktop_size = getDesktopSize()
  let window_size = getWindowSize(created_window)

  // background preto caso o conteúdo seja um iframe
  if (window_content[1]) {
    created_window.getElementsByClassName('window-body')[0].style.backgroundColor = 'black'
  }

  function randomNumber(number) {
    number = number/4
    return Math.floor(Math.random() * number) - (number/2)
  }
  
  let win_style = created_window.style
  win_style.left = ((desktop_size[0]/2)-(window_size[0]/2)-randomNumber(desktop_size[0]))+'px'
  win_style.top = ((desktop_size[1]/2)-(window_size[1]/2)-randomNumber(desktop_size[1]))+'px'

  win_style.opacity = 1
  win_style.transform = 'scale(1)'

  jQueryLoadWindow()
  toggleFocusedWindow(created_window)
} // end - createWindow


function destroyWindow(the_window, isWindowFrame=0) {
  if (!isWindowFrame) 
    the_window = the_window.parentElement.parentElement.parentElement;
  
  the_window.style.transition = 'top 400ms cubic-bezier(0.8, 0, 1, 1), opacity 280ms 100ms'
  the_window.style.top = getDesktopSize()[1]+'px'
  the_window.style.opacity = 0
  
  setTimeout(()=> {
    the_window.remove()
  }, 1000)
} // end - destroyWindow


function toggleFocusedWindow(the_window) {
  if (current_focused_window_id) {
    try {
      getElById(current_focused_window_id)
      .classList.remove('current-focused-window')
    } catch {}
  }

  the_window.classList.add('current-focused-window')
  current_focused_window_id = the_window.id
} // end - toggleFocusedWindow


function toggleMaximize(the_window, isWindowFrame=0, maximizeOnlyVertical=0, isTilingWindow=0, TilingDirection=0) {
  if (!isWindowFrame)
    the_window = the_window.parentElement.parentElement.parentElement;

  // cs = computed style
  let cs_the_window = getComputedStyle(the_window)

  let window_config = windows[the_window.id]
 
  if (window_config['isMaximized']) {
    window_config['isMaximized'] = false

    toggleResizeHandleVisibility(the_window, 0)

    // aplica o tamanho e posicao salvo anteriormente antes de maximizar
    the_window.style.width = window_config['beforeSize'][0]
    the_window.style.height = window_config['beforeSize'][1]
    
    the_window.style.left = window_config['beforePosition'][0]
    the_window.style.top = window_config['beforePosition'][1]
  } else {
    window_config['isMaximized'] = true
    
    toggleResizeHandleVisibility(the_window, 1)

    // atualiza a janela com o estilo computado para nao bugar o transition
    the_window.style.width = cs_the_window.width
    the_window.style.height = cs_the_window.height

    // salva o tamanho antes de maximizar
    window_config['beforeSize'][0] = cs_the_window.width
    window_config['beforeSize'][1] = cs_the_window.height
    

    // salva a posicao antes de maximizar
    let current_window_position = [parseInt(cs_the_window.left), parseInt(cs_the_window.top)]
    let new_window_position = [current_window_position[0], current_window_position[1]]

    // obs: verifica se a janela estava fora do desktop quando foi maximizada
    if (current_window_position[0] < 0) 
      new_window_position[0] = 20;
    else if ((current_window_position[0] + parseInt(cs_the_window.width)) > getDesktopSize()[0])
      new_window_position[0] = (getDesktopSize()[0] - parseInt(cs_the_window.width))-20;
    
    if (current_window_position[1] < 0) 
      new_window_position[1] = 20;
    else if ((current_window_position[1] + parseInt(cs_the_window.height)) > getDesktopSize()[1])
      new_window_position[1] = (getDesktopSize()[1] - parseInt(cs_the_window.height))-20;
    
    window_config['beforePosition'][0] = new_window_position[0]+'px'
    window_config['beforePosition'][1] = new_window_position[1]+'px'
    // fim do salvamento da posicao antes de maximizar

    // seta o tamanho da window frame para o tamanho do desktop container
    the_window.style.height = '100vh'

    // se for tiling window, o width da janela terá metade do width do desktop-container
    if (!maximizeOnlyVertical) 
      the_window.style.width = isTilingWindow ? (parseInt(getDesktopSize()[0])/2)+'px' : '100vw';
    
    // seta posicao 0 para maximizar corretamente e nao sair da tela
    the_window.style.top = 0
    if (isTilingWindow) {
      the_window.style.left = TilingDirection ? getDesktopSize()[0]/2+'px' : 0
    } else {
      if (!maximizeOnlyVertical) 
        the_window.style.left = 0;
    }
  }
} // end - toggleMaximize



function toggleResizeHandleVisibility(the_window, hide=0) {
  if (hide) 
    the_window.classList.add('hide-resize-handle');
  else 
    the_window.classList.remove('hide-resize-handle');
} // end - toggleResizeHandleVisibility