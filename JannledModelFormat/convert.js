
/**
 *	Note: Depends on OBJLoader2.js and three.js (both from three.js)
*/
function convertFromObj(objContent)
{
	var loader = new THREE.OBJLoader2();

	loader.setUseIndices(true);
	var object = loader.parse(objContent);

	var modelName = "ConvertedModel";
	var indices = [];
	var vertices = [];
	var normals = [];
	var uvs = [];

	if(!(typeof object.children[0].geometry.attributes.position === 'undefined'))
		vertices = object.children[0].geometry.attributes.position.array;
	else
			console.error("Failed to load model with name " + modelName + ", it has no vertices!");

	if(!(typeof object.children[0].name === 'undefined'))
		modelName = object.children[0].name;

	if(!(typeof object.children[0].geometry.index === 'undefined'))
		indices = object.children[0].geometry.index.array;

	if(!(typeof object.children[0].geometry.attributes.normal === 'undefined'))
		normals = object.children[0].geometry.attributes.normal.array;

	if(!(typeof object.children[0].geometry.attributes.uv === 'undefined'))
		uvs = object.children[0].geometry.attributes.uv.array;
	else
		var uvs = new Float32Array(vertices.length * 1.5);
	return createModel(modelName, vertices, normals, uvs, indices);
}

function convertToJMF(modelName, vertices, normals, uvs, indices)
{
	var output = "#JannledModelConverter V1.0.0\n";
	output += "o{" + modelName + "}\n" + "v{";
	for(var i=0; i<vertices.length-1; i++)
	{
		output += vertices[i] + ",";
	}
	output += vertices[vertices.length-1] + "}\n";

	output += "n{";
	for(var i=0; i<normals.length-1; i++)
	{
		output += normals[i] + ",";
	}
	output += normals[normals.length-1] + "}\n";

	output += "t{";
	for(var i=0; i<uvs.length-1; i++)
	{
		output += uvs[i] + ",";
	}
	output += uvs[uvs.length-1] + "}\n"

	output += "f{";
	for(var i=0; i<indices.length-1; i++)
	{
		output += indices[i] + ",";
	}
	output += indices[indices.length-1] + "}\n";

	return output;
}

