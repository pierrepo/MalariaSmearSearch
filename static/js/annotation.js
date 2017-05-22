"use strict";
console.log("Load annotation engine");

// constants : ----------------------------------------------------------------

// associative object
// key : annotation code
// value : annotation text, long version
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









// class definition : ---------------------------------------------------------

class Annotation {
    /* Annotation class
    *
    * Attributes
    * ----------
    * name : int as string
    *   the id of the annotation
    * annotation : string
    *   annotation text
    * x : int
    *   x coord of the starting (upper left) pixel of the annotation area
    * y : int
    *   x coord of the starting (upper left) pixel of the annotation area
    * width : int
    *   width of the annotation area
    * height : int
    *   height of the annotation area
    * stroke_color : string - default 'black'
    *   the color of the stroke when the annotation area is drawn on the image
    * stroke_width : int - default 4
    *   the width of the stoke (in pixel) when the annotation area is drawn on the image
    * fill_color : string - default null
    *   the color of the fill when the annotation area is drawn on the image
    * rect : Konva.Rect object - default undefined
    *   the associated full-sized Konva.Rect
    * ratio_rect : Konva.Rect object - default undefined
    *   the associated ratio-sized Konva.Rect
    * ratio : float
    *   the ratio between the full image size and its representation in the
    *   view tool.
    */
    constructor(name, annotation, x, y, width, height, ratio) {
        /* Constructor of annotation object
        *
        * Parameters
        * ----------
        * name : int as string
        *   the id of the annotation
        * annotation : string
        *     annotation text
        * x : int
        *     x coord of the starting (upper left) pixel of the annotation area
        * y : int
        *     x coord of the starting (upper left) pixel of the annotation area
        * width : int
        *     width of the annotation area
        * height : int
        *     height of the annotation area
        * ratio : float
        *     the ratio between the full image size and its representation in the
        *     view tool.
        *
        * Return
        * ------
        * instance of Annotation object
        *
        * Example :
        * ---------
        * an_annotation = new Annotation('1', 'test', 0, 0, 10, 10, 2)
        */
        this.name = name.toString(); // TODO : Change the code to use id directly.
        this.annotation = annotation ;
        this.x = x ;
        this.y = y ;
        this.width = width ;
        this.height = height ;
        this.stroke_color = 'black' ;
        this.stroke_width = 4 ;
        this.fill_color = null ;
        this.rect = this.get_new_rect() ;
        this.ratio_rect = this.get_new_ratio_rect(ratio) ;
        this.ratio = ratio ;
    }

    get_rect(){
        /* Getter of the `rect` attribute of annotation objects
        *
        * It creates a new full-sized Konva.Rect if there is currently none defined
        *
        * Return
        * ------
        * Konva.Rect instance
        */
        if (this.rect === undefined) {
            this.rect = this.get_new_rect() ;
        }
        return this.rect
    }

    get_ratio_rect(ratio = undefined ){
        /* Getter of the `ratio_rect` attribute of annotation objects
        *
        * It creates a new full-sized Konva.Rect if there is currently none defined.
        * It used the previously defined ratio if none is provided or the provided one.
        * If the provided one is the same as the defined one or if no ratio is provided
        * but the ratio_rect is already defined, it return the defined ratio_rect.
        *
        * Parameter
        * ---------
        * ratio : float - default this.ratio
        *   The ratio with which the ratio rect is defined
        *
        * Return
        * ------
        * Konva.Rect instance using the required ratio.
        */
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
        /* Get a new rect (instance of Konva.Rect) using attribute values of the current instance
        *
        * Return
        * ------
        * Konva.Rect instance
        */
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
        /*  Get a new ratio_rect (instance of Konva.Rect) using attribute values of the current instance
        *        *
        * Parameter
        * ---------
        * ratio : float - default this.ratio
        *   The ratio with which the ratio rect is defined
        *
        * Return
        * ------
        * Konva.Rect instance using the required ratio.
        *
        * Side effect
        * -----------
        * It stores the new ratio value in ratio attribute
        */
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

        return ratio_rect;

    }

}



