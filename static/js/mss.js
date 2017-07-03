"use strict";



// for html :  ----------------------------
view_stage_container_id = 'view-konvajs'
url_for_image = Flask.url_for("get_chunk_url", {"sample_id": sample_id, "col":col, "row":row})
url_for_data = Flask.url_for("get_chunk_annotation", {"sample_id":sample_id , "col":col, "row":row}),


//-----------------------------------------


console.log("Load annotation engine");

/* Global var */
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
    "PVR":"Parasite - P. Vivax - Ring",
    "PVT":"Parasite - P. Vivax - Trophzoide",
    "PVS":"Parasite - P. Vivax - Schizont",
    "PVG":"Parasite - P. Vivax - Gametocyte",
    "PVU":"Parasite - P. Vivax - Unknowns",
    "POR":"Parasite - P. Ovale - Ring",
    "POT":"Parasite - P. Ovale - Trophzoide",
    "POS":"Parasite - P. Ovale - Schizont",
    "POG":"Parasite - P. Ovale - Gametocyte",
    "POU":"Parasite - P. Ovale - Unknown",
    "PMR":"Parasite - P. Malariae - Ring",
    "PMT":"Parasite - P. Malariae - Trophzoide",
    "PMS":"Parasite - P. Malariae - Schizont",
    "PMG":"Parasite - P. Malariae - Gametocyte",
    "PMU":"Parasite - P. Malariae - Unknown",
    "PKR":"Parasite - P. Knowlesi - Ring",
    "PKT":"Parasite - P. Knowlesi - Trophozoide",
    "PKS":"Parasite - P. Knowlesi - Schizont",
    "PKG":"Parasite - P. Knowlesi - Gametocyte",
    "PKU":"Parasite - P. Knowlesi - Unknown",
    "RBC":"Red Blood Cell",
    "WBC":"White Blood Cell",
    "THR":"Platelet",
    "ART":"Artefact"
};



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
}


class DatArray {
    constructor(fetched_data, ratio){

        this.data = [] ;

        for(var i = 0; i < fetched_data.length; i++) {
            anno = new Annotation(
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
    shuffle() {
    }
    find(){
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
        var scale_stage_img_layer = new Konva.Layer(name = 'img_layer');
        this.scale_stage.add(scale_stage_img_layer);
        scale_stage_img_layer.moveToBottom();
        var ratio_stage_img_layer = new Konva.Layer(name = 'img_layer');
        this.ratio_stage.add(ratio_stage_img_layer);
        ratio_stage_img_layer.moveToBottom();
        // - the other for the annotations :
        var scale_stage_anno_layer = scale_stage_img_layer; // for scale stage, image and anno on the same layer because each layer has a canvas and Cropper can handle only one canvas at a time
        scale_stage_anno_layer.addName('anno_layer');
        this.scale_stage.add(scale_stage_anno_layer);
        var ratio_stage_anno_layer = new Konva.Layer(name = 'anno_layer');
        this.ratio_stage.add(ratio_stage_anno_layer);

        //
        var img_loaded = false ;
        var data_loaded = false ;
        var fetched_data = undefined ;

        // fetch image :
        this.img = new Image();
        this.img.src = url_for_image;
        // once the image is loaded :
        this.img.onload = function() {
            Flash.success('Image was retrieved from the server', 2000);
            this.ratio = ratio_stage.width()/this.img.naturalWidth;
            set_img_on_stages()
            img_loaded = true ;
            if(img_loaded && data_loaded){
                init(fetched_data) ;
            }
        };

        // fetch data :
        this.data = undefined;
        fetched_data = this.fetch_data(url_for_data).done(){
        // once the data fetch is done :
            data_loaded = true;
            if(img_loaded && data_loaded){
                init(fetched_data);
            }
        }


    }

    /*
    To run only once image AND data are loaded :
    */
    init(img_loaded,data_loaded){
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
                    console.log(fetched_data[i]);
                }
            }
        )
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
          image: this,
          width: imageObj.naturalWidth * this.ratio,
          height: imageObj.naturalHeight * this.ratio
        });
        //adjust stage height (the width is already fixed):
        this.ratio_stage.height(ratio_img.height());
        // add the shape to the img layer
        this.ratio_stage.findOne('.img_layer').add(ratio_img);

    }

    add_annotation(anno){
    }

    rm_annotation(){
    }
}


class AnnotationCore extends SessionCore {
    constructor(scale_stage_container_id, ratio_stage_container_id, url_for_img, url_for_data) {
        super(scale_stage_container_id, ratio_stage_container_id, url_for_img, url_for_data);
        this.cropper_container = $('#'+scale_stage_container_id+' .konvajs-content canvas');
        this.set_cropper();
    }


    init(){
        super();
        for(var i = 0; i < this.data.length; i++) {
            this.add_annotation(this.data[i]);
        }
        refreash_cropper();
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
        append_to_dom_anno_list(new_anno);

        // TODO : do not use the annotation code
        // the action button events are bind automatically,
        // but ensure the click-to-edit functionality is working
        // on newly appended list items even before a page refresh :

        // add the annotation as a rect on the anno layer of the anno stage
        anno_stage_anno_layer.add(new_anno.get_rect());
        // add the ratio annotation as a rect on the anno layer of the view stage
        view_stage_anno_layer.add( new_anno.get_ratio_rect());
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
    function append_to_dom_anno_list(anno){

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

    refreash_cropper(){
        new_content = this.cropper_container.toDataURL();
        this.cropper_container.cropper(
            'replace',
            new_content,
            true
        );

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
