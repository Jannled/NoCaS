
function convertFromObj(objContent)
{
  var modelName = "ConvertedModel";
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
        for(var j=0; j<3; j++)
        {
          var part = triplet[j].split('/');
          if(part.length == 1) faces[faces.length] = triplet;
          else if (part.length == 3) faces[faces.length] = part[0]; //Case 2 is missing?!?!
        }

			case "mtllib": break;

			case "usemtl": break;

			case "s": break;

      case "vt": break;

      case "g": break;

      case "": break;

    	default:
      {
        if (key[0][0] == '#')
          console.log(lines[i])
        else
          console.log("Undefined key: " + key[0] + ", in line " + i + "!");
        break;
      }
		}
  }

  console.log("Loading complete: Vertices: " + (vertices.length/3) + ", Faces: " + (faces.length/3));

  return {
    modelName,
    vertices,
    normals,
    texCoords,
    faces
  };
}
