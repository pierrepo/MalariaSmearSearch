console.log("pouet");




$(document).ready(function(){

    // wrap list item text in a span, and appply functionality buttons
    $("#annotations-list li")
        .wrapInner("<span>")
        .append("<button class='glyphicon glyphicon-trash'></button><button class='glyphicon glyphicon-pencil'></button>");


    /* link li item buttons to events using the on() function
    because :
    - 1) it only creates one event handler which is more efficient
        than using the click function that creates a unique event handler for
        every single list item on the page, each one taking up browser memory
    - and 2) new items appended to the page are automatically bound by
        the same handler. Killer.
    */

    $('#annotations-list li').on('click', '.glyphicon-trash', function(){
        console.log("deleeeete");
    });

    $('#annotations-list li').on('click', '.glyphicon-pencil', function(){
        console.log("edit");
    });
});