class DatArray extends Array{
    /* Object that store annotations
    * extend basic js Array objects
    *
    *
    * Example
    * -------
    * // create a new datarray
    * // fetched_data is an array from json ajax request
    * // it contains information on 10 annotations.
    * fetched_data = [element0, element1, ..., elementN]
    * new_datarray = new DatArray (fetched_data, 2)
    *
    * // access the third annotation :
    * // /!\ the indiciation begins from 0
    * third_anno = new_datarray[2]
    *
    */
    constructor(fetched_data, ratio){
        /* Constructor of annotation object
        *
        * Parameter
        * ---------
        * fetched_data : array
        *   array from json array request
        *   It contains information of the annations retrieve from the server
        *   (name, annotation text, x, y, width, height)
        *
        * Return
        * ------
        * new instance of DatArray containing Annotation object for each annotation in fetched_data
        */
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


    shuffle() {
        /* Shuffle the array
        *
        * It uses the Fisher-Yates-Durstenfeld shuffle
        * more info here : http://stackoverflow.com/a/3718452
        *
        */
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
        /* Finds the elements of an array which satisfy a given name.
        *
        * The original array is not affected.
        *
        * Parameter
        * ---------
        * name : string
        *   name of the annotation that have to be retrieve if defined
        *
        * Return
        * -------
        * Array containing element of the current instance of DatArray that matches
        * the provided name.
        * /!\ NB: As name should be unique, it should have only one result.
        */
        return $.grep(this, function(e){ return e.name == name; });
    }


    splice_anno_by_name(name){
        /* Remove the annotation that matches the provided name
        *
        * /!\ NB : the names shuld be unique, but if several annotation have
        * the same name, only the first one will be removed.
        *
        *
        * Parameter
        * ---------
        * name : string
        *   Name of the annotation we want to remove.
        *
        * Return
        * ------
        * instance of Annotation class : the annotation that has been removed.
        */
        anno = this.get_anno_by_name(name)[0]; // should always return 1 results

        var index = this.indexOf(anno); // index of the element you want to remove
        return this.splice(index, 1)[0];
        // 1 : number of elements to remove
        //splice modifies the array in place and and returns a new array containing the elements that have been removed
    }

}


class SessionCore {
    /* SessionCore object
    *
    * Store what is common between every session in MSS :
    * Retrieve annotation data and image, set and use the view stage.
    *
    *
    * Attributes
    * ----------
    * ratio_stage : Konva.Stage
    *   the view stage that uses a ratio for the full-sized image to be adapted to the device.
    * ratio : float
    *   The ratio with which the ratio stage is defined.
    * data : DatArray
    *   Array that store Annotation objects from the annotation data that are retrieved from the server
    * img : js Image
    *   image that is retrieved from the server.
    *
    */
    constructor(ratio_stage_container_id, url_for_img, url_for_data) {
        /* Constructor of SessionCore instances
        *
        * Parameters
        * ----------
        * ratio_stage_container_id : String | Element
        *   Container selector or DOM element
        *   on which the Konva will be applied.
        * url_for_img : String
        *  url where the the image can be retrieved
        * url_for_data : String
        *   url where the annotation data can be retrieved
        *
        * Return
        * ------
        * instance of SessionCore
        */

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



    init(fetched_data){
        /* The function that is runned once both image AND data are loaded
        *
        * The data attribute of the current instance is set as a DatArray built
        * from the provided fetched data.
        *
        * Parameter
        * ---------
        * fetched_data : Array
        *   array of objects containing information on retreived annotations
        *   (one object per annotation).
        *
        */
        console.log(fetched_data);
        this.data = new DatArray(fetched_data, this.ratio) ;
    }


    fetch_data(url_for_data){
        /* Fetched annotation data at the provided url
        *
        * Parameter
        * ----------
        * url_for_data : String
        *   the url where annotation data have to be retrieved.
        *
        * Return
        * ------
        * jQuery XMLHttpRequest (jqXHR) promise instance.
        */
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


    fetch_img(url_for_img) {
        /* Fetched image at the provided url
        *
        * Parameter
        * ----------
        * url_for_img : String
        *   the url where image have to be retrieved.
        *
        * Return
        * ------
        * Promise that will be resolved once the image is loaded
        *
        * Side effects
        * ------------
        * once the image is loaded,
        * - it computes and sets the ratio
        * - and it sets the image on stage.
        */

        var deferred = $.Deferred();
        this.img = new Image();
        this.img.src = url_for_img;
        // once the image is loaded :
        this.img.onload = () => {
            // arrow function from ES6 :
            // unlike normal functions, arrow functions
            // inherit their this value from the context in which they're defined
            // inspired of : http://stackoverflow.com/a/30824784
            console.log("loaded image: "+url_for_img);
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
        /* Set the loaded image on the view stage using the correct ratio
        *
        * The image is set on the Layer named `ìmg_layer` of the ratio stage.
        */
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
        /* Add the provided annotation shape (using ratio) on the anno layer of the view stage
        *
        * Argument
        * ---------
        * anno : instance of Annotation
        *   the annotation we want to draw on the Layer named anno_layer of the view stage.
        */
        this.ratio_stage.findOne('.anno_layer').add(anno.get_ratio_rect());
    }


}

class ViewCore extends SessionCore {
    /* ViewCore objects
    *
    * It extends the SessionCore adding annoation list functionality.
    *
    */
    constructor(ratio_stage_container_id, annotations_list_id, url_for_img, url_for_data) {
        /* Constructor of ViewCore object
        *
        * Parameters
        * ----------
        * ratio_stage_container_id : String | Element
        *   Container selector or DOM element
        *   on which the Konva will be applied.
        * annotations_list_id : String
        *   Annotation list container selector
        * url_for_img : String
        *  url where the the image can be retrieved
        * url_for_data : String
        *   url where the annotation data can be retrieved
        *
        * Return
        * ------
        * initialized instance of ViewCore.
        * with annotation shapes drawn on the view stage,
        * and linked to hightlightning via click event, as well as annotation in the list.
        */
        super(ratio_stage_container_id, url_for_img, url_for_data);

        this.set_annotation_list_events(annotations_list_id);
    }


    handleClickAnno(name){
        /* Handles the event 'click annotations'.
        *
        * - On click :
        * The corresponding shape on the view stage
        * and the annotation item in the annotation list
        * are filled in yellow (with transparency of 0.5).
        * - On reclick : the fill is removed.
        *
        * NB : The function does not redraw the stage.
        *
        * Parameter
        * ----------
        * name : String
        *   the name of an annotation
        *   this name corresponds to konva rect shape on ratio stage
        *   and of the name of an annotation item in the annotation list.
        *
        */
        console.log('in handleClickAnno');
        var activate = ! $("#annotations-list li[name="+name+"] span").hasClass( "click" );
        var transparency = (activate ? 0.5 : 0).toString();
        console.log (activate * 0.5) ;
        var rect = self.ratio_stage.findOne('.'+name);
        rect.setFill('rgba(255,255,0,'+0.5 * activate+')'); // 'rgba(255,255,0,'+transparency+')'
        $("#annotations-list li[name="+name+"] span").toggleClass('click');

    }

    set_annotation_list_events(annotations_list_id){
        /* Set the click event on annotation list
        *
        * If the user click on annotation item, both the annotation item and the
        * corresponding shape on the view stage are hightlighted in yellow.
        *
        * Parameter
        * ---------
        * annotations_list_id : string
        *   Annotation list container selector
        *
        */
        self = this ;
        $('#'+annotations_list_id).on("click", "span", function() {
            // Each time your mouse enters or leaves a child element,
            // mouseover is triggered
            self.handleClickAnno($(this).parent().attr("name"));
            self.ratio_stage.findOne('.anno_layer').draw();
        })
    }

    init(fetched_data){
        /* The function that is runned once both image AND data are loaded
        *
        * The data attribute of the current instance is set as a DatArray built
        * from the provided fetched data.
        * The annotations are added in the annotation list and drawn on the view stage.
        *
        * Parameter
        * ---------
        * fetched_data : Array
        *   array of objects containing information on retreived annotations
        *   (one object per annotation).
        *
        */
        super.init(fetched_data);
        console.log('!!!!!!!!!!!!!!!!!!!!', fetched_data, this.data);
        for(var i = 0; i < this.data.length; i++) {
            this.add_annotation(this.data[i]);
            console.log(this.data[i]);
        }
        self.ratio_stage.draw();
    }

    add_annotation(anno){
        /* Add an annotation to the session
        *
        * - It puts the new anno in the annotations list
        * - It adds the annotation on the annotation layers of the view stage
        *
        * NB :
        * It does npt store the new annotation in the db !
        * It does not refresh the layers
        *
        * Parameter
        * ----------
        * anno : instance of Annotation
        *   the annotation to add.
        *
        */
        console.log(anno);

        // add anno on ratio stage :
        this.show_annotation(anno);

        // the new anno is appended in the anno list :
        this.append_to_dom_anno_list(anno);

        self = this;
        // bind the new ratio rect to mouse events :
        anno.get_ratio_rect().on('click', function(evt) {
            self.handleClickAnno(this.name());
            self.ratio_stage.findOne('.anno_layer').draw();
        });

        // TODO : do not use the annotation code
        // the action button events are bind automatically,
        // but ensure the click-to-edit functionality is working
        // on newly appended list items even before a page refresh :


    }

    append_to_dom_anno_list(anno){
        /* This function adds an annotation in the anno list
        *
        * - It wraps the new annotation in action buttons (delete button) # TODO : rm that from here !
        * - It puts the new annotation in the annotations list.
        *
        * Parameter
        * ---------
        * anno : instance of Annotation
        *   the annotaiton to add.
        *
        */

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
         var html="<li class='list-group-item' name='"+anno.name+"'><span>" + ANNO_DECODER[anno.annotation] + "</span></li>";
         $("#annotations-list").append(html);
     }
}

class AnnotationCore extends ViewCore {
    /* AnnotationCore objects
    *
    * It extends the ViewCore adding annotation tool functionality.
    *
    * Attributes
    * ----------
    * scale_stage : Konva.Stage
    *   the anotation stage that usesthe full-sized image.
    * cropper_container : String
    *   Container selector of the element of the scale_stage on with the cropper can be set.
    */
    constructor(scale_stage_container_id, ratio_stage_container_id, annotations_list_id, url_for_img, url_for_data) {
        /* Constructor of AnnotationCore object
        *
        * Parameters
        * ----------
        * scale_stage_container_id : String | Element
        *   Container selector or DOM element
        *   on which the Konva will be applied for the scale stage.
        * ratio_stage_container_id : String | Element
        *   Container selector or DOM element
        *   on which the Konva will be applied for the ratio stage.
        * annotations_list_id : String
        *   Annotation list container selector
        * url_for_img : String
        *  url where the the image can be retrieved
        * url_for_data : String
        *   url where the annotation data can be retrieved
        *
        * Return
        * ------
        * initialized instance of AnnotationCore.
        * with annotation shapes drawn on both the view and the annotation stage,
        * shapes on view stage are linked to hightlightning via click event, as well as annotation in the list.
        * a cropper is initialized on the annotation stage for the user to add new annotations.
        * action button to delete and edit annotations are activated.
        */
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



    set_annotation_list_events(annotations_list_id){
        /* Set the click event on annotation list
        *
        * If the user click on annotation item, both the annotation item and the
        * corresponding shape on the view stage are hightlighted in yellow.
        * Handle click on delete button : If the user click on delete buton, he is
        * ask to confirm, then, the associated annotation is deleted
        * from the annotation list, the stages and the database.
        *
        * Parameter
        * ---------
        * annotations_list_id : string
        *   Annotation list container selector
        *
        */
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
        /* The function that is runned once both image AND data are loaded
        *
        * The data attribute of the current instance is set as a DatArray built
        * from the provided fetched data.
        * The annotations are added in the annotation list
        * and drawn on both the view and the annotation stages.
        *
        * Parameter
        * ---------
        * fetched_data : Array
        *   array of objects containing information on retreived annotations
        *   (one object per annotation).
        *
        */
        console.log(fetched_data);
        super.init(fetched_data);

        self.scale_stage.draw();
        this.refreash_cropper();
        Flash.success('Annotations were added on both the view and the annotation canvas. Everything is ready.', 3000);

    }

    set_img_on_stage(){
        /* Set the loaded image on the stages
        *
        * The image is set on the Layer named `ìmg_layer` of the ratio stage
        * (using the ratio), and on the scale stage at its full size.
        */

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
        /* Add the provided annotation shape on the anno layer of the stages
        *
        * Argument
        * ---------
        * anno : instance of Annotation
        *   the annotation we want to draw on the Layer named anno_layer of the view stage.
        */
        // add the ratio annotation as a rect on the anno layer of the view stage
        super.show_annotation(anno)

        // add the ratio annotation as a rect on the anno layer of the view stage
        this.scale_stage.findOne('.anno_layer').add(anno.get_rect());
    }



    refreash_cropper(){
        /* Refreash the cropper to take changes into account. */
        var new_content = this.cropper_container[0].toDataURL();
        this.cropper_container.cropper(
            'replace',
            new_content,
            true
        );

    }



    append_to_dom_anno_list(anno){
        /* This function adds an annotation in the anno list
        *
        * - It wraps the new annotation in action buttons (delete button),
        * - It make the item editable,
        * - It puts the new annotation in the annotations list.
        *
        * Parameter
        * ---------
        * anno : instance of Annotation
        *   the annotaiton to add.
        *
        */
         var html="<li class='list-group-item' name='"+anno.name+"'><span>" + ANNO_DECODER[anno.annotation] + "</span><button class='glyphicon glyphicon-trash'></button></li>";
         $("#annotations-list").append(html);
         this.makeEditable("#annotations-list li[name="+anno.name+"] span");
    }



    makeEditable(editableTarget) {
        /* Make an element editable using the plugin Jeditable
        *
        * Parameter
        * ---------
        * editableTarget : String
        *   Container selector of the DOM element that will be editable
        */

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



    set_cropper(){
        /* Set the cropper on the scale stage */
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
    /* GameCore class
    *
    * Defines what is common to all MSS games
    *
    * Attributes :
    * ------------
    * succes : int - default 0
    *   the positive score / number of success
    * errors : int - default 0
    *   the negative score / number of false
    */
    constructor(ratio_stage_container_id, url_for_img, url_for_data) {
        /* Constructor of GameCore object
        *
        * Parameters
        * ----------
        * ratio_stage_container_id : String | Element
        *   Container selector or DOM element
        *   on which the Konva will be applied for the ratio stage.
        * url_for_img : String
        *  url where the the image can be retrieved
        * url_for_data : String
        *   url where the annotation data can be retrieved
        *
        * Return
        * ------
        * initialized instance of GameCore.
        */
        super(ratio_stage_container_id, url_for_img, url_for_data);
        this.success = 0 ;
        this.errors = 0 ;
    }

    handle_end_game() {
        /* Handle the end the game
        *
        * Inform the user about its successses and its errors
        * ans ak him if we want to replay.
        *
        */
        if(confirm("Success: "+this.success+"  errors: "+this.errors+".\nDo you want to replay?")){
            location.reload();
        } else {
            window.location.href = "{{url_for('index')}}";
            // href or replace ? XXX
            //http://stackoverflow.com/a/506004
        }
    }

    init(fetched_data){
        /* The function that is runned once both image AND data are loaded
        *
        * The data attribute of the current instance is set as a DatArray built
        * from the provided fetched data.
        * The game is runned
        *
        * Parameter
        * ---------
        * fetched_data : Array
        *   array of objects containing information on retreived annotations
        *   (one object per annotation).
        *
        */
        console.log(fetched_data);
        super.init(fetched_data);
        this.play_game()
    }


    play_game(){
        /* Play the game
        *
        * This function has to be rewritten for each game.
        */
        console.log("starting the game");
    }
}


class FindParaActivity extends GameCore {
    /* FindParaActivity class*/

    constructor(ratio_stage_container_id, url_for_img, url_for_data) {
        /* Constructor of FindParaActivity object
        *
        * Parameters
        * ----------
        * ratio_stage_container_id : String | Element
        *   Container selector or DOM element
        *   on which the Konva will be applied for the ratio stage.
        * url_for_img : String
        *  url where the the image can be retrieved
        * url_for_data : String
        *   url where the annotation data can be retrieved
        *
        * Return
        * ------
        * initialized instance of FindParaActivity.
        */
        super(ratio_stage_container_id, url_for_img, url_for_data);
    }

    init(fetched_data){
        /* The function that is runned once both image AND data are loaded
        *
        * The data attribute of the current instance is set as a DatArray built
        * from the provided fetched data.
        * All parasite annotations are drawn invisibly on the viw stage.
        * The game is runned.
        *
        * Parameter
        * ---------
        * fetched_data : Array
        *   array of objects containing information on retreived annotations
        *   (one object per annotation).
        *
        */
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
        /* Play the game
        *
        * The user click on the view stage. If he click on a parasite,
        * he earns a success point. Otherwise : he loses an error point.
        * A user cannot click 2 times on the same parasite annotation.
        * When all parasite annotations are found, it triggers the end of the game.
        */

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
    /* FindParaActivity class
    *
    * Attribute
    * ---------
    * current_annotation :
    *   annotation the user is currently asked about
    */
    constructor(ratio_stage_container_id, url_for_img, url_for_data) {
        /* Constructor of YesNoActivity object
        *
        * Parameters
        * ----------
        * ratio_stage_container_id : String | Element
        *   Container selector or DOM element
        *   on which the Konva will be applied for the ratio stage.
        * url_for_img : String
        *  url where the the image can be retrieved
        * url_for_data : String
        *   url where the annotation data can be retrieved
        *
        * Return
        * ------
        * initialized instance of YesNoActivity.
        */
        super(ratio_stage_container_id, url_for_img, url_for_data);
        this.current_annotation = undefined ;
    }

    play_game(){
        /* Play the game
        *
        * Each annotation are drawn in a random order.
        * For each annotation, the user have to tell if he thinks it is a
        * parasite (click yes) or not (click no).
        * If the answear is correct, the user earns a success point.
        * Otherwise, the user loses an error point.
        */

        console.log(this.data);
        this.data = this.data.shuffle();
        console.log(this.data);

        this.set_new_round();

        var click_handler = (event) => {
            console.log("click on the 'yes' button");
            this.update_score_based_on_answear(event.target.id);

            // end game because no more annotation left :
            if (this.data.length == 0 ){
                this.handle_end_game();
            }else{ // or play another round :
                this.current_anno.get_ratio_rect().destroy()
                this.set_new_round();
            }

        }

        $("#yes").click(click_handler);
        $("#no").click(click_handler);

    }

    set_new_round(){
        /* Draw the new annotation on the view stage */
        this.current_anno = this.data.pop();
        console.log(this.current_anno);
        // add the ratio annotation as a rect on the anno layer of the view stage
        this.show_annotation(this.current_anno);
        this.ratio_stage.findOne('.anno_layer').draw();

    }


    update_score_based_on_answear(answer){
        /* Update the score based on the user answear
        *
        * Check if the answer is correct and increment success and errors score consequently
        *
        * Parameter
        * ---------
        * answer : string
        *   'yes' or 'no'
        */

        console.log(
            this.current_anno.annotation[0],
            this.current_anno.annotation[0]=='P',
            answer,
            this.success,
            this.errors
        );
        if (
            // current anno is a para and the user has clicked yes :
            (this.current_anno.annotation[0]==='P' && answer === 'yes')
            // current anno is not a para and the user has clicked no :
            || (this.current_anno.annotation[0]!=='P' && answer === 'no')
        ){
            this.success++;
            $('#success').html(this.success);
        }else{
            this.errors++;
            $('#errors').html(this.errors);
        }
    }

}
