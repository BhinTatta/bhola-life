import {
  LinearFilter,
  Matrix3,
  NearestFilter,
  RGBAFormat,
  ShaderMaterial,
  StereoCamera,
  WebGLRenderTarget,
  WebGLRenderer,
  Scene,
  Camera,
  PerspectiveCamera,
} from "three";
import { FullScreenQuad } from "three/examples/jsm/postprocessing/Pass.js";

class AnaglyphEffect {
  private colorMatrixLeft: Matrix3;
  private colorMatrixRight: Matrix3;
  private _stereo: StereoCamera;
  private _renderTargetL: WebGLRenderTarget;
  private _renderTargetR: WebGLRenderTarget;
  private _material: ShaderMaterial;
  private _quad: FullScreenQuad;
  private renderer: WebGLRenderer;

  constructor(renderer: WebGLRenderer, width = 512, height = 512) {
    this.renderer = renderer;

    // Dubois matrices
    this.colorMatrixLeft = new Matrix3().fromArray([
      0.4561, -0.0400822, -0.0152161, 0.500484, -0.0378246, -0.0205971,
      0.176381, -0.0157589, -0.00546856,
    ]);

    this.colorMatrixRight = new Matrix3().fromArray([
      -0.0434706, 0.378476, -0.0721527, -0.0879388, 0.73364, -0.112961,
      -0.00155529, -0.0184503, 1.2264,
    ]);

    this._stereo = new StereoCamera();

    const _params = {
      minFilter: LinearFilter,
      magFilter: NearestFilter,
      format: RGBAFormat,
    };
    this._renderTargetL = new WebGLRenderTarget(width, height, _params);
    this._renderTargetR = new WebGLRenderTarget(width, height, _params);

    this._material = new ShaderMaterial({
      uniforms: {
        mapLeft: { value: this._renderTargetL.texture },
        mapRight: { value: this._renderTargetR.texture },
        colorMatrixLeft: { value: this.colorMatrixLeft },
        colorMatrixRight: { value: this.colorMatrixRight },
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = vec2( uv.x, uv.y );
          gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
        }
      `,
      fragmentShader: `
        uniform sampler2D mapLeft;
        uniform sampler2D mapRight;
        varying vec2 vUv;
        uniform mat3 colorMatrixLeft;
        uniform mat3 colorMatrixRight;
        void main() {
          vec2 uv = vUv;
          vec4 colorL = texture2D( mapLeft, uv );
          vec4 colorR = texture2D( mapRight, uv );
          vec3 color = clamp(
            colorMatrixLeft * colorL.rgb +
            colorMatrixRight * colorR.rgb, 0.0, 1.0 );
          gl_FragColor = vec4( color.r, color.g, color.b, max( colorL.a, colorR.a ) );
        }
      `,
    });

    this._quad = new FullScreenQuad(this._material);
  }

  setSize(width: number, height: number): void {
    this.renderer.setSize(width, height);
    const pixelRatio = this.renderer.getPixelRatio();
    this._renderTargetL.setSize(width * pixelRatio, height * pixelRatio);
    this._renderTargetR.setSize(width * pixelRatio, height * pixelRatio);
  }

  render(scene: Scene, camera: Camera): void {
    const currentRenderTarget = this.renderer.getRenderTarget();

    if (scene.matrixWorldAutoUpdate) scene.updateMatrixWorld();

    if (!camera.parent && camera.matrixWorldAutoUpdate)
      camera.updateMatrixWorld();

    // Ensure that the camera is a PerspectiveCamera before calling update
    if (camera instanceof PerspectiveCamera) {
      this._stereo.update(camera);

      this.renderer.setRenderTarget(this._renderTargetL);
      this.renderer.clear();
      this.renderer.render(scene, this._stereo.cameraL);

      this.renderer.setRenderTarget(this._renderTargetR);
      this.renderer.clear();
      this.renderer.render(scene, this._stereo.cameraR);

      this.renderer.setRenderTarget(null);
      this._quad.render(this.renderer);

      this.renderer.setRenderTarget(currentRenderTarget);
    } else {
      console.warn("The provided camera is not a PerspectiveCamera.");
    }
  }

  dispose(): void {
    this._renderTargetL.dispose();
    this._renderTargetR.dispose();
    this._material.dispose();
    this._quad.dispose();
  }
}

export { AnaglyphEffect };
