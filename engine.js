
/*canvas.requestPointerLock = canvas.requestPointerLock ||
			     canvas.mozRequestPointerLock ||
			     canvas.webkitRequestPointerLock;

// Ask the browser to release the pointer
document.exitPointerLock = document.exitPointerLock ||
			   document.mozExitPointerLock ||
			   document.webkitExitPointerLock;
*/
/** Vertex shader */
const vsSource = `
	#version 300 es
	layout(location = 0) in vec4 aVertexPosition;
	layout(location = 1) in vec3 aVertexNormal;
	layout(location = 2) in vec2 aTextureCoord;

	uniform mat4 uNormalMatrix;
	uniform mat4 uModelMatrix;
	uniform mat4 uProjectionMatrix;

	out vec3 FragPos;
	out vec3 Normal;
	out vec2 textureCoord;

	void main(void)
	{
		FragPos = vec3(uModelMatrix * aVertexPosition);
		Normal = normalize(mat3(uNormalMatrix) * aVertexNormal);

		gl_Position = uProjectionMatrix * uModelMatrix * aVertexPosition;
		textureCoord = aTextureCoord;

	}`;

/** Fragment shader */
const fsSource = `
	#version 300 es
	precision mediump float;

	in vec3 FragPos;
	in vec3 Normal;
	in vec2 textureCoord;

	out vec4 FragColor;

	uniform sampler2D uSampler;

	uniform vec3 ambientLight;
	uniform vec3 lightPos;
	uniform vec3 lightColor;
	uniform vec3 viewPos;

	void main(void)
	{
		vec4 texelColor = texture(uSampler, textureCoord);

		// diffuse
		vec3 lightDir = normalize(lightPos - FragPos);
		float diff = max(dot(Normal, lightDir), 0.0f);
		vec3 diffuse = diff * lightColor;

		// specular
		float specularStrength = 0.5f;
		vec3 viewDir = normalize(viewPos - FragPos);
		vec3 reflectDir = reflect(-lightDir, Normal);
		float spec = pow(max(dot(viewDir, reflectDir), 0.0f), 32.0f);
		vec3 specular = specularStrength * spec * lightColor;

		FragColor = vec4(texelColor.rgb * (ambientLight + diffuse + specular), 1.0f);
	}`;

var gl;
var engine; /* Bad approach */

class Engine
{
	/**
	 * @param{HTMLElement} canvasElement The HTML Element of the canvas
	 */
	constructor(canvasContainerElement, displayRatio)
	{
		var currentTime = 0.0;
		engine = this;

		this.canvas = document.createElement('canvas');
		this.canvasContainer = canvasContainerElement;

		if(typeof displayRatio !== 'number') this.displayRatio = 16 / 9; else this.displayRatio = displayRatio;

		this.init(this.canvas, this.canvasContainer);
	}

