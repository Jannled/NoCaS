# NoCaS
A light weight JavaScript game engine powered by WebGL.

The name remains for historic reasons^^

## Usage
```java
var engine = new Engine(document.getElementById('yourHtmlCanvasElement'));
engine.loadModelFromUrl('models/GenericCube.jmf', [2, 0, -6], [0.5, 1, 0]);
engine.loadModelFromUrl('models/Sphere.jmf', [-2, 0, -6], [0.5, 1, 0], [0.1, 0.1, 0.1]);
```

## Model Conversion (.jmf)
The engine uses it's own model format to prevent including big librarys in the shipped code.

[The code for conversion from .obj is avaiable here](https://github.com/Jannled/NoCaS/tree/master/JannledModelFormat)
