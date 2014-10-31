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

Sphere hit_spheres[3];
float seed;

float rand(vec2 co){
	return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
}

mat4 rotationMatrix(vec3 axis, float angle)
{
	float s = sin(angle);
	float c = cos(angle);
	float oc = 1.0 - c;
	return mat4(oc * axis.x * axis.x + c, oc * axis.x * axis.y - axis.z * s,
	            oc * axis.z * axis.x + axis.y * s, 0.0,
	            oc * axis.x * axis.y + axis.z * s, oc * axis.y * axis.y + c,
	            oc * axis.y * axis.z - axis.x * s, 0.0,
	            oc * axis.z * axis.x - axis.y * s, oc * axis.y * axis.z + axis.x * s,
	            oc * axis.z * axis.z + c, 0.0,
	            0.0, 0.0, 0.0, 1.0);
}

vec3 randDirInHem(vec3 norm) {
	vec3 perp;
	if (norm == vec3(0,1,0))
		perp = vec3(1,0,0);
	else
		perp = normalize(cross(norm, vec3(0,1,0)));
	vec2 randvec = (norm.xy + norm.yz) * seed;
	float u = abs(rand(randvec));
	float v = abs(rand(randvec * seed));
	float theta = 2 * 3.14159 * u;
	float phi = acos(2*v-1);

	perp = (vec4(perp, 1) * rotationMatrix(norm, theta)).xyz;

	return norm * sin(phi) + perp * cos(phi);
}

vec3 projectRay(vec3 pos, vec3 dir, int maxDist, int maxDepth) {
	int layersFilled = 0;
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
			if (t1 < 0) continue;
			if (t < minT) {
				minT = t;
				minS = s;
			}
		}
		if (minT < maxDist) {
			hit_spheres[layersFilled] = minS;
			pos = pos + dir * minT;
			vec3 norm = normalize(pos - minS.pos);
			pos = minS.pos + norm * minS.rad;
			dir = randDirInHem(norm);
			layersFilled++;
			maxDepth--;
		} else
			break;
	}
	vec3 color = vec3(0,0,0);
	while (--layersFilled >= 0) {
		vec3 newc = hit_spheres[layersFilled].color;
		float l = hit_spheres[layersFilled].light_emit;
		color = vec3(color.r * newc.r + newc.r * l,
		             color.g * newc.g + newc.g * l,
		             color.b * newc.b + newc.b * l);
	}
	return color;
}

void main() {
	vec3 pos = vec3(0,0,0);
	vec3 dir = normalize(vec3(screenp.x * whratio, screenp.y, 1));
	seed = user_seed;
	color = projectRay(pos, dir, 100, 3);
	for (int i = 0; i < 10; i++) {
		seed += .1;
		color += projectRay(pos, dir, 100, 3);
	}
	color /= 11;
}