	init(canvas, canvasContainer)
	{
		this.activeScene = new Scene();

		var js = document.getElementById("js");
		var wgl = document.getElementById("wgl");

		//JavaScript is running
		if(js != null) js.style.color = "#00FF00";

		if(canvas != null) gl = canvas.getContext('webgl2');
		else
		{
			console.error("Canvas tag not found, is the ID glcanvas?");
			return;
		}

		// If we don't have a GL context, give up now
		if (!gl) {
			console.error('Unable to initialize WebGL. Your browser or machine may not support it.');
			return;
		}

		//WebGL is running
		if(wgl != null) wgl.style.color = "#00FF00";

		//Add canvas to document
		if(canvasContainer instanceof HTMLElement)
		{
			while (canvasContainer.lastChild)
    			canvasContainer.removeChild(canvasContainer.lastChild);

			this.canvasContainer.appendChild(this.canvas);
		}  else
		{
			console.error("Failed to initialize engine. Please pass an HTML Element as first parameter!");
		}

		engine.newSize();
		if(location.hash === "#fullscreen") goFullscreen(canvas);

		//Print out OpenGL Version
		console.log(gl.getParameter(gl.SHADING_LANGUAGE_VERSION));
		console.log(gl.getParameter(gl.VERSION));

		// Initialize a shader program; this is where all the lighting
		// for the vertices and so forth is established.
		const shaderProgram = new ShaderProgram(new Shader(vsSource, gl.VERTEX_SHADER), new Shader(fsSource, gl.FRAGMENT_SHADER));

		// Collect all the info needed to use the shader program.
		// Look up which attributes our shader program is using
		// for aVertexPosition, aVertexNormal, aTextureCoord,
		// and look up uniform locations.
		const programInfo = {
			program: shaderProgram,
			attribLocations: {
				vertexPosition: shaderProgram.getAttribLocation('aVertexPosition'),
				vertexNormal: shaderProgram.getAttribLocation('aVertexNormal'),
				textureCoord: shaderProgram.getAttribLocation('aTextureCoord'),
			},
			uniformLocations: {
				projectionMatrix: shaderProgram.getUniformLocation('uProjectionMatrix'),
				modelMatrix: shaderProgram.getUniformLocation('uModelMatrix'),
				normalMatrix: shaderProgram.getUniformLocation('uNormalMatrix'),
				uSampler: shaderProgram.getUniformLocation('uSampler'),
				ambientLight: shaderProgram.getUniformLocation('ambientLight')
			},
		};

		var then = 0;
		const logicTicks = 0.05;
		var timeSinceUpdate = logicTicks;
		var fpsElement = document.getElementById("FPS");

		//Update canvas size
		window.scrollBy(0,1); //Safari fix
		window.addEventListener('resize', engine.newSize);

		/** Called by requestAnimationFrame */ //setTimeout()
		function renderLoop(timestamp)
		{
			timestamp *= 0.001;	// convert to seconds
			const deltaTime = timestamp - then;
			then = timestamp;

			timeSinceUpdate = timeSinceUpdate + deltaTime;

			while(timeSinceUpdate > logicTicks)
			{
				timeSinceUpdate = timeSinceUpdate - logicTicks;
				engine.activeScene.update(deltaTime);

				if(fpsElement instanceof HTMLElement) fpsElement.innerHTML = Math.round(1/(deltaTime));
			}

			engine.activeScene.render(programInfo, deltaTime);
			requestAnimationFrame(renderLoop);
		}
		requestAnimationFrame(renderLoop);
	}

	/**
	 *  Uploads the model to the GPU
	 */ //positions, normals, texCoords, indices, textureUrl, position, rotation, scale
	 loadModel(model)
	 {
	 	//Build the Vertices buffer (Attrib 0)
	 	const positionBuffer = gl.createBuffer();
	 	gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
	 	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(model.vertices), gl.STATIC_DRAW);

