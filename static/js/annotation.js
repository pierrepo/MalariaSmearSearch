console.log("pouet");




$(document).ready(function(){
    var chunk = document.getElementById('chunk');

    var add_sel_x = document.getElementById('add-sel-x')
    var add_sel_y = document.getElementById('add-sel-y')
    var add_sel_width = document.getElementById('add-sel-width')
    var add_sel_height = document.getElementById('add-sel-height')

    var cropper = new Cropper(chunk, {
        viewMode :1, //the crop box should be within the canvas
        dragMode : 'move' , //dragging mode of the cropper.

        crop: function(e) {
            console.log(e.detail.x);
            add_sel_x.value = e.detail.x
            console.log(e.detail.y);
            add_sel_y.value = e.detail.y
            console.log(e.detail.width);
            add_sel_width.value = e.detail.width
            console.log(e.detail.height);
            add_sel_height.value = e.detail.height
            //console.log(e.detail.rotate);
            //console.log(e.detail.scaleX);
            //console.log(e.detail.scaleY);
    }
    });



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

    $('#annotations-list').on('click', '.glyphicon-trash', function(){
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

    $('#annotations-list').on('click', '.glyphicon-pencil', function(){
        console.log("edit");
    });

    $('#add-new').submit(function(){
        var newAnnotationText= $( "#new-list-item-text option:selected" ).text();

        $.ajax({

            // DEVELOPER, save new list item!

            success: function(theResponse){
                // the new list item is appended
                $("#annotations-list")
                    .append("<li><span id='' title='Double-click to edit...'>" + newAnnotationText + "</span><button class='glyphicon glyphicon-trash'></button><button class='glyphicon glyphicon-pencil'></button></li>");
                // ensures the click-to-edit functionality is working
                // on newly appended list items even before a page refresh :
                // TODO
                //bindAllTabs("li #"+theResponse);
                bindAllTabs("#annotations-list li span");

                // clear the input fields after submission :
                $('#add-new').get(0).reset()
                // That makes adding a bunch of annotation items in sequence very easy and natural.
            },
            error: function(){
                // TODO
                // uh oh, didn't work. Error message?
            }
        });

        return false; // prevent default form submission -> no page refresh
    });
});
