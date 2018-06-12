Event.prototype.propagationPath = function propagationPath() {
    var polyfill = function () {
        var element = this.target || null;
        var pathArr = [element];
        if (!element || !element.parentElement) {
            return [];
        }
        while (element.parentElement) {
            element = element.parentElement;
            pathArr.unshift(element);
        }

        return pathArr;
    }.bind(this);
    return this.path || (this.composedPath && this.composedPath()) || polyfill();
};


class DragAndResizable {

    constructor(innerContainer,outerContainer,allowResize=true,callback) {
      this.innerContainer=innerContainer
      this.outerContainer=outerContainer
      this.allowResize=allowResize
      this.callback=callback
      this.state=null
      this.isMouseDown=false
      this.lastScale = 0
      this.lastTouchY=0,this.lastTouchX=0
      this.supportsTouch =(('ontouchstart' in window) || (navigator.msMaxTouchPoints > 0)) 
      
      if (this.supportsTouch) {
        this.touchStartEvent=function(e) { this.onTouchStart(e) }.bind(this)
        this.touchEndEvent=function(e) { this.onTouchEnd(e) }.bind(this)
        this.touchCancelEvent=function(e) { this.onTouchCancel(e) }.bind(this)
        this.touchMoveEvent=function(e) { this.onTouchMove(e) }.bind(this)
        this.outerContainer.addEventListener('touchstart',this.touchStartEvent);
        this.outerContainer.addEventListener('touchend',this.touchEndEvent);
        this.outerContainer.addEventListener('touchcancel',this.touchCancelEvent);
        this.outerContainer.addEventListener('touchmove',this.touchMoveEvent);
        this.pinch= new PinchDetect(this.outerContainer)
        this.pinch.callbacks.scale=this.onPinch.bind(this)
      }
      else {
        this.mousedownEvent= function(e) { this.onMouseDown(e) }.bind(this)
        this.mousemoveEvent= function(e) { this.onMouseMove(e) }.bind(this)
        this.mouseupEvent= function(e) { this.onMouseUp(e) }.bind(this)
        this.mouseleaveEvent= function(e) { this.onMouseLeave(e) }.bind(this)
        this.mousewheelEvent= function(e) { this.mouseWheelHandler(e) }.bind(this) 
        this.wheelEvent=function(e) { this.mouseWheelHandler(e) }.bind(this) 
        this.resizeEvent=function(e) { this.resize(e) }.bind(this)
        window.addEventListener('resize',this.resizeEvent)
        window.addEventListener('mouseup', this.mouseupEvent)
        window.addEventListener('mousemove',this.mousemoveEvent)
        document.body.addEventListener('mousedown', this.mousedownEvent)
        document.body.addEventListener('mouseup', this.mouseleaveEvent)
        this.innerContainer.addEventListener("mousewheel", this.mousewheelEvent, false);
        this.innerContainer.addEventListener("wheel", this.mousewheelEvent, false);
      }
    }  
    disconnectEvents() {
      window.removeEventListener('onresize',this.resizeEvent)
      window.removeEventListener('mousemove', this.mousemoveEvent)
      window.removeEventListener('mouseup', this.mouseupEvent)
      document.body.removeEventListener('mousedown', this.mousedownEvent)
      document.body.removeEventListener('mouseleave', this.mouseleaveEvent)
      this.innerContainer.removeEventListener("mousewheel", this.mousewheelEvent)
      this.innerContainer.removeEventListener("wheel", this.mousewheelEvent)
      this.outerContainer.removeEventListener('touchstart',this.touchStartEvent)
      this.outerContainer.removeEventListener('touchend',this.touchEndEvent)
      this.outerContainer.removeEventListener('touchcancel',this.touchCancelEvent)
      this.outerContainer.removeEventListener('touchmove',this.touchMoveEvent)

    }
    mouseWheelHandler(e) {
     var e = window.event || e
     e.preventDefault()
     this.state='mouseWheel'
     if (this.callback) this.callback(this.state,e)
     return false 
    }
    resize(e) {
      this.state='resizeWindow'
      if (this.callback) this.callback(this.state, e)
    }

    setXandYForTouch(e) {
      if (e.changedTouches.length > 1) {
        this.lastTouchY = this.lastTouchX = null
        return;
      }
      e.path = e.propagationPath();
      if (this.lastTouchY!=null) {
        e.movementX = e.changedTouches[0].clientX - this.lastTouchX 
        e.movementY = e.changedTouches[0].clientY -  this.lastTouchY 
       // console.log("X: " + e. movementX + ' and Y:' + e.movementY);
      }
      else {
        e.movementX=e.movementY=0
      }
      e.clientX=e.changedTouches[0].clientX
      e.clientY=e.changedTouches[0].clientY
      this.lastTouchY = e.changedTouches[0].clientY
      this.lastTouchX = e.changedTouches[0].clientX
    }

