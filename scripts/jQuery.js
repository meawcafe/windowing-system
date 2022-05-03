function jQueryDraggable() {
  $(".window-frame")
  .draggable({
    // containment: "parent", // solução para reconhecer touch de celulares
    // snap: true,        // grudar janelas pela borda quando estao proximas
    // snapTolerance: 10, // tolerancia do snap
    distance: 12,      // distancia minima após o clique para começar a arrastar a janela
    cursor: "move",    // muda o cursor do mouse quando arrasta (é possivel personalizar)
    iframeFix: true,   // resolve um problema caso voce use a tag iframe (o mouse entra dentro e para de arrastar)
    cancel: '.window-body, .dots', // cancela o draggable nos elementos com essas classes
    handle: ".title-bar", // elementos com essa classe sao os que podem ser clicados para arrastar o elemento principal
    start: function () {
      transparentWindowOnDrag($(this), 1)

      let window_config = windows[$(this).attr('id')]

      if (window_config['isMaximized']) {
        toggleResizeHandleVisibility(this, 0)

        $(this).css('width', window_config['beforeSize'][0])
        $(this).css('height', window_config['beforeSize'][1])
      }
    }, // end - draggable [ start ]

    stop: function (event) {
      transparentWindowOnDrag($(this), 0)

      ghostMaximizePreview(undefined, '', 1)

      let window_config = windows[$(this).attr('id')]

      if (window_config['isMaximized']) {
        window_config['isMaximized'] = false
      }
      
      // tiling window (arrastar para os lados para maximizar metade da janela)
      let mouse_position_x = checkReadyToMaximizeByMousePosition(event, 'x')
      if (mouse_position_x) {
        toggleMaximize(this, 1, 0, 1, mouse_position_x-1)
        return 0
      } 
      
      if (checkReadyToMaximizeByMousePosition(event, 'y')) {
        toggleMaximize(this, 1)
      } 

      // arrastar a janela para baixo e perder
      if (event.clientY+($(this).height())/5 > getDesktopSize()[1]) {
        $(this).css('top', (getDesktopSize()[1]-$(this).height())-20)
      }
    }, // end - draggable [ stop ]

    drag: function(event, ui) {
      let window_config = windows[$(this).attr('id')]

      if (window_config['isMaximized']) {
        ui.position.left = (event.clientX)-$(this).width()/2
        ui.position.top = (event.clientY)-20
      }

      // tiling window (arrastar para os lados para maximizar metade da janela)
      let mouse_position_x = checkReadyToMaximizeByMousePosition(event, 'x')
      if (mouse_position_x) {
        if (mouse_position_x == 1) {ghostMaximizePreview(undefined, 'left')}
        if (mouse_position_x == 2) {ghostMaximizePreview(undefined, 'right')}
      } else if (checkReadyToMaximizeByMousePosition(event, 'y')) {
        ghostMaximizePreview(undefined, 'full')
      } else {
        ghostMaximizePreview(undefined, '', 1)
      }
    } // end - draggable [ drag ]
  })

  .mousedown(function() {
    toggleFocusedWindow(this)
  })
}

function jQueryResizable() {
  $(".window-frame")
  .resizable({
    containment: '#desktop-container',
    handles: 'all',
    minWidth: 300,
    iframeFix: true,
    minHeight: 200,
    start: function () {
      transparentWindowOnDrag($(this), 1)
      
      $(this).removeClass('current-focused-window')
    }, // end - resizable [ start ]

    stop: function (event) {
      transparentWindowOnDrag($(this), 0)

      ghostMaximizePreview(undefined, '', 1)

      $(this).addClass('current-focused-window')

      if (checkReadyToMaximizeByMousePosition(event, 'y')) {
        toggleMaximize(this, 1, 1)
      }
    }, // end - resizable [ stop ]

    resize: function(event) {
      if (checkReadyToMaximizeByMousePosition(event, 'y')) {
        ghostMaximizePreview(this, 'tiling')
      } else {
        ghostMaximizePreview(undefined, '', 1)
      }
    } // end - resizable [ resize ]
  })
} // end - jQueryResizable

function jQueryLoadWindow() {
  jQueryResizable()

  // será necessário destruir o resizable e aplicar novamente
  // senão deixará de funcionar corretamente para todas as janelas
  $(".window-frame").resizable('destroy')

  jQueryResizable()

  jQueryDraggable()
} // end - jQueryLoadWindow


function checkReadyToMaximizeByMousePosition(event, axis) {
  function getMousePositionPercentage(event_client, client_axis) {
    return ((event_client/getDesktopSize()[client_axis])*100).toFixed(0);
  }
  
  if (axis == 'y') {
    return getMousePositionPercentage(event.clientY, 1) < 2;
  } 
  else {
    if (getMousePositionPercentage(event.clientX, 0) < 2) 
      return 1;
    else if (getMousePositionPercentage(event.clientX, 0) > 98) 
      return 2;
  }
} // end - checkReadyToMaximizeByMousePosition