function convertFromJMF(content)
{
	const hpos = 0;
	const opos = 1;
	const vpos = 2;
	const npos = 3;
	const tpos = 4;
	const fpos = 5
	var h = "--NOT FOUND--";
	var o = "--NOT FOUND--";
	var v = "--NOT FOUND--";
	var n = "--NOT FOUND--";
	var t = "--NOT FOUND--";
	var f = "--NOT FOUND--";

	var lines = content.split('\n');
	try{
		//Parse the JMF-header
		lines[0].trim();
		if(lines[0].charAt(0) !== '#') throw "Missing #-Key";
		h=lines[0];

		//Parse the object section
		lines[opos].trim();
		if(lines[opos].charAt(0) !== 'o') throw "Missing o-Key";
		var begin = lines[opos].indexOf('{');
		var end = lines[opos].lastIndexOf('}');
		if(!((begin > -1) && (end > -1) && (begin < end))) throw "Malformed curly brackets in object section!";
		o=lines[opos].substr(begin+1, (end-2));

		//Parse the vertice section
		lines[vpos].trim();
		if(lines[vpos].charAt(0) !== 'v') throw "Missing v-Key";
		var begin = lines[vpos].indexOf('{');
		var end = lines[vpos].lastIndexOf('}');
		if(!((begin > -1) && (end > -1) && (begin < end))) throw "Malformed curly brackets in vertice section!";
		v = Float32Array.from(lines[vpos].substr(begin+1, (end-2)).split(","));


		//Parse the normal section
		lines[npos].trim();
		if(lines[npos].charAt(0) !== 'n') throw "Missing n-Key";
		var begin = lines[npos].indexOf('{');
		var end = lines[npos].lastIndexOf('}');
		if(!((begin > -1) && (end > -1) && (begin < end))) throw "Malformed curly brackets in vertice section!";
		n = Float32Array.from(lines[npos].substr(begin+1, (end-2)).split(","));


		//Parse the texture section
		lines[tpos].trim();
		if(lines[tpos].charAt(0) !== 't') throw "Missing t-Key";
		var begin = lines[tpos].indexOf('{');
		var end = lines[tpos].lastIndexOf('}');
		if(!((begin > -1) && (end > -1) && (begin < end))) throw "Malformed curly brackets in vertice section!";
		t = Float32Array.from(lines[tpos].substr(begin+1, (end-2)).split(","));


		//Parse the face section
		lines[fpos].trim();
		if(lines[fpos].charAt(0) !== 'f') throw "Missing f-Key";
		var begin = lines[fpos].indexOf('{');
		var end = lines[fpos].lastIndexOf('}');
		if(!((begin > -1) && (end > -1) && (begin < end))) throw "Malformed curly brackets in vertice section!";
		f = Float32Array.from(lines[fpos].substr(begin+1, (end-2)).split(","));

		return {
			name: o,
			vertices: v,
			normals: n,
			uvs: t,
			indices: f
		};
	} catch(err) {
		console.error("An error occured while parsing the model: " + err);
		if(console.trace) console.trace();
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

		if(indices instanceof Float32Array)
			this.indices = indices;
		else if(Array.isArray(indices))
			this.indices = Float32Array.from(indices);
		else this.indices = new Float32Array(0);

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
			const modelViewMatrix = mat4.create();
			mat4.translate(modelViewMatrix, modelViewMatrix, this.position);		// amount to translate
			mat4.rotate(modelViewMatrix, modelViewMatrix, this.rotation[0], [1, 0, 0]);	// axis to rotate around in radians (X)
			mat4.rotate(modelViewMatrix, modelViewMatrix, this.rotation[1], [0, 1, 0]);	// axis to rotate around in radians (Y)
			mat4.rotate(modelViewMatrix, modelViewMatrix, this.rotation[2], [0, 0, 1]);	// axis to rotate around in radians (Z)

			const normalMatrix = mat4.create();
			mat4.invert(normalMatrix, modelViewMatrix);
			mat4.transpose(normalMatrix, normalMatrix);

			// Tell WebGL how to pull out the positions from the position
			// buffer into the vertexPosition attribute
			{
				gl.bindBuffer(gl.ARRAY_BUFFER, this.ogldata.positionBuffer);
				gl.vertexAttribPointer(programInfo.attribLocations.vertexPosition, 3, gl.FLOAT, false, 0, 0);
				gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);
			}

			// Tell WebGL how to pull out the texture coordinates from
			// the texture coordinate buffer into the textureCoord attribute.
			{
				gl.bindBuffer(gl.ARRAY_BUFFER, this.ogldata.textureCoordBuffer);
				gl.vertexAttribPointer(programInfo.attribLocations.textureCoord, 2, gl.FLOAT, false, 0, 0);
				gl.enableVertexAttribArray(programInfo.attribLocations.textureCoord);
			}

			// Tell WebGL how to pull out the normals from
			// the normal buffer into the vertexNormal attribute.
			{
				gl.bindBuffer(gl.ARRAY_BUFFER, this.ogldata.normalBuffer);
				gl.vertexAttribPointer(programInfo.attribLocations.vertexNormal, 3, gl.FLOAT, false, 0, 0);
				gl.enableVertexAttribArray(programInfo.attribLocations.vertexNormal);
			}

			// Tell WebGL which indices to use to index the vertices
			gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.ogldata.indexBuffer);

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
			gl.bindTexture(gl.TEXTURE_2D, this.ogldata.textureBuffer);

			// Tell the shader we bound the texture to texture unit 0
			gl.uniform1i(programInfo.uniformLocations.uSampler, 0);
			{
				gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);
			}
		};
	}
}
