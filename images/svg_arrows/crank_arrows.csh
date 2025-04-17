#!/bin/csh -f

# all possible colormaps
set colortable_stdgamma2=('#000000' '#000043' '#000087' '#0000D0' '#1C00EA' '#51009E' '#540057' '#950011' '#DE0000' '#FF2500' '#FF6D1C' '#FFA347' '#FFA300' '#A3A300' '#E5E623' '#FFFF50' '#FFFF7A' '#FFFFA7' '#FFFFD1' '#FFFFFF')
set colortable_bluered=('#000083' '#0000B3' '#0000E7' '#001BFF' '#004FFF' '#0087FF' '#00BBFF' '#00EFFF' '#23FFDB' '#57FFA7' '#8FFF6F' '#C3FF3B' '#FBFF03' '#FFCF00' '#FF9B00' '#FF6300' '#FF2F00' '#F60000' '#BD0000' '#830000')
set colortable_bluemono=('#99ccff' '#8cc3fc' '#80b9f8' '#73b0f4' '#68a6f1' '#5c9ded' '#5093e8' '#4589e4' '#3a80e0' '#2f76db' '#236cd6' '#1763d0' '#0859cb' '#004fc5' '#0044be' '#003ab7' '#002fb0' '#0023a9' '#0015a1' '#000099')
set colortable_viridis=('#450d54' '#481568' '#482677' '#453781' '#3f4788' '#39558c' '#32648e' '#2d708e' '#277d8e' '#238a8d' '#1f968b' '#20a386' '#29af7f' '#3cbc75' '#56c667' '#74d055' '#94d840' '#b8de29' '#dce317' '#fde725')
set colortable_colorsafe=('#000000' '#150088' '#2d00d8' '#461fd6' '#5732d4' '#6542d2' '#7052d0' '#7a60ce' '#937ac5' '#a795bb' '#BFBE6B' '#c9c866' '#d2d360' '#dcdd59' '#e5e852' '#eff249' '#f8fd3e' '#fffd89' '#fffec5' '#ffffff')
set colortable_stdgamma2_inverted=( "#FFFFFF", "#FFFFD1", "#FFFFA7", "#FFFF7A", "#FFFF50", "#E5E623", "#A3A300", "#FFA300", "#FFA347", "#FF6D1C", "#FF2500", "#DE0000", "#950011", "#540057", "#51009E", "#1C00EA", "#0000D0", "#000087", "#000043", "#000000")
set colortable_viridis_inverted=("#fde725", "#dce317", "#b8de29", "#94d840", "#74d055", "#56c667", "#3cbc75", "#29af7f", "#20a386", "#1f968b", "#238a8d", "#277d8e", "#2d708e", "#32648e", "#39558c", "#3f4788", "#453781", "#482677", "#481568", "#450d54")
set colortable_colorsafe_inverted=("#ffffff", "#fffec5", "#fffd89", "#f8fd3e", "#eff249", "#e5e852", "#dcdd59", "#d2d360", "#c9c866", "#BFBE6B", "#a795bb", "#937ac5", "#7a60ce", "#7052d0", "#6542d2", "#5732d4", "#461fd6", "#2d00d8", "#150088", "#000000")


# select one colormap here
#set colortable=`echo ${colortable_bluered}`
#set loc=bluered
#set colortable=`echo ${colortable_stdgamma2}`
#set loc=stdgamma2
#set colortable=`echo ${colortable_bluemono}`
#set loc=bluemono
#set colortable=`echo ${colortable_viridis}`
#set loc=viridis
#set colortable=`echo ${colortable_colorsafe}`
#set loc=colorsafe
#set colortable=`echo ${colortable_stdgamma2_inverted}`
#set loc=stdgamma2_inverted
#set colortable=`echo ${colortable_colorsafe_inverted}`
#set loc=colorsafe_inverted
set colortable=`echo ${colortable_viridis_inverted}`
set loc=viridis_inverted


@ colorInd=0
foreach thiscolor ($colortable)
  echo $thiscolor
  @ degrees=0
  while ($degrees < 360)
    set degree_zeropad = `echo $degrees | awk '{printf "%03d\n", $0}'`
    set colorind_zeropad = `echo $colorInd | awk '{printf "%02d\n", $0}'`
    set file_prefix1=conc_and_angle_${loc}/arrow_${colorind_zeropad}_${degree_zeropad}
    cat arrow_template_conc_and_angle.svg |sed "s/#MYCOLOR/${thiscolor}/g" | sed "s/MYDEGREES/${degrees}/g" > arrow_test.svg
    rsvg-convert --width=44 --height=44 -f png -o ${file_prefix1}.png arrow_test.svg
 
    if ($degrees == 0) then
      cat arrow_template_conc.svg |sed "s/#MYCOLOR/${thiscolor}/g" > arrow_test.svg
      set file_prefix2=conc_{loc}
      cp arrow_test.svg conc_${loc}/arrow_${colorind_zeropad}.svg
    endif

    @ degrees += 1
  end
  @ colorInd += 1
end
