//firefox is being a jerk ..  translate is slow when using CSS brightness filter. So do it manually.
CropComponents={}
CropComponents.brightnessFilter=function(img,pct) {
	var canvas = document.createElement('canvas');
	canvas.width = img.width
	canvas.height = img.height
	var ctx = canvas.getContext('2d');
	ctx.drawImage(img,0,0);
	var imgData =  ctx.getImageData(0,0,canvas.width,canvas.height);
	for (var i = 0; i < imgData.data.length; i += 4) {
	  imgData.data[i] = imgData.data[i] * pct
	  imgData.data[i+1] = imgData.data[i+1] * pct
	  imgData.data[i+2] = imgData.data[i+2] * pct
	}
	ctx.putImageData(imgData,0,0);
	var jpegUrl = canvas.toDataURL("image/jpeg");
	canvas=null
	return jpegUrl
}

