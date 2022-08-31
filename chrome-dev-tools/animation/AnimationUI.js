import*as Common from"../common/common.js";import*as InlineEditor from"../inline_editor/inline_editor.js";import*as SDK from"../sdk/sdk.js";import*as UI from"../ui/ui.js";import{AnimationImpl}from"./AnimationModel.js";import{AnimationTimeline,StepTimingFunction}from"./AnimationTimeline.js";export class AnimationUI{constructor(t,e,i){this._animation=t,this._timeline=e,this._parentElement=i,this._animation.source().keyframesRule()&&(this._keyframes=this._animation.source().keyframesRule().keyframes()),this._nameElement=i.createChild("div","animation-name"),this._nameElement.textContent=this._animation.name(),this._svg=i.createSVGChild("svg","animation-ui"),this._svg.setAttribute("height",Options.AnimationSVGHeight),this._svg.style.marginLeft="-"+Options.AnimationMargin+"px",this._svg.addEventListener("contextmenu",this._onContextMenu.bind(this)),this._activeIntervalGroup=this._svg.createSVGChild("g"),UI.UIUtils.installDragHandle(this._activeIntervalGroup,this._mouseDown.bind(this,Events.AnimationDrag,null),this._mouseMove.bind(this),this._mouseUp.bind(this),"-webkit-grabbing","-webkit-grab"),Animation.AnimationUI.installDragHandleKeyboard(this._activeIntervalGroup,this._keydownMove.bind(this,Animation.AnimationUI.Events.AnimationDrag,null)),this._cachedElements=[],this._movementInMs=0,this._keyboardMovementRateMs=50,this._color=AnimationUI.Color(this._animation)}static Color(t){const e=Object.keys(Colors);return Colors[e[String.hashCode(t.name()||t.id())%e.length]].asString(Common.Color.Format.RGB)}static installDragHandleKeyboard(t,e){t.addEventListener("keydown",e,!1)}animation(){return this._animation}setNode(t){this._node=t}_createLine(t,e){const i=t.createSVGChild("line",e);return i.setAttribute("x1",Options.AnimationMargin),i.setAttribute("y1",Options.AnimationHeight),i.setAttribute("y2",Options.AnimationHeight),i.style.stroke=this._color,i}_drawAnimationLine(t,e){const i=this._cachedElements[t];i.animationLine||(i.animationLine=this._createLine(e,"animation-line")),i.animationLine.setAttribute("x2",(this._duration()*this._timeline.pixelMsRatio()+Options.AnimationMargin).toFixed(2))}_drawDelayLine(t){this._delayLine||(this._delayLine=this._createLine(t,"animation-delay-line"),this._endDelayLine=this._createLine(t,"animation-delay-line"));const e=this._animation.source().fill();this._delayLine.classList.toggle("animation-fill","backwards"===e||"both"===e);const i=Options.AnimationMargin;this._delayLine.setAttribute("x1",i),this._delayLine.setAttribute("x2",(this._delay()*this._timeline.pixelMsRatio()+i).toFixed(2));const n="forwards"===e||"both"===e;this._endDelayLine.classList.toggle("animation-fill",n);const s=Math.min(this._timeline.width(),(this._delay()+this._duration()*this._animation.source().iterations())*this._timeline.pixelMsRatio());this._endDelayLine.style.transform="translateX("+s.toFixed(2)+"px)",this._endDelayLine.setAttribute("x1",i),this._endDelayLine.setAttribute("x2",n?(this._timeline.width()-s+i).toFixed(2):(this._animation.source().endDelay()*this._timeline.pixelMsRatio()+i).toFixed(2))}_drawPoint(t,e,i,n,s){if(this._cachedElements[t].keyframePoints[n])return void this._cachedElements[t].keyframePoints[n].setAttribute("cx",i.toFixed(2));const o=e.createSVGChild("circle",n<=0?"animation-endpoint":"animation-keyframe-point");if(o.setAttribute("cx",i.toFixed(2)),o.setAttribute("cy",Options.AnimationHeight),o.style.stroke=this._color,o.setAttribute("r",Options.AnimationMargin/2),o.tabIndex=0,UI.ARIAUtils.setAccessibleName(o,n<=0?ls`Animation Endpoint slider`:ls`Animation Keyframe slider`),n<=0&&(o.style.fill=this._color),this._cachedElements[t].keyframePoints[n]=o,!s)return;let a;a=0===n?Events.StartEndpointMove:-1===n?Events.FinishEndpointMove:Events.KeyframeMove,UI.UIUtils.installDragHandle(o,this._mouseDown.bind(this,a,n),this._mouseMove.bind(this),this._mouseUp.bind(this),"ew-resize"),Animation.AnimationUI.installDragHandleKeyboard(o,this._keydownMove.bind(this,a,n))}_renderKeyframe(t,e,i,n,s,o){function a(t,e,i){const n=t.createSVGChild("line");n.setAttribute("x1",e),n.setAttribute("x2",e),n.setAttribute("y1",Options.AnimationMargin),n.setAttribute("y2",Options.AnimationHeight),n.style.stroke=i}const r=UI.Geometry.CubicBezier.parse(o),m=this._cachedElements[t].keyframeRender;m[e]||(m[e]=r?i.createSVGChild("path","animation-keyframe"):i.createSVGChild("g","animation-keyframe-step"));const h=m[e];if(h.tabIndex=0,UI.ARIAUtils.setAccessibleName(h,ls`${this._animation.name()} slider`),h.style.transform="translateX("+n.toFixed(2)+"px)","linear"===o){h.style.fill=this._color;const t=InlineEditor.BezierUI.Height;h.setAttribute("d",["M",0,t,"L",0,5,"L",s.toFixed(2),5,"L",s.toFixed(2),t,"Z"].join(" "))}else if(r)h.style.fill=this._color,InlineEditor.BezierUI.BezierUI.drawVelocityChart(r,h,s);else{const t=StepTimingFunction.parse(o);h.removeChildren();const e={start:0,middle:.5,end:1}[t.stepAtPosition];for(let i=0;i<t.steps;i++)a(h,(i+e)*s/t.steps,this._color)}}redraw(){const t=this._timeline.width()-Options.AnimationMargin;if(this._svg.setAttribute("width",(t+2*Options.AnimationMargin).toFixed(2)),this._activeIntervalGroup.style.transform="translateX("+(this._delay()*this._timeline.pixelMsRatio()).toFixed(2)+"px)",this._nameElement.style.transform="translateX("+(this._delay()*this._timeline.pixelMsRatio()+Options.AnimationMargin).toFixed(2)+"px)",this._nameElement.style.width=(this._duration()*this._timeline.pixelMsRatio()).toFixed(2)+"px",this._drawDelayLine(this._svg),"CSSTransition"===this._animation.type())return void this._renderTransition();this._renderIteration(this._activeIntervalGroup,0),this._tailGroup||(this._tailGroup=this._activeIntervalGroup.createSVGChild("g","animation-tail-iterations"));const e=this._duration()*this._timeline.pixelMsRatio();let i;for(i=1;i<this._animation.source().iterations()&&e*(i-1)<this._timeline.width();i++)this._renderIteration(this._tailGroup,i);for(;i<this._cachedElements.length;)this._cachedElements.pop().group.remove()}_renderTransition(){this._cachedElements[0]||(this._cachedElements[0]={animationLine:null,keyframePoints:{},keyframeRender:{},group:null}),this._drawAnimationLine(0,this._activeIntervalGroup),this._renderKeyframe(0,0,this._activeIntervalGroup,Options.AnimationMargin,this._duration()*this._timeline.pixelMsRatio(),this._animation.source().easing()),this._drawPoint(0,this._activeIntervalGroup,Options.AnimationMargin,0,!0),this._drawPoint(0,this._activeIntervalGroup,this._duration()*this._timeline.pixelMsRatio()+Options.AnimationMargin,-1,!0)}_renderIteration(t,e){this._cachedElements[e]||(this._cachedElements[e]={animationLine:null,keyframePoints:{},keyframeRender:{},group:t.createSVGChild("g")});const i=this._cachedElements[e].group;i.style.transform="translateX("+(e*this._duration()*this._timeline.pixelMsRatio()).toFixed(2)+"px)",this._drawAnimationLine(e,i),console.assert(this._keyframes.length>1);for(let t=0;t<this._keyframes.length-1;t++){const n=this._offset(t)*this._duration()*this._timeline.pixelMsRatio()+Options.AnimationMargin,s=this._duration()*(this._offset(t+1)-this._offset(t))*this._timeline.pixelMsRatio();this._renderKeyframe(e,t,i,n,s,this._keyframes[t].easing()),(t||!t&&0===e)&&this._drawPoint(e,i,n,t,0===e)}this._drawPoint(e,i,this._duration()*this._timeline.pixelMsRatio()+Options.AnimationMargin,-1,0===e)}_delay(){let t=this._animation.source().delay();return this._mouseEventType!==Events.AnimationDrag&&this._mouseEventType!==Events.StartEndpointMove||(t+=this._movementInMs),Math.max(0,t)}_duration(){let t=this._animation.source().duration();return this._mouseEventType===Events.FinishEndpointMove?t+=this._movementInMs:this._mouseEventType===Events.StartEndpointMove&&(t-=Math.max(this._movementInMs,-this._animation.source().delay())),Math.max(0,t)}_offset(t){let e=this._keyframes[t].offsetAsNumber();return this._mouseEventType===Events.KeyframeMove&&t===this._keyframeMoved&&(console.assert(t>0&&t<this._keyframes.length-1,"First and last keyframe cannot be moved"),e+=this._movementInMs/this._animation.source().duration(),e=Math.max(e,this._keyframes[t-1].offsetAsNumber()),e=Math.min(e,this._keyframes[t+1].offsetAsNumber())),e}_mouseDown(t,e,i){return 2!==i.buttons&&(!this._svg.enclosingNodeOrSelfWithClass("animation-node-removed")&&(this._mouseEventType=t,this._keyframeMoved=e,this._downMouseX=i.clientX,i.consume(!0),this._node&&Common.Revealer.reveal(this._node),!0))}_mouseMove(t){this._setMovementAndRedraw((t.clientX-this._downMouseX)/this._timeline.pixelMsRatio())}_setMovementAndRedraw(t){this._movementInMs=t,this._delay()+this._duration()>.8*this._timeline.duration()&&this._timeline.setDuration(1.2*this._timeline.duration()),this.redraw()}_mouseUp(t){this._movementInMs=(t.clientX-this._downMouseX)/this._timeline.pixelMsRatio(),this._mouseEventType===Events.KeyframeMove?this._keyframes[this._keyframeMoved].setOffset(this._offset(this._keyframeMoved)):this._animation.setTiming(this._duration(),this._delay()),this._movementInMs=0,this.redraw(),delete this._mouseEventType,delete this._downMouseX,delete this._keyframeMoved}_keydownMove(t,e,i){switch(this._mouseEventType=t,this._keyframeMoved=e,i.key){case"ArrowLeft":case"ArrowUp":this._movementInMs=-this._keyboardMovementRateMs;break;case"ArrowRight":case"ArrowDown":this._movementInMs=this._keyboardMovementRateMs;break;default:return}this._mouseEventType===Animation.AnimationUI.Events.KeyframeMove?this._keyframes[this._keyframeMoved].setOffset(this._offset(this._keyframeMoved)):this._animation.setTiming(this._duration(),this._delay()),this._setMovementAndRedraw(0),delete this._mouseEventType,delete this._keyframeMoved,i.consume(!0)}_onContextMenu(t){this._animation.remoteObjectPromise().then((function(e){if(!e)return;const i=new UI.ContextMenu.ContextMenu(t);i.appendApplicableItems(e),i.show()})),t.consume(!0)}}export const Events={AnimationDrag:"AnimationDrag",KeyframeMove:"KeyframeMove",StartEndpointMove:"StartEndpointMove",FinishEndpointMove:"FinishEndpointMove"};export const Options={AnimationHeight:26,AnimationSVGHeight:50,AnimationMargin:7,EndpointsClickRegionSize:10,GridCanvasHeight:40};export const Colors={Purple:Common.Color.Color.parse("#9C27B0"),"Light Blue":Common.Color.Color.parse("#03A9F4"),"Deep Orange":Common.Color.Color.parse("#FF5722"),Blue:Common.Color.Color.parse("#5677FC"),Lime:Common.Color.Color.parse("#CDDC39"),"Blue Grey":Common.Color.Color.parse("#607D8B"),Pink:Common.Color.Color.parse("#E91E63"),Green:Common.Color.Color.parse("#0F9D58"),Brown:Common.Color.Color.parse("#795548"),Cyan:Common.Color.Color.parse("#00BCD4")};