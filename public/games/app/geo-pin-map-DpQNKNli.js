import{a as e,n as t,t as n}from"./jsx-runtime-B-hcVAMW.js";import{Ai as r,Bn as i,Br as a,Ci as o,Fi as s,Fn as c,Gi as l,Hi as u,Hr as d,Ii as f,In as ee,Ki as p,Or as m,Pi as te,Pn as h,Qn as g,Ri as ne,Rr as _,Sr as v,Un as y,Ur as re,Vr as ie,Wi as b,Wn as ae,Yi as oe,ai as se,di as ce,fr as le,gi as ue,hi as de,ii as fe,ji as x,ki as pe,lr as S,vr as C,wi as me,xi as he,yr as w}from"./play-DBfx9pYj.js";var T=e(t(),1),E={type:`change`},D={type:`start`},O={type:`end`},ge=new de,_e=new se,k=Math.cos(70*a.DEG2RAD),A=new l,j=2*Math.PI,M={NONE:-1,ROTATE:0,DOLLY:1,PAN:2,TOUCH_ROTATE:3,TOUCH_PAN:4,TOUCH_DOLLY_PAN:5,TOUCH_DOLLY_ROTATE:6},N=1e-6,ve=class extends g{constructor(e,t=null){super(e,t),this.state=M.NONE,this.target=new l,this.cursor=new l,this.minDistance=0,this.maxDistance=1/0,this.minZoom=0,this.maxZoom=1/0,this.minTargetRadius=0,this.maxTargetRadius=1/0,this.minPolarAngle=0,this.maxPolarAngle=Math.PI,this.minAzimuthAngle=-1/0,this.maxAzimuthAngle=1/0,this.enableDamping=!1,this.dampingFactor=.05,this.enableZoom=!0,this.zoomSpeed=1,this.enableRotate=!0,this.rotateSpeed=1,this.keyRotateSpeed=1,this.enablePan=!0,this.panSpeed=1,this.screenSpacePanning=!0,this.keyPanSpeed=7,this.zoomToCursor=!1,this.autoRotate=!1,this.autoRotateSpeed=2,this.keys={LEFT:`ArrowLeft`,UP:`ArrowUp`,RIGHT:`ArrowRight`,BOTTOM:`ArrowDown`},this.mouseButtons={LEFT:_.ROTATE,MIDDLE:_.DOLLY,RIGHT:_.PAN},this.touches={ONE:f.ROTATE,TWO:f.DOLLY_PAN},this.target0=this.target.clone(),this.position0=this.object.position.clone(),this.zoom0=this.object.zoom,this._cursorStyle=`auto`,this._domElementKeyEvents=null,this._lastPosition=new l,this._lastQuaternion=new ce,this._lastTargetPosition=new l,this._quat=new ce().setFromUnitVectors(e.up,new l(0,1,0)),this._quatInverse=this._quat.clone().invert(),this._spherical=new x,this._sphericalDelta=new x,this._scale=1,this._panOffset=new l,this._rotateStart=new b,this._rotateEnd=new b,this._rotateDelta=new b,this._panStart=new b,this._panEnd=new b,this._panDelta=new b,this._dollyStart=new b,this._dollyEnd=new b,this._dollyDelta=new b,this._dollyDirection=new l,this._mouse=new b,this._performCursorZoom=!1,this._pointers=[],this._pointerPositions={},this._controlActive=!1,this._onPointerMove=P.bind(this),this._onPointerDown=ye.bind(this),this._onPointerUp=be.bind(this),this._onContextMenu=Ee.bind(this),this._onMouseWheel=Ce.bind(this),this._onKeyDown=F.bind(this),this._onTouchStart=we.bind(this),this._onTouchMove=Te.bind(this),this._onMouseDown=xe.bind(this),this._onMouseMove=Se.bind(this),this._interceptControlDown=De.bind(this),this._interceptControlUp=Oe.bind(this),this.domElement!==null&&this.connect(this.domElement),this.update()}set cursorStyle(e){this._cursorStyle=e,e===`grab`?this.domElement.style.cursor=`grab`:this.domElement.style.cursor=`auto`}get cursorStyle(){return this._cursorStyle}connect(e){super.connect(e),this.domElement.addEventListener(`pointerdown`,this._onPointerDown),this.domElement.addEventListener(`pointercancel`,this._onPointerUp),this.domElement.addEventListener(`contextmenu`,this._onContextMenu),this.domElement.addEventListener(`wheel`,this._onMouseWheel,{passive:!1}),this.domElement.getRootNode().addEventListener(`keydown`,this._interceptControlDown,{passive:!0,capture:!0}),this.domElement.style.touchAction=`none`}disconnect(){this.state=M.NONE,this.domElement.removeEventListener(`pointerdown`,this._onPointerDown),this.domElement.ownerDocument.removeEventListener(`pointermove`,this._onPointerMove),this.domElement.ownerDocument.removeEventListener(`pointerup`,this._onPointerUp),this.domElement.removeEventListener(`pointercancel`,this._onPointerUp),this.domElement.removeEventListener(`wheel`,this._onMouseWheel),this.domElement.removeEventListener(`contextmenu`,this._onContextMenu),this.stopListenToKeyEvents();let e=this.domElement.getRootNode();e.removeEventListener(`keydown`,this._interceptControlDown,{capture:!0}),e.removeEventListener(`keyup`,this._interceptControlUp,{capture:!0}),this._controlActive=!1,this._pointers.length=0,this._pointerPositions={},this.domElement.style.touchAction=``,this.domElement.style.cursor=`auto`}dispose(){this.disconnect()}getPolarAngle(){return this._spherical.phi}getAzimuthalAngle(){return this._spherical.theta}getDistance(){return this.object.position.distanceTo(this.target)}listenToKeyEvents(e){e.addEventListener(`keydown`,this._onKeyDown),this._domElementKeyEvents=e}stopListenToKeyEvents(){this._domElementKeyEvents!==null&&(this._domElementKeyEvents.removeEventListener(`keydown`,this._onKeyDown),this._domElementKeyEvents=null)}saveState(){this.target0.copy(this.target),this.position0.copy(this.object.position),this.zoom0=this.object.zoom}reset(){this.target.copy(this.target0),this.object.position.copy(this.position0),this.object.zoom=this.zoom0,this.object.updateProjectionMatrix(),this.dispatchEvent(E),this.update(),this.state=M.NONE}pan(e,t){this._pan(e,t),this.update()}dollyIn(e){this._dollyIn(e),this.update()}dollyOut(e){this._dollyOut(e),this.update()}rotateLeft(e){this._rotateLeft(e),this.update()}rotateUp(e){this._rotateUp(e),this.update()}update(e=null){let t=this.object.position;A.copy(t).sub(this.target),A.applyQuaternion(this._quat),this._spherical.setFromVector3(A),this.autoRotate&&this.state===M.NONE&&this._rotateLeft(this._getAutoRotationAngle(e)),this.enableDamping?(this._spherical.theta+=this._sphericalDelta.theta*this.dampingFactor,this._spherical.phi+=this._sphericalDelta.phi*this.dampingFactor):(this._spherical.theta+=this._sphericalDelta.theta,this._spherical.phi+=this._sphericalDelta.phi);let n=this.minAzimuthAngle,r=this.maxAzimuthAngle;isFinite(n)&&isFinite(r)&&(n<-Math.PI?n+=j:n>Math.PI&&(n-=j),r<-Math.PI?r+=j:r>Math.PI&&(r-=j),n<=r?this._spherical.theta=Math.max(n,Math.min(r,this._spherical.theta)):this._spherical.theta=this._spherical.theta>(n+r)/2?Math.max(n,this._spherical.theta):Math.min(r,this._spherical.theta)),this._spherical.phi=Math.max(this.minPolarAngle,Math.min(this.maxPolarAngle,this._spherical.phi)),this._spherical.makeSafe(),this.enableDamping===!0?this.target.addScaledVector(this._panOffset,this.dampingFactor):this.target.add(this._panOffset),this.target.sub(this.cursor),this.target.clampLength(this.minTargetRadius,this.maxTargetRadius),this.target.add(this.cursor);let i=!1;if(this.zoomToCursor&&this._performCursorZoom||this.object.isOrthographicCamera)this._spherical.radius=this._clampDistance(this._spherical.radius);else{let e=this._spherical.radius;this._spherical.radius=this._clampDistance(this._spherical.radius*this._scale),i=e!=this._spherical.radius}if(A.setFromSpherical(this._spherical),A.applyQuaternion(this._quatInverse),t.copy(this.target).add(A),this.object.lookAt(this.target),this.enableDamping===!0?(this._sphericalDelta.theta*=1-this.dampingFactor,this._sphericalDelta.phi*=1-this.dampingFactor,this._panOffset.multiplyScalar(1-this.dampingFactor)):(this._sphericalDelta.set(0,0,0),this._panOffset.set(0,0,0)),this.zoomToCursor&&this._performCursorZoom){let e=null;if(this.object.isPerspectiveCamera){let t=A.length();e=this._clampDistance(t*this._scale);let n=t-e;this.object.position.addScaledVector(this._dollyDirection,n),this.object.updateMatrixWorld(),i=!!n}else if(this.object.isOrthographicCamera){let t=new l(this._mouse.x,this._mouse.y,0);t.unproject(this.object);let n=this.object.zoom;this.object.zoom=Math.max(this.minZoom,Math.min(this.maxZoom,this.object.zoom/this._scale)),this.object.updateProjectionMatrix(),i=n!==this.object.zoom;let r=new l(this._mouse.x,this._mouse.y,0);r.unproject(this.object),this.object.position.sub(r).add(t),this.object.updateMatrixWorld(),e=A.length()}else console.warn(`WARNING: OrbitControls.js encountered an unknown camera type - zoom to cursor disabled.`),this.zoomToCursor=!1;e!==null&&(this.screenSpacePanning?this.target.set(0,0,-1).transformDirection(this.object.matrix).multiplyScalar(e).add(this.object.position):(ge.origin.copy(this.object.position),ge.direction.set(0,0,-1).transformDirection(this.object.matrix),Math.abs(this.object.up.dot(ge.direction))<k?this.object.lookAt(this.target):(_e.setFromNormalAndCoplanarPoint(this.object.up,this.target),ge.intersectPlane(_e,this.target))))}else if(this.object.isOrthographicCamera){let e=this.object.zoom;this.object.zoom=Math.max(this.minZoom,Math.min(this.maxZoom,this.object.zoom/this._scale)),e!==this.object.zoom&&(this.object.updateProjectionMatrix(),i=!0)}return this._scale=1,this._performCursorZoom=!1,i||this._lastPosition.distanceToSquared(this.object.position)>N||8*(1-this._lastQuaternion.dot(this.object.quaternion))>N||this._lastTargetPosition.distanceToSquared(this.target)>N?(this.dispatchEvent(E),this._lastPosition.copy(this.object.position),this._lastQuaternion.copy(this.object.quaternion),this._lastTargetPosition.copy(this.target),!0):!1}_getAutoRotationAngle(e){return e===null?j/60/60*this.autoRotateSpeed:j/60*this.autoRotateSpeed*e}_getZoomScale(e){let t=Math.abs(e*.01);return .95**(this.zoomSpeed*t)}_rotateLeft(e){this._sphericalDelta.theta-=e}_rotateUp(e){this._sphericalDelta.phi-=e}_panLeft(e,t){A.setFromMatrixColumn(t,0),A.multiplyScalar(-e),this._panOffset.add(A)}_panUp(e,t){this.screenSpacePanning===!0?A.setFromMatrixColumn(t,1):(A.setFromMatrixColumn(t,0),A.crossVectors(this.object.up,A)),A.multiplyScalar(e),this._panOffset.add(A)}_pan(e,t){let n=this.domElement;if(this.object.isPerspectiveCamera){let r=this.object.position;A.copy(r).sub(this.target);let i=A.length();i*=Math.tan(this.object.fov/2*Math.PI/180),this._panLeft(2*e*i/n.clientHeight,this.object.matrix),this._panUp(2*t*i/n.clientHeight,this.object.matrix)}else this.object.isOrthographicCamera?(this._panLeft(e*(this.object.right-this.object.left)/this.object.zoom/n.clientWidth,this.object.matrix),this._panUp(t*(this.object.top-this.object.bottom)/this.object.zoom/n.clientHeight,this.object.matrix)):(console.warn(`WARNING: OrbitControls.js encountered an unknown camera type - pan disabled.`),this.enablePan=!1)}_dollyOut(e){this.object.isPerspectiveCamera||this.object.isOrthographicCamera?this._scale/=e:(console.warn(`WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled.`),this.enableZoom=!1)}_dollyIn(e){this.object.isPerspectiveCamera||this.object.isOrthographicCamera?this._scale*=e:(console.warn(`WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled.`),this.enableZoom=!1)}_updateZoomParameters(e,t){if(!this.zoomToCursor)return;this._performCursorZoom=!0;let n=this.domElement.getBoundingClientRect(),r=e-n.left,i=t-n.top,a=n.width,o=n.height;this._mouse.x=r/a*2-1,this._mouse.y=-(i/o)*2+1,this._dollyDirection.set(this._mouse.x,this._mouse.y,1).unproject(this.object).sub(this.object.position).normalize()}_clampDistance(e){return Math.max(this.minDistance,Math.min(this.maxDistance,e))}_handleMouseDownRotate(e){this._rotateStart.set(e.clientX,e.clientY)}_handleMouseDownDolly(e){this._updateZoomParameters(e.clientX,e.clientX),this._dollyStart.set(e.clientX,e.clientY)}_handleMouseDownPan(e){this._panStart.set(e.clientX,e.clientY)}_handleMouseMoveRotate(e){this._rotateEnd.set(e.clientX,e.clientY),this._rotateDelta.subVectors(this._rotateEnd,this._rotateStart).multiplyScalar(this.rotateSpeed);let t=this.domElement;this._rotateLeft(j*this._rotateDelta.x/t.clientHeight),this._rotateUp(j*this._rotateDelta.y/t.clientHeight),this._rotateStart.copy(this._rotateEnd),this.update()}_handleMouseMoveDolly(e){this._dollyEnd.set(e.clientX,e.clientY),this._dollyDelta.subVectors(this._dollyEnd,this._dollyStart),this._dollyDelta.y>0?this._dollyOut(this._getZoomScale(this._dollyDelta.y)):this._dollyDelta.y<0&&this._dollyIn(this._getZoomScale(this._dollyDelta.y)),this._dollyStart.copy(this._dollyEnd),this.update()}_handleMouseMovePan(e){this._panEnd.set(e.clientX,e.clientY),this._panDelta.subVectors(this._panEnd,this._panStart).multiplyScalar(this.panSpeed),this._pan(this._panDelta.x,this._panDelta.y),this._panStart.copy(this._panEnd),this.update()}_handleMouseWheel(e){this._updateZoomParameters(e.clientX,e.clientY),e.deltaY<0?this._dollyIn(this._getZoomScale(e.deltaY)):e.deltaY>0&&this._dollyOut(this._getZoomScale(e.deltaY)),this.update()}_handleKeyDown(e){let t=!1;switch(e.code){case this.keys.UP:e.ctrlKey||e.metaKey||e.shiftKey?this.enableRotate&&this._rotateUp(j*this.keyRotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(0,this.keyPanSpeed),t=!0;break;case this.keys.BOTTOM:e.ctrlKey||e.metaKey||e.shiftKey?this.enableRotate&&this._rotateUp(-j*this.keyRotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(0,-this.keyPanSpeed),t=!0;break;case this.keys.LEFT:e.ctrlKey||e.metaKey||e.shiftKey?this.enableRotate&&this._rotateLeft(j*this.keyRotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(this.keyPanSpeed,0),t=!0;break;case this.keys.RIGHT:e.ctrlKey||e.metaKey||e.shiftKey?this.enableRotate&&this._rotateLeft(-j*this.keyRotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(-this.keyPanSpeed,0),t=!0}t&&(e.preventDefault(),this.update())}_handleTouchStartRotate(e){if(this._pointers.length===1)this._rotateStart.set(e.pageX,e.pageY);else{let t=this._getSecondPointerPosition(e),n=.5*(e.pageX+t.x),r=.5*(e.pageY+t.y);this._rotateStart.set(n,r)}}_handleTouchStartPan(e){if(this._pointers.length===1)this._panStart.set(e.pageX,e.pageY);else{let t=this._getSecondPointerPosition(e),n=.5*(e.pageX+t.x),r=.5*(e.pageY+t.y);this._panStart.set(n,r)}}_handleTouchStartDolly(e){let t=this._getSecondPointerPosition(e),n=e.pageX-t.x,r=e.pageY-t.y,i=Math.sqrt(n*n+r*r);this._dollyStart.set(0,i)}_handleTouchStartDollyPan(e){this.enableZoom&&this._handleTouchStartDolly(e),this.enablePan&&this._handleTouchStartPan(e)}_handleTouchStartDollyRotate(e){this.enableZoom&&this._handleTouchStartDolly(e),this.enableRotate&&this._handleTouchStartRotate(e)}_handleTouchMoveRotate(e){if(this._pointers.length==1)this._rotateEnd.set(e.pageX,e.pageY);else{let t=this._getSecondPointerPosition(e),n=.5*(e.pageX+t.x),r=.5*(e.pageY+t.y);this._rotateEnd.set(n,r)}this._rotateDelta.subVectors(this._rotateEnd,this._rotateStart).multiplyScalar(this.rotateSpeed);let t=this.domElement;this._rotateLeft(j*this._rotateDelta.x/t.clientHeight),this._rotateUp(j*this._rotateDelta.y/t.clientHeight),this._rotateStart.copy(this._rotateEnd)}_handleTouchMovePan(e){if(this._pointers.length===1)this._panEnd.set(e.pageX,e.pageY);else{let t=this._getSecondPointerPosition(e),n=.5*(e.pageX+t.x),r=.5*(e.pageY+t.y);this._panEnd.set(n,r)}this._panDelta.subVectors(this._panEnd,this._panStart).multiplyScalar(this.panSpeed),this._pan(this._panDelta.x,this._panDelta.y),this._panStart.copy(this._panEnd)}_handleTouchMoveDolly(e){let t=this._getSecondPointerPosition(e),n=e.pageX-t.x,r=e.pageY-t.y,i=Math.sqrt(n*n+r*r);this._dollyEnd.set(0,i),this._dollyDelta.set(0,(this._dollyEnd.y/this._dollyStart.y)**+this.zoomSpeed),this._dollyOut(this._dollyDelta.y),this._dollyStart.copy(this._dollyEnd);let a=(e.pageX+t.x)*.5,o=(e.pageY+t.y)*.5;this._updateZoomParameters(a,o)}_handleTouchMoveDollyPan(e){this.enableZoom&&this._handleTouchMoveDolly(e),this.enablePan&&this._handleTouchMovePan(e)}_handleTouchMoveDollyRotate(e){this.enableZoom&&this._handleTouchMoveDolly(e),this.enableRotate&&this._handleTouchMoveRotate(e)}_addPointer(e){this._pointers.push(e.pointerId)}_removePointer(e){delete this._pointerPositions[e.pointerId];for(let t=0;t<this._pointers.length;t++)if(this._pointers[t]==e.pointerId){this._pointers.splice(t,1);return}}_isTrackingPointer(e){for(let t=0;t<this._pointers.length;t++)if(this._pointers[t]==e.pointerId)return!0;return!1}_trackPointer(e){let t=this._pointerPositions[e.pointerId];t===void 0&&(t=new b,this._pointerPositions[e.pointerId]=t),t.set(e.pageX,e.pageY)}_getSecondPointerPosition(e){let t=e.pointerId===this._pointers[0]?this._pointers[1]:this._pointers[0];return this._pointerPositions[t]}_customWheelEvent(e){let t=e.deltaMode,n={clientX:e.clientX,clientY:e.clientY,deltaY:e.deltaY};switch(t){case 1:n.deltaY*=16;break;case 2:n.deltaY*=100}return e.ctrlKey&&!this._controlActive&&(n.deltaY*=10),n}};function ye(e){this.enabled!==!1&&(this._pointers.length===0&&(this.domElement.setPointerCapture(e.pointerId),this.domElement.ownerDocument.addEventListener(`pointermove`,this._onPointerMove),this.domElement.ownerDocument.addEventListener(`pointerup`,this._onPointerUp)),!this._isTrackingPointer(e)&&(this._addPointer(e),e.pointerType===`touch`?this._onTouchStart(e):this._onMouseDown(e),this._cursorStyle===`grab`&&(this.domElement.style.cursor=`grabbing`)))}function P(e){this.enabled!==!1&&(e.pointerType===`touch`?this._onTouchMove(e):this._onMouseMove(e))}function be(e){switch(this._removePointer(e),this._pointers.length){case 0:this.domElement.releasePointerCapture(e.pointerId),this.domElement.ownerDocument.removeEventListener(`pointermove`,this._onPointerMove),this.domElement.ownerDocument.removeEventListener(`pointerup`,this._onPointerUp),this.dispatchEvent(O),this.state=M.NONE,this._cursorStyle===`grab`&&(this.domElement.style.cursor=`grab`);break;case 1:let t=this._pointers[0],n=this._pointerPositions[t];this._onTouchStart({pointerId:t,pageX:n.x,pageY:n.y})}}function xe(e){let t;switch(e.button){case 0:t=this.mouseButtons.LEFT;break;case 1:t=this.mouseButtons.MIDDLE;break;case 2:t=this.mouseButtons.RIGHT;break;default:t=-1}switch(t){case _.DOLLY:if(this.enableZoom===!1)return;this._handleMouseDownDolly(e),this.state=M.DOLLY;break;case _.ROTATE:if(e.ctrlKey||e.metaKey||e.shiftKey){if(this.enablePan===!1)return;this._handleMouseDownPan(e),this.state=M.PAN}else{if(this.enableRotate===!1)return;this._handleMouseDownRotate(e),this.state=M.ROTATE}break;case _.PAN:if(e.ctrlKey||e.metaKey||e.shiftKey){if(this.enableRotate===!1)return;this._handleMouseDownRotate(e),this.state=M.ROTATE}else{if(this.enablePan===!1)return;this._handleMouseDownPan(e),this.state=M.PAN}break;default:this.state=M.NONE}this.state!==M.NONE&&this.dispatchEvent(D)}function Se(e){switch(this.state){case M.ROTATE:if(this.enableRotate===!1)return;this._handleMouseMoveRotate(e);break;case M.DOLLY:if(this.enableZoom===!1)return;this._handleMouseMoveDolly(e);break;case M.PAN:if(this.enablePan===!1)return;this._handleMouseMovePan(e)}}function Ce(e){this.enabled!==!1&&this.enableZoom!==!1&&this.state===M.NONE&&(e.preventDefault(),this.dispatchEvent(D),this._handleMouseWheel(this._customWheelEvent(e)),this.dispatchEvent(O))}function F(e){this.enabled!==!1&&this._handleKeyDown(e)}function we(e){switch(this._trackPointer(e),this._pointers.length){case 1:switch(this.touches.ONE){case f.ROTATE:if(this.enableRotate===!1)return;this._handleTouchStartRotate(e),this.state=M.TOUCH_ROTATE;break;case f.PAN:if(this.enablePan===!1)return;this._handleTouchStartPan(e),this.state=M.TOUCH_PAN;break;default:this.state=M.NONE}break;case 2:switch(this.touches.TWO){case f.DOLLY_PAN:if(this.enableZoom===!1&&this.enablePan===!1)return;this._handleTouchStartDollyPan(e),this.state=M.TOUCH_DOLLY_PAN;break;case f.DOLLY_ROTATE:if(this.enableZoom===!1&&this.enableRotate===!1)return;this._handleTouchStartDollyRotate(e),this.state=M.TOUCH_DOLLY_ROTATE;break;default:this.state=M.NONE}break;default:this.state=M.NONE}this.state!==M.NONE&&this.dispatchEvent(D)}function Te(e){switch(this._trackPointer(e),this.state){case M.TOUCH_ROTATE:if(this.enableRotate===!1)return;this._handleTouchMoveRotate(e),this.update();break;case M.TOUCH_PAN:if(this.enablePan===!1)return;this._handleTouchMovePan(e),this.update();break;case M.TOUCH_DOLLY_PAN:if(this.enableZoom===!1&&this.enablePan===!1)return;this._handleTouchMoveDollyPan(e),this.update();break;case M.TOUCH_DOLLY_ROTATE:if(this.enableZoom===!1&&this.enableRotate===!1)return;this._handleTouchMoveDollyRotate(e),this.update();break;default:this.state=M.NONE}}function Ee(e){this.enabled!==!1&&e.preventDefault()}function De(e){e.key===`Control`&&(this._controlActive=!0,this.domElement.getRootNode().addEventListener(`keyup`,this._interceptControlUp,{passive:!0,capture:!0}))}function Oe(e){e.key===`Control`&&(this._controlActive=!1,this.domElement.getRootNode().removeEventListener(`keyup`,this._interceptControlUp,{passive:!0,capture:!0}))}var I=new i,L=new l,R=class extends C{constructor(){super(),this.isLineSegmentsGeometry=!0,this.type=`LineSegmentsGeometry`,this.setIndex([0,2,1,2,3,1,2,4,3,4,5,3,4,6,5,6,7,5]),this.setAttribute(`position`,new S([-1,2,0,1,2,0,-1,1,0,1,1,0,-1,0,0,1,0,0,-1,-1,0,1,-1,0],3)),this.setAttribute(`uv`,new S([-1,2,1,2,-1,1,1,1,-1,-1,1,-1,-1,-2,1,-2],2))}applyMatrix4(e){let t=this.attributes.instanceStart,n=this.attributes.instanceEnd;return t!==void 0&&(t.applyMatrix4(e),n.applyMatrix4(e),t.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this}setPositions(e){let t;e instanceof Float32Array?t=e:Array.isArray(e)&&(t=new Float32Array(e));let n=new w(t,6,1);return this.setAttribute(`instanceStart`,new v(n,3,0)),this.setAttribute(`instanceEnd`,new v(n,3,3)),this.instanceCount=this.attributes.instanceStart.count,this.computeBoundingBox(),this.computeBoundingSphere(),this}setColors(e){let t;e instanceof Float32Array?t=e:Array.isArray(e)&&(t=new Float32Array(e));let n=new w(t,6,1);return this.setAttribute(`instanceColorStart`,new v(n,3,0)),this.setAttribute(`instanceColorEnd`,new v(n,3,3)),this}fromWireframeGeometry(e){return this.setPositions(e.attributes.position.array),this}fromEdgesGeometry(e){return this.setPositions(e.attributes.position.array),this}fromMesh(e){return this.fromWireframeGeometry(new oe(e.geometry)),this}fromLineSegments(e){let t=e.geometry;return this.setPositions(t.attributes.position.array),this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new i);let e=this.attributes.instanceStart,t=this.attributes.instanceEnd;e!==void 0&&t!==void 0&&(this.boundingBox.setFromBufferAttribute(e),I.setFromBufferAttribute(t),this.boundingBox.union(I))}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new pe),this.boundingBox===null&&this.computeBoundingBox();let e=this.attributes.instanceStart,t=this.attributes.instanceEnd;if(e!==void 0&&t!==void 0){let n=this.boundingSphere.center;this.boundingBox.getCenter(n);let r=0;for(let i=0,a=e.count;i<a;i++)L.fromBufferAttribute(e,i),r=Math.max(r,n.distanceToSquared(L)),L.fromBufferAttribute(t,i),r=Math.max(r,n.distanceToSquared(L));this.boundingSphere.radius=Math.sqrt(r),isNaN(this.boundingSphere.radius)&&console.error(`THREE.LineSegmentsGeometry.computeBoundingSphere(): Computed radius is NaN. The instanced position data is likely to have NaN values.`,this)}}toJSON(){}};c.line={worldUnits:{value:1},linewidth:{value:1},resolution:{value:new b},dashOffset:{value:0},dashScale:{value:1},dashSize:{value:1},gapSize:{value:1}},h.line={uniforms:u.merge([c.common,c.fog,c.line]),vertexShader:`
		#include <common>
		#include <color_pars_vertex>
		#include <fog_pars_vertex>
		#include <logdepthbuf_pars_vertex>
		#include <clipping_planes_pars_vertex>

		uniform float linewidth;
		uniform vec2 resolution;

		attribute vec3 instanceStart;
		attribute vec3 instanceEnd;

		attribute vec3 instanceColorStart;
		attribute vec3 instanceColorEnd;

		#ifdef WORLD_UNITS

			varying vec4 worldPos;
			varying vec3 worldStart;
			varying vec3 worldEnd;

			#ifdef USE_DASH

				varying vec2 vUv;

			#endif

		#else

			varying vec2 vUv;

		#endif

		#ifdef USE_DASH

			uniform float dashScale;
			attribute float instanceDistanceStart;
			attribute float instanceDistanceEnd;
			varying float vLineDistance;

		#endif

		float trimSegmentAlpha( const in vec4 start, const in vec4 end ) {

			// compute the interpolation factor needed to trim the segment so it terminates
			// between the camera plane and the near plane

			// conservative estimate of the near plane
			float a = projectionMatrix[ 2 ][ 2 ]; // 3nd entry in 3th column
			float b = projectionMatrix[ 3 ][ 2 ]; // 3nd entry in 4th column

			// we need different nearEstimate formula for reversed and default depth buffer
			// a is positive with a reversed depth buffer so it can be used for controlling the code flow
			float nearEstimate = ( a > 0.0 ) ? ( - b / ( a + 1.0 ) ) : ( - 0.5 * b / a );

			return ( nearEstimate - start.z ) / ( end.z - start.z );

		}

		void main() {

			#ifdef USE_COLOR

				vColor.xyz = ( position.y < 0.5 ) ? instanceColorStart : instanceColorEnd;

			#endif

			float aspect = resolution.x / resolution.y;

			// camera space
			vec4 start = modelViewMatrix * vec4( instanceStart, 1.0 );
			vec4 end = modelViewMatrix * vec4( instanceEnd, 1.0 );

			#ifdef USE_DASH

				float lineDistanceStart = dashScale * instanceDistanceStart;
				float lineDistanceEnd = dashScale * instanceDistanceEnd;

			#endif

			#ifdef WORLD_UNITS

				worldStart = start.xyz;
				worldEnd = end.xyz;

			#else

				vUv = uv;

			#endif

			// special case for perspective projection, and segments that terminate either in, or behind, the camera plane
			// clearly the gpu firmware has a way of addressing this issue when projecting into ndc space
			// but we need to perform ndc-space calculations in the shader, so we must address this issue directly
			// perhaps there is a more elegant solution -- WestLangley

			bool perspective = ( projectionMatrix[ 2 ][ 3 ] == - 1.0 ); // 4th entry in the 3rd column

			if ( perspective ) {

				if ( start.z < 0.0 && end.z >= 0.0 ) {

					float alpha = trimSegmentAlpha( start, end );
					end.xyz = mix( start.xyz, end.xyz, alpha );

					#ifdef USE_DASH

						lineDistanceEnd = mix( lineDistanceStart, lineDistanceEnd, alpha );

					#endif

				} else if ( end.z < 0.0 && start.z >= 0.0 ) {

					float alpha = trimSegmentAlpha( end, start );
					start.xyz = mix( end.xyz, start.xyz, alpha );

					#ifdef USE_DASH

						lineDistanceStart = mix( lineDistanceEnd, lineDistanceStart, alpha );

					#endif

				}

			}

			#ifdef USE_DASH

				vLineDistance = ( position.y < 0.5 ) ? lineDistanceStart : lineDistanceEnd;
				vUv = uv;

			#endif

			// clip space
			vec4 clipStart = projectionMatrix * start;
			vec4 clipEnd = projectionMatrix * end;

			// ndc space
			vec3 ndcStart = clipStart.xyz / clipStart.w;
			vec3 ndcEnd = clipEnd.xyz / clipEnd.w;

			// direction
			vec2 dir = ndcEnd.xy - ndcStart.xy;

			// account for clip-space aspect ratio
			dir.x *= aspect;
			dir = normalize( dir );

			#ifdef WORLD_UNITS

				vec3 worldDir = normalize( end.xyz - start.xyz );
				vec3 tmpFwd = normalize( mix( start.xyz, end.xyz, 0.5 ) );
				vec3 worldUp = normalize( cross( worldDir, tmpFwd ) );
				vec3 worldFwd = cross( worldDir, worldUp );
				worldPos = position.y < 0.5 ? start: end;

				// height offset
				float hw = linewidth * 0.5;
				worldPos.xyz += position.x < 0.0 ? hw * worldUp : - hw * worldUp;

				// don't extend the line if we're rendering dashes because we
				// won't be rendering the endcaps
				#ifndef USE_DASH

					// cap extension
					worldPos.xyz += position.y < 0.5 ? - hw * worldDir : hw * worldDir;

					// add width to the box
					worldPos.xyz += worldFwd * hw;

					// endcaps
					if ( position.y > 1.0 || position.y < 0.0 ) {

						worldPos.xyz -= worldFwd * 2.0 * hw;

					}

				#endif

				// project the worldpos
				vec4 clip = projectionMatrix * worldPos;

				// shift the depth of the projected points so the line
				// segments overlap neatly
				vec3 clipPose = ( position.y < 0.5 ) ? ndcStart : ndcEnd;
				clip.z = clipPose.z * clip.w;

			#else

				vec2 offset = vec2( dir.y, - dir.x );
				// undo aspect ratio adjustment
				dir.x /= aspect;
				offset.x /= aspect;

				// sign flip
				if ( position.x < 0.0 ) offset *= - 1.0;

				// endcaps
				if ( position.y < 0.0 ) {

					offset += - dir;

				} else if ( position.y > 1.0 ) {

					offset += dir;

				}

				// adjust for linewidth
				offset *= linewidth;

				// adjust for clip-space to screen-space conversion // maybe resolution should be based on viewport ...
				offset /= resolution.y;

				// select end
				vec4 clip = ( position.y < 0.5 ) ? clipStart : clipEnd;

				// back to clip space
				offset *= clip.w;

				clip.xy += offset;

			#endif

			gl_Position = clip;

			vec4 mvPosition = ( position.y < 0.5 ) ? start : end; // this is an approximation

			#include <logdepthbuf_vertex>
			#include <clipping_planes_vertex>
			#include <fog_vertex>

		}
		`,fragmentShader:`
		uniform vec3 diffuse;
		uniform float opacity;
		uniform float linewidth;

		#ifdef USE_DASH

			uniform float dashOffset;
			uniform float dashSize;
			uniform float gapSize;

		#endif

		varying float vLineDistance;

		#ifdef WORLD_UNITS

			varying vec4 worldPos;
			varying vec3 worldStart;
			varying vec3 worldEnd;

			#ifdef USE_DASH

				varying vec2 vUv;

			#endif

		#else

			varying vec2 vUv;

		#endif

		#include <common>
		#include <color_pars_fragment>
		#include <fog_pars_fragment>
		#include <logdepthbuf_pars_fragment>
		#include <clipping_planes_pars_fragment>

		vec2 closestLineToLine(vec3 p1, vec3 p2, vec3 p3, vec3 p4) {

			float mua;
			float mub;

			vec3 p13 = p1 - p3;
			vec3 p43 = p4 - p3;

			vec3 p21 = p2 - p1;

			float d1343 = dot( p13, p43 );
			float d4321 = dot( p43, p21 );
			float d1321 = dot( p13, p21 );
			float d4343 = dot( p43, p43 );
			float d2121 = dot( p21, p21 );

			float denom = d2121 * d4343 - d4321 * d4321;

			float numer = d1343 * d4321 - d1321 * d4343;

			mua = numer / denom;
			mua = clamp( mua, 0.0, 1.0 );
			mub = ( d1343 + d4321 * ( mua ) ) / d4343;
			mub = clamp( mub, 0.0, 1.0 );

			return vec2( mua, mub );

		}

		void main() {

			float alpha = opacity;
			vec4 diffuseColor = vec4( diffuse, alpha );

			#include <clipping_planes_fragment>

			#ifdef USE_DASH

				if ( vUv.y < - 1.0 || vUv.y > 1.0 ) discard; // discard endcaps

				if ( mod( vLineDistance + dashOffset, dashSize + gapSize ) > dashSize ) discard; // todo - FIX

			#endif

			#ifdef WORLD_UNITS

				// Find the closest points on the view ray and the line segment
				vec3 rayEnd = normalize( worldPos.xyz ) * 1e5;
				vec3 lineDir = worldEnd - worldStart;
				vec2 params = closestLineToLine( worldStart, worldEnd, vec3( 0.0, 0.0, 0.0 ), rayEnd );

				vec3 p1 = worldStart + lineDir * params.x;
				vec3 p2 = rayEnd * params.y;
				vec3 delta = p1 - p2;
				float len = length( delta );
				float norm = len / linewidth;

				#ifndef USE_DASH

					#ifdef USE_ALPHA_TO_COVERAGE

						float dnorm = fwidth( norm );
						alpha = 1.0 - smoothstep( 0.5 - dnorm, 0.5 + dnorm, norm );

					#else

						if ( norm > 0.5 ) {

							discard;

						}

					#endif

				#endif

			#else

				#ifdef USE_ALPHA_TO_COVERAGE

					// artifacts appear on some hardware if a derivative is taken within a conditional
					float a = vUv.x;
					float b = ( vUv.y > 0.0 ) ? vUv.y - 1.0 : vUv.y + 1.0;
					float len2 = a * a + b * b;
					float dlen = fwidth( len2 );

					if ( abs( vUv.y ) > 1.0 ) {

						alpha = 1.0 - smoothstep( 1.0 - dlen, 1.0 + dlen, len2 );

					}

				#else

					if ( abs( vUv.y ) > 1.0 ) {

						float a = vUv.x;
						float b = ( vUv.y > 0.0 ) ? vUv.y - 1.0 : vUv.y + 1.0;
						float len2 = a * a + b * b;

						if ( len2 > 1.0 ) discard;

					}

				#endif

			#endif

			#include <logdepthbuf_fragment>
			#include <color_fragment>

			gl_FragColor = vec4( diffuseColor.rgb, alpha );

			#include <tonemapping_fragment>
			#include <colorspace_fragment>
			#include <fog_fragment>
			#include <premultiplied_alpha_fragment>

		}
		`};var ke=class extends me{constructor(e){super({type:`LineMaterial`,uniforms:u.clone(h.line.uniforms),vertexShader:h.line.vertexShader,fragmentShader:h.line.fragmentShader,clipping:!0}),this.isLineMaterial=!0,this.setValues(e)}get color(){return this.uniforms.diffuse.value}set color(e){this.uniforms.diffuse.value=e}get worldUnits(){return`WORLD_UNITS`in this.defines}set worldUnits(e){e===!0!==this.worldUnits&&(this.needsUpdate=!0),e===!0?this.defines.WORLD_UNITS=``:delete this.defines.WORLD_UNITS}get linewidth(){return this.uniforms.linewidth.value}set linewidth(e){this.uniforms.linewidth&&(this.uniforms.linewidth.value=e)}get dashed(){return`USE_DASH`in this.defines}set dashed(e){e===!0!==this.dashed&&(this.needsUpdate=!0),e===!0?this.defines.USE_DASH=``:delete this.defines.USE_DASH}get dashScale(){return this.uniforms.dashScale.value}set dashScale(e){this.uniforms.dashScale.value=e}get dashSize(){return this.uniforms.dashSize.value}set dashSize(e){this.uniforms.dashSize.value=e}get dashOffset(){return this.uniforms.dashOffset.value}set dashOffset(e){this.uniforms.dashOffset.value=e}get gapSize(){return this.uniforms.gapSize.value}set gapSize(e){this.uniforms.gapSize.value=e}get opacity(){return this.uniforms.opacity.value}set opacity(e){this.uniforms&&(this.uniforms.opacity.value=e)}get resolution(){return this.uniforms.resolution.value}set resolution(e){this.uniforms.resolution.value.copy(e)}get alphaToCoverage(){return`USE_ALPHA_TO_COVERAGE`in this.defines}set alphaToCoverage(e){this.defines&&(e===!0!==this.alphaToCoverage&&(this.needsUpdate=!0),e===!0?this.defines.USE_ALPHA_TO_COVERAGE=``:delete this.defines.USE_ALPHA_TO_COVERAGE)}},z=new p,Ae=new l,B=new l,V=new p,H=new p,U=new p,W=new l,G=new ie,K=new m,je=new l,q=new i,J=new pe,Y=new p,X,Z;function Me(e,t,n){return Y.set(0,0,-t,1).applyMatrix4(e.projectionMatrix),Y.multiplyScalar(1/Y.w),Y.x=Z/n.width,Y.y=Z/n.height,Y.applyMatrix4(e.projectionMatrixInverse),Y.multiplyScalar(1/Y.w),Math.abs(Math.max(Y.x,Y.y))}function Ne(e,t){let n=e.matrixWorld,r=e.geometry,i=r.attributes.instanceStart,a=r.attributes.instanceEnd,o=Math.min(r.instanceCount,i.count);for(let r=0,s=o;r<s;r++){K.start.fromBufferAttribute(i,r),K.end.fromBufferAttribute(a,r),K.applyMatrix4(n);let o=new l,s=new l;X.distanceSqToSegment(K.start,K.end,s,o),s.distanceTo(o)<Z*.5&&t.push({point:s,pointOnLine:o,distance:X.origin.distanceTo(s),object:e,face:null,faceIndex:r,uv:null,uv1:null})}}function Pe(e,t,n){let r=t.projectionMatrix,i=e.material.resolution,o=e.matrixWorld,s=e.geometry,c=s.attributes.instanceStart,u=s.attributes.instanceEnd,d=Math.min(s.instanceCount,c.count),f=-t.near;X.at(1,U),U.w=1,U.applyMatrix4(t.matrixWorldInverse),U.applyMatrix4(r),U.multiplyScalar(1/U.w),U.x*=i.x/2,U.y*=i.y/2,U.z=0,W.copy(U),G.multiplyMatrices(t.matrixWorldInverse,o);for(let t=0,s=d;t<s;t++){if(V.fromBufferAttribute(c,t),H.fromBufferAttribute(u,t),V.w=1,H.w=1,V.applyMatrix4(G),H.applyMatrix4(G),V.z>f&&H.z>f)continue;if(V.z>f){let e=V.z-H.z,t=(V.z-f)/e;V.lerp(H,t)}else if(H.z>f){let e=H.z-V.z,t=(H.z-f)/e;H.lerp(V,t)}V.applyMatrix4(r),H.applyMatrix4(r),V.multiplyScalar(1/V.w),H.multiplyScalar(1/H.w),V.x*=i.x/2,V.y*=i.y/2,H.x*=i.x/2,H.y*=i.y/2,K.start.copy(V),K.start.z=0,K.end.copy(H),K.end.z=0;let s=K.closestPointToPointParameter(W,!0);K.at(s,je);let d=a.lerp(V.z,H.z,s),ee=d>=-1&&d<=1,p=W.distanceTo(je)<Z*.5;if(ee&&p){K.start.fromBufferAttribute(c,t),K.end.fromBufferAttribute(u,t),K.start.applyMatrix4(o),K.end.applyMatrix4(o);let r=new l,i=new l;X.distanceSqToSegment(K.start,K.end,i,r),n.push({point:i,pointOnLine:r,distance:X.origin.distanceTo(i),object:e,face:null,faceIndex:t,uv:null,uv1:null})}}}var Fe=class extends d{constructor(e=new R,t=new ke({color:Math.random()*16777215})){super(e,t),this.isLineSegments2=!0,this.type=`LineSegments2`}computeLineDistances(){let e=this.geometry,t=e.attributes.instanceStart,n=e.attributes.instanceEnd,r=new Float32Array(2*t.count);for(let e=0,i=0,a=t.count;e<a;e++,i+=2)Ae.fromBufferAttribute(t,e),B.fromBufferAttribute(n,e),r[i]=i===0?0:r[i-1],r[i+1]=r[i]+Ae.distanceTo(B);let i=new w(r,2,1);return e.setAttribute(`instanceDistanceStart`,new v(i,1,0)),e.setAttribute(`instanceDistanceEnd`,new v(i,1,1)),this}raycast(e,t){let n=this.material.worldUnits,r=e.camera;if(r===null&&!n&&console.error(`LineSegments2: "Raycaster.camera" needs to be set in order to raycast against LineSegments2 while worldUnits is set to false.`),n===!1&&(this.material.resolution.x===0||this.material.resolution.y===0))return;let i=e.params.Line2===void 0?0:e.params.Line2.threshold||0;X=e.ray;let a=this.matrixWorld,o=this.geometry,s=this.material;Z=s.linewidth+i,o.boundingSphere===null&&o.computeBoundingSphere(),J.copy(o.boundingSphere).applyMatrix4(a);let c;if(c=n?Z*.5:Me(r,Math.max(r.near,J.distanceToPoint(X.origin)),s.resolution),J.radius+=c,X.intersectsSphere(J)===!1)return;o.boundingBox===null&&o.computeBoundingBox(),q.copy(o.boundingBox).applyMatrix4(a);let l;l=n?Z*.5:Me(r,Math.max(r.near,q.distanceToPoint(X.origin)),s.resolution),q.expandByScalar(l),X.intersectsBox(q)!==!1&&(n?Ne(this,t):Pe(this,r,t))}onBeforeRender(e){let t=this.material.uniforms;t&&t.resolution&&(e.getViewport(z),this.material.uniforms.resolution.value.set(z.z,z.w))}},Ie=class extends R{constructor(){super(),this.isLineGeometry=!0,this.type=`LineGeometry`}setPositions(e){let t=e.length-3,n=new Float32Array(2*t);for(let r=0;r<t;r+=3)n[2*r]=e[r],n[2*r+1]=e[r+1],n[2*r+2]=e[r+2],n[2*r+3]=e[r+3],n[2*r+4]=e[r+4],n[2*r+5]=e[r+5];return super.setPositions(n),this}setColors(e){let t=e.length-3,n=new Float32Array(2*t);for(let r=0;r<t;r+=3)n[2*r]=e[r],n[2*r+1]=e[r+1],n[2*r+2]=e[r+2],n[2*r+3]=e[r+3],n[2*r+4]=e[r+4],n[2*r+5]=e[r+5];return super.setColors(n),this}setFromPoints(e){let t=e.length-1,n=new Float32Array(6*t);for(let r=0;r<t;r++)n[6*r]=e[r].x,n[6*r+1]=e[r].y,n[6*r+2]=e[r].z||0,n[6*r+3]=e[r+1].x,n[6*r+4]=e[r+1].y,n[6*r+5]=e[r+1].z||0;return super.setPositions(n),this}fromLine(e){let t=e.geometry;return this.setPositions(t.attributes.position.array),this}},Le=class extends Fe{constructor(e=new Ie,t=new ke({color:Math.random()*16777215})){super(e,t),this.isLine2=!0,this.type=`Line2`}},Q=(e,t=1)=>{let n=a.degToRad(e.lat),r=a.degToRad(e.lng);return new l(Math.cos(n)*Math.cos(r),Math.sin(n),-Math.cos(n)*Math.sin(r)).multiplyScalar(t)},Re=(e,t)=>a.radToDeg(Math.atan(Math.sinh(Math.PI*(1-2*e/t)))),ze=Re(0,1);function Be(e,t,n){let r=2**e,i=e<4?32:e<7?16:8,a=[],o=[],s=[],c=Array.from({length:i+1},(e,t)=>({lat:Re(n+t/i,r),v:1-t/i}));for(let{lat:e,v:n}of c)for(let s=0;s<=i;s++){let c=Q({lat:e,lng:(t+s/i)/r*360-180});a.push(c.x,c.y,c.z),o.push(s/i,n)}for(let e=0;e<c.length-1;e++)for(let t=0;t<i;t++){let n=e*(i+1)+t,r=n+i+1;s.push(n,r,n+1,r,r+1,n+1)}let l=new y;return l.setAttribute(`position`,new S(a,3)),l.setAttribute(`uv`,new S(o,2)),l.setIndex(s),l}function Ve(e){let t=[],n=[],r=[];for(let r=0;r<=24;r++){let i=e?90-(90-ze)*r/24:-ze-(90-ze)*r/24;for(let e=0;e<=128;e++){let r=Q({lat:i,lng:e/128*360-180});t.push(r.x,r.y,r.z),n.push(e/128,(i+90)/180)}}for(let t=0;t<24;t++)for(let n=0;n<128;n++){let i=t*129+n,a=i+128+1;(!e||t>0)&&r.push(i,a,i+1),(e||t<23)&&r.push(a,a+1,i+1)}let i=new y;return i.setAttribute(`position`,new S(t,3)),i.setAttribute(`uv`,new S(n,2)),i.setIndex(r),i}function He(e,t,n,r=0,i=1){let o=Math.max(1080,e)/2/Math.tan(a.degToRad(t/2))/n,s=Math.cos(a.degToRad(Math.min(Math.abs(r),ze)))*Math.sqrt(Math.max(.1,i));return Math.min(16,Math.ceil(Math.log2(o*2*Math.PI*s/256)))}var $=n(),Ue=e=>({lat:a.radToDeg(Math.asin(a.clamp(e.y/e.length(),-1,1))),lng:a.radToDeg(Math.atan2(-e.z,e.x))}),We=(e,t,n)=>`https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/${e}/${n}/${t}`,Ge=4,Ke=16,qe=220,Je=8,Ye=.0095;function Xe(e){let t=document.createElement(`canvas`);t.width=64,t.height=96;let n=t.getContext(`2d`);if(!n)return null;n.shadowColor=`#0008`,n.shadowBlur=6,n.shadowOffsetY=2,n.beginPath(),n.moveTo(32,92),n.bezierCurveTo(26,74,8,62,8,34),n.arc(32,34,24,Math.PI,0),n.bezierCurveTo(56,62,38,74,32,92),n.closePath(),n.fillStyle=e.color,n.fill(),n.shadowColor=`transparent`,n.lineWidth=4,n.strokeStyle=`#ffffff`,n.stroke(),n.fillStyle=e.answer?`#173f40`:`#ffffff`,n.font=`bold 28px sans-serif`,n.textAlign=`center`,n.textBaseline=`middle`,n.fillText(e.answer?`★`:e.label.slice(0,1),32,35);let r=new ae(t);return r.colorSpace=he,r}var Ze=()=>typeof window<`u`&&window.matchMedia?.(`(prefers-reduced-motion: reduce)`).matches;function Qe({pins:e,onPin:t}){let n=(0,T.useRef)(null),i=(0,T.useRef)(null),c=(0,T.useRef)(t),[u,p]=(0,T.useState)(`Loading satellite imagery…`),[m,h]=(0,T.useState)(!1),[g,_]=(0,T.useState)(0);return(0,T.useEffect)(()=>{c.current=t},[t]),(0,T.useEffect)(()=>{let e=n.current;if(!e)return;let t;try{t=new ee({antialias:!0,alpha:!0})}catch{queueMicrotask(()=>p(`The globe needs WebGL. Enable hardware acceleration or try another browser.`));return}let u=!1,m=!1,g=new o;t.setClearColor(0,0);let _=new fe(40,1,.002,20),v=t.domElement;v.tabIndex=0,v.setAttribute(`role`,`application`),v.setAttribute(`aria-label`,`Satellite globe. Drag to rotate; pinch or scroll to zoom. Arrow keys rotate, plus and minus zoom, Enter places a pin at the crosshair. Home resets the globe.`),e.appendChild(v),t.setPixelRatio(Math.min(window.devicePixelRatio,3));let y=new ve(_,v);y.enablePan=!1,y.enableDamping=!1,y.enableZoom=!1,y.minDistance=1.0095,y.maxDistance=8,y.touches.TWO=f.DOLLY_ROTATE;let ie=new re({color:`#ffffff`}),ae=new r(1,128,96),oe=new d(ae,ie);oe.scale.setScalar(.997),g.add(oe);let se=[!0,!1].map(e=>{let t=new d(Ve(e),ie);return g.add(t),t}),ce=new r(1.045,64,48),de=new d(ce,new me({side:1,transparent:!0,depthWrite:!1,vertexShader:`varying vec3 vNormal; varying vec3 vView;
          void main() {
            vec4 p = modelViewMatrix * vec4(position, 1.0);
            vNormal = normalize(normalMatrix * normal);
            vView = normalize(-p.xyz);
            gl_Position = projectionMatrix * p;
          }`,fragmentShader:`varying vec3 vNormal; varying vec3 vView;
          void main() {
            // Strongest at the globe's edge, fading out into the room.
            float rim = pow(clamp(-dot(vNormal, vView) * 3.4, 0.0, 1.0), 2.0);
            gl_FragColor = vec4(0.45, 0.72, 1.0, rim * 0.7);
          }`}));g.add(de);let x=new le;g.add(x);let S=new le;g.add(S);let C=new le;g.add(C);let w=0,T=null,E=null,D=()=>a.degToRad(_.fov/2);function O(){return 1.04/Math.sin(Math.atan(Math.tan(D())*Math.min(1,_.aspect)))}function ge(){let e=_.position.length()-1;y.rotateSpeed=a.clamp(e*Math.tan(D())/Math.PI,5e-4,1)}function _e(){if(u)return;w=0;let e=performance.now();if(E){let t=Math.min(1,(e-E.start)/E.ms),n=t<.5?4*t**3:1-(-2*t+2)**3/2,r=a.lerp(E.from.length(),E.to.length(),n);_.position.copy(E.from).normalize().lerp(E.to.clone().normalize(),n).normalize().multiplyScalar(r),y.update(),t>=1&&(E=null)}if(T){let t=Math.min(1,(e-T.start)/900);for(let e of T.lines){let n=e.userData.segments;e.geometry.instanceCount=Math.max(1,Math.round(n*t))}t>=1&&(T=null)}ge(),de.visible=_.position.length()>1.12;let n=_.position;for(let e of S.children)e.visible=e.userData.normal.dot(n)>1.002;Ce(),t.render(g,_),(E||T)&&k()}let k=()=>{!u&&!w&&(w=requestAnimationFrame(_e))},A=new Map,j=0,M=[],N=new ue,ye=new pe(new l,1),P=new l;function be(e,n=0,r=1){return He(t.domElement.height,_.fov,e,n,r)}function xe(e,n,r){let i=`${e}/${n}/${r}`,a=new re({transparent:!0,opacity:0,depthWrite:!1,polygonOffset:!0,polygonOffsetFactor:-1-e,polygonOffsetUnits:-4-e}),o=new d(Be(e,n,r),a);o.renderOrder=e,o.visible=!1,x.add(o);let s={mesh:o,z:e,ready:!1,used:performance.now()};A.set(i,s),j++,new ne().load(We(e,n,r),e=>{if(j--,u||A.get(i)!==s){e.dispose();return}e.colorSpace=he,e.anisotropy=t.capabilities.getMaxAnisotropy(),a.map=e,a.opacity=1,a.transparent=!1,a.needsUpdate=!0,s.ready=!0,k()},void 0,()=>{j--,k()})}function Se(e){let t=A.get(e),n=t.mesh.material;n.map?.dispose(),n.dispose(),t.mesh.geometry.dispose(),x.remove(t.mesh),A.delete(e)}function Ce(){for(let e of A.values())e.mesh.visible=!1;if(!m||be(_.position.length()-1)<Ge){M=[],h(!1);return}let e=new Map,t=new b;for(let n=0;n<=20;n++)for(let r=0;r<=20;r++){if(t.set(r/20*2-1,n/20*2-1),N.setFromCamera(t,_),!N.ray.intersectSphere(ye,P))continue;let i=Ue(P);if(Math.abs(i.lat)>=ze)continue;let o=a.clamp(be(P.distanceTo(_.position),i.lat,-P.dot(N.ray.direction)),3,Ke),s=2**o,c=Math.floor((i.lng+180)/360*s)%s,l=Math.sin(a.degToRad(i.lat)),u=a.clamp(Math.floor((.5-Math.log((1+l)/(1-l))/(4*Math.PI))*s),0,s-1),d=Math.hypot(r/20-.5,n/20-.5);for(let t of Math.abs(i.lat)>60?[0,-1,1]:[0]){let n=(c+t+s)%s,r=`${o}/${n}/${u}`,i=e.get(r);(!i||i[3]>d)&&e.set(r,[o,n,u,d])}}let n=performance.now();M=[];for(let[t,[r,i,a,o]]of e){let e=A.get(t);if(e?.ready){e.mesh.visible=!0,e.used=n;continue}e||M.push([r,i,a,o]);for(let e=1;e<=r;e++){let t=A.get(`${r-e}/${i>>e}/${a>>e}`);if(t?.ready){t.mesh.visible=!0,t.used=n;break}}}for(M.sort((e,t)=>e[3]-t[3]);j<Je&&M.length;){let[e,t,n]=M.shift();xe(e,t,n)}if(A.size>qe){let e=[...A.entries()].filter(([,e])=>!e.mesh.visible&&e.ready).sort((e,t)=>e[1].used-t[1].used).slice(0,A.size-qe);for(let[t]of e)Se(t)}h([...A.values()].some(e=>e.mesh.visible))}let F=new ne().load(`/games/maps/earth-satellite.jpg`,()=>{if(u){F.dispose();return}m=!0,p(``),k()},void 0,()=>{u||p(`Satellite imagery could not load. Retry the globe.`)});F.colorSpace=he,F.anisotropy=t.capabilities.getMaxAnisotropy(),ie.map=F;function we(){for(;S.children.length;){let e=S.children[0];e.material.map?.dispose(),e.material.dispose(),S.remove(e)}for(;C.children.length;){let e=C.children[0];e.geometry.dispose(),e.material.dispose(),C.remove(e)}T=null}let Te=``,Ee=[];function De(t){we(),Ee=t;let{width:n,height:r}=e.getBoundingClientRect();for(let e of t){let t=Xe(e);if(!t)continue;let n=new te(new s({map:t,sizeAttenuation:!1,depthTest:!1,depthWrite:!1}));n.center.set(.5,0),n.renderOrder=e.answer?1001:1e3,n.position.copy(Q(e,1.001)),n.userData.normal=Q(e),n.scale.set(.04,.06,1),S.add(n)}let i=t.find(e=>e.answer),a=[];if(i){let e=Q(i);for(let i of t){if(i.answer)continue;let t=Q(i),o=t.angleTo(e);if(o<.002)continue;let s=Math.max(12,Math.ceil(o*60)),c=Math.min(.2,o*.12),l=[];for(let n=0;n<=s;n++){let r=n/s,i=t.clone().multiplyScalar(Math.sin((1-r)*o)).add(e.clone().multiplyScalar(Math.sin(r*o))).divideScalar(Math.sin(o)).multiplyScalar(1.002+Math.sin(r*Math.PI)*c);l.push(i.x,i.y,i.z)}let u=new Ie;u.setPositions(l);let d=new Le(u,new ke({color:i.color,linewidth:3,transparent:!0,opacity:.95,resolution:new b(n,r)}));d.userData.segments=s,d.renderOrder=900,C.add(d),a.push(d)}let o=`${i.lat},${i.lng}`;if(o!==Te&&(Te=o,Oe(t,i),!Ze()&&a.length)){for(let e of a)e.geometry.instanceCount=1;T={start:performance.now()+350,lines:a}}}else Te=``;k()}function Oe(e,t){let n=Q(t),r=e.reduce((e,t)=>e.add(Q(t)),new l).add(n.clone().multiplyScalar(e.length)).normalize();r.lengthSq()===0&&r.copy(n);let i=Math.max(...e.map(e=>r.angleTo(Q(e)))),o=a.clamp(i*2.6+.12,.15,O()-1),s=r.multiplyScalar(1+o);Ze()?(_.position.copy(s),y.update()):E={start:performance.now(),from:_.position.clone(),to:s,ms:1100}}function I(){let e=O();y.maxDistance=Math.max(8,e),E=null,_.position.copy(Q({lat:18,lng:8},e)),y.update(),k()}function L(e){E=null;let t=a.clamp((_.position.length()-1)*e,Ye,y.maxDistance-1);_.position.setLength(1+t),y.update(),k()}let R=0,z=new ResizeObserver(()=>{let{width:n,height:r}=e.getBoundingClientRect();if(!n||!r)return;_.aspect=n/r,_.updateProjectionMatrix(),t.setPixelRatio(Math.min(window.devicePixelRatio,3)),t.setSize(n,r,!1);for(let e of C.children)e.material.resolution.set(n,r);let i=O();if(R)y.maxDistance=Math.max(8,i),_.position.setLength(a.clamp(1+(_.position.length()-1)*(i-1)/(R-1),y.minDistance,y.maxDistance)),y.update();else{I();let e=Ee.find(e=>e.answer);e&&Oe(Ee,e)}R=i,k()});z.observe(e),y.addEventListener(`change`,k),y.addEventListener(`start`,()=>{E=null});function Ae(e,t){m&&(N.setFromCamera(new b(e,t),_),N.ray.intersectSphere(ye,P)&&c.current?.(Ue(P)))}let B=new Map,V=null,H=0,U=()=>{let[e,t]=[...B.values()];return Math.hypot(e.x-t.x,e.y-t.y)},W=e=>{B.set(e.pointerId,{x:e.clientX,y:e.clientY}),B.size===1&&e.button===0?V={x:e.clientX,y:e.clientY,moved:!1}:V&&(V.moved=!0),B.size===2&&(H=U())},G=e=>{if(B.has(e.pointerId)&&(B.set(e.pointerId,{x:e.clientX,y:e.clientY}),V&&Math.hypot(e.clientX-V.x,e.clientY-V.y)>5&&(V.moved=!0),B.size===2)){let e=U();H>0&&e>0&&L(H/e),H=e}},K=e=>{if(V&&!V.moved&&B.size===1){let t=v.getBoundingClientRect();Ae((e.clientX-t.left)/t.width*2-1,1-(e.clientY-t.top)/t.height*2)}B.delete(e.pointerId),B.size||(V=null)},je=e=>{B.delete(e.pointerId),V&&(V.moved=!0)},q=e=>{e.preventDefault();let t=e.deltaMode===1?e.deltaY*16:e.deltaMode===2?e.deltaY*400:e.deltaY;L(Math.exp(a.clamp(t,-120,120)*(e.ctrlKey?.01:.0025)))},J=e=>{if(![`ArrowLeft`,`ArrowRight`,`ArrowUp`,`ArrowDown`,`+`,`=`,`-`,`Enter`,` `,`Home`].includes(e.key))return;if(e.preventDefault(),e.key===`Home`){I();return}if(e.key===`Enter`||e.key===` `){Ae(0,0);return}if(!e.key.startsWith(`Arrow`)){L(e.key===`-`?1.4:1/1.4);return}E=null;let t=Ue(_.position),n=_.position.length(),r=(e.shiftKey?.2:3)*Math.min(1,(n-1)*1.5);t.lng+=e.key===`ArrowLeft`?-r:e.key===`ArrowRight`?r:0,t.lat=a.clamp(t.lat+(e.key===`ArrowUp`?r:e.key===`ArrowDown`?-r:0),-89,89),_.position.copy(Q(t,n)),y.update(),k()};v.addEventListener(`pointerdown`,W),v.addEventListener(`pointermove`,G),v.addEventListener(`pointerup`,K),v.addEventListener(`pointercancel`,je),v.addEventListener(`wheel`,q,{passive:!1}),v.addEventListener(`keydown`,J);let Y=e=>{e.preventDefault(),p(`The graphics connection was lost. Retry the globe.`)};return v.addEventListener(`webglcontextlost`,Y),i.current={reset:I,pins:De},()=>{u=!0,w&&cancelAnimationFrame(w),i.current=null,z.disconnect(),y.dispose(),v.removeEventListener(`pointerdown`,W),v.removeEventListener(`pointermove`,G),v.removeEventListener(`pointerup`,K),v.removeEventListener(`pointercancel`,je),v.removeEventListener(`wheel`,q),v.removeEventListener(`keydown`,J),v.removeEventListener(`webglcontextlost`,Y),we();for(let e of A.keys())Se(e);F.dispose(),ie.dispose(),ae.dispose();for(let e of se)e.geometry.dispose();ce.dispose(),de.material.dispose(),t.dispose(),v.remove()}},[g]),(0,T.useEffect)(()=>{i.current?.pins(e)},[e,g]),(0,$.jsxs)(`div`,{className:`atlas-map-shell`,children:[(0,$.jsx)(`div`,{ref:n,className:`atlas-pin-map`,children:t&&(0,$.jsx)(`span`,{className:`atlas-globe-crosshair`,"aria-hidden":`true`,children:`+`})}),m&&(0,$.jsx)(`small`,{className:`atlas-map-credit`,children:`Imagery © Esri, Maxar, Earthstar Geographics`}),u&&(0,$.jsxs)(`output`,{className:`atlas-map-error`,children:[u,!u.startsWith(`Loading`)&&(0,$.jsx)(`button`,{onClick:()=>{p(`Loading satellite imagery…`),_(e=>e+1)},children:`Retry globe`})]})]})}export{Qe as GeoPinMap};