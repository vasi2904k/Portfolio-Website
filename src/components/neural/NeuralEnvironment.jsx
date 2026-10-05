"use client";
import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { AdditiveBlending, BackSide, Color, Object3D, Vector3 } from "three";
import { createNeuralEnvironment, closestNeuralPaths } from "@/utils/neuralEnvironment.mjs";

const noRaycast = () => null;
const fiberVertex = `
  attribute float aPhase;
  uniform float uTime;
  uniform vec3 uActive;
  varying float vPhase;
  varying float vDistance;
  varying float vNear;
  void main() {
    vec3 p = position + vec3(sin(uTime * .18 + aPhase) * .07, cos(uTime * .13 + aPhase) * .06, 0.0);
    vec4 world = modelMatrix * vec4(p, 1.0);
    vDistance = length(cameraPosition - world.xyz);
    vNear = exp(-length(world.xyz - uActive) * .055);
    vPhase = aPhase;
    gl_Position = projectionMatrix * viewMatrix * world;
  }
`;
const fiberFragment = `
  uniform vec3 uColor;
  uniform vec3 uSignal;
  uniform float uTime;
  uniform float uActivity;
  varying float vPhase;
  varying float vDistance;
  varying float vNear;
  void main() {
    float pulse = .9 + .1 * sin(uTime * .4 + vPhase);
    float local = uActivity * vNear;
    float fade = 1.0 - smoothstep(55.0, 170.0, vDistance);
    gl_FragColor = vec4(mix(uColor, uSignal, local * .5), (.16 + local * .12) * pulse * fade);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

// Analytic ray/sphere intersection with six density samples inside each fog
// volume. These are real world-space volumes, not a fullscreen image effect.
const mistVertex = `
  varying vec3 vWorld;
  varying vec3 vCenter;
  varying float vRadius;
  void main() {
    vec4 world = modelMatrix * instanceMatrix * vec4(position, 1.0);
    vWorld = world.xyz;
    vCenter = (modelMatrix * instanceMatrix * vec4(0.0, 0.0, 0.0, 1.0)).xyz;
    vRadius = length(instanceMatrix[0].xyz);
    gl_Position = projectionMatrix * viewMatrix * world;
  }
