console.log("pouet");




$(document).ready(function(){
    /**************************************************************************/
    // util functions :

    /* This function draw a rectangle corresponding to the given objet, on the given layer
    *
    * @param {Object} anno - the object representing an annotation
    * @param {Konva.Layer} layer - the layer on which you want the rect to be drawn
    *
    * @return {Konva.Rect} rect - the shape that has been draw on the layer.
    *
    */
    function drawAnno(anno, layer) {
        console.log(anno) ;
        var rect = new Konva.Rect({
          x: anno.x,
          y: anno.y,
          width: anno.width,
          height: anno.height,
          fill : null,
          stroke: anno.stroke,
          strokeWidth:  anno.strokeWidth,
          name: anno.name
        });
        layer.add(rect);
        return rect ;
    }

    /*
    * This function handles the event 'hover annotations'.
    * If the mouse is on a rect or on an annotation item in the anotation list,
    * the corresponding rect and annotation item are filled in yellow
    * (with transparency of 0.5).
    * Else nothing happens.
    * Nota Bene :
    * after using this function, you have to refreash the layer containing the rect annotations
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


    /*Functions that flash messages in the flash div :
    *
    * @param {string} msg - the msg that have to be printed
    * @param {int} time - the duration of the flash
    *
    */
    Flash = {}
    Flash.success = function(msg, time =1000){
        $('#flash-container')[0].innerHTML = "<div class='success message'>" + msg + "</div>";
        $('#flash-container').addClass('showing');
        setTimeout(function(){
          $('#flash-container').removeClass('showing');
        }, time);
      };
    Flash.error = function(msg, time =1000){
        $('#flash-container')[0].innerHTML = "<div class='error message'>" + msg + "</div>";
        $('#flash-container').addClass('showing');
        setTimeout(function(){
            $('#flash-container').removeClass('showing');
        }, time);
    };

    /**************************************************************************/

    // fetch image :
    image_loaded = false ;
    var imageObj = new Image();
    imageObj.src = img_source;

    // fetch corresponding annotation data :
    data_loaded = false ;

    console.log("!!!!!!!!!!!!!!!!!!!!!!!!");
    console.log(img_filename);
    $.getJSON(
        '/chunks/'+img_filename+'/annotations/',
        function(data){
            console.log(data);

            Flash.success('Annotation was retrieved from the server', 3000);
            for(var i = 0; i < data.length; i++) {
                var obj = data[i];

                obj.stroke = 'black';
                obj.strokeWidth = 4;
                obj.name = obj.id.toString(); // TODO : Change the code to use id directly.

                console.log(obj);

                // put the annotation in the list :
                //TODO : do not use the code but the complete word
                $('#annotations-list').append("<li name = '"+ obj.name +"'>" + obj.annotation + "</li>");

            }

            // wrap list item text in a span, and appply functionality buttons
            $("#annotations-list li")
                .wrapInner("<span>")
                .append("<button class='glyphicon glyphicon-trash'></button><button class='glyphicon glyphicon-pencil'></button>");

            // make annotation selects editable :
            bindAllTabs("#annotations-list li span");


            data_loaded = true ;
            init_anno(data) ;

            // TODO : put data as li in annotation list. NB : name will begin with 1 because sqlite autoincrement begin from 1.
            // make li name derived from annotation item name / id
        }
    );




    // create Konva stages
    var anno_stage = new Konva.Stage({
      container: 'anno-konvajs',  // id of container <div>
      width : 1,
      height : 1
    });
    var view_stage = new Konva.Stage({
      container: 'view-konvajs',   // id of container <div>
      width: $('#view-konvajs').width()
    });
    // then, layers creation :
    // - one for the image :
    var view_stage_img_layer = new Konva.Layer();
    var anno_stage_img_layer = new Konva.Layer();
    // - the other for the annotations :
    var view_stage_anno_layer = new Konva.Layer();
    var anno_stage_anno_layer = anno_stage_img_layer; // for anno stage : image and anno on the same layer because each layer has a canvas and Cropper can handle only one canvas at a time

    // once the image is loaded :
    imageObj.onload = function() {
      Flash.success('Image was retrieved from the server', 3000);
      // compute ratio :
      console.log(imageObj.naturalWidth)
      ratio = view_stage.width()/imageObj.naturalWidth;
      console.log(ratio);
      var view_stage_image = new Konva.Image({
        x: 0,
        y: 0,
        image: this,
        width: imageObj.naturalWidth * ratio,
        height: imageObj.naturalHeight * ratio
      });
      var anno_stage_image = new Konva.Image({
        x: 0,
        y: 0,
        image: this,
        width: imageObj.naturalWidth,
        height: imageObj.naturalHeight
      });
      //adjust stage height :
      view_stage.height( view_stage_image.height() );
      // and the anno stage dimention :
      anno_stage.height( anno_stage_image.height() );
      anno_stage.width( anno_stage_image.width() );
      // add the shape to the layer
      view_stage_img_layer.add(view_stage_image);
      anno_stage_img_layer.add(anno_stage_image);
      // add the layer to the stage
      view_stage.add(view_stage_img_layer);
      view_stage_img_layer.moveToBottom();
      anno_stage.add(anno_stage_img_layer);
      anno_stage_img_layer.moveToBottom();

      // Set the cropper :
      $('#anno-konvajs .konvajs-content canvas').cropper({
          viewMode :1, //   0: the crop box is just within the container  ;     1: the crop box should be within the canvas -> zoom / dezoom as you want but do not select out the image ;     2: the canvas should not be within the container ;    3: the container should be within the canvas
          dragMode : 'crop', // 'crop': create a new crop box ; 'move': move the canvas  ;  'none': do nothing
          autoCrop : true, //enable / disable the default image crop when initialize.
          autoCropArea : 0.1,
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
      Flash.success('The cropper was setted successfully', 3000);


      image_loaded =true ;
      init_anno() ;
    };

    function init_anno(data = []){
        console.log("data_loaded", data_loaded, "image_loaded", image_loaded);
        if(data_loaded && image_loaded) {
        // once image is loaded
        // AND once data are loaded
            // render (false) annotations = add the shape to the layer // TODO : is there a for each loop in js ?
            for(var i = 0; i < data.length; i++) {
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
                drawAnno(ratio_data, view_stage_anno_layer);
                drawAnno(data[i], anno_stage_anno_layer);
            }

            // add the layer to the stage
            view_stage.add(view_stage_anno_layer);
            anno_stage.add(anno_stage_anno_layer);

            // listeners for user input events
            view_stage.find('Rect').on('mouseover', function(evt) {
                var annotation = evt.target;
                if (annotation) {
                    console.log('mouseover');
                    console.log(annotation, true);
                    handleHoverAnno(true, this.name(), view_stage);
                    view_stage_anno_layer.draw();
                }
            });

            view_stage.find('Rect').on('mouseout', function(evt) {
                var annotation = evt.target;
                if (annotation) {
                    console.log('mouseover');
                    console.log(annotation, false);
                    handleHoverAnno(false, this.name(), view_stage);
                    view_stage_anno_layer.draw();
                }
            });

            view_stage.find('Rect').on('mousedown', function(evt) {
                var annotation = evt.target;
                if (annotation) {
                    console.log('mousedown');
                    console.log(annotation);
                }
            });

            //Resource the cropper to take the annotations into account
            new_url = $('#anno-konvajs .konvajs-content canvas')[0].toDataURL();
            //the first (and the only one) canvas selected here corresponds both to the image and annotation layer of the annotation stage.
            console.log (new_url);
            $('#anno-konvajs .konvajs-content canvas').cropper(
                'replace',
                new_url,
                true
            );

            Flash.success('The annotations were added on both the view and the annotation canvas. Everything is ready.', 3000);
        }
    }


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
            $('#view-konvajs').hide()
        }else{
            // Change button attribute to handle reclick -> return in annotation mode
            $(this).val('view');
            $(this).toggleClass( 'glyphicon-plus');
            $(this).toggleClass( 'glyphicon-eye-open');
            $(this).text('Annotate');
            // Hide anno stuff : cropper div, the input form :
            $('.anno-stuff').hide();
            // Show rendered kanva :
            $('#view-konvajs').show()
            // Destroy the cropper :
            //$('#anno-konvajs .konvajs-content canvas').cropper("destroy");
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
            name      : 'value', /*change default name of parameter 'name' to 'value'*/
            submitdata: { id : $(editableTarget).closest("li").attr("name") } /*return li parent attr. use closest function because it is more foolproof than parent*/
        });
    }



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

                url : '/del_anno',
                type: "DELETE", /*TODO : REST - the DELETE method requests thant the origin server delete the resource identified by the request URI*/
                data : {'id': $(this).closest("li").attr("name")},


                success: function(r){
                    thiscache
                        .parent()
                            .hide(400, function(){$(this).remove()});
                    Flash.success("The annotation was deleted");
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

            url : '/chunks/'+img_filename+'/annotations/',
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
                drawAnno(new_anno, anno_stage_anno_layer);
                anno_stage_anno_layer.draw();

                //Resource the cropper to take the new annotation into account/
                new_url = $('#anno-konvajs .konvajs-content canvas')[0].toDataURL();
                //the first (and the only one) canvas selected here corresponds both to the image and annotation layer of the annotation stage.
                console.log (new_url);
                $('#anno-konvajs .konvajs-content canvas').cropper(
                    'replace',
                    new_url,
                    true
                );

                ratio_new_anno = {
                    x: new_anno.x * ratio,
                    y: new_anno.y * ratio,
                    width: new_anno.width * ratio,
                    height: new_anno.height * ratio,
                    stroke: new_anno.stroke,
                    strokeWidth: new_anno.strokeWidth * ratio,
                    name: new_anno.name
                };
                rect = drawAnno(ratio_new_anno, view_stage_anno_layer);
                view_stage_anno_layer.draw();


                // Bind events : //TODO : refactorize
                rect.on('mouseover', function(evt) {
                    var annotation = evt.target;
                    if (annotation) {
                        console.log('mouseover');
                        console.log(annotation, true);
                        handleHoverAnno(true, this.name(), view_stage);
                        view_stage_anno_layer.draw();
                    }
                });

                rect.on('mouseout', function(evt) {
                    var annotation = evt.target;
                    if (annotation) {
                        console.log('mouseover');
                        console.log(annotation, false);
                        handleHoverAnno(false, this.name(), view_stage);
                        view_stage_anno_layer.draw();
                    }
                });

                rect.on('mousedown', function(evt) {
                    var annotation = evt.target;
                    if (annotation) {
                        console.log('mousedown');
                        console.log(annotation);
                    }
                });

                console.log ("new");
                console.log (new_anno);
                console.log(ratio_new_anno);
                // clear the input fields after submission :
                $('#add-new').get(0).reset()
                // That makes adding a bunch of annotation items in sequence very easy and natural.


                Flash.success("The annotation was added");
            },
            error: function(){
                // TODO
                // uh oh, didn't work. Error message?
            }
        });

        return false; // prevent default form submission -> no page refresh
    });
});
