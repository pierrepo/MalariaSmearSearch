"use strict";
console.log("Load annotation engine");

// constants : ----------------------------------------------------------------

var ANNO_DECODER = {
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


var scale_stage_container_id = 'anno-konvajs';
var ratio_stage_container_id = 'view-konvajs';
var url_for_img = Flask.url_for("get_chunk_url", {"sample_id": sample_id, "col":col, "row":row}) ;
var url_for_data = Flask.url_for("get_chunk_annotation", {"sample_id":sample_id , "col":col, "row":row}) ;
var add_form_field_baseid = 'add-sel-';



// class definition : ---------------------------------------------------------

class Annotation {
    constructor(name, annotation, x, y, width, height, ratio) {
        this.name = name.toString(); // TODO : Change the code to use id directly.
        this.annotation = annotation ;
        this.x = x ;
        this.y = y ;
        this.width = width ;
        this.height = height ;
        this.stroke_color = 'black' ;
        this.stroke_width = 4 ;
        this.fill_color = null ;
        this.rect = undefined ;
        this.ratio_rect = undefined ;
        this.data = undefined ;
        this.ratio = ratio ;
    }

    get_rect(){
        if (this.rect === undefined) {
            this.rect = this.get_new_rect() ;
        }
        return this.rect
    }

    get_ratio_rect(ratio = undefined ){
        if (ratio !== undefined && this.ratio !== ratio) {
            this.ratio = ratio;
            this.ratio_rect = this.get_new_ratio_rect(ratio);
        }
        if (this.ratio_rect === undefined) {
            this.ratio_rect = this.get_new_ratio_rect(this.ratio);
        }
        return this.ratio_rect
    }

    get_new_rect(){
        return new Konva.Rect({
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height,
            fill : this.fill_color,
            stroke: this.stroke_color,
            strokeWidth:  this.stroke_width,
            name: this.name
        })
    }
    get_new_ratio_rect(ratio){
        this.ratio = ratio;

        ratio_rect = new Konva.Rect({
            x: this.x * ratio,
            y: this.y * ratio,
            width: this.width * ratio,
            height: this.height * ratio,
            fill : this.fill_color,
            stroke: this.stroke_color,
            strokeWidth:  this.stroke_width * ratio,
            name: this.name
        });

        // bind the new ratio rect to mouse events :
        ratio_rect.on('click', function(evt) {
            var annotation = evt.target;
            if (annotation) {
                handleClickAnno(this.name(), view_stage);
                view_stage_anno_layer.draw();
            }
        });


        return ratio_rect;

    }

}



class DatArray {
    constructor(fetched_data, ratio){
        console.log(fetched_data);

        this.data = [] ;

        for(var i = 0; i < fetched_data.length; i++) {
            var anno = new Annotation(
                fetched_data[i].name,
                fetched_data[i].annotation,
                fetched_data[i].x,
                fetched_data[i].y,
                fetched_data[i].width,
                fetched_data[i].height,
                ratio
            );
            this.data.push(anno);
        }
    }
}


class SessionCore {
    constructor(scale_stage_container_id, ratio_stage_container_id, url_for_img, url_for_data) {

        // create scale stage and ratio view stage ...
        this.scale_stage = new Konva.Stage({
            container: scale_stage_container_id  // id of container <div>
        })
        this.ratio_stage = new Konva.Stage({
            container: ratio_stage_container_id,  // id of container <div>
            width: $('#'+ratio_stage_container_id).width()
        })
        // ... and theirs layers :
        // - one for the image (in the bottom):
        var scale_stage_img_layer = new Konva.Layer();
        scale_stage_img_layer.name('img_layer');
        this.scale_stage.add(scale_stage_img_layer);
        scale_stage_img_layer.moveToBottom();
        var ratio_stage_img_layer = new Konva.Layer(name = 'img_layer');
        ratio_stage_img_layer.name('img_layer');
        this.ratio_stage.add(ratio_stage_img_layer);
        ratio_stage_img_layer.moveToBottom();
        // - the other for the annotations :
        var scale_stage_anno_layer = scale_stage_img_layer; // for scale stage, image and anno on the same layer because each layer has a canvas and Cropper can handle only one canvas at a time
        scale_stage_anno_layer.addName('anno_layer');
        //this.scale_stage.add(scale_stage_anno_layer);
        var ratio_stage_anno_layer = new Konva.Layer(name = 'anno_layer');
        ratio_stage_anno_layer.name('anno_layer');
        this.ratio_stage.add(ratio_stage_anno_layer);



        /* Fetch data
        * inspired of :
        * http://stackoverflow.com/a/8645155
        * and
        * https://zestedesavoir.com/tutoriels/446/les-promesses-en-javascript/#4-13285_gerer-des-traitement-simultanes
        */

        var promises = [];
        promises.push(this.fetch_img(url_for_img));
        promises.push(this.fetch_data(url_for_data));
        console.log('----------------------------------');
        console.log(promises);

        /* Promise.all(promesses) :
        - returns a promise that will be resolved only if
        promisses given in parameter (and that has to be an iterable, like an array, for instance)
        will be resolved
        - fails if one on them (no matter wich one) fails
        */
        Promise.all(promises).then( (results) => {
            console.log('promises array all resolved', results);
            var fetched_data = results[1] ;
            console.log('---------------', fetched_data);
            this.init(fetched_data) ;
        }).catch(function (err) {
            console.error('An error has occured.', err);
        });


    }


    /*
    To run only once image AND data are loaded :
    */
    init(fetched_data){
        console.log(fetched_data);
        this.data = new DatArray(fetched_data) ;
    }

    fetch_data(url_for_data){
        return $.getJSON(
            url_for_data,
            function(fetched_data){
                Flash.success('Annotations were fetched from the server', 2000);
                for(var i = 0; i < fetched_data.length; i++) {
                    fetched_data[i].stroke = 'black';
                    fetched_data[i].strokeWidth = 4;
                    fetched_data[i].name = fetched_data[i].id.toString(); // TODO : Change the code to use id directly.
                    console.log(i, fetched_data[i]);
                }
            }
        )
    }

    fetch_img(src) {

        var deferred = $.Deferred();
        this.img = new Image();
        this.img.src = src;
        // once the image is loaded :
        this.img.onload = () => {
            // arrow function from ES6 :
            // unlike normal functions, arrow functions
            // inherit their this value from the context in which they're defined
            // inspired of : http://stackoverflow.com/a/30824784
            console.log("loaded image: "+src);
            Flash.success('Image was retrieved from the server', 2000);
            deferred.resolve();
            this.ratio = this.ratio_stage.width()/this.img.naturalWidth;
            this.set_img_on_stages();
        };
        this.img.onerror = function(e) {
          console.log("error when loading the image")
        };
        return deferred.promise();
    }


    set_img_on_stages(){
        //-----
        // img for scale stage :
        var scale_img = new Konva.Image({
          x: 0,
          y: 0,
          image: this.img,
          width: this.img.naturalWidth,
          height: this.img.naturalHeight,
        });
        // adjust stage dimention = the same of the original image
        this.scale_stage.height(scale_img.height());
        this.scale_stage.width(scale_img.width());
        // add the img to the img layer :
        this.scale_stage.findOne('.img_layer').add(scale_img);

        //-----
        // ratio img for ratio stage :
        var ratio_img = new Konva.Image({
          x: 0,
          y: 0,
          image: this.img,
          width: this.img.naturalWidth * this.ratio,
          height: this.img.naturalHeight * this.ratio
        });
        //adjust stage height (the width is already fixed):
        this.ratio_stage.height(ratio_img.height());
        // add the shape to the img layer
        this.ratio_stage.findOne('.img_layer').add(ratio_img);

    }


}
class AnnotationCore extends SessionCore {
    constructor(scale_stage_container_id, ratio_stage_container_id, url_for_img, url_for_data) {
        super(scale_stage_container_id, ratio_stage_container_id, url_for_img, url_for_data);
        this.cropper_container = $('#'+scale_stage_container_id+' .konvajs-content canvas');
        this.set_cropper();
    }


    init(fetched_data){
        console.log(fetched_data);
        super.init(fetched_data);
        for(var i = 0; i < this.data.length; i++) {
            this.add_annotation(this.data[i]);
        }
        this.refreash_cropper();
        Flash.success('Annotations were added on both the view and the annotation canvas. Everything is ready.', 3000);

    }



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
    * @param {object} Annotation - the newly added annotation
    *
    */
    add_annotation(anno){
        console.log(new_anno);

        // the new anno is appended in the anno list :
        this.append_to_dom_anno_list(new_anno);

        // TODO : do not use the annotation code
        // the action button events are bind automatically,
        // but ensure the click-to-edit functionality is working
        // on newly appended list items even before a page refresh :

        // add the annotation as a rect on the anno layer of the anno stage
        anno_stage_anno_layer.add(new_anno.get_rect());
        // add the ratio annotation as a rect on the anno layer of the view stage
        view_stage_anno_layer.add( new_anno.get_ratio_rect());
    }



    refreash_cropper(){
        var new_content = this.cropper_container[0].toDataURL();
        this.cropper_container.cropper(
            'replace',
            new_content,
            true
        );

    }


    /* This function add an annotation in the anno list
    *
    * - It wraps the new annotation in action buttons (delete and edit)
    * - It puts the new anno in the annotations list
    * - It make the new item editable
    *
    * @param {object} Annotation - the annotaiton to add
    *
    */
    append_to_dom_anno_list(anno){

        // http://stackoverflow.com/a/12949050
        // jQuery append function close tags automatically.
        // that is why why cannot use :
        /*
        $("#annotations-list")
            .append("<li name='"+new_anno.name+"'><span>" + ANNO_DECODER[new_anno.annotation] + "</span>");
        if (user_has_right) {
            $("#annotations-list")
                .append("<button class='glyphicon glyphicon-trash'></button>");
        }
        $("#annotations-list")
            .append("</li>");
        */
        // Instead, we put the html in an string then append that string to the dom :
         var html="<li class='list-group-item' name='"+anno.name+"'><span>" + ANNO_DECODER[anno.annotation] + "</span>"
         if (user_has_right) {
             html+=" <button class='glyphicon glyphicon-trash'></button>";
         }
         html+="</li>";

         $("#annotations-list").append(html);

         if (user_has_right) {
             makeEditable("#annotations-list li[name="+new_anno.name+"] span");
         }
    }

    set_cropper(){
        this.cropper_container.cropper({
            viewMode :1, //   0: the crop box is just within the container  ;     1: the crop box should be within the canvas -> zoom / dezoom as you want but do not select out the image ;     2: the canvas should not be within the container ;    3: the container should be within the canvas
            dragMode : 'crop', // 'crop': create a new crop box ; 'move': move the canvas  ;  'none': do nothing
            autoCrop : true, //enable / disable the default image crop when initialize.
            autoCropArea : 0.1,
            crop: function(e) {
                // Output the result data for cropping image.
                console.log(e.x);
                $('#'+add_form_field_baseid+'x').val(Math.round(e.x))
                console.log(e.y);
                $('#'+add_form_field_baseid+'y').val(Math.round(e.y))
                console.log(e.width);
                $('#'+add_form_field_baseid+'width').val(Math.round(e.width))
                console.log(e.height);
                $('#'+add_form_field_baseid+'height').val(Math.round(e.height))
                //console.log(e.detail.rotate);
                //console.log(e.detail.scaleX);
                //console.log(e.detail.scaleY);
            }
        });
        Flash.success('The cropper was created successfully', 3000);
    }
}



class GameCore extends SessionCore {
    constructor() {
        super();
    }

    handle_end_game() {
    }
}


class FindParaActivity extends GameCore {
    constructor() {
        super();
    }

}

class YesNoActivity extends GameCore {
    constructor() {
        super();
    }

}




$(document).ready(function(){

    /**************************************************************************/
    // util functions :

    /*
    * This function handles the event 'click annotations'.
    * If the mouse is on a rect or on an annotation item in the anotation list,
    * the corresponding rect and annotation item are filled in yellow
    * (with transparency of 0.5).
    * Else nothing happens.
    * Nota Bene :
    * after using this function, you have to refreash the layer containing the rect annotations
    * using the draw() function.
    *
    * @param {string} name - the name of a konva rect annotation and of an annotation item in the annotation list.
    * @param {Konva.stage} stage - stage where the annotations will be colored
    *
    */
    function handleClickAnno(name, stage){
        console.log('in handleClickAnno');
        activate = ! $("#annotations-list li[name="+name+"] span").hasClass( "click" );
        transparency = (activate ? 0.5 : 0).toString();
        console.log (activate * 0.5) ;
        rect = stage.findOne('.'+name);
        rect.setFill('rgba(255,255,0,'+0.5 * activate+')'); // 'rgba(255,255,0,'+transparency+')'
        $("#annotations-list li[name="+name+"] span").toggleClass('click');

    }


    /**************************************************************************/

    /*************************************************************************/
    var session = new AnnotationCore(
        scale_stage_container_id,
        ratio_stage_container_id,
        url_for_img,
        url_for_data
    )

    /*********************/
    /* Set the crop tool */
    /*********************/


    /* Fetch data */








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
            data      : ANNO_DECODER,

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


   $('#annotations-list').on("click", "span", function() {
       // Each time your mouse enters or leaves a child element,
       // mouseover is triggered
       handleClickAnno($(this).parent().attr("name"), view_stage);
       view_stage_anno_layer.draw();
   })



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
