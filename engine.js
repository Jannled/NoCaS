const displayRatio = 16/9;
const canvasID = 'glcanvas';

//Test Cube
const positions = [
	// Front face
	-1.0, -1.0,	1.0,
	 1.0, -1.0,	1.0,
	 1.0,	1.0,	1.0,
	-1.0,	1.0,	1.0,

	// Back face
	-1.0, -1.0, -1.0,
	-1.0,	1.0, -1.0,
	 1.0,	1.0, -1.0,
	 1.0, -1.0, -1.0,

	// Top face
	-1.0,	1.0, -1.0,
	-1.0,	1.0,	1.0,
	 1.0,	1.0,	1.0,
	 1.0,	1.0, -1.0,

	// Bottom face
	-1.0, -1.0, -1.0,
	 1.0, -1.0, -1.0,
	 1.0, -1.0,	1.0,
	-1.0, -1.0,	1.0,

	// Right face
	 1.0, -1.0, -1.0,
	 1.0,	1.0, -1.0,
	 1.0,	1.0,	1.0,
	 1.0, -1.0,	1.0,

	// Left face
	-1.0, -1.0, -1.0,
	-1.0, -1.0,	1.0,
	-1.0,	1.0,	1.0,
	-1.0,	1.0, -1.0,
];

const normals = [
		// Front
		 0.0,	0.0,	1.0,
		 0.0,	0.0,	1.0,
		 0.0,	0.0,	1.0,
		 0.0,	0.0,	1.0,

		// Back
		 0.0,	0.0, -1.0,
		 0.0,	0.0, -1.0,
		 0.0,	0.0, -1.0,
		 0.0,	0.0, -1.0,

		// Top
		 0.0,	1.0,	0.0,
		 0.0,	1.0,	0.0,
		 0.0,	1.0,	0.0,
		 0.0,	1.0,	0.0,

		// Bottom
		 0.0, -1.0,	0.0,
		 0.0, -1.0,	0.0,
		 0.0, -1.0,	0.0,
		 0.0, -1.0,	0.0,

		// Right
		 1.0,	0.0,	0.0,
		 1.0,	0.0,	0.0,
		 1.0,	0.0,	0.0,
		 1.0,	0.0,	0.0,

		// Left
		-1.0,	0.0,	0.0,
		-1.0,	0.0,	0.0,
		-1.0,	0.0,	0.0,
		-1.0,	0.0,	0.0
	];

	const texCoords = [
	// Front
	0.0,	0.0,
	1.0,	0.0,
	1.0,	1.0,
	0.0,	1.0,
	// Back
	0.0,	0.0,
	1.0,	0.0,
	1.0,	1.0,
	0.0,	1.0,
	// Top
	0.0,	0.0,
	1.0,	0.0,
	1.0,	1.0,
	0.0,	1.0,
	// Bottom
	0.0,	0.0,
	1.0,	0.0,
	1.0,	1.0,
	0.0,	1.0,
	// Right
	0.0,	0.0,
	1.0,	0.0,
	1.0,	1.0,
	0.0,	1.0,
	// Left
	0.0,	0.0,
	1.0,	0.0,
	1.0,	1.0,
	0.0,	1.0,
];

const indices = [
	0,	1,	2,			0,	2,	3,		// front
	4,	5,	6,			4,	6,	7,		// back
	8,	9,	10,		 8,	10, 11,	 // top
	12, 13, 14,		 12, 14, 15,	 // bottom
	16, 17, 18,		 16, 18, 19,	 // right
	20, 21, 22,		 20, 22, 23,	 // left
];

/** Vertex shader */
const vsSource = `
	attribute vec4 aVertexPosition;
	attribute vec3 aVertexNormal;
	attribute vec2 aTextureCoord;

	uniform mat4 uNormalMatrix;
	uniform mat4 uModelViewMatrix;
	uniform mat4 uProjectionMatrix;

	varying highp vec2 vTextureCoord;
	varying highp vec3 vLighting;

	void main(void) {
		gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
		vTextureCoord = aTextureCoord;

		// Apply lighting effect

		highp vec3 ambientLight = vec3(0.3, 0.3, 0.3);
		highp vec3 directionalLightColor = vec3(1, 1, 1);
		highp vec3 directionalVector = normalize(vec3(0.85, 0.8, 0.75));

		highp vec4 transformedNormal = uNormalMatrix * vec4(aVertexNormal, 1.0);

		highp float directional = max(dot(transformedNormal.xyz, directionalVector), 0.0);
		vLighting = ambientLight + (directionalLightColor * directional);
	}`;

