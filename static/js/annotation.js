console.log("pouet");

jQuery.noConflict();

jQuery(document).ready(function($) {
    // You can use the locally-scoped $ in here as an alias to jQuery.

    console.log("bim");

    // wrap list item text in a span, and appply functionality buttons
    $("#annotations-list li")
        .wrapInner("<span>")
        .append("<button class='glyphicon glyphicon-trash'></button><button class='glyphicon glyphicon-pencil'></button>");

});
