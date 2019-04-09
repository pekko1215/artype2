/**
 * Created by pekko1215 on 2017/07/16.
 */
var colordata = {
    DEFAULT_B:{
        color:0x888888,
        alpha:0.5
    },
    DEFAULT_F: {
        color:0xffffff,
        alpha:0.5
    },
    RED_B:{
        color:0xffAAAA,
        alpha:0.1
    },
    LINE_F:{
        color:0xcccccc,
        alpha:0.5
    },
    SYOTO_B:{
        color:0x444444,
        alpha:0.5
    },
    SYOTO_F:{
        color:0x666666,
        alpha:0.2
    },
    BLUE_F:{
        color:0xAAAAFF,
        alpha:0.2
    }
}

var flashdata = {
    default:{
        back:Array(3).fill(Array(3).fill(colordata.DEFAULT_B)),
        front:Array(3).fill(Array(3).fill(colordata.DEFAULT_F))
    },
    redtest:{
        back:Array(3).fill(Array(3).fill(colordata.RED_B)),
        front:Array(3).fill(Array(3).fill(colordata.RED_B))
    },
    syoto:{
        back:Array(3).fill(Array(3).fill(colordata.DEFAULT_B)),
        front:Array(3).fill(Array(3).fill(colordata.SYOTO_F))
    },
    blue:{
        back:Array(3).fill(Array(3).fill(colordata.BLUE_F)),
        front:Array(3).fill(Array(3).fill(colordata.BLUE_F))
    }
}