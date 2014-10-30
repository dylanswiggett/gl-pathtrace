#version 330 core

layout(location = 0) out vec3 color;

struct Sphere {
     float x, y, z, rad;
     float r, g, b;
     float light_emit;
};

uniform spheres
{
     Sphere s[256];
};

uniform int numspheres;
in vec2 screenp;

void main() {
//     color = vec3((screenp.xy + vec2(1,1)) / 2, 0);
       color = vec3(s[0].x, s[0].y, s[0].z);
}