	 	//Build the Normals buffer (Attrib 1)
	 	const normalBuffer = gl.createBuffer();
	 	gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
	 	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(model.normals), gl.STATIC_DRAW);

	 	//Build the texture coords buffer (Attrib 2)
	 	const textureCoordBuffer = gl.createBuffer();
	 	gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordBuffer);
	 	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(model.uvs), gl.STATIC_DRAW);

	 	// Build the element array buffer (Attrib 3)
	 	const indexBuffer = gl.createBuffer();
	 	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
	 	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(model.indices), gl.STATIC_DRAW);

		// Load the Texture data
	 	const textureBuffer = gl.createTexture();
	 	gl.bindTexture(gl.TEXTURE_2D, textureBuffer);

	 	const level = 0;
	 	const internalFormat = gl.RGBA;
	 	const width = 1;
	 	const height = 1;
	 	const border = 0;
	 	const srcFormat = gl.RGBA;
	 	const srcType = gl.UNSIGNED_BYTE;
	 	const pixel = new Uint8Array([255, 0, 255, 255]); //Color of unloaded texture
	 	gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
	 								width, height, border, srcFormat, srcType,
	 								pixel);

	 	const image = new Image();
	 	image.onload = function() {
	 		gl.bindTexture(gl.TEXTURE_2D, textureBuffer);
	 		gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
	 									srcFormat, srcType, image);

	 		if (isPowerOf2(image.width) && isPowerOf2(image.height)) {
	 			 gl.generateMipmap(gl.TEXTURE_2D);
	 		} else {
	 			 // wrapping to clamp to edge
	 			 gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	 			 gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
	 			 gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	 		}
	 	};
	 	image.src = model.textureUrl;

	 	model.ogldata.positionBuffer = positionBuffer;
	 	model.ogldata.normalBuffer = normalBuffer;
	 	model.ogldata.textureCoordBuffer = textureCoordBuffer;
	 	model.ogldata.indexBuffer = indexBuffer;
		model.ogldata.textureBuffer = textureBuffer;

		return model; //For convenience
	 }


	/**
	 * Uses XHR to download a model file which will then be parsed and loaded into the scene
	 * @param fileUrl Path of the jmf file to be downloaded
	*/
	loadModelFromUrl(fileUrl, imageUrl, position, rotation, scale)
	{
		var activeScene = engine.activeScene;

		requestFile(fileUrl, function(data, status)
		{
			console.log('Request: "' + fileUrl + '" [' + status + "].")
			var mesh = convertFromJMF(data);
			var model = new Model(mesh.name, mesh.vertices, mesh.normals, mesh.uvs, mesh.indices, imageUrl, position, rotation, scale);
			engine.activeScene.loadModelToScene(model);
		});
	}

	/** Handle window y */
	newSize()
	{
		var twidth = engine.canvas.parentElement.offsetWidth;
		var theight = Math.round(twidth / engine.displayRatio);

		console.log("Canvas resized to " + twidth + "x" + theight);
		engine.canvas.width = twidth;
		engine.canvas.height = theight;
		gl.viewport(0, 0, engine.canvas.width, engine.canvas.height);
	}

	lockMouse()
	{
		canvas.requestPointerLock();
	}
}

/**
 * @param shaderSource Source Code
 * @param shaderType VERTEX_SHADER oder FRAGMENT_SHADER
 */
class Shader
{
	constructor(shaderSource, shaderType)
	{
		if(shaderType !== gl.VERTEX_SHADER && shaderType !== gl.FRAGMENT_SHADER)
			console.error("Invalid Shader type passed!");
		const shaderID = gl.createShader(shaderType);
		gl.shaderSource(shaderID, shaderSource.trim());
		gl.compileShader(shaderID);

		if (!gl.getShaderParameter(shaderID, gl.COMPILE_STATUS)) {
			console.error('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shaderID));
			gl.deleteShader(shaderID);
		}

		this.shaderID = shaderID;
	}
}

/**
 * @param{} vertexShader The Vertex Shader
 * @param{} fragmentShader The FragmentShader
 */
class ShaderProgram
{
	constructor(vertexShader, fragmentShader)
	{
		if(vertexShader instanceof Shader && fragmentShader instanceof Shader)
		{
			this.vertexShader = vertexShader;
			this.fragmentShader = fragmentShader;

			// Create the shader program
			const shaderProgramID = gl.createProgram();
			gl.attachShader(shaderProgramID, vertexShader.shaderID);
			gl.attachShader(shaderProgramID, fragmentShader.shaderID);
			gl.linkProgram(shaderProgramID);

			// If creating the shader program failed, alert
			if (!gl.getProgramParameter(shaderProgramID, gl.LINK_STATUS)) {
				console.error('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgramID));
			}
			this.shaderProgramID = shaderProgramID;

			console.log("Sucessfully created ShaderProgram.");
		}
		else console.error("Could not create ShaderProgram, at least one of the Shaders is invalid!");
	}

/**
 * Get attribute by name from ShaderProgram
 * @param gl The OpenGL Instance
 * @param name The name of the attribute
 */
	getAttribLocation(name)
	{
		return gl.getAttribLocation(this.shaderProgramID, name);
	}

	/**
	 * Get uniform by name from ShaderProgram
	 * @param gl The OpenGL Instance
	 * @param name The name of the uniform
	 */
	getUniformLocation(name)
	{
		return gl.getUniformLocation(this.shaderProgramID, name);
	}

	/**
	 * @param identifier Either the name or an ID
	 * @param vector3 The vector to set
	 */
	setVec3(identifier, vector3)
	{
		if(identifier instanceof String || typeof identifier === 'string')
			gl.uniform3fv(this.getUniformLocation(identifier), vector3);
		else if(identifier instanceof WebGLUniformLocation)
			gl.uniform3fv(identifier, vector3);
		else console.error("setVec3: Identifier is not of type String or WebGLUniformLocation!");
	}

	setMat4(identifier, matrix4, transpose)
	{
		if(typeof transpose !== 'boolean') console.error("setMat4: tanspose is not a boolean!")
		if(identifier instanceof String || typeof identifier === 'string')
			gl.uniformMatrix4fv(this.getUniformLocation(identifier), transpose, matrix4);
		else if(identifier instanceof WebGLUniformLocation)
			gl.uniformMatrix4fv(identifier, transpose, matrix4);
		else console.error("setMat4: Identifier is not of type String or WebGLUniformLocation!")
	}
}

/**
 *
 */
class Scene
{
	//Sky Color:  0.529, 0.807, 0.921
	//Logo Color: 0.149, 0.847, 0.886
	constructor()
	{
		this.models = [];
		this.ambientLight = Float32Array.from([0.0, 0.0, 0.0]);
		this.cameraPosition = new Float32Array(3);
	}

