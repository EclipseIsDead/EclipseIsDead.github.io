$(window).on('load', function () {
    make_border_style('#box', '+=+| |+=+', '#928374');
});

function make_border_style(selector, text, color, $parent) {
    var $test_div = $('<div style="position: absolute; margin: 0; padding: 0; border: 0 none; opacity: 0; left: -9999em;">X</div>').appendTo($parent || 'body');

    $parent = $($parent || 'body');
    selector = selector || '.text-box';
    text = text || '╔═╗║ ║╚═╝';
    var lines = text.match(/.../g);
    
    var cw = parseInt($test_div.innerWidth());
    var ch = parseInt($test_div.innerHeight());
    var ff = $test_div.css('font-family');
    var fs = parseInt($test_div.css('font-size'));
    var vpad = (ch - fs) / 2;
    var w = cw * 3, h = ch * 3;
    $test_div.remove();

    var canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    var ctx = canvas.getContext("2d");
    ctx.font = fs + 'px ' + ff;
    ctx.fillStyle = color || $parent.css('color');
    ctx.fillText(lines[0], 0, fs+vpad);
    ctx.fillText(lines[1], 0, fs+vpad+ch);
    ctx.fillText(lines[2], 0, fs+vpad+ch*2);
    var durl = canvas.toDataURL();
    $('<style type="text/css">'+selector+'{ border-width:'+ch+'px '+ cw +'px; border-image:url("' + durl + '") ' + ch + ' ' + cw + ' repeat</style>').appendTo('body');
}