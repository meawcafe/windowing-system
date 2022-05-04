let for_mobile_devices = 0

function getElById(id, return_el_value=0, parse_int=0) {
  let element = document.getElementById(id)
  if (return_el_value) {
    element = element.value
    if (parse_int) element = parseInt(element)
  }
  return element
} // end - getElById


window.onload = function() {
  if (window.innerWidth <= 400) {
    for_mobile_devices = 1
    getElById('notify-text').firstElementChild.innerHTML += ' [ mobile mode ON ]'
  }
};