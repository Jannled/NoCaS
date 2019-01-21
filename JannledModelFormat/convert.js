
function convertFromObj(objContent)
{
  var modelName = "ConvertedModel";
  var vertices = [];
  var normals = [];
  var texCoords = [];
  var vertexIndices = [];
  var uvIndices = [];
  var normalIndices = [];

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
	        normals[normals.length] = key[2];
	        normals[normals.length] = key[3];
	        break;

		case "f":
	        var triplet = lines[i].slice(1).trim().split(' ');
	        for(var j=0; j<3; j++)
	        {
	        	var part = triplet[j].split('/');
	        	if(part.length == 1) faces[faces.length] = triplet-1;
				//TODO Case 2
		        else if (part.length == 3)
				{
					vertexIndices[vertexIndices.length] = part[0]-1;
					uvIndices[uvIndices.length] = part[1]-1;
					normalIndices[normalIndices.length] = part[2]-1;
				}
	        }

		case "mtllib": break;

		case "usemtl": break;

		case "s": break;

      	case "vt":
			texCoords[texCoords.length] = key[1];
			texCoords[texCoords.length] = key[2];
			break;

      	case "g": break;

      	case "": break;

		default:
			if (key[0][0] == '#')
			  console.log(lines[i])
			else
			  console.log("Undefined key: " + key[0] + ", in line " + i + "!");
			break;
		}

    //OpenGL stores data different from obj
    var conVertices = [];
    var conNormals = [];
    var conUVs = [];
    var indices = [];

    //Check for matching attrib data
    for(var k=0; k<vertices.length; k++)
    {
      for(var l=0; l<vertexIndices.length; l++)
      {
        if(vertexIndices[l] == k)
        {
          
        }
      }
    }

    //Compute normals per vertex
    for(var k=0; k<vertexIndices.length; k++)
    {

    }
	}

  return {
    modelName,
    conVertices,
    conNormals,
    conUVs,
    indices
  };
}
