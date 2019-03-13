# Tonetime-Croptool

* Web component for croping an image.
* No dependencies/No Frameworks (Polyfill is needed for browsers w/o webcomponent support)
* Works on both mobile and web browsers.
* 5k gzipped.
* [See examples here](https://tonetime.github.io/tonetime-croptool/)


# Installation

Add crop tool script and if necessary a polyfill for older browsers.
<br />


<code>
&lt;tonetime-croptool  src=&#039;images/cat.jpg&#039; &gt;&lt;/tonetime-croptool&gt;
</code>





# Attributes 
+ src: [image source]
+ range: [true | false]  Show a range slider to zoom in and out. Will never show on mobile devices
+ cropbox-width,cropbox-height: [pct] Cropbox provides a background with a rectangluar box to crop the image
+ cropbox-fixed: [true | false]  Do not allow the user to change the height/width of the cropbox.
+ starting-scale: Starting scale value. Default is minimum to fit in container..

# Function
+ drawCroppedImage(): returns the image data for the currently cropped image (in original size)
