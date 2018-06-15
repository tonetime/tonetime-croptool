# Tonetime-Croptool

* Web component for croping an image.
* No dependencies (Polyfill is needed for browsers w/o webcomponent support)
* Works on both mobile and web browsers.
* 5k gzipped.

# Installation

Add crop tool script and if necessary a polypill for older browsers.
<code>
&lt;script src=&quot;https://cdnjs.cloudflare.com/ajax/libs/webcomponentsjs/1.2.0/webcomponents-lite.js&quot;&gt;&lt;/script&gt; &lt;!-- polyfill for old browsers --&gt;  <br> &lt;script src=&quot;dist/tonetime-croptool.js&quot;&gt;&lt;/script&gt;
</code>

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
