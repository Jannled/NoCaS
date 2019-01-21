var loader = new THREE.OBJLoader2();

function convertFromObj(objContent)
{
	loader.setUseIndices(true);
	var modelName = "Toll"; //TODO
	var indices = []; //TODO
	var object = loader.parse(objContent);
	var vertices = object.children[0].geometry.attributes.position.array;
	var normals = object.children[0].geometry.attributes.normal.array;
	var uvs = object.children[0].geometry.attributes.uv.array;

  return {
    modelName,
    vertices,
    normals,
    uvs,
    indices
  };
}
