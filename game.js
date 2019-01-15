
main();

function main()
{
	loadModelFromUrl('models/cube.obj');
	newSize();
}

/**
 * Uses JQuery to download a model file which will then be parsed and loaded into the scene
 * @param fileUrl Path of the obj file to be downloaded
*/
function loadModelFromUrl(fileUrl)
{
	jQuery.get(fileUrl, function(data, status)
	{
		console.log('Request: "' + fileUrl + '" [' + status + "].")
		var model = convertFromObj(data);
		loadModelToScene(loadModelToScene(gl, model.vertices, model.normals, model.texCoords, model.faces, 'Entwurf Spielbrett NoCaS.jpeg', [0, 0, -6], [0, 0, 0]));
	});
}
