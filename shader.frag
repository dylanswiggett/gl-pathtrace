#version 330 core

layout(location = 0) out vec3 color;

struct Sphere {
	vec3 pos;
	float rad;
	vec3 color;
	float light_emit;
};

uniform spheres
{
	Sphere sphere_list[256];
};

uniform int numspheres;
uniform float whratio;
uniform int t;
uniform float user_seed;
in vec2 screenp;

float seed;

float rand(vec2 co){
	return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
}

vec3 cosineSampleHemisphere(float u1, float u2)
{
    float r = sqrt(u1);
    float theta = 2 * 3.14159 * u2;
 
    float x = r * cos(theta);
    float y = r * sin(theta);
 
    return vec3(x, y, sqrt(max(0.0f, 1 - u1)));
}

vec3 randDirInHem(vec3 norm) {
    float u1 = rand(norm.xy * seed);
    float u2 = rand(norm.yz * seed);
    vec3 dir = cosineSampleHemisphere(u1, u2);
    if (dot(norm, dir) < 0)
        dir = -dir;
    return dir;
}

vec3 projectRay(vec3 pos, vec3 dir, int maxDist, int maxDepth) {
	vec3 color = vec3(1,1,1);
	
	while (maxDepth > 0) {
		float minT = 1000000;
		Sphere minS;
		for (int i = 0; i < numspheres; i++) {
			// Ray/Sphere intersection
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
			if (t < minT && t >= 0) {
				minT = t;
				minS = s;
			}
		}
		if (minT < maxDist) {
			color *= minS.color;
			if (minS.light_emit > 0)
				return color * minS.light_emit;
			pos = pos + dir * minT;
			vec3 norm = (pos - minS.pos) / minS.rad;
			pos = minS.pos + norm * minS.rad;
			dir = randDirInHem(norm);
			maxDepth--;
		} else
			return vec3(0,0,0);
	}

	return vec3(0,0,0);
}

void main() {
	vec3 pos = vec3(0,0,0);
	vec3 dir = normalize(vec3(screenp.x * whratio, screenp.y, 1));
	seed = user_seed;
	color = projectRay(pos, dir, 100, 4);
	for (int i = 0; i < 3; i++) {
		seed += .1;
		color += projectRay(pos, dir, 100, 4);
	}
	color /= 3;
}
