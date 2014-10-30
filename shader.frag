#version 330 core

layout(location = 0) out vec3 color;

struct Sphere {
	vec3 pos;
	float rad;
	float r, g, b;
	float light_emit;
};

uniform spheres
{
	Sphere sphere_list[256];
};

uniform int numspheres;
uniform float whratio;
in vec2 screenp;

vec3 projectRay(vec3 pos, vec3 dir, int maxDist) {
	float minT = 1000000;
	Sphere minS;
	for (int i = 0; i < numspheres; i++) {
		Sphere s = sphere_list[i];
		vec3 L = s.pos - pos;
		float tca = dot(L, dir);
		if (tca < 0) continue;
		float d2 = dot(L,L) - tca * tca;
		if (d2 > s.rad * s.rad) continue;
		float thc = sqrt(s.rad * s.rad - d2);
		float t0 = tca - thc;
		float t1 = tca + thc;
		float t = t0;
		if (t0 < 0)
			t = t1;
		if (t1 < 0) continue;
		if (t1 < minT) {
			minT = t1;
			minS = s;
		}
	}
	if (minT < maxDist)
		return vec3(minS.r, minS.g, minS.b);
	else
		return vec3(0,0,0);
}

void main() {
	vec3 pos = vec3(0,0,0);
	vec3 dir = normalize(vec3(screenp.x * whratio, screenp.y, 1));
       	color = projectRay(pos, dir, 100);
}
