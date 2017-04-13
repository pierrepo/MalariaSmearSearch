console.log("pouet");




$(document).ready(function(){


    anno_decoder = {
        "PUR":"Parasite - Unknown species - Ring",
        "PUT":"Parasite - Unknown species - Trophzoide",
        "PUS":"Parasite - Unknown species - Schizont",
        "PUG":"Parasite - Unknown species - Gametocyte",
        "PUU":"Parasite - Unknown species - Unknown",
        "PFR":"Parasite - P. Falciparum - Ring",
        "PFT":"Parasite - P. Falciparum - Trophzoide",
        "PFS":"Parasite - P. Falciparum - Schizont",
        "PFG":"Parasite - P. Falciparum - Gametocyte",
        "PFU":"Parasite - P. Falciparum - Unknown",
        "PMR":"Parasite - P. Malariae - Ring",
        "PMT":"Parasite - P. Malariae - Trophzoide",
        "PMS":"Parasite - P. Malariae - Schizont",
        "PMG":"Parasite - P. Malariae - Gametocyte",
        "PMU":"Parasite - P. Malariae - Unknown",
        "POR":"Parasite - P. Ovale - Ring",
        "POT":"Parasite - P. Ovale - Trophzoide",
        "POS":"Parasite - P. Ovale - Schizont",
        "POG":"Parasite - P. Ovale - Gametocyte",
        "POU":"Parasite - P. Ovale - Unknown",
        "PVR":"Parasite - P. Vivax - Ring",
        "PVT":"Parasite - P. Vivax - Trophzoide",
        "PVS":"Parasite - P. Vivax - Schizont",
        "PVG":"Parasite - P. Vivax - Gametocyte",
        "PVU":"Parasite - P. Vivax - Unknowns",
        "RBC":"Red Blood Cell",
        "WBC":"White Blood Cell",
        "THR":"Platelet",
        "ART":"Artefact"
     }


    /**************************************************************************/
    // util functions :

    /* This function adds a new annotation to the session
    * - It wraps the new annotation in action buttons (delete and edit)
    * - It puts the new anno in the annotations list
    * - It make the new item editable
    * - It adds the annotation on the annotation layers
    *   of both the anno (to scale) and the view Konva stages (using ratio)
    *
    * NB :
    * It doesn't store the new annotation in the db !
    * It doesn't refresh the layers
    *
    * @param {object} new_anno - the newly added annotation
    *
    */
    function addAnnoView(new_anno){
        console.log("================================");
        // the new anno is appended in the anno list :

        // http://stackoverflow.com/a/12949050
        // jQuery append function close tags automatically.
        // that is why why cannot use :
        /*
        $("#annotations-list")
            .append("<li name='"+new_anno.name+"'><span>" + anno_decoder[new_anno.annotation] + "</span>");
        if (user_has_right) {
            $("#annotations-list")
                .append("<button class='glyphicon glyphicon-trash'></button>");
        }
        $("#annotations-list")
            .append("</li>");
        */
        // Instead, we put the html in an string then append that string to the dom :
         var html="<li name='"+new_anno.name+"'><span>" + anno_decoder[new_anno.annotation] + "</span>"
         if (user_has_right) {
             html+="<button class='glyphicon glyphicon-trash'></button>";
         }
         html+="</li>";

         $("#annotations-list").append(html)

        // TODO : do not use the annotation code
        // the action button events are bind automatically,
        // but ensure the click-to-edit functionality is working
        // on newly appended list items even before a page refresh :

        if (user_has_right) {
            makeEditable("#annotations-list li[name="+new_anno.name+"] span");
        }

        // add the annotation as a rect on the anno layer of the anno stage
        console.log(new_anno) ;
        var rect = new Konva.Rect({
          x: new_anno.x,
          y: new_anno.y,
          width: new_anno.width,
          height: new_anno.height,
          fill : null,
          stroke: new_anno.stroke,
          strokeWidth:  new_anno.strokeWidth,
          name: new_anno.name
        });
        anno_stage_anno_layer.add(rect);

        // compute the ration annotation :
        ratio_new_anno = {
            x: new_anno.x * ratio,
            y: new_anno.y * ratio,
            width: new_anno.width * ratio,
            height: new_anno.height * ratio,
            stroke: new_anno.stroke,
            strokeWidth: new_anno.strokeWidth * ratio,
            name: new_anno.name.toString() // it has to be a string !!
        };

        // add the ration annotation as a rect on the anno layer of the view stage
        console.log(ratio_new_anno) ;
        var ratio_rect = new Konva.Rect({
          x: ratio_new_anno.x,
          y: ratio_new_anno.y,
          width: ratio_new_anno.width,
          height: ratio_new_anno.height,
          fill : null,
          stroke: ratio_new_anno.stroke,
          strokeWidth:  ratio_new_anno.strokeWidth,
          name: ratio_new_anno.name.toString() // it has to be a string !!
        });
        view_stage_anno_layer.add(ratio_rect);

        // bind the new ratio rect to mouse events :

        ratio_rect.on('mouseover', function(evt) {
            var annotation = evt.target;
            if (annotation) {
                console.log('mouseover');
                console.log(annotation, true);
                handleHoverAnno(true, this.name(), view_stage);
                view_stage_anno_layer.draw();
            }
        });

        ratio_rect.on('mouseout', function(evt) {
            var annotation = evt.target;
            if (annotation) {
                console.log('mouseover');
                console.log(annotation, false);
                handleHoverAnno(false, this.name(), view_stage);
                view_stage_anno_layer.draw();
            }
        });

        ratio_rect.on('mousedown', function(evt) {
            var annotation = evt.target;
            if (annotation) {
                console.log('mousedown');
                console.log(annotation);
            }
        });


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
        $('#flash-container').html ("<div class='success message'>" + msg + "</div>");
        $('#flash-container').addClass('showing');
        setTimeout(function(){
          $('#flash-container').removeClass('showing');
        }, time);
      };
    Flash.error = function(msg, time =1000){
        $('#flash-container').html("<div class='error message'>" + msg + "</div>");
        $('#flash-container').addClass('showing');
        setTimeout(function(){
            $('#flash-container').removeClass('showing');
        }, time);
    };

    /**************************************************************************/

    /*************************************************************************/

    /*********************/
    /* Set the crop tool */
    /*********************/

    /* create Konva instances */
    // Konva stages
    var anno_stage = new Konva.Stage({
      container: 'anno-konvajs',  // id of container <div>
      width : 1,
      height : 1
    });
    var view_stage = new Konva.Stage({
      container: 'view-konvajs',   // id of container <div>
      width: $('#view-konvajs').width()
    });
    // and layers added to corresponding stages from the bottom to the top :
    // - one for the image (in the bottom):
    var view_stage_img_layer = new Konva.Layer();
    view_stage.add(view_stage_img_layer);
    view_stage_img_layer.moveToBottom();
    var anno_stage_img_layer = new Konva.Layer();
    anno_stage.add(anno_stage_img_layer);
    anno_stage_img_layer.moveToBottom();
    // - the other for the annotations :
    var view_stage_anno_layer = new Konva.Layer();
    var anno_stage_anno_layer = anno_stage_img_layer; // for anno stage : image and anno on the same layer because each layer has a canvas and Cropper can handle only one canvas at a time


    /* Fetch data */

    //***  fetch image :
    image_loaded = false ;
    var imageObj = new Image();
    imageObj.src = Flask.url_for("get_chunk_url", {"sample_id": sample_id, "col":col, "row":row});

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



      // Set the cropper :
      $('#anno-konvajs .konvajs-content canvas').cropper({
          viewMode :1, //   0: the crop box is just within the container  ;     1: the crop box should be within the canvas -> zoom / dezoom as you want but do not select out the image ;     2: the canvas should not be within the container ;    3: the container should be within the canvas
          dragMode : 'crop', // 'crop': create a new crop box ; 'move': move the canvas  ;  'none': do nothing
          autoCrop : true, //enable / disable the default image crop when initialize.
          autoCropArea : 0.1,
          crop: function(e) {
              // Output the result data for cropping image.
              console.log(e.x);
              $('#add-sel-x').val(Math.round(e.x))
              console.log(e.y);
              $('#add-sel-y').val(Math.round(e.y))
              console.log(e.width);
              $('#add-sel-width').val(Math.round(e.width))
              console.log(e.height);
              $('#add-sel-height').val(Math.round(e.height))
              //console.log(e.detail.rotate);
              //console.log(e.detail.scaleX);
              //console.log(e.detail.scaleY);
          }
      });
      Flash.success('The cropper was setted successfully', 3000);


      image_loaded =true ;
      init_anno() ;
    };


    //*** fetch corresponding annotation data :
    var data = []; // global var
    data_loaded = false ;

    console.log("!!!!!!!!!!!!!!!!!!!!!!!!");
    $.getJSON(

        Flask.url_for("get_chunk_annotation", {"sample_id":sample_id , "col":col, "row":row}),

        function(received_data){
            console.log(received_data);

            Flash.success('Annotation was retrieved from the server', 3000);
            for(var i = 0; i < received_data.length; i++) {
                var obj = received_data[i];

                obj.stroke = 'black';
                obj.strokeWidth = 4;
                obj.name = obj.id.toString(); // TODO : Change the code to use id directly.

                console.log(obj);
            }

            data_loaded = true ;
            data = received_data; // set the global var
            init_anno() ;
        }
    );

    /* Render the loaded annotations on the loaded chunk */

    function init_anno(){ // use global var data
        console.log("data_loaded", data_loaded, "image_loaded", image_loaded);
        if(data_loaded && image_loaded) {
        // once image is loaded
        // AND once data are loaded
            console.log( '!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!')
            console.log(data)
            // render (false) annotations = add the shape to the layer // TODO : is there a for each loop in js ?
            for(var i = 0; i < data.length; i++) {
                addAnnoView(data[i]);
            }

            // add the layer to the stage
            view_stage.add(view_stage_anno_layer);
            anno_stage.add(anno_stage_anno_layer);

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

        // Toggle button Annotate <-> View
        value = $(this).text();
        console.log(value);

        if ($( "#icon-text" ).text().trim() == "Annotate" ) {
            // Change button text and icon Annotate -> View
            $( "#icon-annotate" ).hide();
            $( "#icon-view" ).show();
            $( "#icon-text" ).text("View");
            // Show annotation stuff : the cropper div and the input form
            $( ".anno-stuff" ).show();
            // Hide rendered kanva :
            $( "#view-konvajs" ).hide();
        }else{
             // Change button text and icon View -> Annotate
            $( "#icon-annotate" ).show();
            $( "#icon-view" ).hide();
            $( "#icon-text" ).text("Annotate");
            // Hide anno stuff : cropper div, the input form :
            $( ".anno-stuff" ).hide();
            // Show rendered kanva :
            $( "#view-konvajs" ).show();
            // Destroy the cropper :
            //$('#anno-konvajs .konvajs-content canvas').cropper("destroy");
        }
    });



    function makeEditable(editableTarget) {
        /*
        Target an element
        and use the Jeditable plugin  editable() function on it
        with some parameters :
            callback file path,
            list items require a double-click to edit
            tooltip message
            text in the saving button
        */
        $(editableTarget).editable(Flask.url_for("update_anno_text", {"sample_id":sample_id , "col":col, "row":row, "anno_id":$(editableTarget).closest("li").attr("name")}), {
            event     : 'dblclick', /*event triggering the edition*/
            tooltip   : 'Double-click to edit...', /*tooltip msg*/
            submit    : 'Save', /*message on the submit button*/
            indicator : 'Saving...', /*msg printed when saving*/

            type      : 'select', /*to use select as input type and not free text*/
            /*select is built from JSON encoded array.
             - Array keys are values for <option> tag.
             - Array values are text shown in pulldown.*/
            data      : anno_decoder,

            /*NB for server side : */
            method    : 'POST', /*the default = POST TODO : think about PUT*/
            name      : 'new_value', /*change default name of parameter 'name' to 'value'*/
        });
    }




    /***********************************/
    /* link li item buttons to events  */
    /***********************************/

    /* link li item buttons to events using the on() function because :
    - 1) it only creates one event handler which is more efficient
        than using the click function that creates a unique event handler for
        every single list item on the page, each one taking up browser memory
    - and 2) new items appended to the page are automatically bound by
        the same handler. Killer.
    */

    // span hover :


   $('#annotations-list').on("mouseover", "span", function() {
       // Each time your mouse enters or leaves a child element,
       // mouseover is triggered
       handleHoverAnno(true,  $(this).parent().attr("name"), view_stage);
       view_stage_anno_layer.draw();

   }).on('mouseleave', 'span', function() {
       handleHoverAnno(false,  $(this).parent().attr("name"), view_stage);
       view_stage_anno_layer.draw();
   });




    // del button :
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

                url : Flask.url_for("del_anno", {"sample_id":sample_id , "col":col, "row":row, "anno_id": $(this).closest("li").attr("name")}),
                type: "DELETE", /*TODO : REST - the DELETE method requests thant the origin server delete the resource identified by the request URI*/

                success: function(r){

                    rect = anno_stage_anno_layer.find( "."+ thiscache.parent().attr("name") );
                    rect.destroy();
                    anno_stage_anno_layer.draw();
                    //Resource the cropper to take the deletion into account
                    new_url = $('#anno-konvajs .konvajs-content canvas')[0].toDataURL();
                    //the first (and the only one) canvas selected here corresponds both to the image and annotation layer of the annotation stage.
                    console.log (new_url);
                    $('#anno-konvajs .konvajs-content canvas').cropper(
                        'replace',
                        new_url,
                        true
                    );


                    ratio_rect = view_stage_anno_layer.find( "."+ thiscache.parent().attr("name") );
                    ratio_rect.off('mouseover');
                    ratio_rect.off('mouseout');
                    ratio_rect.off('mousedown');
                    ratio_rect.destroy();
                    view_stage_anno_layer.draw();

                    thiscache
                        .parent()
                            .hide(400, function(){$(this).remove()});
                    Flash.success("The annotation was deleted", 2000);
                }
            });
        }
        else {
            thiscache.text("Click again to confirm deletion")
            .data("readyToDelete", "go for it");
        }
    });


    $('#add-new').submit(function(){
        var newAnnotationText= $( "#new-list-item-text option:selected" ).text();

        $.ajax({

            url :  Flask.url_for("add_anno", {"sample_id":sample_id , "col":col, "row":row}),
            type: "POST",
            data : $('#add-new').serialize(),

            success: function(theResponse){

                console.log(theResponse);

                // draw the annotation on the konvas :
                new_anno = {
                    annotation :  $('#new-list-item-text').val(),
                    x: $('#add-sel-x').val(),
                    y: $('#add-sel-y').val(),
                    width: $('#add-sel-width').val(),
                    height: $('#add-sel-height').val(),
                    stroke: 'red',
                    strokeWidth: 4,
                    name: theResponse.toString() // it has to be a string !!
                };
                console.log("!!!!!!!!!!!!!!!!!!!!!!!!!");
                addAnnoView(new_anno);
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

                view_stage_anno_layer.draw();

                console.log ("new");
                console.log (new_anno);
                console.log(ratio_new_anno);
                // clear the input fields after submission :
                $('#add-new').get(0).reset()
                // That makes adding a bunch of annotation items in sequence very easy and natural.


                Flash.success("The annotation was added", 2000);
            },
            error: function(){
                // TODO
                // uh oh, didn't work. Error message?
            }
        });

        return false; // prevent default form submission -> no page refresh
    });
});
