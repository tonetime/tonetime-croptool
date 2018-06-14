class TonetimeCroptool extends HTMLElement {
  constructor() {
    super();
  }
  initAfterDOM() {
    this.img=null,this.backgroundImage=null,this.container=null
    this.currentScale=1.0,this.maxScale=2.0
    this.currentTx=0,this.currentTy=0
    this.supportsTouch =(('ontouchstart' in window) || (navigator.msMaxTouchPoints > 0))
    this.zoomSlider=null;
    this.defaultZoomSliderSupport=false
    this.cropboxHeight=0,this.cropboxWidth=0
    this.useBgImage=false
    this.startingScale = parseFloat(this.getAttribute('starting-scale'))
    this.maxScale = parseFloat(this.getAttribute('maxscale')) || 5.0
    this.isFirefox = navigator.userAgent.toLowerCase().indexOf('firefox') > -1;
    this.isLoaded=false
  }
  clear() {    
    if (this.dragAndResize) this.dragAndResize.disconnectEvents()
    this.dragAndResize=null   
    if (this.shadowRoot)
        this.shadowRoot.getElementById('crop-component-img').src=''
  }
  onResize() {
    this.cropboxHeight=0,this.cropboxWidth=0
    this.setTransformationOrigin()  
    this.positionImage()
    this.updateScale(this.currentScale)
    this.setupCropBox()
    this.setBackgroundImage()
    this.coverFitImage()
    this.updateTransform()
    this.zoomSlider.parentElement.style.display='none'
  }
  get template() {
    return `
          <div id ='crop-component-container' style='overflow:hidden;cursor: move; z-index:10; position:relative; ' >
            <img  id ='crop-component-img' src='${this.src}'  ondragstart="return false" style='z-index:1;position:relative; transform:scale(1) translate(0px, 0px);'>
          </div>
            <div  ondragstart="return false"  style='z-index:0; position:absolute; overflow:hidden;display:none '>
                <img src='' id='crop-component-bg-image'  style='transform:scale(1) translate(0px, 0px);'>
            </div>
            <canvas id="crop-component-canvas" style='display:none'></canvas>
            <div id='tcrop-div'  style='display:none;background-color: lightgray; margin-top:5px; opacity:0.8; z-index:100; text-align:center; position: absolute;  border-radius: 2px;'>
                <input id = 'crop-component-range' type="range" min=1 max=4  step=0.1  value="1" style='margin-top:5px;width:75%' />
            </div>
          `
  }
  connectedCallback() {  	
    let shadowRoot = this.attachShadow({mode: 'open'});
    shadowRoot.innerHTML = this.template;  
    this.insertImage(this.src)
  }
  insertImage(src,resize) {    
    this.style.display='inline-block'    
    this.setAttribute('src',src)
    this.clear()
    this.shadowRoot.getElementById('crop-component-img').onload=function() {  
      var a = getComputedStyle(this)
      var container = this.shadowRoot.getElementById('crop-component-container')
      container.style.width = a.width
      container.style.height = a.height
      this.initAfterDOM()
      this.shadowDOMRenderedCallback()
      this.imageLoadedCallback()
      this.isLoaded=true
    }.bind(this)
    this.shadowRoot.getElementById('crop-component-img').src=this.src
  }
  attributeChangedCallback(name, oldValue, newValue) {
    if (this.isLoaded) {
      this.isLoaded=false
      if (name=='src') {
        this.insertImage(newValue,true)

      }
    }
  }
  static get observedAttributes() {
    return ['src', 'range'];
  }
  setZoomSlider() {
  	var r = this.getAttribute('range') 
  	if (r && r.toLowerCase()==='true' && (!this.supportsTouch)) {  		
  		this.displayDefaultSlider()
  		this.defaultZoomSliderSupport=true
  	}
  	else if (r!=null) {
  		this.zoomSlider = document.getElementById(r)  		
  	}
  }
  setBackgroundImage() { 
    if (!this.useBgImage) 
      return
    this.backgroundImage=this.shadowRoot.getElementById('crop-component-bg-image')
   // if (this.isFirefox) {
      var adjustedImg = CropComponents.brightnessFilter(this.shadowRoot.getElementById('crop-component-img'),0.5)
      this.backgroundImage.src=adjustedImg
   // }
   // else {        
    //  this.backgroundImage.style.filter='brightness(50%)'
     // this.backgroundImage.src=this.src
    //}
		this.backgroundImage.parentElement.style.top=this.offsetTop +'px'
		this.backgroundImage.parentElement.style.height= this.offsetHeight +'px'
		this.backgroundImage.parentElement.style.width= this.offsetWidth +'px'
		this.backgroundImage.parentElement.style.display='inline'
  	
  }
  positionBelowImage(element) {
  	element.style.display='inline'
  	var top = this.offsetHeight+this.offsetTop
  	//var w = this.offsetWidth *0.6
  	//var left = ((this.offsetLeft + this.offsetWidth) / 2) - (w/2)
  	var w = this.offsetWidth
  	var left = this.offsetLeft
  	element.style.top=top+'px'
  	element.style.width=w+'px'
  	element.style.left=left+'px'  
  }
  setupCropBox() {
  	var ch = this.getAttribute('cropbox-height')
  	var cw = this.getAttribute('cropbox-width')
  	if (ch == null && cw ==null) return
    this.useBgImage=true
    if (ch.indexOf('%') > 0)  ch = this.offsetHeight * (parseFloat(ch)/100) 
    if (cw.indexOf('%') > 0)  cw = this.offsetWidth * (parseFloat(cw)/100) 

  	if (ch==null) ch=cw
  	if (cw==null) cw=ch
  	this.container.style.height=ch +'px'
  	this.container.style.width=cw+'px'
  	this.container.style.outline='1px solid white'
  	this.cropboxHeight=(this.offsetHeight/2) - (parseFloat(ch) / 2)
  	this.cropboxWidth=(this.offsetWidth/2) - (parseFloat(cw) / 2)
  	this.container.style.top = this.cropboxHeight + 'px'
  	this.container.style.left = this.cropboxWidth + 'px'
  }
  //calling on the loading of the image, ensuring sdom insertion.  hacky, maybe mutation observer?
  shadowDOMRenderedCallback() {  
    this.container = this.shadowRoot.getElementById('crop-component-container')    
    if (!this.dragAndResize)
      this.dragAndResize=new DragAndResizable(this.container,this,true,this.moves.bind(this))
    this.img = this.shadowRoot.getElementById('crop-component-img')
    this.setupCropBox()
    this.setBackgroundImage()
    this.setZoomSlider()
    if (this.zoomSlider && (!this.supportsTouch)) this.setupSlider()
  }
  moves(state,e,data) {

    if (state=='resizeWindow') {
      this.onResize();
      return;
    }
    if (state=='mousePressedInContainer') {
     if (this.defaultZoomSliderSupport) {
      this.positionBelowImage(this.zoomSlider.parentElement)
     }
    }
    else if (state=='panningInContainer') {
      var top = this.currentTy + (e.movementY * (1/this.currentScale))
      var left = this.currentTx + (e.movementX * (1/this.currentScale))      
      this.currentTx = left
      this.currentTy = top
      this.coverFitImage()
      this.updateTransform()
    }
    else if (state=='pinchAndZoom') {
      var adjscale = this.currentScale + (e.movement* (this.minimumScale() * 4));
      this.updateScale(adjscale)
    }
    else if (state=='mousePressedOutsideContainer') {
      if (e.target != this && this.zoomSlider)
        this.zoomSlider.parentElement.style.display='none'
    }
    else if (state=='reszieContainer') {
      if (this.cropboxFixed==true) return
      var outerContainer=this.absoluteRect(this)
      var innerContainer=this.absoluteRect(this.container)
      var bgImage = this.shadowRoot.getElementById('crop-component-bg-image')
      var bounds=this.bounds()

      if (data.currentDirection=='EW' || data.currentDirection=='NE' || data.currentDirection=='SE') {
       var movement=e.movementX
       if (movement < 0 &&  e.srcElement != this) {
          movement=0
       }

        var newWidth = parseFloat(this.container.style.width) + movement        
        var newBounds = this.boundsR(innerContainer.bottom,innerContainer.top, (this.container.offsetLeft + newWidth),innerContainer.left)       
        if ( (innerContainer.left + newWidth) < outerContainer.right && newWidth > 5  && this.currentTx >= bounds.right ) {
            var z = (movement / 2)
            var newTx = this.currentTx +  (  z - (z *  (1/this.currentScale)))
            if (newBounds.right <= newTx) {
              this.container.style.width=newWidth+'px'
              this.currentTx=newTx   
            }
        }
      }
      if (data.currentDirection=='WE' || data.currentDirection=='NW' || data.currentDirection=='SW') {
        var movement=e.movementX        
        if (movement > 0 && e.srcElement != this) {

          movement=0          
        }
        var newWidth = parseFloat(this.container.style.width) - movement  
        var newLeft = parseFloat(this.container.style.left) + movement
        var newBounds =  this.boundsR(innerContainer.bottom,innerContainer.top, (newLeft + newWidth),newLeft)                 
        if (newLeft > 0 && newWidth > 5  && this.currentTx <= bounds.left) {
          var z = (movement / 2)
          var newTx = this.currentTx -  (  z + (z *  (1/this.currentScale)))          
          if (newTx <= newBounds.left) {
            this.currentTx=newTx
            this.container.style.width=newWidth+'px'
            this.container.style.left=newLeft+'px'
            this.cropboxWidth=newLeft
          }
        }        
      }
      if (data.currentDirection=='NS' || data.currentDirection=='NW' || data.currentDirection=='NE') {
        var movement=e.movementY
        if (movement > 0 && e.srcElement != this) {
          movement=0
        }
        var newHeight = parseFloat(this.container.style.height) - movement
        var newTop = parseFloat(this.container.style.top) + movement
        var newBounds = this.boundsR( (this.container.offsetTop + newHeight), (outerContainer.top + newTop), innerContainer.right,innerContainer.left)         
        if (newTop >= 0 &&  newHeight > 20  && this.currentTy <= bounds.top){
          var z = (movement / 2)
          var newTy= this.currentTy -  (  z + (z *  (1/this.currentScale)))
          if (newTy <=bounds.top) {
            this.currentTy = newTy
            this.container.style.height=newHeight+'px'
            this.container.style.top=newTop+'px'
            this.cropboxHeight=newTop
          }
        }
      }
      if (data.currentDirection=='SN'  || data.currentDirection=='SE'   || data.currentDirection=='SW'  ) {       
        var movement = e.movementY
        if (movement < 0 && e.srcElement != this) {
          movement=0
        }
        var newHeight = parseFloat(this.container.style.height) + movement
        var newBounds = this.boundsR( (this.container.offsetTop + newHeight),innerContainer.top, innerContainer.right,innerContainer.left)         
        if (newHeight > 30 &&  (innerContainer.top + newHeight) <  outerContainer.bottom && this.currentTy >= bounds.bottom) {
          var z = (movement / 2)
          var newTy = this.currentTy +  (  z - (z *  (1/this.currentScale)))
          if (newTy >=newBounds.bottom) {
            this.currentTy=newTy
            this.container.style.height=newHeight+'px'
          }
        }
      }
      this.setTransformationOrigin()
      this.updateTransform()
    }
    else if (state=='mouseWheel') {
      var direction = (e.detail<0 || e.wheelDelta>0 || e.deltaY<0) ? 1 : -1
      var scale = this.currentScale + (direction/5)
      this.updateScale(scale)
    }
  }
  displayDefaultSlider() {
  	this.zoomSlider = this.shadowRoot.getElementById('crop-component-range')
  	this.setupSlider()
  }
  setupSlider() {
  	this.zoomSlider.min= parseFloat(this.minimumScale()).toFixed(2)
  	this.zoomSlider.max = this.maxScale
  	this.zoomSlider.step = 0.1
  	this.zoomSlider.value = this.currentScale
  	this.zoomSlider.oninput=function(e) {
	   	var scale=parseFloat(this.zoomSlider.value)
    	this.updateScale(scale)
    }.bind(this)	
  }
  imageLoadedCallback() {    
	// this.currentScale=this.minimumScale()
    if (this.startingScale)  {
      this.currentScale=this.startingScale
    }
    else {
      this.currentScale=this.minimumScale()
    }
    this.setTransformationOrigin()  
    this.positionImage()
    this.updateScale(this.currentScale)
  }
  disconnectedCallback() {
    if (this.dragAndResize) this.dragAndResize.disconnectEvents()
  }
  coverFitImage() {
  	var bounds = this.bounds()
  	if (this.currentTy > bounds.top) {
  		this.currentTy=bounds.top
	}
    else if (bounds.bottom > this.currentTy) {
    	this.currentTy=bounds.bottom
    }
    if (bounds.left < this.currentTx) {
    	this.currentTx=bounds.left
    }
    else if (bounds.right > this.currentTx) {
    	this.currentTx=bounds.right
    }


  }
  minimumScale() {
  	var scaleY = this.offsetHeight / this.img.offsetHeight
  	var scaleX = this.offsetWidth / this.img.offsetWidth
  	var minScale = scaleY > scaleX ? scaleY : scaleX
  	return minScale
  }
  positionImage(xPct=0.5,yPct=0.5) {
  	var c1 = this.absoluteRect(this.container)
  	var i1 = this.absoluteRect(this.img)
    c1.point = [(c1.right - c1.left) * xPct, (c1.bottom - c1.top) * yPct]
    i1.point =  [(i1.right - i1.left) * xPct, (i1.bottom - i1.top) * yPct]
    var tx = c1.point[0] - i1.point[0]
    var ty = c1.point[1] - i1.point[1]
    this.currentTx=tx
    this.currentTy=ty
	  this.updateTransform()  
  }
  updateScale(scale) {
    //console.log('currentscale:' + this.currentScale + ' min:' + this.minimumScale() + ' range:' + this.zoomSlider + ' max:' + this.maxScale);
  	this.currentScale=scale
   	if (this.currentScale <= 0) this.currentScale=1   
    //console.log('go  here?' + this.currentScale);

    if (this.currentScale > this.maxScale) this.currentScale=this.maxScale
    this.currentScale = this.currentScale < this.minimumScale() ? this.minimumScale() : this.currentScale
	  if (this.zoomSlider) this.zoomSlider.value = this.currentScale
    this.coverFitImage()
    this.updateTransform()
  }
  loop() {
    this.updateTransform()
    window.requestAnimationFrame(this.loop.bind(this))
  }
  updateTransform() {
  	this.img.style.transform=`scale(${this.currentScale}) translate(${this.currentTx}px, ${this.currentTy}px)`;
  	if (this.backgroundImage) {
  		var adjustedTx=this.cropboxWidth + this.currentTx
  		var adjustedTy=this.cropboxHeight + this.currentTy
  		this.backgroundImage.style.transform=`scale(${this.currentScale}) translate(${adjustedTx}px, ${adjustedTy}px)`;
  	}
  }
  setTransformationOrigin(xPct=0.5,yPct=0.5) {
  	var containerRect = this.absoluteRect(this.container)
    var outsideContainer = this.absoluteRect(this)
   	var transY = (containerRect.bottom - containerRect.top) * xPct
   	var transX = (containerRect.right - containerRect.left) * yPct
  	this.img.style.transformOrigin=`${transX}px ${transY}px`
  	if (this.backgroundImage) {
      var bTransX = (containerRect.left + ( (containerRect.right - containerRect.left) * xPct)) - outsideContainer.left 
      var bTransY = (containerRect.top + ( (containerRect.bottom - containerRect.top) * yPct)) - outsideContainer.top 
      if (this.backgroundImage) this.backgroundImage.style.transformOrigin=`${bTransX}px ${bTransY}px`
  	}
  }
  absoluteRect(elem) {
    var rect = elem.getBoundingClientRect()
//    return {top:rect.top, bottom:rect.bottom, right:rect.right,left:rect.left}
  	return {top:elem.offsetTop, bottom: elem.offsetHeight + elem.offsetTop, right:elem.offsetLeft+elem.offsetWidth,left:elem.offsetLeft}
  }
  bounds() {
    var containerRect = this.absoluteRect(this.container)
    return this.boundsR(containerRect.bottom,containerRect.top,containerRect.right,containerRect.left)
  }
  boundsR(bottom,top,right,left) {
    var containerPointY = (bottom - top) / 2
    var containerPointX = (right - left) / 2
    var out ={}
    out.top = - ((containerPointY -(containerPointY * this.currentScale))  * (1/this.currentScale))
    out.left =  - ((containerPointX -(containerPointX * this.currentScale))  * (1/this.currentScale))
    out.bottom =  ((( - ((this.img.offsetHeight * this.currentScale) - (containerPointY*2)) ) + (out.top*this.currentScale)) * (1/this.currentScale))
    out.right =  ((( - ((this.img.offsetWidth * this.currentScale) - (containerPointX*2)) ) + (out.left*this.currentScale)) * (1/this.currentScale))
    return out   
  }


  croppedDimensions() {    
  	var rect = { dx: parseFloat(Math.abs(this.currentTx - Math.round(this.bounds().left))).toFixed(2),
  			dy: parseFloat(Math.abs((this.currentTy - Math.round(this.bounds().top)))).toFixed(2), 
  			dWidth: parseFloat(this.container.offsetWidth  * (1/this.currentScale)).toFixed(2), 
  			dHeight:parseFloat(this.container.offsetHeight * (1/this.currentScale)).toFixed(2)}
	 return rect
  }
  drawCroppedImage() {
  	var r = this.croppedDimensions()   
    var canvas =  this.shadowRoot.getElementById('crop-component-canvas')
   	//canvas.width = this.container.offsetWidth
  	//canvas.height=this.container.offsetHeight
    canvas.width=r.dWidth
    canvas.height=r.dHeight
  	var context = canvas.getContext('2d');
  	context.drawImage(this.img, r.dx,r.dy,r.dWidth,r.dHeight,0, 0,canvas.width,canvas.height);
  	var jpegUrl = canvas.toDataURL("image/jpeg");
  	return jpegUrl
  }
  get src() {
  	return this.getAttribute('src') 
  }
  get cropboxFixed() {
    var a = this.getAttribute('cropbox-fixed')
    return a && a.toLowerCase()!='false'

  }
}
window.customElements.define('tonetime-croptool', TonetimeCroptool);
