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

/*
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
*/

vec3 uniformSampleHemisphere(float u1, float u2)
{
    float r = sqrt(1.0 - u1 * u1);
    float phi = 2 * 3.14159 * u2;
 
    return vec3(cos(phi) * r, sin(phi) * r, u1);
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
	int layersFilled = 0;
	int hit_spheres[4];
	
	while (maxDepth > 0) {
		float minT = 1000000;
		int minS;
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
				minS = i;
			}
		}
		if (minT < maxDist) {
			hit_spheres[layersFilled] = minS;
			pos = pos + dir * minT;
			vec3 norm = (pos - sphere_list[minS].pos) / sphere_list[minS].rad;
			pos = sphere_list[minS].pos + norm * sphere_list[minS].rad;
			dir = randDirInHem(norm);
			layersFilled++;
			maxDepth--;
		} else
			break;
	}
	vec3 color = vec3(0,0,0);
	while (--layersFilled >= 0) {
		Sphere s = sphere_list[hit_spheres[layersFilled]];
		color = s.color * (color + s.light_emit);
	}
	return color;
}

void main() {
	vec3 pos = vec3(0,0,0);
	vec3 dir = normalize(vec3(screenp.x * whratio, screenp.y, 1));
	seed = user_seed;
	color = projectRay(pos, dir, 100, 4);
	for (int i = 0; i < 20; i++) {
		seed += .1;
		color += projectRay(pos, dir, 100, 4);
	}
	color /= 21;
}