/** Fragment shader */
const fsSource = `
	varying highp vec2 vTextureCoord;
	varying highp vec3 vLighting;

	uniform sampler2D uSampler;

	void main(void) {
		highp vec4 texelColor = texture2D(uSampler, vTextureCoord);

		gl_FragColor = vec4(texelColor.rgb * vLighting, texelColor.a);
	}`;

var currentTime = 0.0;
var gl;
var canvas;

var scene = [];

main();

/** Main Method */
function main()
{
	var js = document.getElementById("js");
	var wgl = document.getElementById("wgl");

	//JavaScript is running
	if(js != null) js.style.color = "#00FF00";

 	canvas = document.getElementById(canvasID);
	if(canvas != null) gl = canvas.getContext('webgl');
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

	// Initialize a shader program; this is where all the lighting
	// for the vertices and so forth is established.
	const shaderProgram = initShaderProgram(gl, vsSource, fsSource);

	// Collect all the info needed to use the shader program.
	// Look up which attributes our shader program is using
	// for aVertexPosition, aVertexNormal, aTextureCoord,
	// and look up uniform locations.
	const programInfo = {
		program: shaderProgram,
		attribLocations: {
			vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
			vertexNormal: gl.getAttribLocation(shaderProgram, 'aVertexNormal'),
			textureCoord: gl.getAttribLocation(shaderProgram, 'aTextureCoord'),
		},
		uniformLocations: {
			projectionMatrix: gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
			modelViewMatrix: gl.getUniformLocation(shaderProgram, 'uModelViewMatrix'),
			normalMatrix: gl.getUniformLocation(shaderProgram, 'uNormalMatrix'),
			uSampler: gl.getUniformLocation(shaderProgram, 'uSampler'),
		},
	};

	// Here's where we call the routine that builds all the
	// objects we'll be drawing.
	scene[scene.length] = loadModel(gl, positions, normals, texCoords, indices, 'cubetexture.png');
	scene[scene.length] = loadModel(gl, positions, normals, texCoords, indices, 'cubetexture.png');

	var then = 0;

	newSize();

	// Draw the scene repeatedly
	function render(now) {
		now *= 0.001;	// convert to seconds
		const deltaTime = now - then;
		then = now;

		drawScene(gl, programInfo, deltaTime);

		requestAnimationFrame(render);
	}
	requestAnimationFrame(render);
}

function loadModel(gl, positions, normals, texCoords, indices, textureUrl)
{
	//Build the positions buffer
	const positionBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

	//Build the normals buffer
	const normalBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);

	//Build the texture coords buffer
	const textureCoordBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texCoords), gl.STATIC_DRAW);

	// Build the element array buffer
	const indexBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

	const texture = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D, texture);

	const level = 0;
	const internalFormat = gl.RGBA;
	const width = 1;
	const height = 1;
	const border = 0;
	const srcFormat = gl.RGBA;
	const srcType = gl.UNSIGNED_BYTE;
	const pixel = new Uint8Array([255, 0, 255, 255]);
	gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
								width, height, border, srcFormat, srcType,
								pixel);

	const image = new Image();
	image.onload = function() {
		gl.bindTexture(gl.TEXTURE_2D, texture);
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
	image.src = textureUrl;

	return {
		position: positionBuffer,
		normal: normalBuffer,
		textureCoord: textureCoordBuffer,
		indices: indexBuffer,
		texture: texture,
	};
}

function isPowerOf2(value) {
	return (value & (value - 1)) == 0;
}

