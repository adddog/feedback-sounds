export const VERT = `
    precision lowp float;
    uniform mat4 projection, view, model;
    attribute vec3 position;
    attribute vec3 normal;
    attribute vec2 uvs;

    uniform vec3 rotationAxis;
    uniform float tick;
    uniform float randomSpeed;
    //uniform sampler2D texture;

    uniform vec3 lightDir;
    uniform vec3 color;
    uniform float ambientLightAmount;
    uniform float diffuseLightAmount;
    uniform float scaleAmount;
    uniform float positionAmount;

    varying vec3 vColor;
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
      pos *= scaleAmount;
      norm *= scaleAmount;

      float xRad = tick * randomSpeed * rotationAxis.x * DEG_TO_RAD;
      float yRad = tick * randomSpeed * rotationAxis.y * DEG_TO_RAD;
      float zRad = tick * randomSpeed * rotationAxis.z * DEG_TO_RAD;

      pos += vec3(cos(xRad) * model[3][2] * positionAmount ,
        sin(xRad) * model[3][2] * positionAmount ,
        0.);

      pos = rotateX(xRad) * pos;
      pos = rotateY(yRad) * pos;
      pos = rotateZ(zRad) * pos;
      norm = rotateX(xRad) * norm;
      norm = rotateY(yRad) * norm;
      norm = rotateZ(zRad) * norm;

      vPosition = pos;
      vNormal = norm;
      //vec4 pixelate = texture2D( texture, vTextureCoord );
      //pos.xyz += norm * (length(pixelate.rgb) * 1.);

      vec3 ambient = ambientLightAmount * color;
      float cosTheta = dot(vNormal, lightDir);
      vec3 diffuse = diffuseLightAmount * color * clamp(cosTheta , 0., 1.0 );
      vColor = ( (vNormal)/2. - 0.4 ) + ambient + diffuse;
      //vColor = vec3(am)

      gl_Position = projection * view * model * vec4(pos, 1);
    }
    `

export const FRAG = `
    precision lowp float;

    varying vec2    vTextureCoord;
    varying vec3 vColor;
    varying vec3 vNormal;
    varying vec3 vPosition;
    uniform float ambientLightAmount;
    uniform float diffuseLightAmount;

    uniform vec3 lightDir;
    uniform sampler2D texture;


    uniform vec3 color;


    void main () {
      //vec4 pixelate = texture2D( texture, vTextureCoord );
      //vec3 ambient = ambientLightAmount * color;

      //float cosTheta = dot(vNormal, lightDir);
      //vec3 diffuse = diffuseLightAmount * color * clamp(cosTheta , 0.0, 1.0 );
      //gl_FragColor = vec4((ambient + diffuse), 1.0);

      gl_FragColor = vec4(vColor, 1.);
      //gl_FragColor = vec4(pixelate.rgb+(vNormal*0.2)+ambient + diffuse, 1.);
    }
    `
