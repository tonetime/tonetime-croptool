function PinchDetect(element) {
	element.addEventListener('touchstart', this.touchStartHandler.bind(this));
	element.addEventListener('touchmove', this.touchMoveHandler.bind(this));
	element.addEventListener('touchend', this.touchEndHandler.bind(this));
	this.scaling=false
	this.lastDist=null
	this.scaleLine=[]
	this.element = element;
	this.callbacks = {
	  rotate: null,
	  scale: null
	};

}
PinchDetect.prototype.touchStartHandler = function(e) {
	if (e.touches.length === 2) {
		this.lastDist=null
		this.scaleLine=[]
	    this.scaling = true
	}
}
PinchDetect.prototype.touchMoveHandler = function(e) {
	if (this.scaling) {
		var dist = Math.hypot(
		    e.touches[0].pageX - e.touches[1].pageX,
		    e.touches[0].pageY - e.touches[1].pageY);

		if (this.lastDist==null) {
			this.lastDist=dist
		}
		else {
			var scale = dist - this.lastDist;
			scale = scale / this.element.offsetHeight
			scale = scale.toFixed(4);
			this.callbacks.scale({
			  scale: scale,
			  x: 0,
			  y: 0
			}); 	
			this.lastDist=dist
		}
	}
}
PinchDetect.prototype.touchEndHandler = function(e) {
	this.scaling=false;
	this.lastDist=null
	//console.log(this.scaleLine);
}
PinchDetect.prototype.onScale = function(callback) {
  this.callbacks.scale = callback;
};
