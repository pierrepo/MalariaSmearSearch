"use strict";

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
        this.name = name ;
        this.annotation = annotation ;
        this.x = x ;
        this.y = y ;
        this.width = width ;
        this.height = height ;
        this.stroke_color = undefined ;
        this.stroke_width = undefined ;
        this.fill_color = undefined ;
        this.rect = undefined ;
        this.data = undefined ;
    }

}


class DatArray {
    constructor() {
    }

    shuffle() {
    }

    find(){
    }

    fetch(){
    }
}





class SessionCore {
    constructor() {
        this.view_stage = undefined ;
        this.image = undefined ;
        this.data = undefined ;
    }

    setup() {
    }

    add_annotation(){
    }

    rm_annotation(){
    }
}


class AnnotationCore extends SessionCore {
    constructor() {
        super();
        this.anno_stage = undefined ;
    }

    setup() {
        super.setup();
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
