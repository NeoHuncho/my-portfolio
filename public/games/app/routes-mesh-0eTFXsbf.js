import{d as e,l as t,n,t as r}from"./pieces-kzVvRsg2.js";import{Gi as i,Hn as a,Hr as o,Jr as s,Un as c,Ur as l,Vn as u,Vr as d,Xr as f,Yn as p,di as m,er as h,lr as g,or as _,pi as v}from"./play-DBfx9pYj.js";import{t as y}from"./BufferGeometryUtils-B7wqzOkG.js";var b=.15,x=.2,ee=.075,S=.012,C=.022,te=.09,w=.1,T=.018,ne=.038,re=.13,ie=.13,ae=.12,E=.125,oe=.37,se=.2,ce=.25,le=.2,ue=.26,de=.20600000000000002,fe=.14,pe=1/Math.tan(55*Math.PI/180),D=[{x:0,z:-.5},{x:.5,z:0},{x:0,z:.5},{x:-.5,z:0}],O=e=>e.type===`straight`?1:e.type===`bend`?Math.PI/4:e.type===`stub`?.5:e.length,me=.035;function k(e,t){if(e===`flat`)return 0;if(e===`bridge`){let e=Math.sin(Math.PI*t);return me*e*e}let n=Math.min(1,Math.min(t,1-t)/oe),r=n*n*(3-2*n);return r?e===`overpass`?ie*r:-ae*r:0}var he=e=>e===`station-cross`?ce:se;function A(e,t){let i=e.shape;if(i.type===`line`)return{x:i.from.x+r[i.dir]*i.length*t,z:i.from.z+n[i.dir]*i.length*t,tx:r[i.dir],tz:n[i.dir]};let{at:a}=e;if(i.type===`straight`||i.type===`stub`){let e=D[i.a],n=i.type===`stub`?{x:0,z:0}:D[(i.a+2)%4],r=Math.hypot(n.x-e.x,n.z-e.z);return{x:a.x+e.x+(n.x-e.x)*t,z:a.z+e.z+(n.z-e.z)*t,tx:(n.x-e.x)/r,tz:(n.z-e.z)/r}}let o=D[i.a],s=D[i.b],c={x:o.x+s.x,z:o.z+s.z},l=Math.atan2(o.z-c.z,o.x-c.x),u=Math.atan2(s.z-c.z,s.x-c.x),d=u-l;d>Math.PI&&(d-=Math.PI*2),d<-Math.PI&&(d+=Math.PI*2),u=l+d*t;let f=Math.sign(d);return{x:a.x+c.x+Math.cos(u)*.5,z:a.z+c.z+Math.sin(u)*.5,tx:-Math.sin(u)*f,tz:Math.cos(u)*f}}var j=(e,t)=>({x:t%e.size+.5,z:Math.floor(t/e.size)+.5}),ge=e=>e===`overpass`||e===`road-bridge`?1:e===`rail-bridge`?2:null;function M(n,r,i){let a=t(n,r),o=e[n],s=ge(n),c=[];for(let e of a.links){let t=[...new Set(e.map(e=>a.edges[e]))];for(let r of t){let t=e.filter(e=>a.edges[e]===r),l={kind:r,at:i,lift:r===s?n===`overpass`?`overpass`:`bridge`:n===`overpass`?`cutting`:`flat`,junction:!1,station:!1};if(o.station||t.length===1)for(let e of t)c.push({...l,shape:{type:`stub`,a:e},station:!!o.station});else if(t.length===2){let[e,n]=t;c.push({...l,shape:(e+2)%4===n?{type:`straight`,a:e}:{type:`bend`,a:e,b:n}})}else if(t.length===4&&r===2)for(let e of[t[0],t[1]])c.push({...l,junction:!0,shape:{type:`straight`,a:e}});else for(let e=0;e<t.length;e++)for(let n=e+1;n<t.length;n++){let r=t[e],i=t[n];c.push({...l,junction:!0,shape:(r+2)%4===i?{type:`straight`,a:r}:{type:`bend`,a:r,b:i}})}}}return c}var _e=2.4,N=3.8;function P(e){return e.exits.map(t=>{let i=j(e,t.cell),a={x:i.x+r[t.dir]*.5,z:i.z+n[t.dir]*.5};return{kind:t.route,shape:{type:`line`,from:a,dir:t.dir,length:t.pier?1:t.route===2?N:9},at:i,lift:`flat`,junction:!1,station:!1}})}function F(e,t,n,r){let i=t%e.size,a=Math.floor(t/e.size);return n===2?`h:${i}:${a+1}:${r}`:n===1?`v:${i+1}:${a}:${r}`:n===0?`h:${i}:${a}:${r}`:`v:${i}:${a}:${r}`}function ve(e,t,n,r){let i=n.shape;return i.type===`straight`?[F(e,t,i.a,n.kind),F(e,t,(i.a+2)%4,n.kind)]:i.type===`bend`?[F(e,t,i.a,n.kind),F(e,t,i.b,n.kind)]:i.type===`stub`?[F(e,t,i.a,n.kind),`c:${t}:${r}:${n.kind}`]:[``,``]}function ye(e,t){let n=[];t.forEach((t,r)=>{t&&M(t.p,t.o,j(e,r)).forEach((i,a)=>{if(i.kind===3)return;let[o,s]=ve(e,r,i,0);n.push({id:`${r}:${t.p}:${t.o}:${a}`,seg:i,a:o,b:s,length:O(i.shape)})})});let r=P(e);e.exits.forEach((t,i)=>{n.push({id:`x:${i}`,seg:r[i],a:F(e,t.cell,t.dir,t.route),b:`x:${i}`,length:O(r[i].shape),exit:{index:i,pier:!!t.pier}})});let i=new Map,a=(e,t)=>{let n=i.get(e);n?n.push(t):i.set(e,[t])};for(let e of n)a(e.a,e),a(e.b,e);let o=[];for(let e of n)e.exit&&(i.get(e.a)?.length??0)>1&&o.push({node:e.b,edge:e,kind:e.seg.kind,pier:e.exit.pier});return{edges:n,at:i,gates:o}}var be=(e,t)=>e.a===t?e.b:e.a,I=`
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
`,xe={grass:1.2,field:.9,asphalt:.6,ballast:.3,brick:.14,roof:.12,slate:.12,plaster:.25,wood:.12,stone:.2,rock:.6,foliage:.22,bark:.1,sand:.8,cobble:.2},Se={brick:`rotaBrick`,roof:`rotaSlate`,slate:`rotaSlate`,stone:`rotaFlags`,cobble:`rotaSetts`,ballast:`rotaBallast`,grass:`rotaGrass`,foliage:`rotaGrass`,field:`rotaEarth`,sand:`rotaEarth`,asphalt:`rotaEarth`,rock:`rotaEarth`,plaster:`rotaEarth`,wood:`rotaWood`,bark:`rotaWood`},L=[{main:`#2d5fa8`,dark:`#1b3766`},{main:`#a8344c`,dark:`#5e1c2b`},{main:`#2f7d4f`,dark:`#1a4a2e`},{main:`#c27a24`,dark:`#7a4a12`},{main:`#6550a8`,dark:`#3a2d66`},{main:`#21808f`,dark:`#124a54`}],Ce={grass:[1.05,.04],foliage:[1.1,.05],field:[1.05,.04],slate:[1,.06],stone:[1,.06],rock:[1,.06],metal:[.9,.12],chrome:[.7,.2],glass:[1,0]},we={white:`#f4f1ea`,black:`#17181b`,dark:`#2a2d33`,grey:`#a9a9a9`,red:`#c63a2c`,lamp:`#ffd38a`,window:`#ffcf86`,cream:`#f1e6cc`,brass:`#d9a74a`,steel:`#c9ced6`,iron:`#4b4d52`};function Te(e,t,n){let r=L[t%L.length];return e===`team`?r.main:e===`team2`?r.dark:n??we[e]??`#cccccc`}function Ee(e,t){let n=new p(e),[r,i]=Ce[t]??[1,.04],a={h:0,s:0,l:0};return n.getHSL(a),a.s=Math.min(.9,a.s*r),a.l+=(1-a.l)*i,a.l=Math.max(a.l,t===`rubber`||t===`plain`?.1:.16),n.setHSL(a.h,a.s,a.l)}var R=null;function De(){if(R)return R;let e=[96,178,255],t=new Uint8Array(e.length*4);return e.forEach((e,n)=>t.set([e,e,e,255],n*4)),R=new h(t,e.length,1,v),R.minFilter=R.magFilter=f,R.generateMipmaps=!1,R.needsUpdate=!0,R}function z(e,t={}){let n=new s({color:new p(e),gradientMap:De(),vertexColors:t.vertexColors??!1});return t.emissive&&(n.emissive=new p(t.emissive),n.emissiveIntensity=t.glow??1),n}function Oe(e){if(e.userData.softAO)return;e.userData.softAO=!0;let t=e.getAttribute(`color`);if(!t){let t=new Float32Array(e.getAttribute(`position`).count*3).fill(1);e.setAttribute(`color`,new a(t,3));return}for(let e=0;e<t.count;e++)for(let n=0;n<t.itemSize&&n<3;n++){let r=t.getComponent(e,n);t.setComponent(e,n,.62+.38*r)}t.needsUpdate=!0}var ke=class{constructor(e={}){this.textures=e,this.cache=new Map,this.detail={value:1}}surface(e,t,n){let r=Se[t];return r?(e.onBeforeCompile=e=>{e.uniforms.uSurfaceDetail=this.detail,e.vertexShader=e.vertexShader.replace(`void main() {`,`varying vec2 vSurfaceUv;
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
${I}
void main() {`).replace(`#include <map_fragment>`,`#include <map_fragment>
  vec3 surfaceAxes = abs(normalize(vSurfaceNormal));
  vec2 surfaceCoord = ${n===void 0?`surfaceAxes.y > max(surfaceAxes.x, surfaceAxes.z) ? vSurfaceWorld.xz
      : surfaceAxes.x > surfaceAxes.z ? vSurfaceWorld.zy : vSurfaceWorld.xy`:`vSurfaceUv * ${n.toFixed(4)}`};
  float surfaceValue = ${r}(surfaceCoord);
  diffuseColor.rgb *= surfaceValue;`).replace(`#include <normal_fragment_maps>`,`#include <normal_fragment_maps>
  if (uSurfaceDetail > 0.45)
    normal = rotaRelief(normal, -vViewPosition, surfaceValue * 0.00012);`)},e.customProgramCacheKey=()=>`rota-surface-v1|${t}|${n??`world`}`,e):e}tiled(e,t,n={}){let r=`tiled|${e}|${t}|${n.vertexColors??``}`,i=this.cache.get(r);if(i)return i;let a=this.surface(z(t,{vertexColors:n.vertexColors}),e);return a.name=r,this.cache.set(r,a),a}get(e,t=0,n){let[r,i=``]=e.split(`:`),a=`${e}${i===`team`||i===`team2`?`@${t}`:``}|${n??``}`,o=this.cache.get(a);if(o)return o;let s=this.make(r,i,t,n);return s.name=e,this.cache.set(a,s),s}make(e,t,n,r){let i=Te(t,n,r);if(e===`glow`){let e=new p(i);return new l({color:e.multiplyScalar(1.25)})}if(e===`glass`)return z(t===`shed`?`#9fb5bd`:`#5e7682`,{vertexColors:!0,emissive:`#34505e`,glow:.25});if(e===`plain`&&t===`void`)return new l({color:`#1d2a24`});let a=t===`team`||t===`team2`?new p(i):Ee(i,e);return this.surface(z(a,{vertexColors:!0}),e,xe[e])}dress(e,t=0,n){return e.traverse(e=>{let r=e;if(!r.isMesh)return;let i=e=>{let r=e.name||`plain:grey`;return n&&r.endsWith(`:body`)?this.get(r,t,n):this.get(r,t,e.userData.hex)};r.material=Array.isArray(r.material)?r.material.map(i):i(r.material),Oe(r.geometry),r.castShadow=!0,r.receiveShadow=!0}),e}dispose(){for(let e of this.cache.values())e.dispose();this.cache.clear()}},Ae=.025,B=.042;function V(e,t=0,n=1,r=.025){let i=O(e.shape)*(n-t),a=Math.max(2,Math.ceil(i/r)+1),o=[];for(let r=0;r<a;r++){let s=t+(n-t)*r/(a-1),c=A(e,s);o.push({x:c.x,z:c.z,tx:c.tx,tz:c.tz,y:k(e.lift,s),s:i*r/(a-1),t:s})}return o}function H(e,t){let n=[],r=[],i=e.map(e=>t(e)),a=i[0].length;for(let t=0;t<a-1;t++){let a=n.length/3;for(let r=0;r<e.length;r++){let a=e[r],o=-a.tz,s=a.tx;for(let[e,c]of[i[r][t],i[r][t+1]])n.push(a.x+o*e,c,a.z+s*e)}for(let t=0;t<e.length-1;t++){let e=a+t*2,n=e+1,i=e+2,o=e+3;r.push(e,n,i,n,o,i)}}let o=new c;return o.setAttribute(`position`,new g(n,3)),o.setIndex(r),o.computeVertexNormals(),o}var U=e=>e.y>.02&&Math.abs(e.t-.5)*1<.14?e.y-Ae:-.004,W=e=>e.y>.004,G=e=>[[-b,S+e.y],[b,S+e.y]],K=e=>t=>{let n=b*e,r=x*e,i=C+t.y,a=[[n,S+t.y],[n,i],[r,i]];return W(t)&&a.push([r,i+B],[r+.012*e,i+B]),a.push([r+(W(t)?.012*e:0),U(t)]),e===1?a:a.reverse()},je=e=>[[x+.012,U(e)],[-x-.012,U(e)]],Me=e=>[[-w-.01,-.004+e.y],[-w+.022,T+e.y],[w-.022,T+e.y],[w+.01,-.004+e.y]],q=e=>t=>{let n=e*te/2,r=T+.006+t.y,i=ne+t.y;return[[n-.0055,r],[n-.0055,i],[n+.0055,i],[n+.0055,r]]},Ne=e=>[[-E,e.y-.002],[E,e.y-.002]],J=e=>t=>{let n=E*e,r=[[n,t.y-.004],[n,0],[n+.02*e,0]];return e===1?r:r.reverse()},Y=(e,t,n)=>r=>{let i=e*t,a=[[i,r.y+.004],[i,r.y+n],[i+.014*t,r.y+n],[i+.014*t,r.y-.03]];return t===1?a:a.reverse()};function Pe(e){let t=e[e.length-1].s,n=Math.max(1,Math.floor(t/.06)),r=new u(.155,.008,.024),a=[],o=new d,s=new m,c=new _(0,0,0,`YXZ`),l=0;for(let u=0;u<n;u++){let d=(u+.5)/n*t;for(;l<e.length-2&&e[l+1].s<d;)l++;let f=e[l],p=e[l+1],m=(d-f.s)/Math.max(1e-6,p.s-f.s),h=f.x+(p.x-f.x)*m,g=f.z+(p.z-f.z)*m,_=f.y+(p.y-f.y)*m,v=Math.atan2(p.y-f.y,Math.max(1e-6,p.s-f.s));c.set(v,Math.atan2(-f.tx,-f.tz),0),s.setFromEuler(c),o.compose(new i(h,T+.004+_,g),s,new i(1,1,1)),a.push(r.clone().applyMatrix4(o))}r.dispose();let f=y(a);for(let e of a)e.dispose();return f}function Fe(e){return{setts:e.tiled(`cobble`,`#5a5a5e`),flags:e.tiled(`stone`,`#c2b8a4`),ballast:e.tiled(`ballast`,`#776d63`),sleeper:e.tiled(`wood`,`#4d3c30`),rail:e.tiled(`metal`,`#c9cdd2`),brick:e.tiled(`brick`,`#8d4d3b`),coping:e.tiled(`stone`,`#cbb894`),iron:e.tiled(`metal`,`#3e4449`),plank:e.tiled(`wood`,`#7a5a40`)}}function X(e,t,n=!0){if(!e)return null;let r=new o(e,t);return r.castShadow=n,r.receiveShadow=!0,r}function Z(e,t){return e.shape.type===`stub`&&e.station?[0,(.5-t+.004)/.5]:[0,1]}function Ie(e,t,n,r){let[i,a]=Z(e,r),o=V(e,i,a),s=e.lift!==`flat`;if(n.push(X(H(o,G),t.setts),X(H(o,K(-1)),s?t.brick:t.flags),X(H(o,K(1)),s?t.brick:t.flags)),s){n.push(X(H(o,e=>[[-x,C+e.y+6e-4],[-b,C+e.y+6e-4]]),t.flags),X(H(o,e=>[[b,C+e.y+6e-4],[x,C+e.y+6e-4]]),t.flags));for(let e of[-1,1])n.push(X(H(o,t=>W(t)?[[e*(x-.003),C+t.y+B+.001],[e*(x+.015),C+t.y+B+.001]]:[[e*x,-1],[e*x,-1]]),t.coping));n.push(X(H(o,je),t.brick))}}function Q(e,t,n,r){let[i,a]=Z(e,r),o=V(e,i,a,.02);if(n.push(X(H(o,Me),t.ballast),X(Pe(o),t.sleeper),X(H(o,q(-1)),t.rail),X(H(o,q(1)),t.rail)),e.lift===`cutting`){n.push(X(H(o,Ne),t.ballast),X(H(o,J(-1)),t.brick),X(H(o,J(1)),t.brick));for(let e of[-1,1])n.push(X(H(o,()=>[[e*(E-.004),.006],[e*(E+.022),.006]]),t.coping))}if(e.lift===`bridge`)for(let e of[-1,1])n.push(X(H(o,Y(w+.012,e,.05)),t.iron))}function $(e,t,n,r,i,a){let s=new u(n-e,i+.004,r-t);s.translate((e+n)/2,(i-.004)/2,(t+r)/2);let c=new o(s,a);return c.receiveShadow=!0,c}function Le(e,t,n,r){let i=x;for(let a of t){let t=V({kind:1,shape:{type:`stub`,a},at:e,lift:`flat`,junction:!1,station:!1},0,(.5-i)/.5);r.push(X(H(t,G),n.setts),X(H(t,K(-1)),n.flags),X(H(t,K(1)),n.flags))}let a=b;r.push($(e.x-i,e.z-i,e.x+i,e.z+i,S,n.setts));for(let[t,o]of[[-1,-1],[1,-1],[-1,1],[1,1]])r.push($(e.x+Math.min(t*a,t*i),e.z+Math.min(o*a,o*i),e.x+Math.max(t*a,t*i),e.z+Math.max(o*a,o*i),C,n.flags));let o=[0,1,0,-1],s=[-1,0,1,0];for(let c=0;c<4;c++){if(t.includes(c))continue;let l=o[c],u=s[c],d=l?Math.min(l*a,l*i):-a,f=l?Math.max(l*a,l*i):a,p=u?Math.min(u*a,u*i):-a,m=u?Math.max(u*a,u*i):a;r.push($(e.x+d,e.z+p,e.x+f,e.z+m,C,n.flags))}}function Re(e,t,n=.2){let r=[],i=new Map;for(let a of e)if(a.kind!==3){if(a.kind===1&&a.junction){let e=`${a.at.x},${a.at.z}`,t=i.get(e)??new Set;a.shape.type===`straight`&&t.add(a.shape.a).add((a.shape.a+2)%4),a.shape.type===`bend`&&t.add(a.shape.a).add(a.shape.b),i.set(e,t);continue}a.kind===1?Ie(a,t,r,n):a.kind===2&&Q(a,t,r,n)}for(let[e,n]of i){let[i,a]=e.split(`,`).map(Number);Le({x:i,z:a},[...n],t,r)}for(let n of e)if(n.kind===1&&n.lift===`bridge`){let e=V(n);for(let n of[-1,1])r.push(X(H(e,Y(x,n,.04)),t.coping))}return r}function ze(e,t,n){let r=[];if(n){let n=V(e);r.push(X(H(n,()=>[[-.26,-.08],[-.26,.004],[.26,.004],[.26,-.08]]),t.coping))}return e.kind===1?Ie(e,t,r,0):Q(e,t,r,0),r}function Be(e){let t=new Map;for(let n of e){let e=n;if(!e.isMesh)continue;e.updateMatrix();let r=e.geometry.index?e.geometry.toNonIndexed():e.geometry.clone();r.applyMatrix4(e.matrix);for(let e of Object.keys(r.attributes))e!==`position`&&e!==`normal`&&r.deleteAttribute(e);let i=e.material,a=t.get(i)??{geos:[],shadows:!1};a.geos.push(r),a.shadows||=e.castShadow,t.set(i,a),e.geometry.dispose()}let n=[];for(let[e,{geos:r,shadows:i}]of t){let t=y(r);for(let e of r)e.dispose();if(!t)continue;let a=new o(t,e);a.castShadow=i,a.receiveShadow=!0,n.push(a)}return n}export{fe as A,pe as C,x as D,S as E,de as O,le as S,ee as T,A as _,V as a,b,I as c,be as d,j as f,M as g,ye as h,Re as i,re as k,N as l,k as m,Be as n,ke as o,P as p,Fe as r,z as s,ze as t,_e as u,O as v,ue as w,E as x,he as y};