`;
const mistFragment = `
  uniform float uTime;
  uniform vec3 uColor;
  varying vec3 vWorld;
  varying vec3 vCenter;
  varying float vRadius;
  float hash(vec3 p) { return fract(sin(dot(p, vec3(127.1, 311.7, 74.7))) * 43758.5453); }
  float noise(vec3 p) {
    vec3 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
    return mix(mix(mix(hash(i), hash(i + vec3(1,0,0)), f.x), mix(hash(i + vec3(0,1,0)), hash(i + vec3(1,1,0)), f.x), f.y),
      mix(mix(hash(i + vec3(0,0,1)), hash(i + vec3(1,0,1)), f.x), mix(hash(i + vec3(0,1,1)), hash(i + vec3(1,1,1)), f.x), f.y), f.z);
  }
  void main() {
    vec3 ray = normalize(vWorld - cameraPosition), oc = cameraPosition - vCenter;
    float b = dot(oc, ray), c = dot(oc, oc) - vRadius * vRadius;
    float discriminant = b * b - c;
    if (discriminant <= 0.0) discard;
    float entry = max(0.0, -b - sqrt(discriminant)), exitPoint = -b + sqrt(discriminant);
    if (exitPoint <= entry) discard;
    float density = 0.0;
    for (int i = 0; i < 6; i++) {
      vec3 p = cameraPosition + ray * mix(entry, exitPoint, (float(i) + .5) / 6.0);
      float radial = max(0.0, 1.0 - length(p - vCenter) / vRadius);
      density += radial * radial * (.35 + .65 * noise(p * .16 + vec3(uTime * .012)));
    }
    float alpha = (1.0 - exp(-density * (exitPoint - entry) * .018)) * .25;
    gl_FragColor = vec4(uColor, alpha);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

export default function NeuralEnvironment({ quality, palette, activePosition, revision, moving, reduced }) {
  const tissue = useMemo(() => createNeuralEnvironment(quality), [quality]);
  const soma = useRef(), halos = useRef(), signals = useRef(), fog = useRef(), dust = useRef();
  const object = useMemo(() => new Object3D(), []), tint = useMemo(() => new Color(), []);
  const elapsed = useRef(0), activity = useRef(0);
  const nearPaths = useMemo(() => closestNeuralPaths(tissue.paths, activePosition), [tissue, activePosition]);
  const fiberUniforms = useMemo(() => ({ uTime: { value: 0 }, uActivity: { value: 0 }, uActive: { value: new Vector3() }, uColor: { value: new Color() }, uSignal: { value: new Color() } }), []);
  const mistUniforms = useMemo(() => ({ uTime: { value: 0 }, uColor: { value: new Color() } }), []);
  useEffect(() => { activity.current = reduced ? 0 : 1; }, [revision, reduced]);
  useEffect(() => {
    fiberUniforms.uColor.value.set(palette.dendrite); fiberUniforms.uSignal.value.set(palette.signal);
    fiberUniforms.uActive.value.fromArray(activePosition); mistUniforms.uColor.value.set(palette.mist);
  }, [palette, activePosition, fiberUniforms, mistUniforms]);
  useLayoutEffect(() => {
    tissue.clouds.forEach((cloud, i) => { object.position.fromArray(cloud.position); object.scale.setScalar(cloud.radius); object.updateMatrix(); fog.current.setMatrixAt(i, object.matrix); });
    fog.current.instanceMatrix.needsUpdate = true; fog.current.computeBoundingSphere();
  }, [tissue, object]);
  useFrame((_, delta) => {
    const dt = Math.min(delta, .05);
    if (moving) elapsed.current += dt;
    activity.current *= Math.exp(-dt * .6);
    const time = elapsed.current, boost = reduced ? 0 : activity.current;
    fiberUniforms.uTime.value = time; fiberUniforms.uActivity.value = boost; mistUniforms.uTime.value = time;
    for (let i = 0; i < tissue.centers.length; i++) {
      const node = tissue.centers[i], p = node.position;
      object.position.set(p[0] + Math.sin(time * .18 + node.phase) * .07, p[1] + Math.cos(time * .13 + node.phase) * .06, p[2]);
      const pulse = 1 + Math.sin(time * .5 + node.phase) * .045;
      object.scale.setScalar(node.radius * pulse); object.updateMatrix(); soma.current.setMatrixAt(i, object.matrix);
      const proximity = Math.exp(-object.position.distanceTo(fiberUniforms.uActive.value) * .055);
      tint.copy(fiberUniforms.uColor.value).lerp(fiberUniforms.uSignal.value, proximity * boost * .5);
      soma.current.setColorAt(i, tint);
      object.scale.multiplyScalar(3.4); object.updateMatrix(); halos.current.setMatrixAt(i, object.matrix);
    }
    soma.current.instanceMatrix.needsUpdate = true; soma.current.instanceColor.needsUpdate = true; halos.current.instanceMatrix.needsUpdate = true;
    for (let i = 0; i < quality.signals; i++) {
      const pathIndex = i < quality.signals / 2 && boost > .1 ? nearPaths[i % nearPaths.length] : i * 37 % tissue.paths.length;
      const path = tissue.paths[pathIndex], points = path.points;
      const cycle = (time * .075 + i * .173) % 1, window = .17 + boost * .14;
      const progress = Math.min(1, cycle / window), step = progress * 8, a = Math.min(7, Math.floor(step)), t = step - a;
      const j = a * 3;
      object.position.set(points[j] + (points[j + 3] - points[j]) * t + Math.sin(time * .18 + path.phase) * .07,
        points[j + 1] + (points[j + 4] - points[j + 1]) * t + Math.cos(time * .13 + path.phase) * .06,
        points[j + 2] + (points[j + 5] - points[j + 2]) * t);
      object.scale.setScalar(!reduced && cycle < window ? .055 + boost * .018 : 0); object.updateMatrix(); signals.current.setMatrixAt(i, object.matrix);
    }
    signals.current.instanceMatrix.needsUpdate = true;
    dust.current.rotation.y = time * .0015; dust.current.position.y = Math.sin(time * .05) * .25;
  });
  return <group name="neural-environment">
    <group name="distant-neural-field">
      <points raycast={noRaycast}><bufferGeometry><bufferAttribute attach="attributes-position" count={tissue.fieldPositions.length / 3} array={tissue.fieldPositions} itemSize={3} /></bufferGeometry><pointsMaterial color={palette.field} size={.15} transparent opacity={.12} depthWrite={false} /></points>
      <lineSegments raycast={noRaycast}><bufferGeometry><bufferAttribute attach="attributes-position" count={tissue.fieldEdges.length / 3} array={tissue.fieldEdges} itemSize={3} /></bufferGeometry><lineBasicMaterial color={palette.fiber} transparent opacity={.065} depthWrite={false} /></lineSegments>
    </group>
    <group name="organic-neural-tissue">
      <lineSegments raycast={noRaycast}><bufferGeometry><bufferAttribute attach="attributes-position" count={tissue.fibers.length / 3} array={tissue.fibers} itemSize={3} /><bufferAttribute attach="attributes-aPhase" count={tissue.phases.length} array={tissue.phases} itemSize={1} /></bufferGeometry><shaderMaterial uniforms={fiberUniforms} vertexShader={fiberVertex} fragmentShader={fiberFragment} transparent depthWrite={false} /></lineSegments>
      <instancedMesh ref={soma} args={[null, null, tissue.centers.length]} raycast={noRaycast} frustumCulled={false}><icosahedronGeometry args={[1, 1]} /><meshBasicMaterial transparent opacity={.25} /></instancedMesh>
      <instancedMesh ref={halos} args={[null, null, tissue.centers.length]} raycast={noRaycast} frustumCulled={false}><sphereGeometry args={[1, 8, 6]} /><meshBasicMaterial color={palette.aura} transparent opacity={.02} depthWrite={false} blending={AdditiveBlending} /></instancedMesh>
      <instancedMesh ref={signals} args={[null, null, quality.signals]} raycast={noRaycast} frustumCulled={false}><sphereGeometry args={[1, 5, 4]} /><meshBasicMaterial color={palette.signal} transparent opacity={.9} depthWrite={false} toneMapped={false} /></instancedMesh>
    </group>
    <group name="volumetric-neural-atmosphere">
      <instancedMesh ref={fog} args={[null, null, tissue.clouds.length]} raycast={noRaycast}><sphereGeometry args={[1, 16, 12]} /><shaderMaterial vertexShader={mistVertex} fragmentShader={mistFragment} uniforms={mistUniforms} transparent depthWrite={false} side={BackSide} /></instancedMesh>
      <points ref={dust} raycast={noRaycast}><bufferGeometry><bufferAttribute attach="attributes-position" count={tissue.dust.length / 3} array={tissue.dust} itemSize={3} /></bufferGeometry><pointsMaterial color={palette.aura} size={.034} transparent opacity={.12} depthWrite={false} blending={AdditiveBlending} /></points>
    </group>
  </group>;
}
