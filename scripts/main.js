function getElById(id, return_el_value=0, parse_int=0) {
  let element = document.getElementById(id)
  if (return_el_value) {
    element = element.value
    if (parse_int) element = parseInt(element)
  }
  return element
} // end - getElById
