console.log("pouet");




$(document).ready(function(){

    function bindAllTabs(editableTarget) {
        /*
        Target an element
        and use the Jeditable plugin  editable() function on it
        with some parameters :
            callback file path,
            list items require a double-click to edit
            tooltip message
            text in the saving button
        */
        $(editableTarget).editable("/callback/file/path", {
            id        : 'listItemID',
            indicator : 'Saving...',
            tooltip   : 'Double-click to edit...',
            event     : 'dblclick',
            data      : " {'parasite':'parasite','red':'red cell','white':'white cell', 'other':'other'}",
            type      : 'select',
            submit    : 'Save',
            submitdata: {action : "update"}
        });
    }


    // wrap list item text in a span, and appply functionality buttons
    $("#annotations-list li")
        .wrapInner("<span>")
        .append("<button class='glyphicon glyphicon-trash'></button><button class='glyphicon glyphicon-pencil'></button>");

    // make annotation selects editable :
    bindAllTabs("#annotations-list li span");

    /* link li item buttons to events using the on() function
    because :
    - 1) it only creates one event handler which is more efficient
        than using the click function that creates a unique event handler for
        every single list item on the page, each one taking up browser memory
    - and 2) new items appended to the page are automatically bound by
        the same handler. Killer.
    */

    $('#annotations-list li').on('click', '.glyphicon-trash', function(){
        /*
        The delete action has a little extra insurance against accidentally
        fat-fingerings. It requires two clicks to actually delete something.
        Not a nasty "ARE YOU SURE" modal popup dialog box, we're a little more
        sly than that :
        As you click the X, a little notice will pop out to the right
        asking about sureness. If they click again then deleting may commence.
        */
        var thiscache = $(this);
        console.log(thiscache);
        if (thiscache.data("readyToDelete") == "go for it") {
            console.log("deleeeete");
            $.ajax({
                // TODO the user wants to delete this list item, commence deleting!
                // if success : reorder the list
                success: function(r){
                    thiscache
                        .parent()
                            .hide(400, function(){$(this).remove()});
                }
            });
        }
        else {
            thiscache.text(" sure ?")
            .data("readyToDelete", "go for it");
        }
    });

    $('#annotations-list li').on('click', '.glyphicon-pencil', function(){
        console.log("edit");
    });
});
