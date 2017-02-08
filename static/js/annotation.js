console.log("pouet");




$(document).ready(function(){
    /**************************************************************************/
    // util functions :

    function addAnno(obj, layer) {
        console.log(obj) ;
        var rect = new Konva.Rect({
          x: obj.x,
          y: obj.y,
          width: 100,
          height: 50,
          stroke: 'black',
          strokeWidth: 4
        });
        layer.add(rect);
    }
    /**************************************************************************/


    // fetch image :
    var imageObj = new Image();
    imageObj.src = img_source;

    // fetch (false) corresponding annotation data : TODO : use AJAX / var
    // build data
    var data = [];
    for(var i = 0; i < 20; i++) {
        var x = Math.random() * 100;
        var y = 100 + (Math.random() * 200) - 100 + (100 / 100) * -1 * x;
        data.push({
            x: x,
            y: y,
            id: i
        });
    }
    console.log(data) ;


    // create a Konva stage
    var stage = new Konva.Stage({
      container: 'konva',   // id of container <div>
      width: 500, // TODO : dimention given by bootstrap
      height: 500
    });
    // then, layers creation :
    // - one for the image :
    var img_layer = new Konva.Layer();
    // - the other for the annotations :
    var anno_layer = new Konva.Layer();

    // once the image is loaded :
    imageObj.onload = function() {
      var chunk = new Konva.Image({
        x: 50,
        y: 50,
        image: this,
        width: 106,
        height: 118
      });
      // add the shape to the layer
      img_layer.add(chunk);
      // add the layer to the stage
      stage.add(img_layer);
      img_layer.moveToBottom();
    };

    // once data are loaded TODO
    // render (false) annotations = add the shape to the layer // TODO : is there a for each loop in js ?
    for(var i = 0; i < data.length; i++) {
        addAnno(data[i], anno_layer);
    }

    // add the layer to the stage
    stage.add(anno_layer);

    // listeners for user input events
    stage.on('mouseover', function(evt) {
        var annotation = evt.target;
        if (annotation) {
            console.log('mouseover');
            console.log(annotation);
        }
    });
    stage.on('mousedown', function(evt) {
        var annotation = evt.target;
        if (annotation) {
            console.log('mousedown');
            console.log(annotation);
        }
    });


    $( "#toggle-mode" ).click(function() {

        value = $(this).val() ;

        console.log (value)

        if ($(this).val() == 'view' ) {
            // Change button attribute to handle reclick -> return in view mode
            $(this).val('annotation')
            $(this).toggleClass( 'glyphicon-plus');
            $(this).toggleClass( 'glyphicon-eye-open');
            $(this).text('View');
            // Show the input form
            $('#add-new').show()
            // Set the cropper :
            $('#chunk').cropper({
                viewMode :1, //the crop box should be within the canvas
                dragMode : 'move' , //dragging mode of the cropper.
                crop: function(e) {
                    // Output the result data for cropping image.
                    console.log(e.x);
                    $('#add-sel-x').val( e.x)
                    console.log(e.y);
                    $('#add-sel-y').val(e.y)
                    console.log(e.width);
                    $('#add-sel-width').val(e.width)
                    console.log(e.height);
                    $('#add-sel-height').val(e.height)
                    //console.log(e.detail.rotate);
                    //console.log(e.detail.scaleX);
                    //console.log(e.detail.scaleY);
                }
            });
        }else{
            // Change button attribute to handle reclick -> return in annotation mode
            $(this).val('view');
            $(this).toggleClass( 'glyphicon-plus');
            $(this).toggleClass( 'glyphicon-eye-open');
            $(this).text('Annotate');
            // Hide the input form :
            $('#add-new').hide();
            // Destroy the cropper :
            $('#chunk').cropper("destroy");
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
