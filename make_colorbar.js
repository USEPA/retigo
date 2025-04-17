function get_brightness(hexcolor) {
    // get rgb colors
    r = parseInt(hexcolor.substr(1,2), 16) / 255.0;
    g = parseInt(hexcolor.substr(3,2), 16) / 255.0;
    b = parseInt(hexcolor.substr(5,2), 16) / 255.0;
    brightness = (r * 0.2126) + (g * 0.7152) + (b * 0.0772);
    //console.log(hexcolor,r,g,b,brightness)
    return brightness;
}


function make_colorbar (x, y, element_height, element_width, my_ncolors, skip, color_table, min, max, title, graphics, useExpFormat) {

    min            = parseFloat(min);
    max            = parseFloat(max);
    element_width  = parseInt(element_width);
    element_height = parseInt(element_height);
    my_ncolors     = parseFloat(my_ncolors);
    //console.log(min, max);
    brightnessThreshold = 0.45; // 0 - 1, lower is darker
    
    graphics.setFont("Helvetica", "11px", Font.PLAIN);    
    
    for (ind=0; ind<=my_ncolors-1; ind++){
        brightness = get_brightness(color_table[ind]);
        if (brightness < brightnessThreshold) {
            tickColor = '#CCCCCC';
        } else {
            tickColor = '#000000';
        }

        // filled colorbar element
        graphics.setColor(color_table[ind]);
        var xcoord = x + (element_width*ind);
        var ycoord = y;
        graphics.fillRect(xcoord, ycoord, element_width, element_height);

        // outline of colorbar element
        graphics.setColor('#000000');
        graphics.drawRect(xcoord, ycoord, element_width, element_height);

        // tick
        if (ind > 0) {
            graphics.setColor(tickColor);
            graphics.fillRect(xcoord, ycoord+1, 1, element_height-1);
        }

        // tick annotations
        graphics.setColor('#000000');
        this_color_val = +(min + ((ind) * (max - min)/my_ncolors))
        if (useExpFormat) {
            this_color_val = this_color_val.toExponential()
        } else {
            // max of 2 digits of precision. Leading "+" means use digits only if necessary.
            this_color_val = this_color_val.toFixed(2);
        }
        
        if ( ind % skip === 0) {
            //graphics.drawStringRect(this_color_val, xcoord-element_width/2, ycoord+10, element_width*skip, "center");
            graphics.drawStringRect(this_color_val, xcoord, ycoord+10, element_width*2.5, "left");
        }
    }

    // annotation for end of colorbar
    maxString = +(max);
    if (useExpFormat) {
        maxString = maxString.toExponential();
    } else {
        maxString = maxString.toFixed(2);
    }
    graphics.drawStringRect(maxString, xcoord+element_width, ycoord+10, element_width*2.5, "left");
    graphics.paint();
    
    graphics.setFont("Helvetica", "12px", Font.BOLD);
    graphics.drawString(title, x, y-20);
    graphics.paint();
    
}

