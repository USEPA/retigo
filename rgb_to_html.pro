function rgb_to_html, r, g, b
  ; take r, g, b vectors and return a corresponding vector of html colors.
  ;
  ; For example:
  ;
  ; r=131, g=50, b=235 -> #8332EB


  if ( (n_elements(r) NE n_elements(g)) OR (n_elements(r) NE n_elements(b)) ) then begin
      message, 'rgb vector lengths do not match'
  endif

  html = strarr(n_elements(r))

  for ind=0L, n_elements(r)-1 do begin
      html[ind] = "'" + '#' + string(r[ind], format='(Z02)') + string(g[ind], format='(Z02)') + string(b[ind], format='(Z02)') + "'"
  endfor

  return, html

end