	/** Update the physics and gamelogic */
	update(deltaTime)
	{
		for(var i=0; i<this.models.length; i++)
		{
			this.models[i].update();
		}
	}

	render(programInfo, deltaTime)
	{
		gl.clearColor(this.ambientLight[0], this.ambientLight[1], this.ambientLight[2], 1.0);	// Clear to white, fully opaque
		gl.clearDepth(1.0);								 // Clear everything
		gl.enable(gl.DEPTH_TEST);					 // Enable depth testing
		gl.depthFunc(gl.LEQUAL);						// Near things obscure far things

		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

		const fieldOfView = 45 * Math.PI / 180;	 // in radians
		const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
		const zNear = 0.1;
		const zFar = 100.0;
		const projectionMatrix = mat4.create();

		// note: glmatrix.js always has the first argument as the destination to receive the result.
		mat4.perspective(projectionMatrix, fieldOfView, aspect, zNear, zFar);

		// Tell WebGL to use our program when drawing
		gl.useProgram(programInfo.program.shaderProgramID);

		programInfo.program.setVec3("ambientLight", this.ambientLight);
		programInfo.program.setVec3("lightPos", [5, 5, 10]);
		programInfo.program.setVec3("lightColor", [1, 1, 1]);
		programInfo.program.setVec3("viewPos", this.cameraPosition);
		for(var i=0; i<this.models.length; i++)
		{
			this.models[i].render(programInfo, projectionMatrix);
		}
	}

