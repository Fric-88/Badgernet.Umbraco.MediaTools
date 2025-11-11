#include <stdint.h>
#include <emscripten.h>

extern "C" {

    EMSCRIPTEN_KEEPALIVE
    void manipulateImageData(
        uint8_t* data,
        int length,
        float red,
        float green,
        float blue,
        float brightness,
        float contrast,
        float exposure)
    {
        float factor = (259 * (contrast + 255)) / (255 * (259 - contrast));
        for (int i = 0; i < length; i += 4) {
            float r = data[i] + brightness;
            r = factor * (r - 128.0f) + 128.0f;
            r *= exposure;
            r += red;
            if (r < 0) r = 0;
            if (r > 255) r = 255;
            data[i] = (uint8_t)r;

            float g = data[i + 1] + brightness;
            g = factor * (g - 128.0f) + 128.0f;
            g *= exposure;
            g += green;
            if (g < 0) g = 0;
            if (g > 255) g = 255;
            data[i + 1] = (uint8_t)g;

            float b = data[i + 2] + brightness;
            b = factor * (b - 128.0f) + 128.0f;
            b *= exposure;
            b += blue;
            if (b < 0) b = 0;
            if (b > 255) b = 255;
            data[i + 2] = (uint8_t)b;
        }
    }

} // extern "C"
