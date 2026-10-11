import{B as e,D as t,Et as n,F as r,Mt as i,Pt as a,Tt as o,Xt as s,_ as c,c as l,jr as u,l as d,rn as f,s as p,u as m,wt as h}from"./three.core-mrld0H0c.js";import{d as g,l as _,n as v,t as y}from"./pieces-kzVvRsg2.js";import{t as b}from"./BufferGeometryUtils-CgYYHeSh.js";var x=.15,S=.2,ee=.075,C=.012,w=.022,T=.09,E=.1,D=.018,te=.038,ne=.13,re=.13,ie=.12,O=.125,ae=.37,oe=.2,se=.25,ce=.056,le=.066,ue=.06,de=.082,fe=.19,pe=.14,me=.18,he=.2,ge=.26,_e=.20600000000000002,ve=.14,ye=1/Math.tan(55*Math.PI/180),k=[{x:0,z:-.5},{x:.5,z:0},{x:0,z:.5},{x:-.5,z:0}],A=e=>e.type===`straight`?1:e.type===`bend`?Math.PI/4:e.type===`stub`?.5:e.length,be=.035;function j(e,t){if(e===`flat`)return 0;if(e===`bridge`){let e=Math.sin(Math.PI*t);return be*e*e}let n=Math.min(1,Math.min(t,1-t)/ae),r=n*n*(3-2*n);return r?e===`overpass`?re*r:-ie*r:0}var xe=e=>e===`station-cross`?se:oe,M=(e,t)=>t===1?e+ue:e;function N(e,t){let n=e.shape;if(n.type===`line`)return{x:n.from.x+y[n.dir]*n.length*t,z:n.from.z+v[n.dir]*n.length*t,tx:y[n.dir],tz:v[n.dir]};let{at:r}=e;if(n.type===`straight`||n.type===`stub`){let e=k[n.a],i=n.type===`stub`?{x:0,z:0}:k[(n.a+2)%4],a=Math.hypot(i.x-e.x,i.z-e.z);return{x:r.x+e.x+(i.x-e.x)*t,z:r.z+e.z+(i.z-e.z)*t,tx:(i.x-e.x)/a,tz:(i.z-e.z)/a}}let i=k[n.a],a=k[n.b],o={x:i.x+a.x,z:i.z+a.z},s=Math.atan2(i.z-o.z,i.x-o.x),c=Math.atan2(a.z-o.z,a.x-o.x),l=c-s;l>Math.PI&&(l-=Math.PI*2),l<-Math.PI&&(l+=Math.PI*2),c=s+l*t;let u=Math.sign(l);return{x:r.x+o.x+Math.cos(c)*.5,z:r.z+o.z+Math.sin(c)*.5,tx:-Math.sin(c)*u,tz:Math.cos(c)*u}}var P=(e,t)=>({x:t%e.size+.5,z:Math.floor(t/e.size)+.5}),Se=e=>e===`overpass`||e===`road-bridge`?1:e===`rail-bridge`?2:null;function F(e,t,n){let r=_(e,t),i=g[e],a=Se(e),o=[];for(let t of r.links){let s=[...new Set(t.map(e=>r.edges[e]))];for(let c of s){let s=t.filter(e=>r.edges[e]===c),l={kind:c,at:n,lift:c===a?e===`overpass`?`overpass`:`bridge`:e===`overpass`?`cutting`:`flat`,junction:!1,station:!1};if(i.station||s.length===1)for(let e of s)o.push({...l,shape:{type:`stub`,a:e},station:!!i.station});else if(s.length===2){let[e,t]=s;o.push({...l,shape:(e+2)%4===t?{type:`straight`,a:e}:{type:`bend`,a:e,b:t}})}else if(s.length===4&&c===2)for(let e of[s[0],s[1]])o.push({...l,junction:!0,shape:{type:`straight`,a:e}});else for(let e=0;e<s.length;e++)for(let t=e+1;t<s.length;t++){let n=s[e],r=s[t];o.push({...l,junction:!0,shape:(n+2)%4===r?{type:`straight`,a:n}:{type:`bend`,a:n,b:r}})}}}return o}var Ce=2.4,I=3.8;function L(e){return e.exits.map(t=>{let n=P(e,t.cell),r={x:n.x+y[t.dir]*.5,z:n.z+v[t.dir]*.5};return{kind:t.route,shape:{type:`line`,from:r,dir:t.dir,length:t.pier?1:t.route===2?I:9},at:n,lift:`flat`,junction:!1,station:!1}})}function R(e,t,n,r){let i=t%e.size,a=Math.floor(t/e.size);return n===2?`h:${i}:${a+1}:${r}`:n===1?`v:${i+1}:${a}:${r}`:n===0?`h:${i}:${a}:${r}`:`v:${i}:${a}:${r}`}function we(e,t,n,r){let i=n.shape;return i.type===`straight`?[R(e,t,i.a,n.kind),R(e,t,(i.a+2)%4,n.kind)]:i.type===`bend`?[R(e,t,i.a,n.kind),R(e,t,i.b,n.kind)]:i.type===`stub`?[R(e,t,i.a,n.kind),`c:${t}:${r}:${n.kind}`]:[``,``]}function Te(e,t){let n=[];t.forEach((t,r)=>{t&&F(t.p,t.o,P(e,r)).forEach((i,a)=>{if(i.kind===3)return;let[o,s]=we(e,r,i,0);n.push({id:`${r}:${t.p}:${t.o}:${a}`,seg:i,a:o,b:s,length:A(i.shape)})})});let r=L(e);e.exits.forEach((t,i)=>{n.push({id:`x:${i}`,seg:r[i],a:R(e,t.cell,t.dir,t.route),b:`x:${i}`,length:A(r[i].shape),exit:{index:i,pier:!!t.pier}})});let i=new Map,a=(e,t)=>{let n=i.get(e);n?n.push(t):i.set(e,[t])};for(let e of n)a(e.a,e),a(e.b,e);let o=[];for(let e of n)e.exit&&(i.get(e.a)?.length??0)>1&&o.push({node:e.b,edge:e,kind:e.seg.kind,pier:e.exit.pier});return{edges:n,at:i,gates:o}}var Ee=(e,t)=>e.a===t?e.b:e.a,z=`
uniform float uSurfaceDetail;
// Capture gradients before any discard or per-pixel material choice. The
// explicit form stays filtered inside the ground's region branches; the
// vec2 overloads keep the same API for models and generated route meshes.
struct RotaSurface {
  vec2 p;
  vec2 dx;
  vec2 dy;
};
RotaSurface rotaSurface(vec2 p) {
  return RotaSurface(p, dFdx(p), dFdy(p));
}
RotaSurface rotaScale(RotaSurface s, vec2 scale) {
  return RotaSurface(s.p * scale, s.dx * scale, s.dy * scale);
}
float rotaHash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}
float rotaNoise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 s = f * f * (3.0 - 2.0 * f);
  return mix(mix(rotaHash(i), rotaHash(i + vec2(1.0, 0.0)), s.x),
             mix(rotaHash(i + vec2(0.0, 1.0)), rotaHash(i + vec2(1.0, 1.0)), s.x), s.y);
}
float rotaVisibility(vec2 dx, vec2 dy) {
  float pixel = max(length(dx), length(dy));
  return 1.0 - smoothstep(0.35, 1.25, pixel);
}
float rotaVisibility(vec2 p) {
  return rotaVisibility(dFdx(p), dFdy(p));
}
float rotaGrain(RotaSurface s) {
  // The first octave remains visible at ordinary phone scale. Skip noise
  // that is completely below a pixel, and fine octaves on a slow client.
  float visible = rotaVisibility(s.dx * 60.0, s.dy * 60.0);
  float grain = 0.0;
  if (visible > 0.0)
    grain = (rotaNoise(s.p * 60.0) - 0.5) * visible;
  if (uSurfaceDetail > 0.45) {
    visible = rotaVisibility(s.dx * 240.0, s.dy * 240.0);
    if (visible > 0.0)
      grain += (rotaNoise(s.p * 240.0) - 0.5) * visible * 0.5;
  }
  if (uSurfaceDetail > 0.8) {
    visible = rotaVisibility(s.dx * 560.0, s.dy * 560.0);
    if (visible > 0.0)
      grain += (rotaNoise(s.p * 560.0) - 0.5) * visible * 0.25;
  }
  return grain;
}
float rotaGrain(vec2 p) {
  return rotaGrain(rotaSurface(p));
}
// Running-bond blocks with filtered recessed joints, worn rims and a stable
// colour per block. Return brightness relative to the material's own tint.
float rotaBlocks(RotaSurface s, vec2 size, vec2 joint, float recess, float variation) {
  float coverage = (1.0 - 2.0 * joint.x) * (1.0 - 2.0 * joint.y);
  float mean = mix(recess, 0.94, coverage);
  float visible = rotaVisibility(s.dx / size, s.dy / size);
  if (visible == 0.0) return mean;
  vec2 q = s.p / size;
  float row = floor(q.y);
  q.x += mod(row, 2.0) * 0.5;
  vec2 f = fract(q), edge = min(f, 1.0 - f);
  vec2 aa = clamp((abs(s.dx) + abs(s.dy)) / size, vec2(0.001), vec2(0.5));
  vec2 fill = smoothstep(joint - aa * 0.5, joint + aa * 0.5, edge);
  float solid = fill.x * fill.y;
  float tone = 0.94 + (rotaHash(vec2(floor(q.x), row)) - 0.5) * variation;
  vec2 bevel = smoothstep(joint, joint + aa + 0.1, edge);
  float relief = mix(0.83, 1.06, bevel.x * bevel.y);
  float value = mix(recess, tone * relief, solid);
  return mix(mean, value, visible);
}
float rotaBlocks(vec2 p, vec2 size, vec2 joint, float recess, float variation) {
  return rotaBlocks(rotaSurface(p), size, joint, recess, variation);
}
float rotaSetts(RotaSurface s) {
  return rotaBlocks(s, vec2(0.028, 0.021), vec2(0.065, 0.08), 0.46, 0.28)
    + rotaGrain(s) * 0.12;
}
float rotaSetts(vec2 p) {
  return rotaSetts(rotaSurface(p));
}
float rotaFlags(RotaSurface s) {
  return rotaBlocks(s, vec2(0.12, 0.09), vec2(0.018, 0.022), 0.65, 0.16)
    + rotaGrain(s) * 0.08;
}
float rotaFlags(vec2 p) {
  return rotaFlags(rotaSurface(p));
}
float rotaBrick(RotaSurface s) {
  return rotaBlocks(s, vec2(0.015, 0.007), vec2(0.035, 0.065), 1.24, 0.25)
    + rotaGrain(s) * 0.1;
}
float rotaBrick(vec2 p) {
  return rotaBrick(rotaSurface(p));
}
float rotaSlate(RotaSurface s) {
  return rotaBlocks(s, vec2(0.018, 0.014), vec2(0.022, 0.045), 0.48, 0.22)
    + rotaGrain(s) * 0.07;
}
float rotaSlate(vec2 p) {
  return rotaSlate(rotaSurface(p));
}
float rotaEarth(RotaSurface s) {
  // Cinder grains and little clods, with variation at several scales.
  return 0.96 + (rotaNoise(s.p * 23.0) - 0.5) * 0.16
    + rotaGrain(s) * 0.27;
}
float rotaEarth(vec2 p) {
  return rotaEarth(rotaSurface(p));
}
float rotaGrass(RotaSurface s) {
  return 0.97 + (rotaNoise(s.p * 32.0) - 0.5) * 0.13
    + rotaGrain(rotaScale(s, vec2(0.7, 1.6))) * 0.28;
}
float rotaGrass(vec2 p) {
  return rotaGrass(rotaSurface(p));
}
float rotaBallast(RotaSurface s) {
  return rotaBlocks(s, vec2(0.011, 0.009), vec2(0.06), 0.52, 0.5)
    + rotaGrain(s) * 0.2;
}
float rotaBallast(vec2 p) {
  return rotaBallast(rotaSurface(p));
}
float rotaWood(vec2 p) {
  float wav = rotaNoise(p * vec2(17.0, 4.0)) * 0.003;
  vec2 q = vec2((p.x + wav) * 350.0, p.y * 7.0);
  float grain = (rotaNoise(q) - 0.5) * rotaVisibility(q);
  return 0.96 + grain * 0.22 + rotaGrain(p) * 0.06;
}
// A subtle normal perturbation from the material relief in view space.
// It uses the surface's derivatives, including instanced and curved meshes.
vec3 rotaRelief(vec3 n, vec3 position, float height) {
  vec3 dx = dFdx(position), dy = dFdy(position);
  vec3 r1 = cross(dy, n), r2 = cross(n, dx);
  float det = dot(dx, r1);
  vec3 grad = sign(det) * (dFdx(height) * r1 + dFdy(height) * r2);
  return normalize(abs(det) * n - grad);
}
`,De={grass:1.2,field:.9,asphalt:.6,ballast:.3,brick:.14,roof:.12,slate:.12,plaster:.25,wood:.12,stone:.2,rock:.6,foliage:.22,bark:.1,sand:.8,cobble:.2},Oe={brick:`rotaBrick`,roof:`rotaSlate`,slate:`rotaSlate`,stone:`rotaFlags`,cobble:`rotaSetts`,ballast:`rotaBallast`,grass:`rotaGrass`,foliage:`rotaGrass`,field:`rotaEarth`,sand:`rotaEarth`,asphalt:`rotaEarth`,rock:`rotaEarth`,plaster:`rotaEarth`,wood:`rotaWood`,bark:`rotaWood`};function ke(e){if(e.hasAttribute(`aRotaWindow`))return;let t=e.getAttribute(`position`),n=new Int32Array(t.count);for(let e=0;e<t.count;e++)n[e]=e;let r=e=>{for(;n[e]!==e;)n[e]=n[n[e]],e=n[e];return e},i=(e,t)=>{n[r(t)]=r(e)},a=new Map;for(let e=0;e<t.count;e++){let n=`${t.getX(e).toFixed(6)},${t.getY(e).toFixed(6)},${t.getZ(e).toFixed(6)}`,r=a.get(n);r===void 0?a.set(n,e):i(e,r)}let o=e.index,s=o?.count??t.count;for(let e=0;e<s;e+=3){let t=o?o.getX(e):e;i(t,o?o.getX(e+1):e+1),i(t,o?o.getX(e+2):e+2)}let c=new Map,l=new u;for(let e=0;e<t.count;e++){let n=r(e),i=c.get(n);i||(i=new p,c.set(n,i)),i.expandByPoint(l.fromBufferAttribute(t,e))}let f=new Float32Array(t.count*4);for(let e=0;e<t.count;e++){let n=c.get(r(e)),i=n.max.x-n.min.x>n.max.z-n.min.z,a=Math.max(1e-6,i?n.max.x-n.min.x:n.max.z-n.min.z),o=Math.max(1e-6,n.max.y-n.min.y),s=i?t.getX(e)-n.min.x:t.getZ(e)-n.min.z,l=Math.sin((n.min.x+n.max.x)*37.3+(n.min.y+n.max.y)*73.1+(n.min.z+n.max.z)*41.7)*43758.5453;f[e*4]=s/a,f[e*4+1]=(t.getY(e)-n.min.y)/o,f[e*4+2]=l-Math.floor(l),f[e*4+3]=o/a}e.setAttribute(`aRotaWindow`,new d(f,4))}function Ae(e,t,n,r){return e.onBeforeCompile=e=>{e.uniforms.uTownTime=t,e.uniforms.uTownDusk=n,e.vertexShader=e.vertexShader.replace(`void main() {`,`attribute vec4 aRotaWindow;
varying vec4 vRotaWindow;
varying float vWindowLit;
uniform float uTownTime, uTownDusk;
void main() {
  vec4 house = vec4(0.0, 0.0, 0.0, 1.0);
  #ifdef USE_INSTANCING
    house = instanceMatrix * house;
  #endif
  house = modelMatrix * house;
  float seed = fract(aRotaWindow.z + sin(dot(house.xz, vec2(127.1, 311.7))) * 43758.5453);
  vRotaWindow = vec4(aRotaWindow.xy, seed, aRotaWindow.w);
  float period = 38.0 + 86.0 * fract(seed * 31.71);
  float cycle = fract(uTownTime / period + fract(seed * 17.17));
  float occupied = smoothstep(0.01, 0.035, cycle) * (1.0 - smoothstep(0.79, 0.815, cycle));
  float threshold = fract(seed * 7.31) * 0.96;
  float on = smoothstep(threshold - 0.035, threshold + 0.035, 0.025 + uTownDusk * 0.85);
  vWindowLit = on * occupied;
`),e.fragmentShader=e.fragmentShader.replace(`void main() {`,`varying vec4 vRotaWindow;
varying float vWindowLit;
void main() {`).replace(`#include <emissivemap_fragment>`,`#include <emissivemap_fragment>
  vec2 pane = vRotaWindow.xy;
  float seed = vRotaWindow.z;
  float curtain = 0.0;
  ${r?`// Gathered side curtains and a narrow pelmet, confined to the glass.
  if (vRotaWindow.w > 0.65 && fract(seed * 13.7) > 0.23) {
    float width = 0.13 + 0.13 * fract(seed * 23.7) + 0.065 * pow(1.0 - pane.y, 2.0);
    curtain = max(1.0 - smoothstep(width, width + 0.018, min(pane.x, 1.0 - pane.x)), smoothstep(0.9, 0.93, pane.y));
  }`:``}
  vec3 warm = mix(vec3(1.0, 0.60, 0.25), vec3(1.0, 0.79, 0.46), fract(seed * 19.31));
  vec3 cloth = mix(vec3(0.48, 0.40, 0.27), vec3(0.7, 0.62, 0.45), step(0.5, fract(pane.x * 13.0)));
  diffuseColor.rgb = mix(diffuseColor.rgb, cloth, curtain * 0.82);
  totalEmissiveRadiance += warm * vWindowLit * mix(1.65, 0.36, curtain);
`)},e.customProgramCacheKey=()=>`rota-window-light-v1|${r}`,e}function je(e,t,n=!1){return e.onBeforeCompile=e=>{e.uniforms.uTownDusk=t,e.vertexShader=e.vertexShader.replace(`void main() {`,`varying float vRotaLens;
uniform float uTownDusk;
void main() {
  ${n?`// Fixed lanterns light at slightly different hours. Moving vehicle
  // lenses use a common dusk threshold so travel cannot change their light.
  vec4 lamp = vec4(0.0, 0.0, 0.0, 1.0);
  #ifdef USE_INSTANCING
    lamp = instanceMatrix * lamp;
  #endif
  lamp = modelMatrix * lamp;
  float threshold = 0.14 + 0.08 * fract(sin(dot(lamp.xz, vec2(127.1, 311.7))) * 43758.5453);`:`float threshold = 0.28;`}
  vRotaLens = smoothstep(threshold, threshold + 0.28, uTownDusk);
`),e.fragmentShader=e.fragmentShader.replace(`void main() {`,`varying float vRotaLens;
void main() {`).replace(`#include <color_fragment>`,`#include <color_fragment>
 diffuseColor.rgb *= mix(0.7, 2.5, vRotaLens);`)},e.customProgramCacheKey=()=>`rota-lens-dusk-v3|${n}`,e}var Me={afternoon:{sun:`#ffdcaa`,sky:`#e9e2d4`,ground:`#8f8272`,haze:`#e4d6bd`,background:`#e4d6bd`},evening:{sun:`#ffc68b`,sky:`#ccd4dc`,ground:`#948d84`,haze:`#a0a8ad`,background:`#969ca4`},blueHour:{sun:`#ffb172`,sky:`#c0d3ee`,ground:`#93949e`,haze:`#6d829a`,background:`#3d5675`}},Ne={sun:`#ffd0a1`,sky:`#d6dcdf`,ground:`#b7ad9e`,haze:`#89959d`,background:`#5f6f7d`};function B(e){let t=Math.max(0,Math.min(1,(e-.55)/.45));return t*t*(3-2*t)}function Pe(e,t){let n=Number.isFinite(e)?Math.max(0,Math.min(1,e)):0,r=B(n);return t.late=r,t.sunHeight=.95-n*.65+r*.22,t.sunIntensity=2.5-n*1.3-r*.82,t.skyIntensity=1.5+n*.4+r*.45,t.shadowIntensity=1-r*.84,t.shadowRadius=1+r*2,t}var V=2.2,Fe=class{constructor(){this.value=0,this.target=0,this.from=0,this.elapsed=V}set(e,t=!1){let n=Number.isFinite(e)?Math.max(0,Math.min(1,e)):0;t?(this.value=this.target=this.from=n,this.elapsed=V):n!==this.target&&(this.from=this.value,this.target=n,this.elapsed=0)}tick(e){if(this.value===this.target)return!1;this.elapsed=Math.min(V,this.elapsed+Math.max(0,Number.isFinite(e)?e:0));let t=this.elapsed/V;return this.value=this.from+(this.target-this.from)*t*t*(3-2*t),!0}},Ie=[{main:`#2d5fa8`,dark:`#1b3766`},{main:`#a8344c`,dark:`#5e1c2b`},{main:`#2f7d4f`,dark:`#1a4a2e`},{main:`#c27a24`,dark:`#7a4a12`},{main:`#6550a8`,dark:`#3a2d66`},{main:`#21808f`,dark:`#124a54`}],Le={grass:[1.05,.04],foliage:[1.1,.05],field:[1.05,.04],slate:[1,.06],stone:[1,.06],rock:[1,.06],metal:[.9,.12],chrome:[.7,.2],glass:[1,0]},Re={white:`#f4f1ea`,black:`#17181b`,dark:`#2a2d33`,grey:`#a9a9a9`,red:`#c63a2c`,lamp:`#ffd38a`,window:`#ffcf86`,cream:`#f1e6cc`,brass:`#d9a74a`,steel:`#c9ced6`,iron:`#4b4d52`};function ze(e,t,n){let r=Ie[t%Ie.length];return e===`team`?r.main:e===`team2`?r.dark:n??Re[e]??`#cccccc`}function Be(e,t){let n=new c(e),[r,i]=Le[t]??[1,.04],a={h:0,s:0,l:0};return n.getHSL(a),a.s=Math.min(.9,a.s*r),a.l+=(1-a.l)*i,a.l=Math.max(a.l,t===`rubber`||t===`plain`?.1:.16),n.setHSL(a.h,a.s,a.l)}var H=null;function Ve(){if(H)return H;let e=[96,178,255],n=new Uint8Array(e.length*4);return e.forEach((e,t)=>n.set([e,e,e,255],t*4)),H=new t(n,e.length,1,f),H.minFilter=H.magFilter=a,H.generateMipmaps=!1,H.needsUpdate=!0,H}function U(e,t={}){let n=new i({color:new c(e),gradientMap:Ve(),vertexColors:t.vertexColors??!1});return t.emissive&&(n.emissive=new c(t.emissive),n.emissiveIntensity=t.glow??1),n}function He(e){if(e.userData.softAO)return;e.userData.softAO=!0;let t=e.getAttribute(`color`);if(!t){let t=new Float32Array(e.getAttribute(`position`).count*3).fill(1);e.setAttribute(`color`,new d(t,3));return}for(let e=0;e<t.count;e++)for(let n=0;n<t.itemSize&&n<3;n++){let r=t.getComponent(e,n);t.setComponent(e,n,.62+.38*r)}t.needsUpdate=!0}var Ue=class{constructor(e={}){this.textures=e,this.cache=new Map,this.detail={value:1},this.time={value:0},this.dusk={value:0},this.late={value:0}}surface(e,t,n){let r=Oe[t];return r?(e.onBeforeCompile=e=>{e.uniforms.uSurfaceDetail=this.detail,e.uniforms.uTownDusk=this.dusk,e.uniforms.uLateDusk=this.late,e.vertexShader=e.vertexShader.replace(`void main() {`,`varying vec2 vSurfaceUv;
varying vec3 vSurfaceWorld, vSurfaceNormal;
void main() {`).replace(`#include <project_vertex>`,`#include <project_vertex>
  vSurfaceUv = uv;
  vec4 surfacePosition = vec4(transformed, 1.0);
  #ifdef USE_INSTANCING
    surfacePosition = instanceMatrix * surfacePosition;
  #endif
  vSurfaceWorld = (modelMatrix * surfacePosition).xyz;
  vSurfaceNormal = inverseTransformDirection(transformedNormal, viewMatrix);`),e.fragmentShader=e.fragmentShader.replace(`void main() {`,`varying vec2 vSurfaceUv;
varying vec3 vSurfaceWorld, vSurfaceNormal;
uniform float uTownDusk, uLateDusk;
${z}
void main() {`).replace(`#include <map_fragment>`,`#include <map_fragment>
  vec3 surfaceAxes = abs(normalize(vSurfaceNormal));
  vec2 surfaceCoord = ${n===void 0?`surfaceAxes.y > max(surfaceAxes.x, surfaceAxes.z) ? vSurfaceWorld.xz
      : surfaceAxes.x > surfaceAxes.z ? vSurfaceWorld.zy : vSurfaceWorld.xy`:`vSurfaceUv * ${n.toFixed(4)}`};
  float surfaceValue = ${r}(surfaceCoord);
  diffuseColor.rgb *= surfaceValue;
  ${t===`cobble`?`diffuseColor.rgb *= mix(vec3(1.0), vec3(1.04, 1.03, 0.91), uLateDusk);`:``}`).replace(`#include <emissivemap_fragment>`,`#include <emissivemap_fragment>
 totalEmissiveRadiance += diffuseColor.rgb * (uTownDusk * 0.12 + uLateDusk * 0.10);`).replace(`#include <opaque_fragment>`,`// Preserve the material hue under blue-hour fill, at the same
  // luminance. Slate remains grey-blue and cobbles remain a warm grey.
  float lightValue = dot(outgoingLight, vec3(0.2126, 0.7152, 0.0722));
  float materialValue = max(0.001, dot(diffuseColor.rgb, vec3(0.2126, 0.7152, 0.0722)));
  vec3 faithful = diffuseColor.rgb * (lightValue / materialValue);
  outgoingLight = mix(outgoingLight, faithful, uLateDusk * ${t===`cobble`?`0.85`:t===`slate`?`0.70`:`0.42`});
  #include <opaque_fragment>`).replace(`#include <normal_fragment_maps>`,`#include <normal_fragment_maps>
  if (uSurfaceDetail > 0.45)
    normal = rotaRelief(normal, -vViewPosition, surfaceValue * 0.00012);`)},e.customProgramCacheKey=()=>`rota-surface-v2|${t}|${n??`world`}`,e):e}tiled(e,t,n={}){let r=`tiled|${e}|${t}|${n.vertexColors??``}`,i=this.cache.get(r);if(i)return i;let a=this.surface(U(t,{vertexColors:n.vertexColors}),e);return a.name=r,this.cache.set(r,a),a}get(e,t=0,n){let[r,i=``]=e.split(`:`),a=`${e}${i===`team`||i===`team2`?`@${t}`:``}|${n??``}`,o=this.cache.get(a);if(o)return o;let s=this.make(r,i,t,n);return s.name=e,this.cache.set(a,s),s}make(e,t,r,i){let a=ze(t,r,i);if(e===`glow`){let e=new c(a);return je(new n({color:e}),this.dusk)}if(e===`glass`)return U(t===`shed`?`#9fb5bd`:`#5e7682`,{vertexColors:!0,emissive:`#34505e`,glow:.25});if(e===`plain`&&t===`void`)return new n({color:`#1d2a24`});let o=t===`team`||t===`team2`?new c(a):Be(a,e);return this.surface(U(o,{vertexColors:!0}),e,De[e])}dress(e,t=0,n){let r=/^(terrace_|cottage|shop|corner_)/.test(e.name),i=r||/^(mill_|warehouse_|works_shed|engine_shed|goods_|station_|town_hall|market_hall|chapel|bank|school)/.test(e.name);return e.traverse(a=>{let o=a;if(!o.isMesh)return;let s=a=>{let s=a.name||`plain:grey`;if(n&&s.endsWith(`:body`))return this.get(s,t,n);if(i&&s.startsWith(`glass:`))return ke(o.geometry),this.windows(r,s);let c=a.userData.hex;return s.startsWith(`glow:`)&&(i||e.name===`gas_lamp`)?this.lamp(s,c):this.get(s,t,c)};o.material=Array.isArray(o.material)?o.material.map(s):s(o.material),He(o.geometry),o.castShadow=!0,o.receiveShadow=!0}),e}lamp(e,t){let r=`stationary-lamp|${e}|${t??``}`,i=this.cache.get(r);if(i)return i;let a=je(new n({color:ze(e.split(`:`)[1]??``,0,t)}),this.dusk,!0);return a.name=e,this.cache.set(r,a),a}windows(e,t=`glass:town-row`){let n=`windows|${e}|${t}`,r=this.cache.get(n);if(r)return r;let i=Ae(U(`#5e7682`,{vertexColors:!0,emissive:`#34505e`,glow:.12}),this.time,this.dusk,e);return i.name=t,this.cache.set(n,i),i}tick(e,t){this.time.value=e,this.dusk.value=t,this.late.value=B(t)}dispose(){for(let e of this.cache.values())e.dispose();this.cache.clear()}},We=.025,W=.042;function G(e,t=0,n=1,r=.025){let i=A(e.shape)*(n-t),a=Math.max(2,Math.ceil(i/r)+1),o=[];for(let r=0;r<a;r++){let s=t+(n-t)*r/(a-1),c=N(e,s);o.push({x:c.x,z:c.z,tx:c.tx,tz:c.tz,y:j(e.lift,s),s:i*r/(a-1),t:s})}return o}function K(t,n){let r=[],i=[],a=t.map(e=>n(e)),o=a[0].length;for(let e=0;e<o-1;e++){let n=r.length/3;for(let n=0;n<t.length;n++){let i=t[n],o=-i.tz,s=i.tx;for(let[t,c]of[a[n][e],a[n][e+1]])r.push(i.x+o*t,c,i.z+s*t)}for(let e=0;e<t.length-1;e++){let t=n+e*2,r=t+1,a=t+2,o=t+3;i.push(t,r,a,r,o,a)}}let s=new m;return s.setAttribute(`position`,new e(r,3)),s.setIndex(i),s.computeVertexNormals(),s}var q=e=>e.y>.02&&Math.abs(e.t-.5)*1<.14?e.y-We:-.004,J=e=>e.y>.004,Ge=e=>[[-x,C+e.y],[x,C+e.y]],Y=e=>t=>{let n=x*e,r=S*e,i=w+t.y,a=[[n,C+t.y],[n,i],[r,i]];return J(t)&&a.push([r,i+W],[r+.012*e,i+W]),a.push([r+(J(t)?.012*e:0),q(t)]),e===1?a:a.reverse()},X=.009,Ke=e=>t=>{let n=x*e,r=[[n-4e-4*e,C+t.y],[n-4e-4*e,w+t.y+7e-4],[n+X*e,w+t.y+7e-4]];return e===1?r:r.reverse()},qe=e=>t=>{let n=x*e,r=[[n-.014*e,C+t.y+4e-4],[n-4e-4*e,C+t.y+4e-4]];return e===1?r:r.reverse()},Je=e=>[[S+.012,q(e)],[-S-.012,q(e)]],Ye=e=>[[-E-.01,-.004+e.y],[-E+.022,D+e.y],[E-.022,D+e.y],[E+.01,-.004+e.y]],Xe=e=>t=>{let n=e*T/2,r=D+.006+t.y,i=te+t.y;return[[n-.0055,r],[n-.0055,i],[n+.0055,i],[n+.0055,r]]},Ze=e=>[[-O,e.y-.002],[O,e.y-.002]],Qe=e=>t=>{let n=O*e,r=[[n,t.y-.004],[n,0],[n+.02*e,0]];return e===1?r:r.reverse()},$e=(e,t,n)=>r=>{let i=e*t,a=[[i,r.y+.004],[i,r.y+n],[i+.014*t,r.y+n],[i+.014*t,r.y-.03]];return t===1?a:a.reverse()};function et(e){let t=e[e.length-1].s,n=Math.max(1,Math.floor(t/.06)),i=new l(.155,.008,.024),a=[],o=new h,c=new s,d=new r(0,0,0,`YXZ`),f=0;for(let r=0;r<n;r++){let s=(r+.5)/n*t;for(;f<e.length-2&&e[f+1].s<s;)f++;let l=e[f],p=e[f+1],m=(s-l.s)/Math.max(1e-6,p.s-l.s),h=l.x+(p.x-l.x)*m,g=l.z+(p.z-l.z)*m,_=l.y+(p.y-l.y)*m,v=Math.atan2(p.y-l.y,Math.max(1e-6,p.s-l.s));d.set(v,Math.atan2(-l.tx,-l.tz),0),c.setFromEuler(d),o.compose(new u(h,D+.004+_,g),c,new u(1,1,1)),a.push(i.clone().applyMatrix4(o))}i.dispose();let p=b(a);for(let e of a)e.dispose();return p}function tt(e){return{setts:e.tiled(`cobble`,`#5a5a5e`),flags:e.tiled(`stone`,`#c2b8a4`),ballast:e.tiled(`ballast`,`#776d63`),sleeper:e.tiled(`wood`,`#4d3c30`),rail:e.tiled(`metal`,`#c9cdd2`),brick:e.tiled(`brick`,`#8d4d3b`),coping:e.tiled(`stone`,`#cbb894`),iron:e.tiled(`metal`,`#3e4449`),plank:e.tiled(`wood`,`#7a5a40`),kerb:e.tiled(`stone`,`#82807b`),gutter:e.tiled(`cobble`,`#3d3d41`)}}function Z(e,t,n=!0){if(!e)return null;let r=new o(e,t);return r.castShadow=n,r.receiveShadow=!0,r}function nt(e,t){return e.shape.type===`stub`&&e.station?[0,(.5-M(t,e.kind)+.004)/.5]:[0,1]}function rt(e,t,n,r){let[i,a]=nt(e,r),o=G(e,i,a),s=e.lift!==`flat`;n.push(Z(K(o,Ge),t.setts),Z(K(o,Y(-1)),s?t.brick:t.flags),Z(K(o,Y(1)),s?t.brick:t.flags));for(let e of[-1,1])n.push(Z(K(o,Ke(e)),t.kerb),Z(K(o,qe(e)),t.gutter));if(s){n.push(Z(K(o,e=>[[-S,w+e.y+6e-4],[-x,w+e.y+6e-4]]),t.flags),Z(K(o,e=>[[x,w+e.y+6e-4],[S,w+e.y+6e-4]]),t.flags));for(let e of[-1,1])n.push(Z(K(o,t=>J(t)?[[e*(S-.003),w+t.y+W+.001],[e*(S+.015),w+t.y+W+.001]]:[[e*S,-1],[e*S,-1]]),t.coping));n.push(Z(K(o,Je),t.brick))}}function Q(e,t,n,r){let[i,a]=nt(e,r),o=G(e,i,a,.02);if(n.push(Z(K(o,Ye),t.ballast),Z(et(o),t.sleeper),Z(K(o,Xe(-1)),t.rail),Z(K(o,Xe(1)),t.rail)),e.lift===`cutting`){n.push(Z(K(o,Ze),t.ballast),Z(K(o,Qe(-1)),t.brick),Z(K(o,Qe(1)),t.brick));for(let e of[-1,1])n.push(Z(K(o,()=>[[e*(O-.004),.006],[e*(O+.022),.006]]),t.coping))}if(e.lift===`bridge`)for(let e of[-1,1])n.push(Z(K(o,$e(E+.012,e,.05)),t.iron))}function $(e,t,n,r,i,a){let s=new l(n-e,i+.004,r-t);s.translate((e+n)/2,(i-.004)/2,(t+r)/2);let c=new o(s,a);return c.receiveShadow=!0,c}function it(e,t,n,r){let i=S;for(let a of t){let t=G({kind:1,shape:{type:`stub`,a},at:e,lift:`flat`,junction:!1,station:!1},0,(.5-i)/.5);r.push(Z(K(t,Ge),n.setts),Z(K(t,Y(-1)),n.flags),Z(K(t,Y(1)),n.flags));for(let e of[-1,1])r.push(Z(K(t,Ke(e)),n.kerb),Z(K(t,qe(e)),n.gutter))}let a=x,s=(t,i,a,s)=>{let c=new l(Math.max(X,a-t),w+7e-4-C,Math.max(X,s-i));c.translate(e.x+(t+a)/2,(w+7e-4+C)/2,e.z+(i+s)/2);let u=new o(c,n.kerb);u.receiveShadow=!0,r.push(u)};for(let[e,n]of[[-1,-1],[1,-1],[-1,1],[1,1]]){let r=n*(a+X/2),o=e*(a+X/2);t.includes(e<0?3:1)&&s(Math.min(e*a,e*i),r-X/2,Math.max(e*a,e*i),r+X/2),t.includes(n<0?0:2)&&s(o-X/2,Math.min(n*a,n*i),o+X/2,Math.max(n*a,n*i))}for(let e=0;e<4;e++){if(t.includes(e))continue;let n=e%2==0,r=(e===0||e===3?-1:1)*(a+X/2);n?s(-a,r-X/2,a,r+X/2):s(r-X/2,-a,r+X/2,a)}r.push($(e.x-i,e.z-i,e.x+i,e.z+i,C,n.setts));for(let[t,o]of[[-1,-1],[1,-1],[-1,1],[1,1]])r.push($(e.x+Math.min(t*a,t*i),e.z+Math.min(o*a,o*i),e.x+Math.max(t*a,t*i),e.z+Math.max(o*a,o*i),w,n.flags));let c=[0,1,0,-1],u=[-1,0,1,0];for(let o=0;o<4;o++){if(t.includes(o))continue;let s=c[o],l=u[o],d=s?Math.min(s*a,s*i):-a,f=s?Math.max(s*a,s*i):a,p=l?Math.min(l*a,l*i):-a,m=l?Math.max(l*a,l*i):a;r.push($(e.x+d,e.z+p,e.x+f,e.z+m,w,n.flags))}}function at(e,t,n=.2){let r=[],i=new Map;for(let a of e)if(a.kind!==3){if(a.kind===1&&a.junction){let e=`${a.at.x},${a.at.z}`,t=i.get(e)??new Set;a.shape.type===`straight`&&t.add(a.shape.a).add((a.shape.a+2)%4),a.shape.type===`bend`&&t.add(a.shape.a).add(a.shape.b),i.set(e,t);continue}a.kind===1?rt(a,t,r,n):a.kind===2&&Q(a,t,r,n)}for(let[e,n]of i){let[i,a]=e.split(`,`).map(Number);it({x:i,z:a},[...n],t,r)}for(let n of e)if(n.kind===1&&n.lift===`bridge`){let e=G(n);for(let n of[-1,1])r.push(Z(K(e,$e(S,n,.04)),t.coping))}return r}function ot(e,t,n){let r=[];if(n){let n=G(e);r.push(Z(K(n,()=>[[-.26,-.08],[-.26,.004],[.26,.004],[.26,-.08]]),t.coping))}return e.kind===1?rt(e,t,r,0):Q(e,t,r,0),r}function st(e){let t=new Map;for(let n of e){let e=n;if(!e.isMesh)continue;e.updateMatrix();let r=e.geometry.index?e.geometry.toNonIndexed():e.geometry.clone();r.applyMatrix4(e.matrix);for(let e of Object.keys(r.attributes))e!==`position`&&e!==`normal`&&r.deleteAttribute(e);let i=e.material,a=t.get(i)??{geos:[],shadows:!1};a.geos.push(r),a.shadows||=e.castShadow,t.set(i,a),e.geometry.dispose()}let n=[];for(let[e,{geos:r,shadows:i}]of t){let t=b(r);for(let e of r)e.dispose();if(!t)continue;let a=new o(t,e);a.castShadow=i,a.receiveShadow=!0,n.push(a)}return n}export{he as A,fe as B,N as C,le as D,M as E,ye as F,S as G,C as H,ge as I,ve as J,_e as K,ee as L,se as M,me as N,x as O,pe as P,w as R,F as S,xe as T,ce as U,te as V,ue as W,Ee as _,G as a,j as b,Ne as c,Pe as d,B as f,Ce as g,I as h,at as i,T as j,O as k,Me as l,z as m,st as n,Ue as o,ke as p,ne as q,tt as r,U as s,ot as t,Fe as u,P as v,A as w,Te as x,L as y,de as z};