	loadModelToScene(model)
	{
		if(typeof model === 'undefined')
		{
			console.warn("Model is undefined, perhaps something went wrong while loading it?");
			return;
		}
		if((model.position instanceof Float32Array) && (model.position.length == 3) &&
			(model.rotation instanceof Float32Array) && (model.rotation.length == 3) &&
			(model.scale instanceof Float32Array) && (model.scale.length == 3) &&
			(model.vertices instanceof Float32Array) && (model.normals instanceof Float32Array) &&
			(model.uvs instanceof Float32Array) && (model.indices instanceof Uint32Array))
		{
			console.info("Loading model with " + (model.vertices.length/3) + " vertices, " + (model.indices.length/3) + ' indices with the texture url: "' + model.texture + '".');
			this.models[this.models.length] = engine.loadModel(model);
		}
		else
		{
			console.warn("Failed to load model, invalid params!");
			return;
		}
	}
}

/**
 * @param modelName
 * @param{Float32Array} vertices
 * @param{Float32Array} normals
 * @param{Float32Array} uvs
 * @param{Float32Array} indices
 * @param texture Link to the texture to be used.
 * @param{Float32Array} position
 * @param{Float32Array} rotation
 * @param{Float32Array} scale
 * @param{Function} update Method to be called when the gamelogic gets updated.
*/
class Model
{
	constructor(modelName, vertices, normals, uvs, indices, texture, position, rotation, scale, update)
	{
		this.modelName = modelName;
		this.velocity = new Float32Array(3);

		if(vertices instanceof Float32Array)
			this.vertices = vertices;
		else if(Array.isArray(vertices))
			this.vertices = Float32Array.from(vertices);
		else this.vertices = new Float32Array(0);

		if(normals instanceof Float32Array)
			this.normals = normals;
		else if(Array.isArray(normals))
			this.normals = Float32Array.from(normals);
		else this.normals = new Float32Array(0);

		if(uvs instanceof Float32Array)
			this.uvs = uvs;
		else if(Array.isArray(uvs))
			this.uvs = Float32Array.from(uvs);
		else this.uvs = new Float32Array(0);

		if(indices instanceof Uint32Array)
			this.indices = indices;
		else if(Array.isArray(indices))
			this.indices = Uint32Array.from(indices);
		else this.indices = new Uint32Array(0);

		//Texture check??
		this.textureUrl = texture;

		if(position instanceof Float32Array && position.length == 3)
			this.position = position;
		else if(Array.isArray(position) && position.length == 3)
			this.position = Float32Array.from(position);
		else this.position = new Float32Array(3);

		if(rotation instanceof Float32Array && rotation.length == 3)
			this.rotation = rotation;
		else if(Array.isArray(rotation) && rotation.length == 3)
			this.rotation = Float32Array.from(rotation);
		else this.rotation = new Float32Array(3);

		if(scale instanceof Float32Array && scale.length == 3)
			this.scale = scale;
		else if(Array.isArray(scale) && scale.length == 3)
			this.scale = Float32Array.from(scale);
		else this.scale = Float32Array.from([1, 1, 1]);

		this.ogldata = {
			positionBuffer: -1,
			normalBuffer: -1,
			textureCoordBuffer: -1,
			indexBuffer: -1,
			textureBuffer: -1
		};

		if(update instanceof Function)
			this.update = update;
		else
			this.update = function() {
				this.rotation[1] += 0.01;
			};

		this.render = function(programInfo, projectionMatrix)
		{
			const modelMatrix = mat4.create();
			mat4.translate(modelMatrix, modelMatrix, this.position);		// amount to translate
			mat4.rotate(modelMatrix, modelMatrix, this.rotation[0], [1, 0, 0]);	// axis to rotate around in radians (X)
			mat4.rotate(modelMatrix, modelMatrix, this.rotation[1], [0, 1, 0]);	// axis to rotate around in radians (Y)
			mat4.rotate(modelMatrix, modelMatrix, this.rotation[2], [0, 0, 1]);	// axis to rotate around in radians (Z)

			const normalMatrix = mat4.create();
			mat4.invert(normalMatrix, modelMatrix);

			// Tell WebGL how to pull out the positions from the position
			// buffer into the vertexPosition attribute
			gl.bindBuffer(gl.ARRAY_BUFFER, this.ogldata.positionBuffer);
			gl.vertexAttribPointer(programInfo.attribLocations.vertexPosition, 3, gl.FLOAT, false, 0, 0);
			gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);

			// Tell WebGL how to pull out the texture coordinates from
			// the texture coordinate buffer into the textureCoord attribute.
			gl.bindBuffer(gl.ARRAY_BUFFER, this.ogldata.textureCoordBuffer);
			gl.vertexAttribPointer(programInfo.attribLocations.textureCoord, 2, gl.FLOAT, false, 0, 0);
			gl.enableVertexAttribArray(programInfo.attribLocations.textureCoord);

			// Tell WebGL how to pull out the normals from
			// the normal buffer into the vertexNormal attribute.
			gl.bindBuffer(gl.ARRAY_BUFFER, this.ogldata.normalBuffer);
			gl.vertexAttribPointer(programInfo.attribLocations.vertexNormal, 3, gl.FLOAT, false, 0, 0);
			gl.enableVertexAttribArray(programInfo.attribLocations.vertexNormal);

			// Tell WebGL which indices to use to index the vertices
			gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.ogldata.indexBuffer);

