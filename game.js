main();

function main()
{
	var engine = new Engine(document.getElementById('gamearea'));
	engine.loadModelFromUrl('models/GenericCube.jmf', [2, 0, -6], [0.5, 1, 0]);
	//engine.loadModelFromUrl('models/GenericCube.jmf', [2, 1, -6], [0.5, 1, 0]);
	//engine.loadModelFromUrl('models/Sphere.jmf', [2, -1, -6], [0.5, 1, 0], [0.1, 0.1, 0.1]);
	engine.loadModelFromUrl('models/Sphere.jmf', [-3, -1, -6], [0.5, 1, 0], [0.1, 0.1, 0.1]);
	//engine.loadModelFromUrl('models/Sphere.jmf', [-2, -4, -6], [0.5, 1, 0], [0.1, 0.1, 0.1]);
	//engine.loadModelFromUrl('models/Sphere.jmf', [3, -1, -3], [0.5, 1, 0], [0.1, 0.1, 0.1]);
	//engine.loadModelFromUrl('models/Sphere.jmf', [0, 4, -6], [0.5, 1, 0], [0.1, 0.1, 0.1]);
	//engine.loadModelFromUrl('models/Sphere.jmf', [-2, -2, -6], [0.5, 1, 0], [0.1, 0.1, 0.1]);
	//lockMouse();
}
