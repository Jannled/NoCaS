main();

function main()
{
	loadModelFromUrl('models/GenericCube.jmf', 'cubetexture.png', [2, 0, -6], [0.5, 1, 0]);
	loadModelFromUrl('models/Sphere.jmf', '', [-2, -1, -6], [0.5, 1, 0], [0.1, 0.1, 0.1]);
	newSize();
	lockMouse();
}
