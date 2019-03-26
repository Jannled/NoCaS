import bpy

print("Exporting scene data");
 
blenderCipher=open('C:\\Users\\Jannled\\Documents\\GitHub\\NoCaS\\Scenes\\Test.txt','w')

for obj in bpy.context.selected_objects:
    blenderCipher.write(obj.name + '(' + str(float(obj.location.x)) + ',' + str(float(obj.location.y)) + ',' + str(float(obj.location.z)) + ')')

blenderCipher.close()