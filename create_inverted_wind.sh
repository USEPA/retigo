#!/bin/bash

# be sure to run dos2unix on this before running

colormap=colorsafe

origCSS=symbols_wind_${colormap}.css
tmpCSS=symbols_wind_${colormap}_inverted_tmp.css
outCSS=symbols_wind_${colormap}_inverted.css
#echo $origCSS
#echo $inCSS
#echo $outCSS

cp $origCSS $tmpCSS

sed -i 's/arrow_00/tmp_19/g' $tmpCSS
sed -i 's/arrow_01/tmp_18/g' $tmpCSS
sed -i 's/arrow_02/tmp_17/g' $tmpCSS
sed -i 's/arrow_03/tmp_16/g' $tmpCSS
sed -i 's/arrow_04/tmp_15/g' $tmpCSS
sed -i 's/arrow_05/tmp_14/g' $tmpCSS
sed -i 's/arrow_06/tmp_13/g' $tmpCSS
sed -i 's/arrow_07/tmp_12/g' $tmpCSS
sed -i 's/arrow_08/tmp_11/g' $tmpCSS
sed -i 's/arrow_09/tmp_10/g' $tmpCSS
sed -i 's/arrow_10/tmp_09/g' $tmpCSS
sed -i 's/arrow_11/tmp_08/g' $tmpCSS
sed -i 's/arrow_12/tmp_07/g' $tmpCSS
sed -i 's/arrow_13/tmp_06/g' $tmpCSS
sed -i 's/arrow_14/tmp_05/g' $tmpCSS
sed -i 's/arrow_15/tmp_04/g' $tmpCSS
sed -i 's/arrow_16/tmp_03/g' $tmpCSS
sed -i 's/arrow_17/tmp_02/g' $tmpCSS
sed -i 's/arrow_18/tmp_01/g' $tmpCSS
sed -i 's/arrow_19/tmp_00/g' $tmpCSS
sed -i "s/arrow_${colormap}/arrow_${colormap}_inverted/g" $tmpCSS

sed -i 's/tmp/arrow/g' $tmpCSS
mv $tmpCSS $outCSS
