console.log("pouet");

jQuery.noConflict();

jQuery(document).ready(function($) {
    // You can use the locally-scoped $ in here as an alias to jQuery.

    console.log("bim");

    // Place annotation from db using AJAX request :
    // TODO

    the_text = 'My annotation'
    var myAnnotation = {
        /** The URL of the image where the annotation should go **/
        src : $('#chunk').attr('src'),
        /** The annotation text **/
        text : the_text,
        /** -> no delete icon in the annotation popup **/
        editable: false,
        /** The annotation shape **/
        shapes : [{
            /** The shape type -- rectangle is the only supported shape type **/
            type : 'rect',
            /** 'units' only required for pixel coordinates **/
            units: 'pixel',
            /** The shape geometry (pixel coordinates) **/
            geometry : { x : 10, y: 10, width : 400, height: 600 }
        }]
    }
    anno.addAnnotation(myAnnotation);



    // wrap list item text in a span, and appply functionality buttons
    $("#annotations-list li")
        .wrapInner("<span>")
        .append("<button class='glyphicon glyphicon-trash'></button><button class='glyphicon glyphicon-pencil'></button>");

});
