#include "Scene.hpp"
#include "GL/glew.h"
#include "GL/gl.h"
#include "shader_loader.hpp"
#include <iostream>
#include <string.h>


/*
 *  *------*
 *  |  __/ |   O   O
 *  |_/    |     | 
 *  *------*   \___/
 */
float frameShape[18] =
    { -1, -1, 0,
      -1,  1, 0,
       1,  1, 0,
      -1, -1, 0,
       1,  1, 0,
       1, -1, 0 };

void printOGLErr() {
    GLuint err;
    cout << "Printing errors:" << endl;
    while ((err = glGetError()) != GL_NO_ERROR) {
        cerr << "OpenGL error: " << err << endl;
    }
}

Scene::~Scene() {
    glDeleteBuffers(1, &render_buffer_);
    glDeleteBuffers(1, &vertex_buffer_);
    delete spheres_;
}

void Scene::setupGL() {
    glGenVertexArrays(1, &vao_);
    glBindVertexArray(vao_);

    // Get single render polygon set up.
    glGenBuffers(1, &vertex_buffer_);
    glBindBuffer(GL_ARRAY_BUFFER, vertex_buffer_);
    glBufferData(GL_ARRAY_BUFFER, sizeof(frameShape), frameShape, GL_STATIC_DRAW);
    glEnableVertexAttribArray(0);
    glVertexAttribPointer(0, 3, GL_FLOAT, GL_FALSE, 0, 0); // 1282 ???

    glGenBuffers(1, &render_buffer_);
    glBindBuffer(GL_UNIFORM_BUFFER, render_buffer_);
    glBufferData(GL_UNIFORM_BUFFER, sizeof(Sphere) * MAX_SPHERES, NULL, GL_DYNAMIC_DRAW);

    shader_ = LoadShaders(VERT_SHADER, FRAG_SHADER);
    glUseProgram(shader_);

    Sphere s;
    s.x = 0;
    s.y = 0;
    s.z = 5;
    s.r = 1;
    s.g = 0;
    s.b = 0;
    s.rad = 2;
    spheres_->push_back(s);

    s.x = .1;
    s.y = .5;
    s.z = 4;
    s.r = 0;
    s.g = 1;
    s.b = 0;
    s.rad = .5;
    spheres_->push_back(s);

}

void Scene::updateGL() {
    glBindBuffer(GL_UNIFORM_BUFFER, render_buffer_);

    GLvoid* p = glMapBuffer(GL_UNIFORM_BUFFER, GL_WRITE_ONLY);
    memcpy(p, &((*spheres_)[0]), sizeof(Sphere) * spheres_->size());
    glUnmapBuffer(GL_UNIFORM_BUFFER);

    GLuint binding_point_index = 0;
    glBindBufferBase(GL_UNIFORM_BUFFER, binding_point_index, render_buffer_);

    GLuint spheres = glGetUniformBlockIndex(shader_, "spheres");
    glUniformBlockBinding(shader_, spheres, binding_point_index);    

    GLuint numspheres = glGetUniformLocation(shader_, "numspheres");
    glUniform1i(numspheres, spheres_->size());

    GLuint whratio = glGetUniformLocation(shader_, "whratio");
    glUniform1f(whratio, ((float) w_) / ((float) h_));
}

void Scene::drawGL() {
    glBindBuffer(GL_ARRAY_BUFFER, vertex_buffer_);
    glDrawArrays(GL_TRIANGLES, 0, sizeof(frameShape) / 3 / sizeof(float));
}
