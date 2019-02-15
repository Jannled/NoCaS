
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


		return createModel(o, v, n, t, f);
	} catch(err) {
		console.error("An error occured while parsing the model:" + err);
	}
}

/**
 * @param modelName
 * @param{Float32Array} vertices
 * @param{Float32Array} normals
 * @param{Float32Array} uvs
 * @param{Float32Array} indices
*/
function createModel(modelName, vertices, normals, uvs, indices)
{
	if(typeof modelName === 'undefined')
		modelName = "Model";
	if(typeof vertices === 'undefined')
		vertices = new Float32Array(0);;
	if(typeof normals === 'undefined')
		normals = new Float32Array(0);
	if(typeof uvs === 'undefined')
		uvs = new Float32Array(0);
	if(typeof indices === 'undefined')
		indices = new Float32Array(0);

	return {
      modelName,
      vertices,
      normals,
      uvs,
      indices
    };
}
