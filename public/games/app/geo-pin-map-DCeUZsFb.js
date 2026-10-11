import{a as e,n as t,t as n}from"./jsx-runtime-B-hcVAMW.js";import{a as r}from"./render-quality-BWx-iCCK.js";import{Ar as i,B as a,Et as o,G as s,Ht as c,Ln as l,Lr as u,Mr as d,Q as f,Qn as ee,Rn as te,St as p,Tt as ne,Ut as re,Xt as m,Yn as ie,Z as h,Zn as ae,b as g,bt as _,cr as v,dr as oe,f as se,fr as ce,hr as le,jr as y,lt as ue,nt as b,or as de,pr as x,s as fe,sr as pe,u as me,wt as he,xr as S}from"./three.core-mrld0H0c.js";import{Er as ge,Tr as C,wr as w}from"./play-CwuWLFGl.js";var T=e(t(),1),E={type:`change`},D={type:`start`},O={type:`end`},k=new l,_e=new re,A=Math.cos(70*p.DEG2RAD),j=new y,M=2*Math.PI,N={NONE:-1,ROTATE:0,DOLLY:1,PAN:2,TOUCH_ROTATE:3,TOUCH_PAN:4,TOUCH_DOLLY_PAN:5,TOUCH_DOLLY_ROTATE:6},P=1e-6,ve=class extends g{constructor(e,t=null){super(e,t),this.state=N.NONE,this.target=new y,this.cursor=new y,this.minDistance=0,this.maxDistance=1/0,this.minZoom=0,this.maxZoom=1/0,this.minTargetRadius=0,this.maxTargetRadius=1/0,this.minPolarAngle=0,this.maxPolarAngle=Math.PI,this.minAzimuthAngle=-1/0,this.maxAzimuthAngle=1/0,this.enableDamping=!1,this.dampingFactor=.05,this.enableZoom=!0,this.zoomSpeed=1,this.enableRotate=!0,this.rotateSpeed=1,this.keyRotateSpeed=1,this.enablePan=!0,this.panSpeed=1,this.screenSpacePanning=!0,this.keyPanSpeed=7,this.zoomToCursor=!1,this.autoRotate=!1,this.autoRotateSpeed=2,this.keys={LEFT:`ArrowLeft`,UP:`ArrowUp`,RIGHT:`ArrowRight`,BOTTOM:`ArrowDown`},this.mouseButtons={LEFT:_.ROTATE,MIDDLE:_.DOLLY,RIGHT:_.PAN},this.touches={ONE:x.ROTATE,TWO:x.DOLLY_PAN},this.target0=this.target.clone(),this.position0=this.object.position.clone(),this.zoom0=this.object.zoom,this._cursorStyle=`auto`,this._domElementKeyEvents=null,this._lastPosition=new y,this._lastQuaternion=new m,this._lastTargetPosition=new y,this._quat=new m().setFromUnitVectors(e.up,new y(0,1,0)),this._quatInverse=this._quat.clone().invert(),this._spherical=new v,this._sphericalDelta=new v,this._scale=1,this._panOffset=new y,this._rotateStart=new i,this._rotateEnd=new i,this._rotateDelta=new i,this._panStart=new i,this._panEnd=new i,this._panDelta=new i,this._dollyStart=new i,this._dollyEnd=new i,this._dollyDelta=new i,this._dollyDirection=new y,this._mouse=new i,this._performCursorZoom=!1,this._pointers=[],this._pointerPositions={},this._controlActive=!1,this._onPointerMove=F.bind(this),this._onPointerDown=ye.bind(this),this._onPointerUp=be.bind(this),this._onContextMenu=Ee.bind(this),this._onMouseWheel=Ce.bind(this),this._onKeyDown=I.bind(this),this._onTouchStart=we.bind(this),this._onTouchMove=Te.bind(this),this._onMouseDown=xe.bind(this),this._onMouseMove=Se.bind(this),this._interceptControlDown=De.bind(this),this._interceptControlUp=Oe.bind(this),this.domElement!==null&&this.connect(this.domElement),this.update()}set cursorStyle(e){this._cursorStyle=e,e===`grab`?this.domElement.style.cursor=`grab`:this.domElement.style.cursor=`auto`}get cursorStyle(){return this._cursorStyle}connect(e){super.connect(e),this.domElement.addEventListener(`pointerdown`,this._onPointerDown),this.domElement.addEventListener(`pointercancel`,this._onPointerUp),this.domElement.addEventListener(`contextmenu`,this._onContextMenu),this.domElement.addEventListener(`wheel`,this._onMouseWheel,{passive:!1}),this.domElement.getRootNode().addEventListener(`keydown`,this._interceptControlDown,{passive:!0,capture:!0}),this.domElement.style.touchAction=`none`}disconnect(){this.state=N.NONE,this.domElement.removeEventListener(`pointerdown`,this._onPointerDown),this.domElement.ownerDocument.removeEventListener(`pointermove`,this._onPointerMove),this.domElement.ownerDocument.removeEventListener(`pointerup`,this._onPointerUp),this.domElement.removeEventListener(`pointercancel`,this._onPointerUp),this.domElement.removeEventListener(`wheel`,this._onMouseWheel),this.domElement.removeEventListener(`contextmenu`,this._onContextMenu),this.stopListenToKeyEvents();let e=this.domElement.getRootNode();e.removeEventListener(`keydown`,this._interceptControlDown,{capture:!0}),e.removeEventListener(`keyup`,this._interceptControlUp,{capture:!0}),this._controlActive=!1,this._pointers.length=0,this._pointerPositions={},this.domElement.style.touchAction=``,this.domElement.style.cursor=`auto`}dispose(){this.disconnect()}getPolarAngle(){return this._spherical.phi}getAzimuthalAngle(){return this._spherical.theta}getDistance(){return this.object.position.distanceTo(this.target)}listenToKeyEvents(e){e.addEventListener(`keydown`,this._onKeyDown),this._domElementKeyEvents=e}stopListenToKeyEvents(){this._domElementKeyEvents!==null&&(this._domElementKeyEvents.removeEventListener(`keydown`,this._onKeyDown),this._domElementKeyEvents=null)}saveState(){this.target0.copy(this.target),this.position0.copy(this.object.position),this.zoom0=this.object.zoom}reset(){this.target.copy(this.target0),this.object.position.copy(this.position0),this.object.zoom=this.zoom0,this.object.updateProjectionMatrix(),this.dispatchEvent(E),this.update(),this.state=N.NONE}pan(e,t){this._pan(e,t),this.update()}dollyIn(e){this._dollyIn(e),this.update()}dollyOut(e){this._dollyOut(e),this.update()}rotateLeft(e){this._rotateLeft(e),this.update()}rotateUp(e){this._rotateUp(e),this.update()}update(e=null){let t=this.object.position;j.copy(t).sub(this.target),j.applyQuaternion(this._quat),this._spherical.setFromVector3(j),this.autoRotate&&this.state===N.NONE&&this._rotateLeft(this._getAutoRotationAngle(e)),this.enableDamping?(this._spherical.theta+=this._sphericalDelta.theta*this.dampingFactor,this._spherical.phi+=this._sphericalDelta.phi*this.dampingFactor):(this._spherical.theta+=this._sphericalDelta.theta,this._spherical.phi+=this._sphericalDelta.phi);let n=this.minAzimuthAngle,r=this.maxAzimuthAngle;isFinite(n)&&isFinite(r)&&(n<-Math.PI?n+=M:n>Math.PI&&(n-=M),r<-Math.PI?r+=M:r>Math.PI&&(r-=M),n<=r?this._spherical.theta=Math.max(n,Math.min(r,this._spherical.theta)):this._spherical.theta=this._spherical.theta>(n+r)/2?Math.max(n,this._spherical.theta):Math.min(r,this._spherical.theta)),this._spherical.phi=Math.max(this.minPolarAngle,Math.min(this.maxPolarAngle,this._spherical.phi)),this._spherical.makeSafe(),this.enableDamping===!0?this.target.addScaledVector(this._panOffset,this.dampingFactor):this.target.add(this._panOffset),this.target.sub(this.cursor),this.target.clampLength(this.minTargetRadius,this.maxTargetRadius),this.target.add(this.cursor);let i=!1;if(this.zoomToCursor&&this._performCursorZoom||this.object.isOrthographicCamera)this._spherical.radius=this._clampDistance(this._spherical.radius);else{let e=this._spherical.radius;this._spherical.radius=this._clampDistance(this._spherical.radius*this._scale),i=e!=this._spherical.radius}if(j.setFromSpherical(this._spherical),j.applyQuaternion(this._quatInverse),t.copy(this.target).add(j),this.object.lookAt(this.target),this.enableDamping===!0?(this._sphericalDelta.theta*=1-this.dampingFactor,this._sphericalDelta.phi*=1-this.dampingFactor,this._panOffset.multiplyScalar(1-this.dampingFactor)):(this._sphericalDelta.set(0,0,0),this._panOffset.set(0,0,0)),this.zoomToCursor&&this._performCursorZoom){let e=null;if(this.object.isPerspectiveCamera){let t=j.length();e=this._clampDistance(t*this._scale);let n=t-e;this.object.position.addScaledVector(this._dollyDirection,n),this.object.updateMatrixWorld(),i=!!n}else if(this.object.isOrthographicCamera){let t=new y(this._mouse.x,this._mouse.y,0);t.unproject(this.object);let n=this.object.zoom;this.object.zoom=Math.max(this.minZoom,Math.min(this.maxZoom,this.object.zoom/this._scale)),this.object.updateProjectionMatrix(),i=n!==this.object.zoom;let r=new y(this._mouse.x,this._mouse.y,0);r.unproject(this.object),this.object.position.sub(r).add(t),this.object.updateMatrixWorld(),e=j.length()}else console.warn(`WARNING: OrbitControls.js encountered an unknown camera type - zoom to cursor disabled.`),this.zoomToCursor=!1;e!==null&&(this.screenSpacePanning?this.target.set(0,0,-1).transformDirection(this.object.matrix).multiplyScalar(e).add(this.object.position):(k.origin.copy(this.object.position),k.direction.set(0,0,-1).transformDirection(this.object.matrix),Math.abs(this.object.up.dot(k.direction))<A?this.object.lookAt(this.target):(_e.setFromNormalAndCoplanarPoint(this.object.up,this.target),k.intersectPlane(_e,this.target))))}else if(this.object.isOrthographicCamera){let e=this.object.zoom;this.object.zoom=Math.max(this.minZoom,Math.min(this.maxZoom,this.object.zoom/this._scale)),e!==this.object.zoom&&(this.object.updateProjectionMatrix(),i=!0)}return this._scale=1,this._performCursorZoom=!1,i||this._lastPosition.distanceToSquared(this.object.position)>P||8*(1-this._lastQuaternion.dot(this.object.quaternion))>P||this._lastTargetPosition.distanceToSquared(this.target)>P?(this.dispatchEvent(E),this._lastPosition.copy(this.object.position),this._lastQuaternion.copy(this.object.quaternion),this._lastTargetPosition.copy(this.target),!0):!1}_getAutoRotationAngle(e){return e===null?M/60/60*this.autoRotateSpeed:M/60*this.autoRotateSpeed*e}_getZoomScale(e){let t=Math.abs(e*.01);return .95**(this.zoomSpeed*t)}_rotateLeft(e){this._sphericalDelta.theta-=e}_rotateUp(e){this._sphericalDelta.phi-=e}_panLeft(e,t){j.setFromMatrixColumn(t,0),j.multiplyScalar(-e),this._panOffset.add(j)}_panUp(e,t){this.screenSpacePanning===!0?j.setFromMatrixColumn(t,1):(j.setFromMatrixColumn(t,0),j.crossVectors(this.object.up,j)),j.multiplyScalar(e),this._panOffset.add(j)}_pan(e,t){let n=this.domElement;if(this.object.isPerspectiveCamera){let r=this.object.position;j.copy(r).sub(this.target);let i=j.length();i*=Math.tan(this.object.fov/2*Math.PI/180),this._panLeft(2*e*i/n.clientHeight,this.object.matrix),this._panUp(2*t*i/n.clientHeight,this.object.matrix)}else this.object.isOrthographicCamera?(this._panLeft(e*(this.object.right-this.object.left)/this.object.zoom/n.clientWidth,this.object.matrix),this._panUp(t*(this.object.top-this.object.bottom)/this.object.zoom/n.clientHeight,this.object.matrix)):(console.warn(`WARNING: OrbitControls.js encountered an unknown camera type - pan disabled.`),this.enablePan=!1)}_dollyOut(e){this.object.isPerspectiveCamera||this.object.isOrthographicCamera?this._scale/=e:(console.warn(`WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled.`),this.enableZoom=!1)}_dollyIn(e){this.object.isPerspectiveCamera||this.object.isOrthographicCamera?this._scale*=e:(console.warn(`WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled.`),this.enableZoom=!1)}_updateZoomParameters(e,t){if(!this.zoomToCursor)return;this._performCursorZoom=!0;let n=this.domElement.getBoundingClientRect(),r=e-n.left,i=t-n.top,a=n.width,o=n.height;this._mouse.x=r/a*2-1,this._mouse.y=-(i/o)*2+1,this._dollyDirection.set(this._mouse.x,this._mouse.y,1).unproject(this.object).sub(this.object.position).normalize()}_clampDistance(e){return Math.max(this.minDistance,Math.min(this.maxDistance,e))}_handleMouseDownRotate(e){this._rotateStart.set(e.clientX,e.clientY)}_handleMouseDownDolly(e){this._updateZoomParameters(e.clientX,e.clientX),this._dollyStart.set(e.clientX,e.clientY)}_handleMouseDownPan(e){this._panStart.set(e.clientX,e.clientY)}_handleMouseMoveRotate(e){this._rotateEnd.set(e.clientX,e.clientY),this._rotateDelta.subVectors(this._rotateEnd,this._rotateStart).multiplyScalar(this.rotateSpeed);let t=this.domElement;this._rotateLeft(M*this._rotateDelta.x/t.clientHeight),this._rotateUp(M*this._rotateDelta.y/t.clientHeight),this._rotateStart.copy(this._rotateEnd),this.update()}_handleMouseMoveDolly(e){this._dollyEnd.set(e.clientX,e.clientY),this._dollyDelta.subVectors(this._dollyEnd,this._dollyStart),this._dollyDelta.y>0?this._dollyOut(this._getZoomScale(this._dollyDelta.y)):this._dollyDelta.y<0&&this._dollyIn(this._getZoomScale(this._dollyDelta.y)),this._dollyStart.copy(this._dollyEnd),this.update()}_handleMouseMovePan(e){this._panEnd.set(e.clientX,e.clientY),this._panDelta.subVectors(this._panEnd,this._panStart).multiplyScalar(this.panSpeed),this._pan(this._panDelta.x,this._panDelta.y),this._panStart.copy(this._panEnd),this.update()}_handleMouseWheel(e){this._updateZoomParameters(e.clientX,e.clientY),e.deltaY<0?this._dollyIn(this._getZoomScale(e.deltaY)):e.deltaY>0&&this._dollyOut(this._getZoomScale(e.deltaY)),this.update()}_handleKeyDown(e){let t=!1;switch(e.code){case this.keys.UP:e.ctrlKey||e.metaKey||e.shiftKey?this.enableRotate&&this._rotateUp(M*this.keyRotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(0,this.keyPanSpeed),t=!0;break;case this.keys.BOTTOM:e.ctrlKey||e.metaKey||e.shiftKey?this.enableRotate&&this._rotateUp(-M*this.keyRotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(0,-this.keyPanSpeed),t=!0;break;case this.keys.LEFT:e.ctrlKey||e.metaKey||e.shiftKey?this.enableRotate&&this._rotateLeft(M*this.keyRotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(this.keyPanSpeed,0),t=!0;break;case this.keys.RIGHT:e.ctrlKey||e.metaKey||e.shiftKey?this.enableRotate&&this._rotateLeft(-M*this.keyRotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(-this.keyPanSpeed,0),t=!0}t&&(e.preventDefault(),this.update())}_handleTouchStartRotate(e){if(this._pointers.length===1)this._rotateStart.set(e.pageX,e.pageY);else{let t=this._getSecondPointerPosition(e),n=.5*(e.pageX+t.x),r=.5*(e.pageY+t.y);this._rotateStart.set(n,r)}}_handleTouchStartPan(e){if(this._pointers.length===1)this._panStart.set(e.pageX,e.pageY);else{let t=this._getSecondPointerPosition(e),n=.5*(e.pageX+t.x),r=.5*(e.pageY+t.y);this._panStart.set(n,r)}}_handleTouchStartDolly(e){let t=this._getSecondPointerPosition(e),n=e.pageX-t.x,r=e.pageY-t.y,i=Math.sqrt(n*n+r*r);this._dollyStart.set(0,i)}_handleTouchStartDollyPan(e){this.enableZoom&&this._handleTouchStartDolly(e),this.enablePan&&this._handleTouchStartPan(e)}_handleTouchStartDollyRotate(e){this.enableZoom&&this._handleTouchStartDolly(e),this.enableRotate&&this._handleTouchStartRotate(e)}_handleTouchMoveRotate(e){if(this._pointers.length==1)this._rotateEnd.set(e.pageX,e.pageY);else{let t=this._getSecondPointerPosition(e),n=.5*(e.pageX+t.x),r=.5*(e.pageY+t.y);this._rotateEnd.set(n,r)}this._rotateDelta.subVectors(this._rotateEnd,this._rotateStart).multiplyScalar(this.rotateSpeed);let t=this.domElement;this._rotateLeft(M*this._rotateDelta.x/t.clientHeight),this._rotateUp(M*this._rotateDelta.y/t.clientHeight),this._rotateStart.copy(this._rotateEnd)}_handleTouchMovePan(e){if(this._pointers.length===1)this._panEnd.set(e.pageX,e.pageY);else{let t=this._getSecondPointerPosition(e),n=.5*(e.pageX+t.x),r=.5*(e.pageY+t.y);this._panEnd.set(n,r)}this._panDelta.subVectors(this._panEnd,this._panStart).multiplyScalar(this.panSpeed),this._pan(this._panDelta.x,this._panDelta.y),this._panStart.copy(this._panEnd)}_handleTouchMoveDolly(e){let t=this._getSecondPointerPosition(e),n=e.pageX-t.x,r=e.pageY-t.y,i=Math.sqrt(n*n+r*r);this._dollyEnd.set(0,i),this._dollyDelta.set(0,(this._dollyEnd.y/this._dollyStart.y)**+this.zoomSpeed),this._dollyOut(this._dollyDelta.y),this._dollyStart.copy(this._dollyEnd);let a=(e.pageX+t.x)*.5,o=(e.pageY+t.y)*.5;this._updateZoomParameters(a,o)}_handleTouchMoveDollyPan(e){this.enableZoom&&this._handleTouchMoveDolly(e),this.enablePan&&this._handleTouchMovePan(e)}_handleTouchMoveDollyRotate(e){this.enableZoom&&this._handleTouchMoveDolly(e),this.enableRotate&&this._handleTouchMoveRotate(e)}_addPointer(e){this._pointers.push(e.pointerId)}_removePointer(e){delete this._pointerPositions[e.pointerId];for(let t=0;t<this._pointers.length;t++)if(this._pointers[t]==e.pointerId){this._pointers.splice(t,1);return}}_isTrackingPointer(e){for(let t=0;t<this._pointers.length;t++)if(this._pointers[t]==e.pointerId)return!0;return!1}_trackPointer(e){let t=this._pointerPositions[e.pointerId];t===void 0&&(t=new i,this._pointerPositions[e.pointerId]=t),t.set(e.pageX,e.pageY)}_getSecondPointerPosition(e){let t=e.pointerId===this._pointers[0]?this._pointers[1]:this._pointers[0];return this._pointerPositions[t]}_customWheelEvent(e){let t=e.deltaMode,n={clientX:e.clientX,clientY:e.clientY,deltaY:e.deltaY};switch(t){case 1:n.deltaY*=16;break;case 2:n.deltaY*=100}return e.ctrlKey&&!this._controlActive&&(n.deltaY*=10),n}};function ye(e){this.enabled!==!1&&(this._pointers.length===0&&(this.domElement.setPointerCapture(e.pointerId),this.domElement.ownerDocument.addEventListener(`pointermove`,this._onPointerMove),this.domElement.ownerDocument.addEventListener(`pointerup`,this._onPointerUp)),!this._isTrackingPointer(e)&&(this._addPointer(e),e.pointerType===`touch`?this._onTouchStart(e):this._onMouseDown(e),this._cursorStyle===`grab`&&(this.domElement.style.cursor=`grabbing`)))}function F(e){this.enabled!==!1&&(e.pointerType===`touch`?this._onTouchMove(e):this._onMouseMove(e))}function be(e){switch(this._removePointer(e),this._pointers.length){case 0:this.domElement.releasePointerCapture(e.pointerId),this.domElement.ownerDocument.removeEventListener(`pointermove`,this._onPointerMove),this.domElement.ownerDocument.removeEventListener(`pointerup`,this._onPointerUp),this.dispatchEvent(O),this.state=N.NONE,this._cursorStyle===`grab`&&(this.domElement.style.cursor=`grab`);break;case 1:let t=this._pointers[0],n=this._pointerPositions[t];this._onTouchStart({pointerId:t,pageX:n.x,pageY:n.y})}}function xe(e){let t;switch(e.button){case 0:t=this.mouseButtons.LEFT;break;case 1:t=this.mouseButtons.MIDDLE;break;case 2:t=this.mouseButtons.RIGHT;break;default:t=-1}switch(t){case _.DOLLY:if(this.enableZoom===!1)return;this._handleMouseDownDolly(e),this.state=N.DOLLY;break;case _.ROTATE:if(e.ctrlKey||e.metaKey||e.shiftKey){if(this.enablePan===!1)return;this._handleMouseDownPan(e),this.state=N.PAN}else{if(this.enableRotate===!1)return;this._handleMouseDownRotate(e),this.state=N.ROTATE}break;case _.PAN:if(e.ctrlKey||e.metaKey||e.shiftKey){if(this.enableRotate===!1)return;this._handleMouseDownRotate(e),this.state=N.ROTATE}else{if(this.enablePan===!1)return;this._handleMouseDownPan(e),this.state=N.PAN}break;default:this.state=N.NONE}this.state!==N.NONE&&this.dispatchEvent(D)}function Se(e){switch(this.state){case N.ROTATE:if(this.enableRotate===!1)return;this._handleMouseMoveRotate(e);break;case N.DOLLY:if(this.enableZoom===!1)return;this._handleMouseMoveDolly(e);break;case N.PAN:if(this.enablePan===!1)return;this._handleMouseMovePan(e)}}function Ce(e){this.enabled!==!1&&this.enableZoom!==!1&&this.state===N.NONE&&(e.preventDefault(),this.dispatchEvent(D),this._handleMouseWheel(this._customWheelEvent(e)),this.dispatchEvent(O))}function I(e){this.enabled!==!1&&this._handleKeyDown(e)}function we(e){switch(this._trackPointer(e),this._pointers.length){case 1:switch(this.touches.ONE){case x.ROTATE:if(this.enableRotate===!1)return;this._handleTouchStartRotate(e),this.state=N.TOUCH_ROTATE;break;case x.PAN:if(this.enablePan===!1)return;this._handleTouchStartPan(e),this.state=N.TOUCH_PAN;break;default:this.state=N.NONE}break;case 2:switch(this.touches.TWO){case x.DOLLY_PAN:if(this.enableZoom===!1&&this.enablePan===!1)return;this._handleTouchStartDollyPan(e),this.state=N.TOUCH_DOLLY_PAN;break;case x.DOLLY_ROTATE:if(this.enableZoom===!1&&this.enableRotate===!1)return;this._handleTouchStartDollyRotate(e),this.state=N.TOUCH_DOLLY_ROTATE;break;default:this.state=N.NONE}break;default:this.state=N.NONE}this.state!==N.NONE&&this.dispatchEvent(D)}function Te(e){switch(this._trackPointer(e),this.state){case N.TOUCH_ROTATE:if(this.enableRotate===!1)return;this._handleTouchMoveRotate(e),this.update();break;case N.TOUCH_PAN:if(this.enablePan===!1)return;this._handleTouchMovePan(e),this.update();break;case N.TOUCH_DOLLY_PAN:if(this.enableZoom===!1&&this.enablePan===!1)return;this._handleTouchMoveDollyPan(e),this.update();break;case N.TOUCH_DOLLY_ROTATE:if(this.enableZoom===!1&&this.enableRotate===!1)return;this._handleTouchMoveDollyRotate(e),this.update();break;default:this.state=N.NONE}}function Ee(e){this.enabled!==!1&&e.preventDefault()}function De(e){e.key===`Control`&&(this._controlActive=!0,this.domElement.getRootNode().addEventListener(`keyup`,this._interceptControlUp,{passive:!0,capture:!0}))}function Oe(e){e.key===`Control`&&(this._controlActive=!1,this.domElement.getRootNode().removeEventListener(`keyup`,this._interceptControlUp,{passive:!0,capture:!0}))}var L=new fe,R=new y,z=class extends h{constructor(){super(),this.isLineSegmentsGeometry=!0,this.type=`LineSegmentsGeometry`,this.setIndex([0,2,1,2,3,1,2,4,3,4,5,3,4,6,5,6,7,5]),this.setAttribute(`position`,new a([-1,2,0,1,2,0,-1,1,0,1,1,0,-1,0,0,1,0,0,-1,-1,0,1,-1,0],3)),this.setAttribute(`uv`,new a([-1,2,1,2,-1,1,1,1,-1,-1,1,-1,-1,-2,1,-2],2))}applyMatrix4(e){let t=this.attributes.instanceStart,n=this.attributes.instanceEnd;return t!==void 0&&(t.applyMatrix4(e),n.applyMatrix4(e),t.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this}setPositions(e){let t;e instanceof Float32Array?t=e:Array.isArray(e)&&(t=new Float32Array(e));let n=new f(t,6,1);return this.setAttribute(`instanceStart`,new b(n,3,0)),this.setAttribute(`instanceEnd`,new b(n,3,3)),this.instanceCount=this.attributes.instanceStart.count,this.computeBoundingBox(),this.computeBoundingSphere(),this}setColors(e){let t;e instanceof Float32Array?t=e:Array.isArray(e)&&(t=new Float32Array(e));let n=new f(t,6,1);return this.setAttribute(`instanceColorStart`,new b(n,3,0)),this.setAttribute(`instanceColorEnd`,new b(n,3,3)),this}fromWireframeGeometry(e){return this.setPositions(e.attributes.position.array),this}fromEdgesGeometry(e){return this.setPositions(e.attributes.position.array),this}fromMesh(e){return this.fromWireframeGeometry(new u(e.geometry)),this}fromLineSegments(e){let t=e.geometry;return this.setPositions(t.attributes.position.array),this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new fe);let e=this.attributes.instanceStart,t=this.attributes.instanceEnd;e!==void 0&&t!==void 0&&(this.boundingBox.setFromBufferAttribute(e),L.setFromBufferAttribute(t),this.boundingBox.union(L))}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new de),this.boundingBox===null&&this.computeBoundingBox();let e=this.attributes.instanceStart,t=this.attributes.instanceEnd;if(e!==void 0&&t!==void 0){let n=this.boundingSphere.center;this.boundingBox.getCenter(n);let r=0;for(let i=0,a=e.count;i<a;i++)R.fromBufferAttribute(e,i),r=Math.max(r,n.distanceToSquared(R)),R.fromBufferAttribute(t,i),r=Math.max(r,n.distanceToSquared(R));this.boundingSphere.radius=Math.sqrt(r),isNaN(this.boundingSphere.radius)&&console.error(`THREE.LineSegmentsGeometry.computeBoundingSphere(): Computed radius is NaN. The instanced position data is likely to have NaN values.`,this)}}toJSON(){}};C.line={worldUnits:{value:1},linewidth:{value:1},resolution:{value:new i},dashOffset:{value:0},dashScale:{value:1},dashSize:{value:1},gapSize:{value:1}},w.line={uniforms:S.merge([C.common,C.fog,C.line]),vertexShader:`
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
		`};var ke=class extends ee{constructor(e){super({type:`LineMaterial`,uniforms:S.clone(w.line.uniforms),vertexShader:w.line.vertexShader,fragmentShader:w.line.fragmentShader,clipping:!0}),this.isLineMaterial=!0,this.setValues(e)}get color(){return this.uniforms.diffuse.value}set color(e){this.uniforms.diffuse.value=e}get worldUnits(){return`WORLD_UNITS`in this.defines}set worldUnits(e){e===!0!==this.worldUnits&&(this.needsUpdate=!0),e===!0?this.defines.WORLD_UNITS=``:delete this.defines.WORLD_UNITS}get linewidth(){return this.uniforms.linewidth.value}set linewidth(e){this.uniforms.linewidth&&(this.uniforms.linewidth.value=e)}get dashed(){return`USE_DASH`in this.defines}set dashed(e){e===!0!==this.dashed&&(this.needsUpdate=!0),e===!0?this.defines.USE_DASH=``:delete this.defines.USE_DASH}get dashScale(){return this.uniforms.dashScale.value}set dashScale(e){this.uniforms.dashScale.value=e}get dashSize(){return this.uniforms.dashSize.value}set dashSize(e){this.uniforms.dashSize.value=e}get dashOffset(){return this.uniforms.dashOffset.value}set dashOffset(e){this.uniforms.dashOffset.value=e}get gapSize(){return this.uniforms.gapSize.value}set gapSize(e){this.uniforms.gapSize.value=e}get opacity(){return this.uniforms.opacity.value}set opacity(e){this.uniforms&&(this.uniforms.opacity.value=e)}get resolution(){return this.uniforms.resolution.value}set resolution(e){this.uniforms.resolution.value.copy(e)}get alphaToCoverage(){return`USE_ALPHA_TO_COVERAGE`in this.defines}set alphaToCoverage(e){this.defines&&(e===!0!==this.alphaToCoverage&&(this.needsUpdate=!0),e===!0?this.defines.USE_ALPHA_TO_COVERAGE=``:delete this.defines.USE_ALPHA_TO_COVERAGE)}},Ae=new d,je=new y,B=new y,V=new d,H=new d,U=new d,W=new y,G=new he,K=new ue,Me=new y,q=new fe,J=new de,Y=new d,X,Z;function Ne(e,t,n){return Y.set(0,0,-t,1).applyMatrix4(e.projectionMatrix),Y.multiplyScalar(1/Y.w),Y.x=Z/n.width,Y.y=Z/n.height,Y.applyMatrix4(e.projectionMatrixInverse),Y.multiplyScalar(1/Y.w),Math.abs(Math.max(Y.x,Y.y))}function Pe(e,t){let n=e.matrixWorld,r=e.geometry,i=r.attributes.instanceStart,a=r.attributes.instanceEnd,o=Math.min(r.instanceCount,i.count);for(let r=0,s=o;r<s;r++){K.start.fromBufferAttribute(i,r),K.end.fromBufferAttribute(a,r),K.applyMatrix4(n);let o=new y,s=new y;X.distanceSqToSegment(K.start,K.end,s,o),s.distanceTo(o)<Z*.5&&t.push({point:s,pointOnLine:o,distance:X.origin.distanceTo(s),object:e,face:null,faceIndex:r,uv:null,uv1:null})}}function Fe(e,t,n){let r=t.projectionMatrix,i=e.material.resolution,a=e.matrixWorld,o=e.geometry,s=o.attributes.instanceStart,c=o.attributes.instanceEnd,l=Math.min(o.instanceCount,s.count),u=-t.near;X.at(1,U),U.w=1,U.applyMatrix4(t.matrixWorldInverse),U.applyMatrix4(r),U.multiplyScalar(1/U.w),U.x*=i.x/2,U.y*=i.y/2,U.z=0,W.copy(U),G.multiplyMatrices(t.matrixWorldInverse,a);for(let t=0,o=l;t<o;t++){if(V.fromBufferAttribute(s,t),H.fromBufferAttribute(c,t),V.w=1,H.w=1,V.applyMatrix4(G),H.applyMatrix4(G),V.z>u&&H.z>u)continue;if(V.z>u){let e=V.z-H.z,t=(V.z-u)/e;V.lerp(H,t)}else if(H.z>u){let e=H.z-V.z,t=(H.z-u)/e;H.lerp(V,t)}V.applyMatrix4(r),H.applyMatrix4(r),V.multiplyScalar(1/V.w),H.multiplyScalar(1/H.w),V.x*=i.x/2,V.y*=i.y/2,H.x*=i.x/2,H.y*=i.y/2,K.start.copy(V),K.start.z=0,K.end.copy(H),K.end.z=0;let o=K.closestPointToPointParameter(W,!0);K.at(o,Me);let l=p.lerp(V.z,H.z,o),d=l>=-1&&l<=1,f=W.distanceTo(Me)<Z*.5;if(d&&f){K.start.fromBufferAttribute(s,t),K.end.fromBufferAttribute(c,t),K.start.applyMatrix4(a),K.end.applyMatrix4(a);let r=new y,i=new y;X.distanceSqToSegment(K.start,K.end,i,r),n.push({point:i,pointOnLine:r,distance:X.origin.distanceTo(i),object:e,face:null,faceIndex:t,uv:null,uv1:null})}}}var Ie=class extends ne{constructor(e=new z,t=new ke({color:Math.random()*16777215})){super(e,t),this.isLineSegments2=!0,this.type=`LineSegments2`}computeLineDistances(){let e=this.geometry,t=e.attributes.instanceStart,n=e.attributes.instanceEnd,r=new Float32Array(2*t.count);for(let e=0,i=0,a=t.count;e<a;e++,i+=2)je.fromBufferAttribute(t,e),B.fromBufferAttribute(n,e),r[i]=i===0?0:r[i-1],r[i+1]=r[i]+je.distanceTo(B);let i=new f(r,2,1);return e.setAttribute(`instanceDistanceStart`,new b(i,1,0)),e.setAttribute(`instanceDistanceEnd`,new b(i,1,1)),this}raycast(e,t){let n=this.material.worldUnits,r=e.camera;if(r===null&&!n&&console.error(`LineSegments2: "Raycaster.camera" needs to be set in order to raycast against LineSegments2 while worldUnits is set to false.`),n===!1&&(this.material.resolution.x===0||this.material.resolution.y===0))return;let i=e.params.Line2===void 0?0:e.params.Line2.threshold||0;X=e.ray;let a=this.matrixWorld,o=this.geometry,s=this.material;Z=s.linewidth+i,o.boundingSphere===null&&o.computeBoundingSphere(),J.copy(o.boundingSphere).applyMatrix4(a);let c;if(c=n?Z*.5:Ne(r,Math.max(r.near,J.distanceToPoint(X.origin)),s.resolution),J.radius+=c,X.intersectsSphere(J)===!1)return;o.boundingBox===null&&o.computeBoundingBox(),q.copy(o.boundingBox).applyMatrix4(a);let l;l=n?Z*.5:Ne(r,Math.max(r.near,q.distanceToPoint(X.origin)),s.resolution),q.expandByScalar(l),X.intersectsBox(q)!==!1&&(n?Pe(this,t):Fe(this,r,t))}onBeforeRender(e){let t=this.material.uniforms;t&&t.resolution&&(e.getViewport(Ae),this.material.uniforms.resolution.value.set(Ae.z,Ae.w))}},Le=class extends z{constructor(){super(),this.isLineGeometry=!0,this.type=`LineGeometry`}setPositions(e){let t=e.length-3,n=new Float32Array(2*t);for(let r=0;r<t;r+=3)n[2*r]=e[r],n[2*r+1]=e[r+1],n[2*r+2]=e[r+2],n[2*r+3]=e[r+3],n[2*r+4]=e[r+4],n[2*r+5]=e[r+5];return super.setPositions(n),this}setColors(e){let t=e.length-3,n=new Float32Array(2*t);for(let r=0;r<t;r+=3)n[2*r]=e[r],n[2*r+1]=e[r+1],n[2*r+2]=e[r+2],n[2*r+3]=e[r+3],n[2*r+4]=e[r+4],n[2*r+5]=e[r+5];return super.setColors(n),this}setFromPoints(e){let t=e.length-1,n=new Float32Array(6*t);for(let r=0;r<t;r++)n[6*r]=e[r].x,n[6*r+1]=e[r].y,n[6*r+2]=e[r].z||0,n[6*r+3]=e[r+1].x,n[6*r+4]=e[r+1].y,n[6*r+5]=e[r+1].z||0;return super.setPositions(n),this}fromLine(e){let t=e.geometry;return this.setPositions(t.attributes.position.array),this}},Re=class extends Ie{constructor(e=new Le,t=new ke({color:Math.random()*16777215})){super(e,t),this.isLine2=!0,this.type=`Line2`}},Q=(e,t=1)=>{let n=p.degToRad(e.lat),r=p.degToRad(e.lng);return new y(Math.cos(n)*Math.cos(r),Math.sin(n),-Math.cos(n)*Math.sin(r)).multiplyScalar(t)},ze=(e,t)=>p.radToDeg(Math.atan(Math.sinh(Math.PI*(1-2*e/t)))),Be=ze(0,1);function Ve(e,t,n){let r=2**e,i=e<4?32:e<7?16:8,o=[],s=[],c=[],l=Array.from({length:i+1},(e,t)=>({lat:ze(n+t/i,r),v:1-t/i}));for(let{lat:e,v:n}of l)for(let a=0;a<=i;a++){let c=Q({lat:e,lng:(t+a/i)/r*360-180});o.push(c.x,c.y,c.z),s.push(a/i,n)}for(let e=0;e<l.length-1;e++)for(let t=0;t<i;t++){let n=e*(i+1)+t,r=n+i+1;c.push(n,r,n+1,r,r+1,n+1)}let u=new me;return u.setAttribute(`position`,new a(o,3)),u.setAttribute(`uv`,new a(s,2)),u.setIndex(c),u}function He(e){let t=[],n=[],r=[];for(let r=0;r<=24;r++){let i=e?90-(90-Be)*r/24:-Be-(90-Be)*r/24;for(let e=0;e<=128;e++){let r=Q({lat:i,lng:e/128*360-180});t.push(r.x,r.y,r.z),n.push(e/128,(i+90)/180)}}for(let t=0;t<24;t++)for(let n=0;n<128;n++){let i=t*129+n,a=i+128+1;(!e||t>0)&&r.push(i,a,i+1),(e||t<23)&&r.push(a,a+1,i+1)}let i=new me;return i.setAttribute(`position`,new a(t,3)),i.setAttribute(`uv`,new a(n,2)),i.setIndex(r),i}function Ue(e,t,n,r=0,i=1){let a=Math.max(1080,e)/2/Math.tan(p.degToRad(t/2))/n,o=Math.cos(p.degToRad(Math.min(Math.abs(r),Be)))*Math.sqrt(Math.max(.1,i));return Math.min(16,Math.ceil(Math.log2(a*2*Math.PI*o/256)))}var $=n(),We=e=>({lat:p.radToDeg(Math.asin(p.clamp(e.y/e.length(),-1,1))),lng:p.radToDeg(Math.atan2(-e.z,e.x))}),Ge=(e,t,n)=>`https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/${e}/${n}/${t}`,Ke=4,qe=16,Je=220,Ye=8,Xe=.0095;function Ze(e){let t=document.createElement(`canvas`);t.width=64,t.height=96;let n=t.getContext(`2d`);if(!n)return null;n.shadowColor=`#0008`,n.shadowBlur=6,n.shadowOffsetY=2,n.beginPath(),n.moveTo(32,92),n.bezierCurveTo(26,74,8,62,8,34),n.arc(32,34,24,Math.PI,0),n.bezierCurveTo(56,62,38,74,32,92),n.closePath(),n.fillStyle=e.color,n.fill(),n.shadowColor=`transparent`,n.lineWidth=4,n.strokeStyle=`#ffffff`,n.stroke(),n.fillStyle=e.answer?`#173f40`:`#ffffff`,n.font=`bold 28px sans-serif`,n.textAlign=`center`,n.textBaseline=`middle`,n.fillText(e.answer?`★`:e.label.slice(0,1),32,35);let r=new se(t);return r.colorSpace=ie,r}var Qe=()=>typeof window<`u`&&window.matchMedia?.(`(prefers-reduced-motion: reduce)`).matches;function $e({pins:e,onPin:t}){let n=(0,T.useRef)(null),a=(0,T.useRef)(null),l=(0,T.useRef)(t),[u,d]=(0,T.useState)(`Loading satellite imagery…`),[f,re]=(0,T.useState)(!1),[m,h]=(0,T.useState)(0);return(0,T.useEffect)(()=>{l.current=t},[t]),(0,T.useEffect)(()=>{let e=n.current;if(!e)return;let t;try{t=new ge({antialias:!0,alpha:!0})}catch{queueMicrotask(()=>d(`The globe needs WebGL. Enable hardware acceleration or try another browser.`));return}let u=!1,f=!1,m=new ae;t.setClearColor(0,0);let h=new c(40,1,.002,20),g=t.domElement;g.tabIndex=0,g.setAttribute(`role`,`application`),g.setAttribute(`aria-label`,`Satellite globe. Drag to rotate; pinch or scroll to zoom. Arrow keys rotate, plus and minus zoom, Enter places a pin at the crosshair. Home resets the globe.`),e.appendChild(g),t.setPixelRatio(r(window.innerWidth,window.innerHeight));let _=new ve(h,g);_.enablePan=!1,_.enableDamping=!1,_.enableZoom=!1,_.minDistance=1.0095,_.maxDistance=8,_.touches.TWO=x.DOLLY_ROTATE;let v=new o({color:`#ffffff`}),se=new pe(1,128,96),ue=new ne(se,v);ue.scale.setScalar(.997),m.add(ue);let b=[!0,!1].map(e=>{let t=new ne(He(e),v);return m.add(t),t}),fe=new pe(1.045,64,48),me=new ne(fe,new ee({side:1,transparent:!0,depthWrite:!1,vertexShader:`varying vec3 vNormal; varying vec3 vView;
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
          }`}));m.add(me);let he=new s;m.add(he);let S=new s;m.add(S);let C=new s;m.add(C);let w=0,T=null,E=null,D=()=>p.degToRad(h.fov/2);function O(){return 1.04/Math.sin(Math.atan(Math.tan(D())*Math.min(1,h.aspect)))}function k(){let e=h.position.length()-1;_.rotateSpeed=p.clamp(e*Math.tan(D())/Math.PI,5e-4,1)}function _e(){if(u)return;w=0;let e=performance.now();if(E){let t=Math.min(1,(e-E.start)/E.ms),n=t<.5?4*t**3:1-(-2*t+2)**3/2,r=p.lerp(E.from.length(),E.to.length(),n);h.position.copy(E.from).normalize().lerp(E.to.clone().normalize(),n).normalize().multiplyScalar(r),_.update(),t>=1&&(E=null)}if(T){let t=Math.min(1,(e-T.start)/900);for(let e of T.lines){let n=e.userData.segments;e.geometry.instanceCount=Math.max(1,Math.round(n*t))}t>=1&&(T=null)}k(),me.visible=h.position.length()>1.12;let n=h.position;for(let e of S.children)e.visible=e.userData.normal.dot(n)>1.002;Ce(),t.render(m,h),(E||T)&&A()}let A=()=>{!u&&!w&&(w=requestAnimationFrame(_e))},j=new Map,M=0,N=[],P=new te,ye=new de(new y,1),F=new y;function be(e,n=0,r=1){return Ue(t.domElement.height,h.fov,e,n,r)}function xe(e,n,r){let i=`${e}/${n}/${r}`,a=new o({transparent:!0,opacity:0,depthWrite:!1,polygonOffset:!0,polygonOffsetFactor:-1-e,polygonOffsetUnits:-4-e}),s=new ne(Ve(e,n,r),a);s.renderOrder=e,s.visible=!1,he.add(s);let c={mesh:s,z:e,ready:!1,used:performance.now()};j.set(i,c),M++,new le().load(Ge(e,n,r),e=>{if(M--,u||j.get(i)!==c){e.dispose();return}e.colorSpace=ie,e.anisotropy=t.capabilities.getMaxAnisotropy(),a.map=e,a.opacity=1,a.transparent=!1,a.needsUpdate=!0,c.ready=!0,A()},void 0,()=>{M--,A()})}function Se(e){let t=j.get(e),n=t.mesh.material;n.map?.dispose(),n.dispose(),t.mesh.geometry.dispose(),he.remove(t.mesh),j.delete(e)}function Ce(){for(let e of j.values())e.mesh.visible=!1;if(!f||be(h.position.length()-1)<Ke){N=[],re(!1);return}let e=new Map,t=new i;for(let n=0;n<=20;n++)for(let r=0;r<=20;r++){if(t.set(r/20*2-1,n/20*2-1),P.setFromCamera(t,h),!P.ray.intersectSphere(ye,F))continue;let i=We(F);if(Math.abs(i.lat)>=Be)continue;let a=p.clamp(be(F.distanceTo(h.position),i.lat,-F.dot(P.ray.direction)),3,qe),o=2**a,s=Math.floor((i.lng+180)/360*o)%o,c=Math.sin(p.degToRad(i.lat)),l=p.clamp(Math.floor((.5-Math.log((1+c)/(1-c))/(4*Math.PI))*o),0,o-1),u=Math.hypot(r/20-.5,n/20-.5);for(let t of Math.abs(i.lat)>60?[0,-1,1]:[0]){let n=(s+t+o)%o,r=`${a}/${n}/${l}`,i=e.get(r);(!i||i[3]>u)&&e.set(r,[a,n,l,u])}}let n=performance.now();N=[];for(let[t,[r,i,a,o]]of e){let e=j.get(t);if(e?.ready){e.mesh.visible=!0,e.used=n;continue}e||N.push([r,i,a,o]);for(let e=1;e<=r;e++){let t=j.get(`${r-e}/${i>>e}/${a>>e}`);if(t?.ready){t.mesh.visible=!0,t.used=n;break}}}for(N.sort((e,t)=>e[3]-t[3]);M<Ye&&N.length;){let[e,t,n]=N.shift();xe(e,t,n)}if(j.size>Je){let e=[...j.entries()].filter(([,e])=>!e.mesh.visible&&e.ready).sort((e,t)=>e[1].used-t[1].used).slice(0,j.size-Je);for(let[t]of e)Se(t)}re([...j.values()].some(e=>e.mesh.visible))}let I=new le().load(`/games/maps/earth-satellite.jpg`,()=>{if(u){I.dispose();return}f=!0,d(``),A()},void 0,()=>{u||d(`Satellite imagery could not load. Retry the globe.`)});I.colorSpace=ie,I.anisotropy=t.capabilities.getMaxAnisotropy(),v.map=I;function we(){for(;S.children.length;){let e=S.children[0];e.material.map?.dispose(),e.material.dispose(),S.remove(e)}for(;C.children.length;){let e=C.children[0];e.geometry.dispose(),e.material.dispose(),C.remove(e)}T=null}let Te=``,Ee=[];function De(t){we(),Ee=t;let{width:n,height:r}=e.getBoundingClientRect();for(let e of t){let t=Ze(e);if(!t)continue;let n=new oe(new ce({map:t,sizeAttenuation:!1,depthTest:!1,depthWrite:!1}));n.center.set(.5,0),n.renderOrder=e.answer?1001:1e3,n.position.copy(Q(e,1.001)),n.userData.normal=Q(e),n.scale.set(.04,.06,1),S.add(n)}let a=t.find(e=>e.answer),o=[];if(a){let e=Q(a);for(let a of t){if(a.answer)continue;let t=Q(a),s=t.angleTo(e);if(s<.002)continue;let c=Math.max(12,Math.ceil(s*60)),l=Math.min(.2,s*.12),u=[];for(let n=0;n<=c;n++){let r=n/c,i=t.clone().multiplyScalar(Math.sin((1-r)*s)).add(e.clone().multiplyScalar(Math.sin(r*s))).divideScalar(Math.sin(s)).multiplyScalar(1.002+Math.sin(r*Math.PI)*l);u.push(i.x,i.y,i.z)}let d=new Le;d.setPositions(u);let f=new Re(d,new ke({color:a.color,linewidth:3,transparent:!0,opacity:.95,resolution:new i(n,r)}));f.userData.segments=c,f.renderOrder=900,C.add(f),o.push(f)}let s=`${a.lat},${a.lng}`;if(s!==Te&&(Te=s,Oe(t,a),!Qe()&&o.length)){for(let e of o)e.geometry.instanceCount=1;T={start:performance.now()+350,lines:o}}}else Te=``;A()}function Oe(e,t){let n=Q(t),r=e.reduce((e,t)=>e.add(Q(t)),new y).add(n.clone().multiplyScalar(e.length)).normalize();r.lengthSq()===0&&r.copy(n);let i=Math.max(...e.map(e=>r.angleTo(Q(e)))),a=p.clamp(i*2.6+.12,.15,O()-1),o=r.multiplyScalar(1+a);Qe()?(h.position.copy(o),_.update()):E={start:performance.now(),from:h.position.clone(),to:o,ms:1100}}function L(){let e=O();_.maxDistance=Math.max(8,e),E=null,h.position.copy(Q({lat:18,lng:8},e)),_.update(),A()}function R(e){E=null;let t=p.clamp((h.position.length()-1)*e,Xe,_.maxDistance-1);h.position.setLength(1+t),_.update(),A()}let z=0,Ae=new ResizeObserver(()=>{let{width:n,height:i}=e.getBoundingClientRect();if(!n||!i)return;h.aspect=n/i,h.updateProjectionMatrix(),t.setPixelRatio(r(n,i)),t.setSize(n,i,!1);for(let e of C.children)e.material.resolution.set(n,i);let a=O();if(z)_.maxDistance=Math.max(8,a),h.position.setLength(p.clamp(1+(h.position.length()-1)*(a-1)/(z-1),_.minDistance,_.maxDistance)),_.update();else{L();let e=Ee.find(e=>e.answer);e&&Oe(Ee,e)}z=a,A()});Ae.observe(e),_.addEventListener(`change`,A),_.addEventListener(`start`,()=>{E=null});function je(e,t){f&&(P.setFromCamera(new i(e,t),h),P.ray.intersectSphere(ye,F)&&l.current?.(We(F)))}let B=new Map,V=null,H=0,U=()=>{let[e,t]=[...B.values()];return Math.hypot(e.x-t.x,e.y-t.y)},W=e=>{B.set(e.pointerId,{x:e.clientX,y:e.clientY}),B.size===1&&e.button===0?V={x:e.clientX,y:e.clientY,moved:!1}:V&&(V.moved=!0),B.size===2&&(H=U())},G=e=>{if(B.has(e.pointerId)&&(B.set(e.pointerId,{x:e.clientX,y:e.clientY}),V&&Math.hypot(e.clientX-V.x,e.clientY-V.y)>5&&(V.moved=!0),B.size===2)){let e=U();H>0&&e>0&&R(H/e),H=e}},K=e=>{if(V&&!V.moved&&B.size===1){let t=g.getBoundingClientRect();je((e.clientX-t.left)/t.width*2-1,1-(e.clientY-t.top)/t.height*2)}B.delete(e.pointerId),B.size||(V=null)},Me=e=>{B.delete(e.pointerId),V&&(V.moved=!0)},q=e=>{e.preventDefault();let t=e.deltaMode===1?e.deltaY*16:e.deltaMode===2?e.deltaY*400:e.deltaY;R(Math.exp(p.clamp(t,-120,120)*(e.ctrlKey?.01:.0025)))},J=e=>{if(![`ArrowLeft`,`ArrowRight`,`ArrowUp`,`ArrowDown`,`+`,`=`,`-`,`Enter`,` `,`Home`].includes(e.key))return;if(e.preventDefault(),e.key===`Home`){L();return}if(e.key===`Enter`||e.key===` `){je(0,0);return}if(!e.key.startsWith(`Arrow`)){R(e.key===`-`?1.4:1/1.4);return}E=null;let t=We(h.position),n=h.position.length(),r=(e.shiftKey?.2:3)*Math.min(1,(n-1)*1.5);t.lng+=e.key===`ArrowLeft`?-r:e.key===`ArrowRight`?r:0,t.lat=p.clamp(t.lat+(e.key===`ArrowUp`?r:e.key===`ArrowDown`?-r:0),-89,89),h.position.copy(Q(t,n)),_.update(),A()};g.addEventListener(`pointerdown`,W),g.addEventListener(`pointermove`,G),g.addEventListener(`pointerup`,K),g.addEventListener(`pointercancel`,Me),g.addEventListener(`wheel`,q,{passive:!1}),g.addEventListener(`keydown`,J);let Y=e=>{e.preventDefault(),d(`The graphics connection was lost. Retry the globe.`)};return g.addEventListener(`webglcontextlost`,Y),a.current={reset:L,pins:De},()=>{u=!0,w&&cancelAnimationFrame(w),a.current=null,Ae.disconnect(),_.dispose(),g.removeEventListener(`pointerdown`,W),g.removeEventListener(`pointermove`,G),g.removeEventListener(`pointerup`,K),g.removeEventListener(`pointercancel`,Me),g.removeEventListener(`wheel`,q),g.removeEventListener(`keydown`,J),g.removeEventListener(`webglcontextlost`,Y),we();for(let e of j.keys())Se(e);I.dispose(),v.dispose(),se.dispose();for(let e of b)e.geometry.dispose();fe.dispose(),me.material.dispose(),t.dispose(),g.remove()}},[m]),(0,T.useEffect)(()=>{a.current?.pins(e)},[e,m]),(0,$.jsxs)(`div`,{className:`atlas-map-shell`,children:[(0,$.jsx)(`div`,{ref:n,className:`atlas-pin-map`,children:t&&(0,$.jsx)(`span`,{className:`atlas-globe-crosshair`,"aria-hidden":`true`,children:`+`})}),f&&(0,$.jsx)(`small`,{className:`atlas-map-credit`,children:`Imagery © Esri, Maxar, Earthstar Geographics`}),u&&(0,$.jsxs)(`output`,{className:`atlas-map-error`,children:[u,!u.startsWith(`Loading`)&&(0,$.jsx)(`button`,{onClick:()=>{d(`Loading satellite imagery…`),h(e=>e+1)},children:`Retry globe`})]})]})}export{$e as GeoPinMap};