attribute vec3 aPosition;
attribute vec3 aNormal;

uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;
uniform vec3 uLightDirection;

varying mediump vec3 vColor;

void main(void) {
	gl_Position = uProjectionMatrix * uViewMatrix * vec4(aPosition, 1.0);

	vColor = abs(dot(normalize(aNormal), normalize(-uLightDirection)))
		* ((gl_Position.xyz / gl_Position.w + 1.0) / 2.0);
}