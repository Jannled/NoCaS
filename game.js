main();

function main()
{
	var engine = new Engine(document.getElementById('gamearea'));
	engine.loadModelFromUrl('models/GenericCube.jmf', 'cubetexture.png', [2, 0, -6], [0.5, 1, 0]);
	engine.loadModelFromUrl('models/Sphere.jmf', '', [-2, -1, -6], [0.5, 1, 0], [0.1, 0.1, 0.1]);
	//lockMouse();
}