			// Set the shader uniforms
			programInfo.program.setMat4(programInfo.uniformLocations.projectionMatrix, projectionMatrix, false);
			programInfo.program.setMat4(programInfo.uniformLocations.modelMatrix, modelMatrix, false);
			programInfo.program.setMat4(programInfo.uniformLocations.normalMatrix, normalMatrix, true);

			// Specify the texture to map onto the faces.

			// Tell WebGL we want to affect texture unit 0
			gl.activeTexture(gl.TEXTURE0);

			// Bind the texture to texture unit 0
			gl.bindTexture(gl.TEXTURE_2D, this.ogldata.textureBuffer);

			// Tell the shader we bound the texture to texture unit 0
			gl.uniform1i(programInfo.uniformLocations.uSampler, 0);
			{
				gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);
			}
		};
	}
}

/** Make specified HTMLElement fullscreen
 * @param{HTMLElement} element The HTML element to request fullscreen for.
 */
function goFullscreen(element)
{
	if(!element instanceof HTMLElement)
		console.error("Please specifie a valid HTML element (" + typeof element + ")!");
	if (element.requestFullscreen) {
		element.requestFullscreen();
	} else if (element.mozRequestFullScreen) { /* Firefox */
		element.mozRequestFullScreen();
	} else if (element.webkitRequestFullscreen) { /* Chrome, Safari & Opera */
		element.webkitRequestFullscreen();
	} else if (element.msRequestFullscreen) { /* IE/Edge */
		element.msRequestFullscreen();
	}
}

function isPowerOf2(value) {
	return (value & (value - 1)) == 0;
}

/**
 *  @param fileUrl The path of the file to download.
 *  @param runOnLoad{Function} The method to execute after the request has finished. The status contains information if the request was successfull [200].
 */
function requestFile(fileUrl, /*Function*/runOnLoad)
{
	if(!(runOnLoad instanceof Function))
	{
		console.error(" requestFile(fileUrl, runOnLoad) needs a function as second argument!");
		return;
	}

	var xhr = new XMLHttpRequest();
	xhr.onreadystatechange = function()
	{
		if(this.readyState == 4) runOnLoad(this.responseText, this.status);
	}
	xhr.open("GET", fileUrl);
	xhr.send();
}


/*
element.requestPointerLock = element.requestPointerLock ||
			     element.mozRequestPointerLock ||
			     element.webkitRequestPointerLock;
// Ask the browser to lock the pointer
element.requestPointerLock();

// Ask the browser to release the pointer
document.exitPointerLock = document.exitPointerLock ||
			   document.mozExitPointerLock ||
			   document.webkitExitPointerLock;
document.exitPointerLock();

// Hook pointer lock state change events
document.addEventListener('pointerlockchange', changeCallback, false);
document.addEventListener('mozpointerlockchange', changeCallback, false);
document.addEventListener('webkitpointerlockchange', changeCallback, false);

// Hook mouse move events
document.addEventListener("mousemove", this.moveCallback, false);

if (document.pointerLockElement === requestedElement ||
  document.mozPointerLockElement === requestedElement ||
  document.webkitPointerLockElement === requestedElement) {
  // Pointer was just locked
  // Enable the mousemove listener
  document.addEventListener("mousemove", this.moveCallback, false);
} else {
  // Pointer was just unlocked
  // Disable the mousemove listener
  document.removeEventListener("mousemove", this.moveCallback, false);
  this.unlockHook(this.element);
}

event.movementX = currentCursorPositionX - previousCursorPositionX;
event.movementY = currentCursorPositionY - previousCursorPositionY;

function moveCallback(e) {
  var movementX = e.movementX ||
      e.mozMovementX          ||
      e.webkitMovementX       ||
      0,
  movementY = e.movementY ||
      e.mozMovementY      ||
      e.webkitMovementY   ||
      0;
}
*/
