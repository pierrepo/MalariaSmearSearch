console.log("pouet");




$(document).ready(function(){
    /**************************************************************************/
    // util functions :

    function addAnno(obj, layer) {
        console.log(obj) ;
        var rect = new Konva.Rect({
          x: obj.x,
          y: obj.y,
          width: obj.width,
          height: obj.height,
          fill : null,
          stroke: obj.stroke,
          strokeWidth:  obj.strokeWidth,
          name: obj.name
        });
        layer.add(rect);
    }

    /*
    * This function handles the event 'hover annotations'.
    * If the mouse is on a rect or on an annotation item in the anotation list,
    * the corresponding rect and annotation item are filled in yellow
    * (with transparency of 0.5).
    * Else nothing happens.
    * Nota Bene :
    * after using this function, you have to redray the layer containing the rect annotations
    * using the draw() function.
    *
    * @param {bool} activate - tells if the mouse is on a annotation (True) or not (False).
    * @param {string} name - the name of a konva rect annotation and of an annotation item in the annotation list.
    * @param {Konva.stage} stage - stage where the annotations will be colored
    *
    */
    function handleHoverAnno(activate, name, stage){
        console.log('in handleHoverAnno');
        transparency = (activate ? 0.5 : 0).toString();
        console.log (activate * 0.5) ;
        rect = stage.findOne('.'+name);
        rect.setFill('rgba(255,255,0,'+0.5 * activate+')'); // 'rgba(255,255,0,'+transparency+')'
        $("#annotations-list li[name="+name+"] span").toggleClass('hover');
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
            width : 100,
            height : 50,
            stroke: 'black',
            strokeWidth: 4,
            name: i.toString()
        });
    }
    console.log(data) ;


    // create Konva stages
    var chunk_stage = new Konva.Stage({
      container: 'chunk',  // id of container <div>
      width : 1,
      height : 1
    });
    var stage = new Konva.Stage({
      container: 'konva',   // id of container <div>
      width: 500, // TODO : dimention given by bootstrap
    });
    // then, layers creation :
    // - one for the image :
    var img_layer = new Konva.Layer();
    var chunk_img_layer = new Konva.Layer();
    // - the other for the annotations :
    var anno_layer = new Konva.Layer();
    var chunk_anno_layer = new Konva.Layer();

    // once the image is loaded :
    imageObj.onload = function() {
      // compute ratio :
      console.log(imageObj.naturalWidth)
      ratio = stage.width()/imageObj.naturalWidth;
      console.log(ratio);
      var chunk = new Konva.Image({
        x: 0,
        y: 0,
        image: this,
        width: imageObj.naturalWidth * ratio,
        height: imageObj.naturalHeight * ratio
      });
      var chunk_chunk = new Konva.Image({
        x: 0,
        y: 0,
        image: this,
        width: imageObj.naturalWidth,
        height: imageObj.naturalHeight
      });
      //adjust stage height :
      stage.height( chunk.height() );
      // and the chunk stage dimention :
      chunk_stage.height( chunk_chunk.height() );
      chunk_stage.width( chunk_chunk.width() );
      // add the shape to the layer
      img_layer.add(chunk);
      chunk_img_layer.add(chunk_chunk);
      // add the layer to the stage
      stage.add(img_layer);
      img_layer.moveToBottom();
      chunk_stage.add(chunk_img_layer);
      chunk_img_layer.moveToBottom();
    };

    // once data are loaded TODO
    // render (false) annotations = add the shape to the layer // TODO : is there a for each loop in js ?
    for(var i = 0; i < data.length; i++) {
        ratio = 0.1893939393939394  // TODO : use ratio computed once the image is loaded
        ratio_data = {
            x: data[i].x * ratio,
            y: data[i].y * ratio,
            width: data[i].width * ratio,
            height: data[i].height * ratio,
            stroke: data[i].stroke,
            strokeWidth: data[i].strokeWidth * ratio,
            name: data[i].name
        };
        console.log ('lààààààààààà') ;
        console.log(data[i]) ;
        console.log(ratio_data) ;
        addAnno(ratio_data, anno_layer);
        addAnno(data[i], chunk_anno_layer);
    }

    // add the layer to the stage
    stage.add(anno_layer);
    chunk_stage.add(chunk_anno_layer);

    // listeners for user input events
    stage.find('Rect').on('mouseover', function(evt) {
        var annotation = evt.target;
        if (annotation) {
            console.log('mouseover');
            console.log(annotation, true);
            handleHoverAnno(true, this.name(), stage);
            anno_layer.draw();
        }
    });

    stage.find('Rect').on('mouseout', function(evt) {
        var annotation = evt.target;
        if (annotation) {
            console.log('mouseover');
            console.log(annotation, false);
            handleHoverAnno(false, this.name(), stage);
            anno_layer.draw();
        }
    });

    stage.find('Rect').on('mousedown', function(evt) {
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
            // Show annotation stuff : the cropper div and the input form
            $('.anno-stuff').show()
            // Hide rendered kanva :
            $('#konva').hide()
            // Set the cropper :
            $('#chunk .konvajs-content canvas').cropper({
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
            // Hide anno stuff : cropper div, the input form :
            $('.anno-stuff').hide();
            // Show rendered kanva :
            $('#konva').show()
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
        $(editableTarget).editable("/update_anno_text", {
            event     : 'dblclick', /*event triggering the edition*/
            tooltip   : 'Double-click to edit...', /*tooltip msg*/
            submit    : 'Save', /*message on the submit button*/
            indicator : 'Saving...', /*msg printed when saving*/

            type      : 'select', /*to use select as input type and not free text*/
            /*select is built from JSON encoded array.
             - Array keys are values for <option> tag.
             - Array values are text shown in pulldown.*/
            data      : " {'P':'parasite','RC':'red cell','WC':'white cell', 'O':'other'}",

            /*NB for server side : */
            method    : 'POST', /*the default = POST TODO : think about PUT*/
            name      : 'value' /*change default name of parameter 'name' to 'value'*/

        });
    }


    // wrap list item text in a span, and appply functionality buttons
    $("#annotations-list li")
        .wrapInner("<span id = '1'>") // TODO : make name derived from annotation item id
        .append("<button class='glyphicon glyphicon-trash'></button><button class='glyphicon glyphicon-pencil'></button>");

    // make annotation selects editable :
    bindAllTabs("#annotations-list li span");
    // TODO : bindAllTabs("#annotations-list li span") with span having the name = id of the annotation

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

    // static varaiable.
    // will be deleted when adding a new annotation in db by ajax will return the id of the annotation
    var incr = (function () {
        var i = 20; // There are 20 rect on the canvas
        return function () {
            return i++;
        }
    })();

    $('#add-new').submit(function(){
        var newAnnotationText= $( "#new-list-item-text option:selected" ).text();

        $.ajax({

            url : '/add_anno',
            type: "POST",
            data : $('#add-new').serialize(),

            success: function(theResponse){

                theResponse = incr().toString();
                console.log(theResponse);

                // the new list item is appended
                $("#annotations-list")
                    .append("<li name="+theResponse+"><span id='' title='Double-click to edit...'>" + newAnnotationText + "</span><button class='glyphicon glyphicon-trash'></button><button class='glyphicon glyphicon-pencil'></button></li>");
                // ensures the click-to-edit functionality is working
                // on newly appended list items even before a page refresh :
                bindAllTabs("#annotations-list li[name="+theResponse+"]");
                // draw the annotation on the konvas :
                new_anno = {
                    x: $('#add-sel-x').val(),
                    y: $('#add-sel-y').val(),
                    width: $('#add-sel-width').val(),
                    height: $('#add-sel-height').val(),
                    stroke: 'red',
                    strokeWidth: 4,
                    name: theResponse
                };
                addAnno(new_anno, chunk_anno_layer);
                chunk_anno_layer.draw();

                ratio_new_anno = {
                    x: new_anno.x * ratio,
                    y: new_anno.y * ratio,
                    width: new_anno.width * ratio,
                    height: new_anno.height * ratio,
                    stroke: new_anno.stroke,
                    strokeWidth: new_anno.strokeWidth * ratio,
                    name: new_anno.name
                };
                addAnno(ratio_new_anno, anno_layer);
                anno_layer.draw();

                console.log ("new");
                console.log (new_anno);
                console.log(ratio_new_anno);
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