/** Draw the scene */
function drawScene(gl, programInfo, deltaTime) {
	gl.clearColor(0.0, 0.0, 0.0, 1.0);	// Clear to black, fully opaque
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

	for(var i=0; i<scene.length; i++)
	{
		const modelViewMatrix = mat4.create();
		mat4.translate(modelViewMatrix,		 // destination matrix
									 modelViewMatrix,		 // matrix to translate
									 [0.0, i, -6.0]);	// amount to translate
		mat4.rotate(modelViewMatrix,	// destination matrix
								modelViewMatrix,	// matrix to rotate
								currentTime,		 // amount to rotate in radians
								[0, 0, 1]);			 // axis to rotate around (Z)
		mat4.rotate(modelViewMatrix,	// destination matrix
								modelViewMatrix,	// matrix to rotate
								currentTime * .7,// amount to rotate in radians
								[0, 1, 0]);			 // axis to rotate around (X)

		const normalMatrix = mat4.create();
		mat4.invert(normalMatrix, modelViewMatrix);
		mat4.transpose(normalMatrix, normalMatrix);

		// Tell WebGL how to pull out the positions from the position
		// buffer into the vertexPosition attribute
		{
			gl.bindBuffer(gl.ARRAY_BUFFER, scene[i].position);
			gl.vertexAttribPointer(programInfo.attribLocations.vertexPosition, 3, gl.FLOAT, false, 0, 0);
			gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);
		}

		// Tell WebGL how to pull out the texture coordinates from
		// the texture coordinate buffer into the textureCoord attribute.
		{
			gl.bindBuffer(gl.ARRAY_BUFFER, scene[i].textureCoord);
			gl.vertexAttribPointer(programInfo.attribLocations.textureCoord, 2, gl.FLOAT, false, 0, 0);
			gl.enableVertexAttribArray(programInfo.attribLocations.textureCoord);
		}

		// Tell WebGL how to pull out the normals from
		// the normal buffer into the vertexNormal attribute.
		{
			gl.bindBuffer(gl.ARRAY_BUFFER, scene[i].normal);
			gl.vertexAttribPointer(programInfo.attribLocations.vertexNormal, 3, gl.FLOAT, false, 0, 0);
			gl.enableVertexAttribArray(programInfo.attribLocations.vertexNormal);
		}

		// Tell WebGL which indices to use to index the vertices
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, scene[i].indices);

		// Tell WebGL to use our program when drawing
		gl.useProgram(programInfo.program);

		// Set the shader uniforms
		gl.uniformMatrix4fv(
				programInfo.uniformLocations.projectionMatrix,
				false,
				projectionMatrix);
		gl.uniformMatrix4fv(
				programInfo.uniformLocations.modelViewMatrix,
				false,
				modelViewMatrix);
		gl.uniformMatrix4fv(
				programInfo.uniformLocations.normalMatrix,
				false,
				normalMatrix);

		// Specify the texture to map onto the faces.

		// Tell WebGL we want to affect texture unit 0
		gl.activeTexture(gl.TEXTURE0);

		// Bind the texture to texture unit 0
		gl.bindTexture(gl.TEXTURE_2D, scene[i].texture);

		// Tell the shader we bound the texture to texture unit 0
		gl.uniform1i(programInfo.uniformLocations.uSampler, 0);

		{
			const vertexCount = 36;
			const type = gl.UNSIGNED_SHORT;
			const offset = 0;
			gl.drawElements(gl.TRIANGLES, vertexCount, type, offset);
		}
	}

	// Update the rotation for the next draw
	currentTime += deltaTime;
}

/** Create Shader program from shader source */
function initShaderProgram(gl, vsSource, fsSource) {
	const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
	const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

	// Create the shader program
	const shaderProgram = gl.createProgram();
	gl.attachShader(shaderProgram, vertexShader);
	gl.attachShader(shaderProgram, fragmentShader);
	gl.linkProgram(shaderProgram);

	// If creating the shader program failed, alert
	if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
		alert('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
		return null;
	}

	return shaderProgram;
}

/** Load a single shader into memory and compiles it */
function loadShader(gl, type, source) {
	const shader = gl.createShader(type);
	gl.shaderSource(shader, source);
	gl.compileShader(shader);

	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		alert('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
		gl.deleteShader(shader);
		return null;
	}

	return shader;
}

window.addEventListener('resize', newSize);
/** Handle window resize */
function newSize()
{
	var twidth = window.innerWidth-50;
	var theight = Math.round(twidth / displayRatio - 50);
	console.log("Canvas resized to " + twidth + "x" + theight);
	const hcanvas = document.getElementById("glcanvas");
	hcanvas.width = twidth;
	hcanvas.height = theight;
	gl.viewport(0, 0, hcanvas.width, hcanvas.height);
}

/** Make game fullscreen */
function goFullscreen()
{
	var gameArea = document.getElementById("gamearea");
	if (gameArea.requestFullscreen) {
		gameArea.requestFullscreen();
	} else if (gameArea.mozRequestFullScreen) { /* Firefox */
		gameArea.mozRequestFullScreen();
	} else if (gameArea.webkitRequestFullscreen) { /* Chrome, Safari & Opera */
		gameArea.webkitRequestFullscreen();
	} else if (gameArea.msRequestFullscreen) { /* IE/Edge */
		gameArea.msRequestFullscreen();
	}
}
