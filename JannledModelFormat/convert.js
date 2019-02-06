
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
	var h = -1;
	var o = -1;
	var v = -1;
	var n = -1;
	var t = -1;
	var f = -1;

	var lines = content.split('\n');

	for(var i=0; i<content.length; i++)
	{
		
	}

	return createModel();
}

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
