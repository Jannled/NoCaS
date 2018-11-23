
function convertFromObj(objContent)
{
  var modelName = "--NULL--";
  var vertices = [];
  var normals = [];
  var texCoords = [];
  var faces = [];

  var lines = objContent.split('\n');
  for(var i=0; i<lines.length; i++)
  {
    lines[i] = lines[i].trim();
    var key = lines[i].split(' ');
    switch(key[0])
    {
      case "o":
        modelName = lines[i].slice(1).trim();
        break;

      case "v":
        vertices[vertices.length] = key[1];
        vertices[vertices.length] = key[2];
        vertices[vertices.length] = key[3];
        break;

      case "vn":
        normals[normals.length] = key[1];
        normals[normals.length] = key[1];
        normals[normals.length] = key[1];
        break;

      case "f":
        var triplet = lines[i].slice(1).trim().split(' ');
        for(var i=0; i<3; i++)
        {
          var part = triplet.split('/');
          switch(part.length)
          {
            case 1:
              faces[faces.length] = triplet;
              break;

            case 2:
              break;

            case 3:
              faces[faces.length] = part[0];
              break;
          }
          break;
        }

      default:
        console.error("Undefined key: " + key[0] + ", in line " + i + "!");
        break;
    }
  }

  return {
	  modelName,
	  vertices,
	  normals,
	  texCoords,
	  faces
  };
}
