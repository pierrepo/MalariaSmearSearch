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
var annotations_list_id = 'annotations-list';
var url_for_img = Flask.url_for("get_chunk_url", {"sample_id": sample_id, "col":col, "row":row}) ;
var url_for_data = Flask.url_for("get_chunk_annotation", {"sample_id":sample_id , "col":col, "row":row}) ;
var add_form_field_baseid = 'add-sel-';








// util functions : -----------------------------------------------------------

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
    var activate = ! $("#annotations-list li[name="+name+"] span").hasClass( "click" );
    var transparency = (activate ? 0.5 : 0).toString();
    console.log (activate * 0.5) ;
    var rect = stage.findOne('.'+name);
    rect.setFill('rgba(255,255,0,'+0.5 * activate+')'); // 'rgba(255,255,0,'+transparency+')'
    $("#annotations-list li[name="+name+"] span").toggleClass('click');

}




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

        var ratio_rect = new Konva.Rect({
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



class DatArray extends Array{
    constructor(fetched_data, ratio){
        console.log(fetched_data);

        super()

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
            this.push(anno);
        }

         console.log(this);
    }


    /* Shuffle array
    * Fisher-Yates-Durstenfeld shuffle
    * http://stackoverflow.com/a/3718452
    */
    shuffle() {
        var sourceArray=this
        for (var i = 0; i < sourceArray.length - 1; i++) {
            var j = i + Math.floor(Math.random() * (sourceArray.length - i));

            var temp = sourceArray[j];
            sourceArray[j] = sourceArray[i];
            sourceArray[i] = temp;
        }
        return sourceArray;
    }

    get_anno_by_name(name){
        return $.grep(this, function(e){ return e.name == name(); });
    }

    // Remove an annotation by name
    // returns the annotation that has been removed
    // NB : /!\
    // if several anno have the same name, only the first one is removed
    splice_anno_by_name(name){
        anno = get_anno_by_name(name)[0]; // should always return 1 results

        var index = this.indexOf(anno); // index of the element you want to remove
        return this.splice(index, 1)[0];
        // 1 : number of elements to remove
        //splice modifies the array in place and and returns a new array containing the elements that have been removed
    }

}


class SessionCore {
    constructor(ratio_stage_container_id, url_for_img, url_for_data) {

        // create ratio view stage ...
        this.ratio_stage = new Konva.Stage({
            container: ratio_stage_container_id,  // id of container <div>
            width: $('#'+ratio_stage_container_id).width()
        })
        // ... and its layers :
        // - one for the image (in the bottom):
        var ratio_stage_img_layer = new Konva.Layer(name = 'img_layer');
        ratio_stage_img_layer.name('img_layer');
        this.ratio_stage.add(ratio_stage_img_layer);
        ratio_stage_img_layer.moveToBottom();
        // - the other for the annotations :
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
        this.data = new DatArray(fetched_data, this.ratio) ;
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
            this.set_img_on_stage();
        };
        this.img.onerror = function(e) {
          console.log("error when loading the image")
        };
        return deferred.promise();
    }


    set_img_on_stage(){

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

    show_annotation(anno){
        // add the ratio annotation as a rect on the anno layer of the view stage
        this.ratio_stage.findOne('.anno_layer').add(anno.get_ratio_rect());
    }


}

class ViewCore extends SessionCore {
    constructor(ratio_stage_container_id, annotations_list_id, url_for_img, url_for_data) {
        super(ratio_stage_container_id, url_for_img, url_for_data);

        this.set_annotation_list_events(annotations_list_id);
    }

    /* handles span click :*/
    set_annotation_list_events(annotations_list_id){
        self = this ;
        $('#'+annotations_list_id).on("click", "span", function() {
            // Each time your mouse enters or leaves a child element,
            // mouseover is triggered
            handleClickAnno($(this).parent().attr("name"), self.ratio_stage);
            self.ratio_stage.findOne('.anno_layer').draw();
        })
    }

    init(fetched_data){
        super.init(fetched_data);
        console.log('!!!!!!!!!!!!!!!!!!!!', fetched_data, this.data);
        for(var i = 0; i < this.data.length; i++) {
            this.add_annotation(this.data[i]);
            console.log(this.data[i]);
        }
        self.ratio_stage.draw();
    }


    /* This function adds a new annotation to the session
    * - It wraps the new annotation in action buttons (delete and edit)
    * - It puts the new anno in the annotations list
    * - It make the new item editable
    * - It adds the annotation on the annotation layers of stage(s)
    *
    * NB :
    * It doesn't store the new annotation in the db !
    * It doesn't refresh the layers
    *
    * @param {object} Annotation - the newly added annotation
    *
    */
    add_annotation(anno){
        console.log(anno);

        // add anno on ratio stage :
        this.show_annotation(anno);

        // the new anno is appended in the anno list :
        this.append_to_dom_anno_list(anno);

        // TODO : do not use the annotation code
        // the action button events are bind automatically,
        // but ensure the click-to-edit functionality is working
        // on newly appended list items even before a page refresh :


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
     }
}

class AnnotationCore extends ViewCore {
    constructor(scale_stage_container_id, ratio_stage_container_id, annotations_list_id, url_for_img, url_for_data) {
        super(ratio_stage_container_id, annotations_list_id, url_for_img, url_for_data);

        // we also need a scale stage for the cropper :
        this.scale_stage = new Konva.Stage({
            container: scale_stage_container_id  // id of container <div>
        })
        var scale_stage_img_layer = new Konva.Layer();
        scale_stage_img_layer.name('img_layer');
        this.scale_stage.add(scale_stage_img_layer);
        scale_stage_img_layer.moveToBottom();
        var scale_stage_anno_layer = scale_stage_img_layer; // for scale stage, image and anno on the same layer because each layer has a canvas and Cropper can handle only one canvas at a time
        scale_stage_anno_layer.addName('anno_layer');
        //this.scale_stage.add(scale_stage_anno_layer);


        this.cropper_container = $('#'+scale_stage_container_id+' .konvajs-content canvas');
    }


    /* handle click on del button : */
    set_annotation_list_events(){
        /*link li item buttons to events

        link li item buttons to events using the on() function because :
        - 1) it only creates one event handler which is more efficient
            than using the click function that creates a unique event handler for
            every single list item on the page, each one taking up browser memory
        - and 2) new items appended to the page are automatically bound by
            the same handler. Killer.
        */
        self = this ;
        super.set_annotation_list_events(annotations_list_id);

        $('#'+annotations_list_id).on('click', '.glyphicon-trash', function(){
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

                        var rect = self.scale_stage.findOne('.anno_layer').find( "."+ thiscache.parent().attr("name") );
                        rect.destroy();
                        self.scale_stage.findOne('.anno_layer').draw();
                        //Resource the cropper to take the deletion into account
                        self.refreash_cropper()


                        var ratio_rect = self.ratio_stage.findOne('.anno_layer').find( "."+ thiscache.parent().attr("name") );
                        ratio_rect.off('mouseover');
                        ratio_rect.off('mouseout');
                        ratio_rect.off('mousedown');
                        ratio_rect.destroy();
                        self.ratio_stage.findOne('.anno_layer').draw();

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

    }

    init(fetched_data){
        console.log(fetched_data);
        super.init(fetched_data);

        self.scale_stage.draw();
        this.refreash_cropper();
        Flash.success('Annotations were added on both the view and the annotation canvas. Everything is ready.', 3000);

    }

    set_img_on_stage(){

        // for the view ratio stage :
        super.set_img_on_stage();

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

        this.set_cropper();
    }


    show_annotation(anno){
        // add the ratio annotation as a rect on the anno layer of the view stage
        super.show_annotation(anno)

        // add the ratio annotation as a rect on the anno layer of the view stage
        this.scale_stage.findOne('.anno_layer').add(anno.get_rect());
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
         super.append_to_dom_anno_list(anno);
         makeEditable("#annotations-list li[name="+anno.name+"] span");
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
        console.log('The cropper was created successfully');
    }
}



class GameCore extends SessionCore {
    constructor(ratio_stage_container_id, url_for_img, url_for_data) {
        super(ratio_stage_container_id, url_for_img, url_for_data);
        this.success = 0 ;
        this.errors = 0 ;
    }

    handle_end_game() {
        if(confirm("Success: "+this.success+"  errors: "+this.errors+".\nDo you want to replay?")){
            location.reload();
        } else {
            window.location.href = "{{url_for('index')}}";
            // href or replace ? XXX
            //http://stackoverflow.com/a/506004
        }
    }

    init(fetched_data){
        console.log(fetched_data);
        super.init(fetched_data);
        this.play_game()
    }

    play_game(){
        console.log("starting the game");
    }
}


class FindParaActivity extends GameCore {
    constructor(ratio_stage_container_id, url_for_img, url_for_data) {
        super(ratio_stage_container_id, url_for_img, url_for_data);
    }

    init(fetched_data){
        console.log(fetched_data);
        var para_data = []
        for(var i = 0; i < fetched_data.length; i++) {
            if (fetched_data[i].annotation[0] == 'P'){
                para_data.push(fetched_data[i]);
            }
        }
        console.log(para_data);
        this.data = new DatArray(para_data, this.ratio) ;

        /*show all annotations*/
        for(var i = 0; i < this.data.length; i++) {
            this.show_annotation(this.data[i]);
        }
        this.ratio_stage.findOne('.anno_layer').draw();
        Flash.success('Annotations were added on the view canvas. Everything is ready.', 2000);

        this.play_game();
    }


    play_game(){

        /* The user triggers events by clicking on the konva : */
        self = this ;

        // the event is link to stage -> the user can click on image or on shape
        //https://konvajs.github.io/docs/events/Stage_Events.html
        this.ratio_stage.on('touchstart click', function(evt) {
            if (evt.target.className == 'Image') {
                console.log(this);
                /* the user has not cliked on a parasite annotation :*/
                console.log('click outside annotation at ' + JSON.stringify(self.ratio_stage.getPointerPosition()));
                console.log(evt.target);
                /* Update score :*/
                self.error ++ ;
                $('#error').html(error);
                var PointerPosition = self.ratio_stage.getPointerPosition() ;
                /* Mark the click with a small circle :*/
                var circle = new Konva.Circle({
                    x: PointerPosition.x,
                    y: PointerPosition.y,
                    radius: 4,
                    fill: '#D43F3A', //red
                    stroke: '#D43F3A', //red
                    strokeWidth: 1
                });
                self.ratio_stage.findOne('.anno_layer').add(circle);
                self.ratio_stage.findOne('.anno_layer').draw();
            }else if (evt.target.className == "Rect"){
                /* the user has cliked on a para annotation*/
                console.log('click inside annotation at ' + JSON.stringify(self.ratio_stage.getPointerPosition()));
                console.log(evt.target) ;
                console.log(evt.target.name());
                /* Update score :*/
                self.score ++ ;
                $('#score').html(score);
                /* Get the clicked anno :*/
                // remove the found parasite ()= the first (the only one) element that have the correct name)
                // from the parasite array
                // /!\ it should have always 1 result
                clicked_anno = self.data.splice_anno_by_name(evt.target.name());
                console.log(clicked_anno);
                // redraw annotation:
                evt.target.stroke("#4CAE4C"); //green
                self.ratio_stage.findOne('.anno_layer').draw();
                // the array has no element left -> end game :
                if (self.data.length == 0) {
                    self.handle_end_game()
                }
            }
        });


    }

}

class YesNoActivity extends GameCore {
    constructor(ratio_stage_container_id, url_for_img, url_for_data) {
        super(ratio_stage_container_id, url_for_img, url_for_data);
        this.current_i = 0 ;
    }

    play_game(){

        console.log(this.data);
        this.data = this.data.shuffle();
        console.log(this.data);

        this.set_new_round();

        var click_handler = (event) => {
            console.log("click on the 'yes' button");
            this.update_score_based_on_answear(event.target.id);

            // end game because no more annotation :
            if (this.current_i>= this.data.length-1 ){
                this.handle_end_game();
            }
            // or play another round :
            else if (this.current_i < this.data.length-1 ) {
                console.log('round', this.current_i);
                this.data[this.current_i].get_ratio_rect().destroy()
                this.current_i++;
                this.set_new_round();
            }

        }

        $("#yes").click(click_handler);
        $("#no").click(click_handler);

    }

    set_new_round(){
        var current_anno = this.data[this.current_i];
        console.log(current_anno);
        // add the ratio annotation as a rect on the anno layer of the view stage
        this.show_annotation(current_anno);
        this.ratio_stage.findOne('.anno_layer').draw();

    }


    update_score_based_on_answear(answer){
        // check if answer is correct
        // and increment success and errors
        /* Arguments :
        * ------------
        * answer : string
            'yes' or 'no'
        */
        var current_anno = this.data[this.current_i];

        console.log(
            current_anno.annotation[0],
            current_anno.annotation[0]=='P',
            answer,
            this.success,
            this.errors
        );
        if (
            // current anno is a para and the user has clicked yes :
            (current_anno.annotation[0]==='P' && answer === 'yes')
            // current anno is not a para and the user has clicked no :
            || (current_anno.annotation[0]!=='P' && answer === 'no')
        ){
            this.success++;
            $('#success').html(this.success);
        }else{
            this.errors++;
            $('#errors').html(this.errors);
        }
    }

}
