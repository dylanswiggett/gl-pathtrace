#include <iostream>
#include <cstdlib>
#include "SDL2/SDL.h"
#include "GL/glew.h"
#include "Scene.hpp"

#define SDL_FLAGS SDL_INIT_EVERYTHING
#define SDL_OGL_FLAGS SDL_WINDOW_OPENGL
#define SDL_WIDTH 1400
#define SDL_HEIGHT 800
#define OPENGL_MAJOR_VERSION 3
#define OPENGL_MINOR_VERSION 3

using namespace std;

SDL_Window *init_SDL(int w, int h) {
    int res;
    SDL_Window *window;

    res = SDL_Init(SDL_FLAGS);
    if (res == -1)
	return NULL;

    window = SDL_CreateWindow("GL Whatnot", 0, 0, w, h,
			      SDL_OGL_FLAGS);

    // SUCCESS
    return window;
}

void destroy_SDL() {
    SDL_Quit();
}

SDL_GLContext init_GL(SDL_Window *window) {
    SDL_GL_SetAttribute(SDL_GL_CONTEXT_MAJOR_VERSION, OPENGL_MAJOR_VERSION);
    SDL_GL_SetAttribute(SDL_GL_CONTEXT_MINOR_VERSION, OPENGL_MINOR_VERSION);

    SDL_GLContext context = SDL_GL_CreateContext(window);

    glewExperimental = GL_TRUE;
    glewInit();

    return context;
}

void destroy_GL(SDL_GLContext context) {
    SDL_GL_DeleteContext(context);
}

int main(int argc, char **argv) {
    SDL_Window *window;
    SDL_GLContext glcontext;
    SDL_Event event;
    Scene *scene;
    bool running;

    if (!(window = init_SDL(SDL_WIDTH, SDL_HEIGHT))) {
	cout << "Failed to initialize SDL. Exiting." << endl;
	return -1;
    }

    if (!(glcontext = init_GL(window))) {
	cout << "Failed to initialize openGL. Exiting." << endl;
	destroy_SDL();
	return -1;
    }

    scene = new Scene(SDL_WIDTH, SDL_HEIGHT);
    scene->setupGL();
    scene->updateGL();

    running = 1;
    while (running) {
	while (SDL_PollEvent(&event)) {
	    switch (event.type) {
	    case SDL_QUIT:
		running = false;
	    }
	}

	scene->drawGL();

	SDL_GL_SwapWindow(window);
    }


    delete scene;
    destroy_GL(glcontext);
    destroy_SDL();
}
