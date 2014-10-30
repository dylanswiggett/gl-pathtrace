#ifndef SCENE_HPP_
#define SCENE_HPP_

#include <vector>
#include "GL/glew.h"
#include "GL/gl.h"

#define VERT_SHADER "shader.vert"
#define FRAG_SHADER "shader.frag"

#define MAX_SPHERES 100

using namespace std;

typedef struct Sphere {
    double x, y, z, rad;
    double r, g, b;
} Sphere;

class Scene {
public:
    Scene(int w, int h) : w_(w), h_(h) {
	spheres_ = new vector<Sphere>();
    };

    virtual ~Scene();
    virtual void setupGL();
    virtual void updateGL();
    virtual void drawGL();
private:
    int w_, h_;
    vector<Sphere> *spheres_;
    GLuint render_buffer_, vertex_buffer_;
    GLuint shader_;
    GLuint vao_;
};

#endif