    onTouchMove(e) {
      e.preventDefault();
      if (e.changedTouches.length > 1 || e.touches.length > 1 || e.targetTouches.length > 1) {
        //console.log('two in move fingers..dont start');
        return;
      }
      this.setXandYForTouch(e)
      this.onMouseMove(e)
    }
    onTouchStart(e) {
      e.preventDefault();
      if (e.changedTouches.length > 1 || e.touches.length > 1 || e.targetTouches.length > 1) {
        //console.log('two fingers..dont start');
        return;
      }
      this.lastTouchY = this.lastTouchX = null
      this.setXandYForTouch(e)
      this.setCursor(e)
      this.onMouseDown(e)
    }
    onTouchEnd(e) {
      e.preventDefault();
      this.onMouseUp(e);
    }
    onTouchCancel(e) {
      this.onMouseUp(e);
    }
    onPinch(e) {
      this.isMouseDown=false
      this.state='pinchAndZoom'
      e.movement=e.scale
      if (this.callback) this.callback(this.state,e)
    }
    onMouseDown(e) {
      var path = e.path || (e.composedPath && e.composedPath());
      var checkContainer = this.supportsTouch ? this.outerContainer : this.innerContainer
      if (path.indexOf(checkContainer) > 0) {
        this.isMouseDown=true
        var event = new CustomEvent('mousePressedInContainer', { 'detail': e });
        this.innerContainer.dispatchEvent(event)
        this.state='mousePressedInContainer'
      }
      else {
        this.state='mousePressedOutsideContainer'
      }
      if (this.callback) this.callback(this.state,e)
    }   
    onMouseUp(e) {
      this.state=null
      this.isMouseDown=false
    }
    onMouseMove(e) {
      if (e.movementX==null || e.movementY==null) {
        return
      }
      this.state=null
      //console.log("Current Direction:" + this.currentDirection + ' allowresize:' + this.allowResize + ' isMouseDown:' + this.isMouseDown);
      if (this.allowResize==true && this.supportsTouch==false) this.setCursor(e)
      if (this.isMouseDown==false) return
      //console.log('So i get here? ' + this.currentDirection);
      if (this.currentDirection==null) { 
        this.state='panningInContainer'  
        if (this.callback) this.callback(this.state, e)
      }
      else if (this.currentDirection!=null && this.allowResize==true) {
        this.state='reszieContainer'
        if (this.callback) this.callback(this.state, e,{currentDirection:this.currentDirection})
      }
    }
    onMouseLeave(e) {
      this.state=null
      this.isMouseDown=false
    }
    setCursor(e) {      
      if (this.isMouseDown) return
      var rect = this.absoluteRect(this.innerContainer)
      var precision= this.supportsTouch ? 25 : 10
      var diff = [Math.abs(rect.bottom - e.clientY),Math.abs(rect.top - e.clientY),Math.abs(rect.left - e.clientX),Math.abs(rect.right - e.clientX)]
      if (diff[0] <precision && diff[2] <precision ) {
        this.currentDirection='SW'       
        this.innerContainer.style.cursor='nesw-resize'
      }
      else if (diff[0] <precision && diff[3] <precision) {
        this.currentDirection='SE'       
        this.innerContainer.style.cursor='nwse-resize'
      }
      else if (diff[1] <precision && diff[2] <precision) {
        this.currentDirection='NW'       
        this.innerContainer.style.cursor='nwse-resize'
      }
      else if (diff[1] <precision && diff[3] <precision) {
        this.currentDirection='NE'       
        this.innerContainer.style.cursor='nesw-resize'
      }
      else if (diff[1] <precision) {
        this.currentDirection='NS'        
        this.innerContainer.style.cursor='ns-resize'
      }
      else if (diff[0] < precision) {
        this.currentDirection='SN'        
        this.innerContainer.style.cursor='ns-resize'
      }
      else if (diff[3] <precision) {
        this.currentDirection='EW'        
        this.innerContainer.style.cursor='ew-resize'
        this.hdir=1
      } 
      else if (diff[2] <precision) {
        this.currentDirection='WE'        
        this.innerContainer.style.cursor='ew-resize'
        this.hdir=0
      } 
      else {
        this.resetCursor()
      } 
     // console.log('Setcursor: ' + this.currentDirection);
    }
    resetCursor() {
      this.currentDirection=null
      this.innerContainer.style.cursor='move'  
      // this.resizing=false 
    }
    absoluteRect(elem) {
      var rect = elem.getBoundingClientRect()
      return {top:rect.top, bottom:rect.bottom, right:rect.right,left:rect.left}
    }
}