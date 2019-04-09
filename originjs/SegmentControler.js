/**
 * Created by pekko1215 on 2017/08/15.
 */

function SegmentControler(canvas,length,x,y,size,offset){
    this.segments = [];
    for(var i=0;i<length;i++){
        this.segments[i] = new SevenSegment(canvas,x+offset*i,y,size);
    }
    this.reset();
}

SegmentControler.prototype.setSegments = function(str){
    str = "" + str
    var arr = str.split("");
    while(arr.length<this.segments.length){
        arr.unshift(" ");
    }
    var i = 0;
    this.reset();
    while(this.segments[i]!=undefined&&arr[i]!=undefined){
        this.segments[i].draw(this.segments[i].mapping(arr[i]));
        i++;
    }
}

SegmentControler.prototype.setOnColor = function(r,g,b){
    this.segments.forEach(function(v){
        v.setOnColor(r,g,b);
    })
}

SegmentControler.prototype.setOffColor = function(r,g,b){
    this.segments.forEach(function(v){
        v.setOffColor(r,g,b);
    })
}

SegmentControler.prototype.reset = function(){
    this.segments.forEach(function(v){
        v.draw(0);
    })
}

SegmentControler.prototype.randomSeg = function(){
        return this.segments.map((seg)=>{
            return (function*(){
                var index = 0;
                var chips = ["a","b","c","d","e","g","c","d","e","f","a","b","g","f"];
                while(true){
                    var obj = {};
                    obj[chips[index++]] = 1;
                    seg.draw(obj)
                    index==chips.length&&(index=0)
                    yield index;
                }
            })()
        })
}

SegmentControler.prototype.setOnce = function(i,v){
    this.segments[i].draw(this.segments[i].mapping(v))
}