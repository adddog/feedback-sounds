
export const VERT = `
    precision lowp float;
    uniform mat4 projection, view, model;
    attribute vec3 position;
    attribute vec3 normal;
    attribute vec2 uvs;

    uniform float tick;
    uniform sampler2D texture;

    varying vec2 vTextureCoord;
    varying vec3 vNormal;
    varying vec3 vPosition;

    const float DEG_TO_RAD = 3.141592653589793 / 180.0;

    mat3 rotateX(float rad) {
    float c = cos(rad);
    float s = sin(rad);
    return mat3(
        1.0, 0.0, 0.0,
        0.0, c, s,
        0.0, -s, c
    );
}

mat3 rotateY(float rad) {
    float c = cos(rad);
    float s = sin(rad);
    return mat3(
        c, 0.0, -s,
        0.0, 1.0, 0.0,
        s, 0.0, c
    );
}

mat3 rotateZ(float rad) {
    float c = cos(rad);
    float s = sin(rad);
    return mat3(
        c, s, 0.0,
        -s, c, 0.0,
        0.0, 0.0, 1.0
    );
}


    void main () {
      vTextureCoord           = uvs;
      vec3 pos = position;
      vec3 norm = normal;
      pos = rotateZ(tick * DEG_TO_RAD) * pos;
      // pos = rotateX(tick * DEG_TO_RAD) * pos;
      pos = rotateZ(tick * DEG_TO_RAD) * pos;
      norm = rotateZ(tick * DEG_TO_RAD) * norm;
      // norm = rotateX(tick * DEG_TO_RAD) * norm;
      norm = rotateZ(tick * DEG_TO_RAD) * norm;
      vPosition = pos;
      vNormal = norm;
      vec4 pixelate = texture2D( texture, vTextureCoord );
      pos.xyz += norm * (length(pixelate.rgb) * 1.);
      gl_Position = projection * view * model * vec4(pos, 1);
    }
    `

export const FRAG = `
    precision lowp float;

    varying vec2    vTextureCoord;
    varying vec3 vNormal;
    varying vec3 vPosition;
    uniform float ambientLightAmount;
    uniform float diffuseLightAmount;

    uniform vec3 lightDir;
    uniform sampler2D texture;


    uniform vec3 color;


    void main () {
      vec4 pixelate = texture2D( texture, vTextureCoord );
      vec3 ambient = ambientLightAmount * color;

      float cosTheta = dot(vNormal, lightDir);
      vec3 diffuse = diffuseLightAmount * color * clamp(cosTheta , 0.0, 1.0 );
      //gl_FragColor = vec4((ambient + diffuse), 1.0);

      //gl_FragColor = vec4(vNormal, 1.);
      gl_FragColor = vec4(pixelate.rgb+(vNormal*0.2)+ambient + diffuse, 1.);
    }
    `
