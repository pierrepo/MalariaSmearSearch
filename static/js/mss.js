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
};



class Annotation {
    constructor(name, annotation, x, y, width, height) {
        this.name = name.toString(); //use id directly ??? TODO
        this.annotation = annotation ;
        this.x = x ;
        this.y = y ;
        this.width = width ;
        this.height = height ;
        this.stroke_color = 'black' ;
        this.stroke_width = 4 ;
        this.fill_color = undefined ;
        this.rect = undefined ;
        this.data = undefined ;
    }
}


class DatArray {
    constructor() {
        this.data = undefined ;
    }

    shuffle() {
    }

    find(){
    }

    fetch(){

        return $.getJSON(url_for_data,

            function(received_data){
                console.log(received_data);
                Flash.success('Annotations were retrieved from the server', 2000);

                for(var i = 0; i < received_data.length; i++) {
                    var obj = new Annotation();



                    received_data[i];
                    obj.stroke = 'black';
                    obj.strokeWidth = 4;
                    obj.name = obj.id.toString(); // TODO : Change the code to use id directly.
                    console.log(obj);
                }
            }
        );
    }
}




class SessionCore {
    constructor() {

        // create scale stage ...
        this.scale_stage = new Konva.Stage({
            container: scale_stage_container_id,  // id of container <div>
            width: $('#'+scale_stage_container_id).width()
        })
        // ... and its layers :
        // - one for the image (in the bottom):
        var scale_stage_img_layer = new Konva.Layer(name = 'img_layer');
        this.scale_stage.add(scale_stage_img_layer);
        scale_stage_img_layer.moveToBottom();
        // - the other for the annotations :
        var scale_stage_anno_layer = new Konva.Layer(name = 'anno_layer');
        this.scale_stage.add(scale_stage_anno_layer);

        //

        // fetch image :
        this.image = new Image();
        this.image.src = url_for_image;
        // once the image is loaded :
        this.image.onload = function() {
            Flash.success('Image was retrieved from the server', 2000);
            set_stage_img()
            var image_loaded = true ;
            init_anno() ;
        };

        this.data = new DatArray() ;
        this.data.fetch()
            .done(){
                var data_loaded = true;
                init_anno();
            }
    }

    set_stage_img(){
        var scale_stage_image = new Konva.Image({
          x: 0,
          y: 0,
          image: this,
          width: this.img.naturalWidth,
          height: this.img.naturalHeight,
        });
        this.scale_stage.height(scale_stage_image.height() );
        this.scale_stage.add(scale_stage_image);

    }

    add_annotation(){
    }

    rm_annotation(){
    }
}


class AnnotationCore extends SessionCore {
    constructor() {
        super()



    }

    setup() {

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
