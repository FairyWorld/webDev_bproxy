import*as Common from"../common/common.js";import*as Host from"../host/host.js";import*as Platform from"../platform/platform.js";import*as UI from"../ui/ui.js";import{ChartViewport,ChartViewportDelegate}from"./ChartViewport.js";import{Calculator,TimelineGrid}from"./TimelineGrid.js";export class FlameChartDelegate{windowChanged(e,t,i){}updateRangeSelection(e,t){}updateSelectedGroup(e,t){}}export class FlameChart extends UI.Widget.VBox{constructor(e,t,i){super(!0),this.registerRequiredCSS("perf_ui/flameChart.css"),this.contentElement.classList.add("flame-chart-main-pane"),this._groupExpansionSetting=i,this._groupExpansionState=i&&i.get()||{},this._flameChartDelegate=t,this._useWebGL=Root.Runtime.experiments.isEnabled("timelineWebGL"),this._chartViewport=new ChartViewport(this),this._chartViewport.show(this.contentElement),this._dataProvider=e,this._candyStripeCanvas=document.createElement("canvas"),this._createCandyStripePattern(),this._viewportElement=this._chartViewport.viewportElement,this._useWebGL&&(this._canvasGL=this._viewportElement.createChild("canvas","fill"),this._initWebGL()),this._canvas=this._viewportElement.createChild("canvas","fill"),this._canvas.tabIndex=0,UI.ARIAUtils.setAccessibleName(this._canvas,ls`Flame Chart`),UI.ARIAUtils.markAsTree(this._canvas),this.setDefaultFocusedElement(this._canvas),this._canvas.classList.add("flame-chart-canvas"),this._canvas.addEventListener("mousemove",this._onMouseMove.bind(this),!1),this._canvas.addEventListener("mouseout",this._onMouseOut.bind(this),!1),this._canvas.addEventListener("click",this._onClick.bind(this),!1),this._canvas.addEventListener("keydown",this._onKeyDown.bind(this),!1),this._entryInfo=this._viewportElement.createChild("div","flame-chart-entry-info"),this._markerHighlighElement=this._viewportElement.createChild("div","flame-chart-marker-highlight-element"),this._highlightElement=this._viewportElement.createChild("div","flame-chart-highlight-element"),this._selectedElement=this._viewportElement.createChild("div","flame-chart-selected-element"),this._canvas.addEventListener("focus",()=>{this._selectedElement.classList.remove("flame-chart-unfocused-selected-element"),this.dispatchEventToListeners(Events.CanvasFocused)},!1),this._canvas.addEventListener("blur",()=>{this._selectedElement.classList.add("flame-chart-unfocused-selected-element")},!1),UI.UIUtils.installDragHandle(this._viewportElement,this._startDragging.bind(this),this._dragging.bind(this),this._endDragging.bind(this),null),this._rulerEnabled=!0,this._rangeSelectionStart=0,this._rangeSelectionEnd=0,this._barHeight=17,this._textBaseline=5,this._textPadding=5,this._markerRadius=6,this._chartViewport.setWindowTimes(e.minimumBoundary(),e.minimumBoundary()+e.totalTime()),this._headerLeftPadding=6,this._arrowSide=8,this._expansionArrowIndent=this._headerLeftPadding+this._arrowSide/2,this._headerLabelXPadding=3,this._headerLabelYPadding=2,this._highlightedMarkerIndex=-1,this._highlightedEntryIndex=-1,this._selectedEntryIndex=-1,this._rawTimelineDataLength=0,this._textWidth=new Map,this._markerPositions=new Map,this._lastMouseOffsetX=0,this._selectedGroup=-1,this._keyboardFocusedGroup=-1,this._selectedGroupBackroundColor=self.UI.themeSupport.patchColorText(Colors.SelectedGroupBackground,UI.UIUtils.ThemeSupport.ColorUsage.Background),this._selectedGroupBorderColor=self.UI.themeSupport.patchColorText(Colors.SelectedGroupBorder,UI.UIUtils.ThemeSupport.ColorUsage.Background)}willHide(){this.hideHighlight()}setBarHeight(e){this._barHeight=e}setTextBaseline(e){this._textBaseline=e}setTextPadding(e){this._textPadding=e}enableRuler(e){this._rulerEnabled=e}alwaysShowVerticalScroll(){this._chartViewport.alwaysShowVerticalScroll()}disableRangeSelection(){this._chartViewport.disableRangeSelection()}highlightEntry(e){this._highlightedEntryIndex!==e&&this._dataProvider.entryColor(e)&&(this._highlightedEntryIndex=e,this._updateElementPosition(this._highlightElement,this._highlightedEntryIndex),this.dispatchEventToListeners(Events.EntryHighlighted,e))}hideHighlight(){this._entryInfo.removeChildren(),this._highlightedEntryIndex=-1,this._updateElementPosition(this._highlightElement,this._highlightedEntryIndex),this.dispatchEventToListeners(Events.EntryHighlighted,-1)}_createCandyStripePattern(){this._candyStripeCanvas.width=17,this._candyStripeCanvas.height=17;const e=this._candyStripeCanvas.getContext("2d");e.translate(8.5,8.5),e.rotate(.25*Math.PI),e.translate(-8.5,-8.5),e.fillStyle="rgba(255, 0, 0, 0.4)";for(let t=-17;t<34;t+=3)e.fillRect(t,-17,1,51)}_resetCanvas(){const e=window.devicePixelRatio,t=Math.round(this._offsetWidth*e),i=Math.round(this._offsetHeight*e);this._canvas.width=t,this._canvas.height=i,this._canvas.style.width=t/e+"px",this._canvas.style.height=i/e+"px",this._useWebGL&&(this._canvasGL.width=t,this._canvasGL.height=i,this._canvasGL.style.width=t/e+"px",this._canvasGL.style.height=i/e+"px")}windowChanged(e,t,i){this._flameChartDelegate.windowChanged(e,t,i)}updateRangeSelection(e,t){this._flameChartDelegate.updateRangeSelection(e,t)}setSize(e,t){this._offsetWidth=e,this._offsetHeight=t}_startDragging(e){return this.hideHighlight(),this._maxDragOffset=0,this._dragStartX=e.pageX,this._dragStartY=e.pageY,!0}_dragging(e){const t=e.pageX-this._dragStartX,i=e.pageY-this._dragStartY;this._maxDragOffset=Math.max(this._maxDragOffset,Math.sqrt(t*t+i*i))}_endDragging(e){this._updateHighlight()}_timelineData(){if(!this._dataProvider)return null;const e=this._dataProvider.timelineData();return e===this._rawTimelineData&&e.entryStartTimes.length===this._rawTimelineDataLength||this._processTimelineData(e),this._rawTimelineData}_revealEntry(e){const t=this._timelineData();if(!t)return;const i=this._chartViewport.windowLeftTime(),s=this._chartViewport.windowRightTime(),r=t.entryStartTimes[e],o=t.entryTotalTimes[e],n=r+o;let a=Math.min(o,s-i);const h=t.entryLevels[e];this._chartViewport.setScrollOffset(this._levelToOffset(h),this._levelHeight(h));const l=(s-i)/this._offsetWidth;if(a=Math.max(a,30*l),i>n){const e=i-n+a;this.windowChanged(i-e,s-e,!0)}else if(s<r){const e=r-s+a;this.windowChanged(i+e,s+e,!0)}}setWindowTimes(e,t,i){this._chartViewport.setWindowTimes(e,t,i),this._updateHighlight()}_onMouseMove(e){if(this._lastMouseOffsetX=e.offsetX,this._lastMouseOffsetY=e.offsetY,this._enabled()&&!this._chartViewport.isDragging())return this._coordinatesToGroupIndex(e.offsetX,e.offsetY,!0)>=0?(this.hideHighlight(),void(this._viewportElement.style.cursor="pointer")):void this._updateHighlight()}_updateHighlight(){const e=this._coordinatesToEntryIndex(this._lastMouseOffsetX,this._lastMouseOffsetY);if(-1!==e)this._chartViewport.isDragging()||(this._updatePopover(e),this._viewportElement.style.cursor=this._dataProvider.canJumpToEntry(e)?"pointer":"default",this.highlightEntry(e));else{this.hideHighlight();const e=this._coordinatesToGroupIndex(this._lastMouseOffsetX,this._lastMouseOffsetY,!1);e>=0&&this._rawTimelineData.groups[e].selectable?this._viewportElement.style.cursor="pointer":this._viewportElement.style.cursor="default"}}_onMouseOut(){this._lastMouseOffsetX=-1,this._lastMouseOffsetY=-1,this.hideHighlight()}_updatePopover(e){if(e===this._highlightedEntryIndex)return void this._updatePopoverOffset();this._entryInfo.removeChildren();const t=this._dataProvider.prepareHighlightedEntryInfo(e);t&&(this._entryInfo.appendChild(t),this._updatePopoverOffset())}_updatePopoverOffset(){const e=this._lastMouseOffsetX,t=this._lastMouseOffsetY,i=this._entryInfo.parentElement.clientWidth,s=this._entryInfo.parentElement.clientHeight,r=this._entryInfo.clientWidth,o=this._entryInfo.clientHeight;let n,a;for(let h=0;h<4;++h){const l=2&h?-10-r:10,d=1&h?-6-o:6;if(n=Platform.NumberUtilities.clamp(e+l,0,i-r),a=Platform.NumberUtilities.clamp(t+d,0,s-o),n>=e||e>=n+r||a>=t||t>=a+o)break}this._entryInfo.style.left=n+"px",this._entryInfo.style.top=a+"px"}_onClick(e){this.focus();if(this._maxDragOffset>5)return;this._selectGroup(this._coordinatesToGroupIndex(e.offsetX,e.offsetY,!1)),this._toggleGroupExpand(this._coordinatesToGroupIndex(e.offsetX,e.offsetY,!0));const t=this._timelineData();if(e.shiftKey&&-1!==this._highlightedEntryIndex&&t){const e=t.entryStartTimes[this._highlightedEntryIndex],i=e+t.entryTotalTimes[this._highlightedEntryIndex];this._chartViewport.setRangeSelection(e,i)}else this._chartViewport.onClick(e),this.dispatchEventToListeners(Events.EntryInvoked,this._highlightedEntryIndex)}_selectGroup(e){if(e<0||this._selectedGroup===e)return;const t=this._rawTimelineData.groups;this._keyboardFocusedGroup=e,this._scrollGroupIntoView(e);const i=t[e].name;t[e].selectable?(this._selectedGroup=e,this._flameChartDelegate.updateSelectedGroup(this,t[e]),this._resetCanvas(),this._draw(),UI.ARIAUtils.alert(ls`${i} selected`,this._canvas)):(this._deselectAllGroups(),UI.ARIAUtils.alert(ls`${i} hovered`,this._canvas))}_deselectAllGroups(){this._selectedGroup=-1,this._flameChartDelegate.updateSelectedGroup(this,null),this._resetCanvas(),this._draw()}_deselectAllEntries(){this._selectedEntryIndex=-1,this._resetCanvas(),this._draw()}_isGroupFocused(e){return e===this._selectedGroup||e===this._keyboardFocusedGroup}_scrollGroupIntoView(e){if(e<0)return;const t=this._rawTimelineData.groups,i=this._groupOffsets,s=i[e];let r=i[e+1];e===t.length-1&&(r+=t[e].style.padding);const o=0===e?0:s,n=Math.min(r-o,this._chartViewport.chartHeight());this._chartViewport.setScrollOffset(o,n)}_toggleGroupExpand(e){e<0||!this._isGroupCollapsible(e)||this._expandGroup(e,!this._rawTimelineData.groups[e].expanded)}_expandGroup(e,t=!0,i=!1){if(e<0||!this._isGroupCollapsible(e))return;const s=this._rawTimelineData.groups,r=s[e];if(r.expanded=t,this._groupExpansionState[r.name]=r.expanded,this._groupExpansionSetting&&this._groupExpansionSetting.set(this._groupExpansionState),this._updateLevelPositions(),this._updateHighlight(),!r.expanded){const t=this._timelineData().entryLevels[this._selectedEntryIndex];this._selectedEntryIndex>=0&&t>=r.startLevel&&(e>=s.length-1||s[e+1].startLevel>t)&&(this._selectedEntryIndex=-1)}if(this._updateHeight(),this._resetCanvas(),this._draw(),this._scrollGroupIntoView(e),!i){const t=s[e].name,i=r.expanded?ls`${t} expanded`:ls`${t} collapsed`;UI.ARIAUtils.alert(i,this._canvas)}}_onKeyDown(e){if(!UI.KeyboardShortcut.KeyboardShortcut.hasNoModifiers(e)||!this._timelineData())return;!this._handleSelectionNavigation(e)&&this._rawTimelineData&&this._rawTimelineData.groups&&this._handleKeyboardGroupNavigation(e)}_handleKeyboardGroupNavigation(e){let t=!1,i=!1;"ArrowUp"===e.code?t=this._selectPreviousGroup():"ArrowDown"===e.code?t=this._selectNextGroup():"ArrowLeft"===e.code?this._keyboardFocusedGroup>=0&&(this._expandGroup(this._keyboardFocusedGroup,!1),t=!0):"ArrowRight"===e.code?this._keyboardFocusedGroup>=0&&(this._expandGroup(this._keyboardFocusedGroup,!0),this._selectFirstChild(),t=!0):isEnterKey(e)&&(i=this._selectFirstEntryInCurrentGroup(),t=i),t&&!i&&this._deselectAllEntries(),t&&e.consume(!0)}_selectFirstEntryInCurrentGroup(){const e=this._rawTimelineData.groups;if(this._keyboardFocusedGroup<0)return!1;const t=e[this._keyboardFocusedGroup].startLevel;if(t<0)return!1;if(this._keyboardFocusedGroup<e.length-1&&e[this._keyboardFocusedGroup+1].startLevel===t)return!1;const i=this._timelineLevels[t][0];return this._expandGroup(this._keyboardFocusedGroup,!0),this.setSelectedEntry(i),!0}_selectPreviousGroup(){if(this._keyboardFocusedGroup<=0)return!1;const e=this._getGroupIndexToSelect(-1);return this._selectGroup(e),!0}_selectNextGroup(){if(this._keyboardFocusedGroup>=this._rawTimelineData.groups.length-1)return!1;const e=this._getGroupIndexToSelect(1);return this._selectGroup(e),!0}_getGroupIndexToSelect(e){const t=this._rawTimelineData.groups;let i,s,r=this._keyboardFocusedGroup;do{r+=e,i=this._rawTimelineData.groups[r].name,s=-1!==this._keyboardFocusedGroup&&t[r].style.nestingLevel>t[this._keyboardFocusedGroup].style.nestingLevel}while(r>0&&r<t.length-1&&(!i||s));return r}_selectFirstChild(){const e=this._rawTimelineData.groups;if(this._keyboardFocusedGroup<0||this._keyboardFocusedGroup>=e.length-1)return;const t=this._keyboardFocusedGroup+1;e[t].style.nestingLevel>e[this._keyboardFocusedGroup].style.nestingLevel&&this._selectGroup(t)}_handleSelectionNavigation(e){if(-1===this._selectedEntryIndex)return!1;const t=this._timelineData();if(!t)return!1;function i(e,i){const s=t.entryStartTimes[e],r=t.entryStartTimes[i],o=s+t.entryTotalTimes[e];return s<r+t.entryTotalTimes[i]&&r<o}const s=UI.KeyboardShortcut.Keys;if(e.keyCode===s.Left.code||e.keyCode===s.Right.code){const i=t.entryLevels[this._selectedEntryIndex],r=this._timelineLevels[i];let o=r.lowerBound(this._selectedEntryIndex);return o+=e.keyCode===s.Left.code?-1:1,e.consume(!0),o>=0&&o<r.length&&this.dispatchEventToListeners(Events.EntrySelected,r[o]),!0}if(e.keyCode===s.Up.code||e.keyCode===s.Down.code){let r=t.entryLevels[this._selectedEntryIndex];if(r+=e.keyCode===s.Up.code?-1:1,r<0||r>=this._timelineLevels.length)return this._deselectAllEntries(),e.consume(!0),!0;const o=t.entryStartTimes[this._selectedEntryIndex]+t.entryTotalTimes[this._selectedEntryIndex]/2,n=this._timelineLevels[r];let a=n.upperBound(o,(function(e,i){return e-t.entryStartTimes[i]}))-1;return!i(this._selectedEntryIndex,n[a])&&(++a,a>=n.length||!i(this._selectedEntryIndex,n[a]))?"ArrowDown"!==e.code&&(this._deselectAllEntries(),e.consume(!0),!0):(e.consume(!0),this.dispatchEventToListeners(Events.EntrySelected,n[a]),!0)}return!!isEnterKey(e)&&(e.consume(!0),this.dispatchEventToListeners(Events.EntryInvoked,this._selectedEntryIndex),!0)}_coordinatesToEntryIndex(e,t){if(e<0||t<0)return-1;const i=this._timelineData();if(!i)return-1;t+=this._chartViewport.scrollOffset();const s=this._visibleLevelOffsets.upperBound(t)-1;if(s<0||!this._visibleLevels[s])return-1;if(t-this._visibleLevelOffsets[s]>this._levelHeight(s))return-1;for(const[t,r]of this._markerPositions)if(i.entryLevels[t]===s&&r.x<=e&&e<r.x+r.width)return t;const r=i.entryStartTimes,o=this._timelineLevels[s];if(!o||!o.length)return-1;const n=this._chartViewport.pixelToTime(e),a=Math.max(o.upperBound(n,(e,t)=>e-r[t])-1,0);function h(t){if(void 0===t)return!1;const s=r[t],o=i.entryTotalTimes[t],n=this._chartViewport.timeToPosition(s),a=this._chartViewport.timeToPosition(s+o);return n-3<e&&e<a+3}let l=o[a];return h.call(this,l)?l:(l=o[a+1],h.call(this,l)?l:-1)}_coordinatesToGroupIndex(e,t,i){if(e<0||t<0)return-1;t+=this._chartViewport.scrollOffset();const s=this._rawTimelineData.groups||[],r=this._groupOffsets.upperBound(t)-1;if(r<0||r>=s.length)return-1;const o=i?s[r].style.height:this._groupOffsets[r+1]-this._groupOffsets[r];if(t-this._groupOffsets[r]>=o)return-1;if(!i)return r;const n=this._canvas.getContext("2d");n.save(),n.font=s[r].style.font;const a=this._headerLeftPadding+this._labelWidthForGroup(n,s[r]);return n.restore(),e>a?-1:r}_markerIndexAtPosition(e){const t=this._timelineData().markers;if(!t)return-1;const i=this._chartViewport.pixelToTime(e),s=this._chartViewport.pixelToTime(e-4),r=this._chartViewport.pixelToTime(e+4);let o=-1,n=1/0;for(let e=this._markerIndexBeforeTime(s);e<t.length&&t[e].startTime()<r;e++){const s=Math.abs(t[e].startTime()-i);s<n&&(o=e,n=s)}return o}_markerIndexBeforeTime(e){return this._timelineData().markers.lowerBound(e,(e,t)=>e-t.startTime())}_draw(){const e=this._timelineData();if(!e)return;const t=this._offsetWidth,i=this._offsetHeight,s=this._canvas.getContext("2d");s.save();const r=window.devicePixelRatio,o=this._chartViewport.scrollOffset();s.scale(r,r),s.fillStyle="rgba(0, 0, 0, 0)",s.fillRect(0,0,t,i),s.translate(0,-o);const n="11px "+Host.Platform.fontFamily();s.font=n;const a=s.createPattern(this._candyStripeCanvas,"repeat"),h=e.entryTotalTimes,l=e.entryStartTimes,d=e.entryLevels,c=this._chartViewport.timeToPixel(),_=[],u=[],p=this._textPadding,f=2*p+UI.UIUtils.measureTextWidth(s,"…"),m=this._chartViewport.pixelToTimeOffset(f),g=Math.max(this._visibleLevelOffsets.upperBound(o)-1,0);this._markerPositions.clear();let v=-1;if("groups"in e&&Array.isArray(e.groups)){const t=e.groups.find(e=>!!e._track&&"CrRendererMain"===e._track.name);t&&(v=t.startLevel)}const y=new Map;for(let e=g;e<this._dataProvider.maxStackDepth()&&!(this._levelToOffset(e)>o+i);++e){if(!this._visibleLevels[e])continue;const t=this._timelineLevels[e];let i=1/0;for(let s=t.lowerBound(this._chartViewport.windowRightTime(),(e,t)=>e-l[t])-1;s>=0;--s){const r=t[s],o=h[r];if(isNaN(o)){u.push(r);continue}(o>=m||this._forceDecorationCache[r])&&_.push(r);const n=l[r];if(n+o<=this._chartViewport.windowLeftTime())break;if(this._useWebGL)continue;const a=this._timeToPositionClipped(n);if(a>=i)continue;i=a;const d=this._entryColorsCache[r];let c=y.get(d);c||(c={indexes:[],showLongDurations:e===v},y.set(d,c)),c.indexes.push(r)}}if(this._useWebGL)this._drawGL();else{s.save(),this._forEachGroupInViewport((e,i,r,o,n)=>{this._isGroupFocused(i)&&(s.fillStyle=this._selectedGroupBackroundColor,s.fillRect(0,e,t,n-r.style.padding))}),s.restore();for(const[e,{indexes:t,showLongDurations:i}]of y){s.beginPath();for(let e=0;e<t.length;++e){const i=t[e],r=h[i];if(isNaN(r))continue;const o=l[i],n=this._timeToPositionClipped(o),a=d[i],c=this._levelHeight(a),_=this._levelToOffset(a),u=this._timeToPositionClipped(o+r),p=Math.max(u-n,1);s.rect(n,_,p-.4,c-1)}s.fillStyle=e,s.fill(),s.beginPath();for(let e=0;e<t.length;++e){const r=t[e],o=h[r];if(!i)continue;if(isNaN(o))continue;if(o<50)continue;const n=l[r],a=this._timeToPositionClipped(n+50),c=d[r],_=this._levelHeight(c),u=this._levelToOffset(c),p=this._timeToPositionClipped(n+o),f=Math.max(p-a,1);s.rect(a,u,f-.4,_-1)}s.fillStyle=a,s.fill()}}s.textBaseline="alphabetic",s.beginPath();let w=-1,T=-1/0;for(let e=u.length-1;e>=0;--e){const t=u[e],i=this._dataProvider.entryTitle(t);if(!i)continue;const r=l[t],o=d[t];w!==o&&(T=-1/0);const n=Math.max(this._chartViewport.timeToPosition(r),T),a=this._levelToOffset(o),h=this._levelHeight(o),c=4,_=Math.ceil(UI.UIUtils.measureTextWidth(s,i))+2*c;T=n+_+1,w=o,this._markerPositions.set(t,{x:n,width:_}),s.fillStyle=this._dataProvider.entryColor(t),s.fillRect(n,a,_,h-1),s.fillStyle="white",s.fillText(i,n+c,a+h-this._textBaseline)}s.strokeStyle="rgba(0, 0, 0, 0.2)",s.stroke();for(let e=0;e<_.length;++e){const i=_[e],r=l[i],o=this._timeToPositionClipped(r),a=Math.min(this._timeToPositionClipped(r+h[i]),t)+1-o,u=d[i],f=this._levelToOffset(u);let m=this._dataProvider.entryTitle(i);m&&m.length&&(s.font=this._dataProvider.entryFont(i)||n,m=UI.UIUtils.trimTextMiddle(s,m,a-2*p));const g=this._chartViewport.timeToPosition(r),v=this._levelHeight(u);this._dataProvider.decorateEntry(i,s,m,o,f,a,v,g,c)||m&&m.length&&(s.fillStyle=this._dataProvider.textColor(i),s.fillText(m,o+p,f+v-this._textBaseline))}s.restore(),this._drawGroupHeaders(t,i),this._drawFlowEvents(s,t,i),this._drawMarkers();const x=TimelineGrid.calculateGridOffsets(this);TimelineGrid.drawCanvasGrid(s,x),this._rulerEnabled&&TimelineGrid.drawCanvasHeaders(s,x,e=>this.formatValue(e,x.precision),3,HeaderHeight),this._updateElementPosition(this._highlightElement,this._highlightedEntryIndex),this._updateElementPosition(this._selectedElement,this._selectedEntryIndex),this._updateMarkerHighlight()}_initWebGL(){const e=this._canvasGL.getContext("webgl");if(!e)return console.error("Failed to obtain WebGL context."),void(this._useWebGL=!1);function t(e,t,i){const s=e.createShader(t);return e.shaderSource(s,i),e.compileShader(s),e.getShaderParameter(s,e.COMPILE_STATUS)?s:(console.error("Shader compile error: "+e.getShaderInfoLog(s)),e.deleteShader(s),null)}const i=t(e,e.VERTEX_SHADER,"\n      attribute vec2 aVertexPosition;\n      attribute float aVertexColor;\n\n      uniform vec2 uScalingFactor;\n      uniform vec2 uShiftVector;\n\n      varying mediump vec2 vPalettePosition;\n\n      void main() {\n        vec2 shiftedPosition = aVertexPosition - uShiftVector;\n        gl_Position = vec4(shiftedPosition * uScalingFactor + vec2(-1.0, 1.0), 0.0, 1.0);\n        vPalettePosition = vec2(aVertexColor, 0.5);\n      }"),s=t(e,e.FRAGMENT_SHADER,"\n      varying mediump vec2 vPalettePosition;\n      uniform sampler2D uSampler;\n\n      void main() {\n        gl_FragColor = texture2D(uSampler, vPalettePosition);\n      }"),r=e.createProgram();e.attachShader(r,i),e.attachShader(r,s),e.linkProgram(r),e.getProgramParameter(r,e.LINK_STATUS)?(this._shaderProgram=r,e.useProgram(r)):(console.error("Unable to initialize the shader program: "+e.getProgramInfoLog(r)),this._shaderProgram=null),this._vertexBuffer=e.createBuffer(),this._colorBuffer=e.createBuffer(),this._uScalingFactor=e.getUniformLocation(r,"uScalingFactor"),this._uShiftVector=e.getUniformLocation(r,"uShiftVector");const o=e.getUniformLocation(r,"uSampler");e.uniform1i(o,0),this._aVertexPosition=e.getAttribLocation(this._shaderProgram,"aVertexPosition"),this._aVertexColor=e.getAttribLocation(this._shaderProgram,"aVertexColor"),e.enableVertexAttribArray(this._aVertexPosition),e.enableVertexAttribArray(this._aVertexColor)}_setupGLGeometry(){const e=this._canvasGL.getContext("webgl");if(!e)return;const t=this._timelineData();if(!t)return;const i=t.entryTotalTimes,s=t.entryStartTimes,r=t.entryLevels,o=new Float32Array(6*i.length*2);let n=new Uint8Array(6*i.length),a=0;const h=new Map,l=[],d=new Array(this._visibleLevels.length),c=this._rawTimelineData.groups||[];this._forEachGroup((e,t,i)=>{if(i.style.useFirstLineForOverview||!this._isGroupCollapsible(t)||i.expanded)return;let s=t+1;for(;s<c.length&&c[s].style.nestingLevel>i.style.nestingLevel;)++s;const r=s<c.length?c[s].startLevel:this._dataProvider.maxStackDepth();for(let t=i.startLevel;t<r;++t)d[t]=e});for(let e=0;e<i.length;++e){const t=r[e],c=d[t];if(!this._visibleLevels[t]&&!c)continue;const _=this._entryColorsCache[e];if(!_)continue;let u=h.get(_);if(void 0===u){const e=Common.Color.Color.parse(_).canonicalRGBA();e[3]=Math.round(255*e[3]),u=l.length/4,l.push(...e),256===u&&(n=new Uint16Array(n)),h.set(_,u)}for(let e=0;e<6;++e)n[a+e]=u;const p=2*a,f=s[e]-this._minimumBoundary,m=f+i[e],g=c||this._levelToOffset(t),v=g+this._levelHeight(t)-1;o[p+0]=f,o[p+1]=g,o[p+2]=m,o[p+3]=g,o[p+4]=f,o[p+5]=v,o[p+6]=f,o[p+7]=v,o[p+8]=m,o[p+9]=g,o[p+10]=m,o[p+11]=v,a+=6}this._vertexCount=a;const _=e.createTexture();e.bindTexture(e.TEXTURE_2D,_),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.NEAREST),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.NEAREST),e.activeTexture(e.TEXTURE0);const u=l.length/4,p=u>=256,f=p?Math.min(65536,e.getParameter(e.MAX_TEXTURE_SIZE)):256;console.assert(u<=f,"Too many colors");const m=p?e.UNSIGNED_SHORT:e.UNSIGNED_BYTE;if(p){const e=65536/f;for(let t=0;t<a;++t)n[t]*=e}const g=new Uint8Array(4*f);g.set(l),e.texImage2D(e.TEXTURE_2D,0,e.RGBA,f,1,0,e.RGBA,e.UNSIGNED_BYTE,g),e.bindBuffer(e.ARRAY_BUFFER,this._vertexBuffer),e.bufferData(e.ARRAY_BUFFER,o,e.STATIC_DRAW),e.vertexAttribPointer(this._aVertexPosition,2,e.FLOAT,!1,0,0),e.bindBuffer(e.ARRAY_BUFFER,this._colorBuffer),e.bufferData(e.ARRAY_BUFFER,n,e.STATIC_DRAW),e.vertexAttribPointer(this._aVertexColor,1,m,!0,0,0)}_drawGL(){const e=this._canvasGL.getContext("webgl");if(!e)return;const t=this._timelineData();if(!t)return;if(this._prevTimelineData&&t.entryTotalTimes===this._prevTimelineData.entryTotalTimes||(this._prevTimelineData=t,this._setupGLGeometry()),e.viewport(0,0,this._canvasGL.width,this._canvasGL.height),!this._vertexCount)return;const i=[2/this.boundarySpan(),-2*window.devicePixelRatio/this._canvasGL.height],s=[this.minimumBoundary()-this.zeroTime(),this._chartViewport.scrollOffset()];e.uniform2fv(this._uScalingFactor,i),e.uniform2fv(this._uShiftVector,s),e.drawArrays(e.TRIANGLES,0,this._vertexCount)}_drawGroupHeaders(e,t){const i=this._canvas.getContext("2d"),s=this._chartViewport.scrollOffset(),r=window.devicePixelRatio,o=this._rawTimelineData.groups||[];if(!o.length)return;const n=this._groupOffsets,a=Array.prototype.peekLast.call(n),h=UI.UIUtils.ThemeSupport.ColorUsage;i.save(),i.scale(r,r),i.translate(0,-s);const l="11px "+Host.Platform.fontFamily();function d(t){i.moveTo(0,t),i.lineTo(e,t)}function c(e,t,s){const r=this._arrowSide*Math.sqrt(3)/2,o=Math.round(r/2);i.save(),i.translate(e,t),i.rotate(s?Math.PI/2:0),i.moveTo(-o,-this._arrowSide/2),i.lineTo(-o,this._arrowSide/2),i.lineTo(r-o,0),i.restore()}i.font=l,i.fillStyle=self.UI.themeSupport.patchColorText("#fff",h.Background),this._forEachGroupInViewport((t,s,r)=>{const o=r.style.padding;o<5||i.fillRect(0,t-o+2,e,o-4)}),o.length&&a<s+t&&i.fillRect(0,a+2,e,s+t-a),i.strokeStyle=self.UI.themeSupport.patchColorText("#eee",h.Background),i.beginPath(),this._forEachGroupInViewport((e,t,i,s)=>{s||i.style.padding<4||d(e-2.5)}),d(a+1.5),i.stroke(),this._forEachGroupInViewport((t,s,r)=>{if(r.style.useFirstLineForOverview)return;if(!this._isGroupCollapsible(s)||r.expanded)return void(!r.style.shareHeaderLine&&this._isGroupFocused(s)&&(i.fillStyle=r.style.backgroundColor,i.fillRect(0,t,e,r.style.height)));if(this._useWebGL)return;let n=s+1;for(;n<o.length&&o[n].style.nestingLevel>r.style.nestingLevel;)n++;const a=n<o.length?o[n].startLevel:this._dataProvider.maxStackDepth();this._drawCollapsedOverviewForGroup(r,t,a)}),i.save(),this._forEachGroupInViewport((e,t,s)=>{if(i.font=s.style.font,this._isGroupCollapsible(t)&&!s.expanded||s.style.shareHeaderLine){const r=this._labelWidthForGroup(i,s)+2;this._isGroupFocused(t)?i.fillStyle=this._selectedGroupBackroundColor:i.fillStyle=Common.Color.Color.parse(s.style.backgroundColor).setAlpha(.8).asString(null),i.fillRect(this._headerLeftPadding-this._headerLabelXPadding,e+this._headerLabelYPadding,r,s.style.height-2*this._headerLabelYPadding)}i.fillStyle=s.style.color,i.fillText(s.name,Math.floor(this._expansionArrowIndent*(s.style.nestingLevel+1)+this._arrowSide),e+s.style.height-this._textBaseline)}),i.restore(),i.fillStyle=self.UI.themeSupport.patchColorText("#6e6e6e",h.Foreground),i.beginPath(),this._forEachGroupInViewport((e,t,i)=>{this._isGroupCollapsible(t)&&c.call(this,this._expansionArrowIndent*(i.style.nestingLevel+1),e+i.style.height-this._textBaseline-this._arrowSide/2,!!i.expanded)}),i.fill(),i.strokeStyle=self.UI.themeSupport.patchColorText("#ddd",h.Background),i.beginPath(),i.stroke(),this._forEachGroupInViewport((e,t,s,r,o)=>{if(this._isGroupFocused(t)){const t=2,r=10;i.fillStyle=this._selectedGroupBorderColor,i.fillRect(0,e-t,t,o-s.style.padding+2*t),i.fillRect(0,e-t,r,t),i.fillRect(0,e+o-s.style.padding,r,t)}}),i.restore()}_forEachGroup(e){const t=this._rawTimelineData.groups||[];if(!t.length)return;const i=this._groupOffsets,s=[{nestingLevel:-1,visible:!0}];for(let r=0;r<t.length;++r){const o=i[r],n=t[r];let a=!0;for(;s.peekLast().nestingLevel>=n.style.nestingLevel;)s.pop(),a=!1;const h=s.peekLast().visible,l=h&&(!this._isGroupCollapsible(r)||n.expanded);s.push({nestingLevel:n.style.nestingLevel,visible:l});const d=r===t.length-1?i[r+1]+n.style.padding:i[r+1];h&&e(o,r,n,a,d-o)}}_forEachGroupInViewport(e){const t=this._chartViewport.scrollOffset();this._forEachGroup((i,s,r,o,n)=>{i-r.style.padding>t+this._offsetHeight||i+n<t||e(i,s,r,o,n)})}_labelWidthForGroup(e,t){return UI.UIUtils.measureTextWidth(e,t.name)+this._expansionArrowIndent*(t.style.nestingLevel+1)+2*this._headerLabelXPadding}_drawCollapsedOverviewForGroup(e,t,i){const s=new Common.SegmentedRange.SegmentedRange((function(e,t){return e.data===t.data&&e.end+.4>t.end?e:null})),r=this._chartViewport.windowLeftTime(),o=this._chartViewport.windowRightTime(),n=this._canvas.getContext("2d"),a=e.style.height,h=this._rawTimelineData.entryStartTimes,l=this._rawTimelineData.entryTotalTimes,d=this._chartViewport.timeToPixel();for(let c=e.startLevel;c<i;++c){const i=this._timelineLevels[c];let _=1/0;for(let c=i.lowerBound(o,(e,t)=>e-h[t])-1;c>=0;--c){const o=i[c],u=h[o],p=this._timeToPositionClipped(u),f=u+l[o];if(isNaN(f)||p>=_)continue;if(f<=r)break;_=p;const m=this._entryColorsCache[o],g=this._timeToPositionClipped(f);if(e.style.useDecoratorsForOverview&&this._dataProvider.forceDecoration(o)){const e=this._chartViewport.timeToPosition(u),i=g-p;n.beginPath(),n.fillStyle=m,n.fillRect(p,t,i,a-1),this._dataProvider.decorateEntry(o,n,"",p,t,i,a,e,d)}else s.append(new Common.SegmentedRange.Segment(p,g,m))}}const c=s.segments().slice().sort((e,t)=>e.data.localeCompare(t.data));let _;n.beginPath();for(let e=0;e<c.length;++e){const i=c[e];_!==c[e].data&&(n.fill(),n.beginPath(),_=c[e].data,n.fillStyle=_),n.rect(i.begin,t,i.end-i.begin,a)}n.fill()}_drawFlowEvents(e,t,i){e.save();const s=window.devicePixelRatio,r=this._chartViewport.scrollOffset();e.scale(s,s),e.translate(0,-r),e.fillStyle="#7f5050",e.strokeStyle="#7f5050";const o=this._timelineData(),n=o.flowStartTimes.lowerBound(this._chartViewport.windowRightTime());e.lineWidth=.5;for(let t=0;t<n;++t){if(!o.flowEndTimes[t]||o.flowEndTimes[t]<this._chartViewport.windowLeftTime())continue;const i=this._chartViewport.timeToPosition(o.flowStartTimes[t]),s=this._chartViewport.timeToPosition(o.flowEndTimes[t]),r=o.flowStartLevels[t],n=o.flowEndLevels[t],a=this._levelToOffset(r)+this._levelHeight(r)/2,h=this._levelToOffset(n)+this._levelHeight(n)/2,l=Math.min((s-i)/4,40),d=(h-a)/10,c=30,_=o.flowEndTimes[t]-o.flowStartTimes[t]<1?a:c+Math.max(0,a+d*(t%c)),u=[];u.push({x:i,y:a}),u.push({x:i+6,y:a}),u.push({x:i+l+12,y:a}),u.push({x:i+l,y:_}),u.push({x:i+2*l,y:_}),u.push({x:s-2*l,y:_}),u.push({x:s-l,y:_}),u.push({x:s-l-12,y:h}),u.push({x:s-6,y:h}),e.beginPath(),e.moveTo(u[0].x,u[0].y),e.lineTo(u[1].x,u[1].y),e.bezierCurveTo(u[2].x,u[2].y,u[3].x,u[3].y,u[4].x,u[4].y),e.lineTo(u[5].x,u[5].y),e.bezierCurveTo(u[6].x,u[6].y,u[7].x,u[7].y,u[8].x,u[8].y),e.stroke(),e.beginPath(),e.arc(i,a,2,-Math.PI/2,Math.PI/2,!1),e.fill(),e.beginPath(),e.moveTo(s,h),e.lineTo(s-6,h-3),e.lineTo(s-6,h+3),e.fill()}e.restore()}_drawMarkers(){const e=this._timelineData().markers,t=this._markerIndexBeforeTime(this.minimumBoundary()),i=this.maximumBoundary(),s=this._chartViewport.timeToPixel(),r=this._canvas.getContext("2d");r.save();const o=window.devicePixelRatio;r.scale(o,o),r.translate(0,3);const n=HeaderHeight-1;for(let o=t;o<e.length;o++){const t=e[o].startTime();if(t>i)break;e[o].draw(r,this._chartViewport.timeToPosition(t),n,s)}r.restore()}_updateMarkerHighlight(){const e=this._markerHighlighElement;e.parentElement&&e.remove();const t=this._highlightedMarkerIndex;if(-1===t)return;const i=this._timelineData().markers[t],s=this._timeToPositionClipped(i.startTime());e.title=i.title();const r=e.style;r.left=s+"px",r.backgroundColor=i.color(),this._viewportElement.appendChild(e)}_processTimelineData(e){if(!e)return this._timelineLevels=null,this._visibleLevelOffsets=null,this._visibleLevels=null,this._groupOffsets=null,this._rawTimelineData=null,this._forceDecorationCache=null,this._entryColorsCache=null,this._rawTimelineDataLength=0,this._selectedGroup=-1,this._keyboardFocusedGroup=-1,void this._flameChartDelegate.updateSelectedGroup(this,null);this._rawTimelineData=e,this._rawTimelineDataLength=e.entryStartTimes.length,this._forceDecorationCache=new Int8Array(this._rawTimelineDataLength),this._entryColorsCache=new Array(this._rawTimelineDataLength);for(let e=0;e<this._rawTimelineDataLength;++e)this._forceDecorationCache[e]=this._dataProvider.forceDecoration(e)?1:0,this._entryColorsCache[e]=this._dataProvider.entryColor(e);const t=new Uint32Array(this._dataProvider.maxStackDepth()+1);for(let i=0;i<e.entryLevels.length;++i)++t[e.entryLevels[i]];const i=new Array(t.length);for(let e=0;e<i.length;++e)i[e]=new Uint32Array(t[e]),t[e]=0;for(let s=0;s<e.entryLevels.length;++s){const r=e.entryLevels[s];i[r][t[r]++]=s}this._timelineLevels=i;const s=this._rawTimelineData.groups||[];for(let e=0;e<s.length;++e){const t=this._groupExpansionState[s[e].name];void 0!==t&&(s[e].expanded=t)}this._updateLevelPositions(),this._updateHeight(),this._selectedGroup=e.selectedGroup?s.indexOf(e.selectedGroup):-1,this._keyboardFocusedGroup=this._selectedGroup,this._flameChartDelegate.updateSelectedGroup(this,e.selectedGroup)}_updateLevelPositions(){const e=this._dataProvider.maxStackDepth(),t=this._rawTimelineData.groups||[];this._visibleLevelOffsets=new Uint32Array(e+1),this._visibleLevelHeights=new Uint32Array(e),this._visibleLevels=new Uint16Array(e),this._groupOffsets=new Uint32Array(t.length+1);let i=-1,s=this._rulerEnabled?HeaderHeight+2:2,r=!0;const o=[{nestingLevel:-1,visible:!0}],n=Math.max(e,t.length?t.peekLast().startLevel+1:0);let a;for(a=0;a<n;++a){let n,h=!0;for(;i<t.length-1&&a===t[i+1].startLevel;){++i,n=t[i].style;let e=!0;for(;o.peekLast().nestingLevel>=n.nestingLevel;)o.pop(),e=!1;const a=!(i>=0&&this._isGroupCollapsible(i))||t[i].expanded;h=o.peekLast().visible,r=a&&h,o.push({nestingLevel:n.nestingLevel,visible:r}),h&&(s+=e?0:n.padding),this._groupOffsets[i]=s,h&&!n.shareHeaderLine&&(s+=n.height)}if(a>=e)continue;const l=i>=0&&a===t[i].startLevel,d=h&&(r||l&&t[i].style.useFirstLineForOverview);let c;if(i>=0){const e=t[i],s=e.style;c=l&&!s.shareHeaderLine||s.collapsible&&!e.expanded?s.height:s.itemsHeight||this._barHeight}else c=this._barHeight;this._visibleLevels[a]=d,this._visibleLevelOffsets[a]=s,this._visibleLevelHeights[a]=c,(d||h&&n&&n.shareHeaderLine&&l)&&(s+=this._visibleLevelHeights[a])}i>=0&&(this._groupOffsets[i+1]=s),this._visibleLevelOffsets[a]=s,this._useWebGL&&this._setupGLGeometry()}_isGroupCollapsible(e){const t=this._rawTimelineData.groups||[],i=t[e].style;if(!i.shareHeaderLine||!i.collapsible)return!!i.collapsible;const s=e+1>=t.length;if(!s&&t[e+1].style.nestingLevel>i.nestingLevel)return!0;return(s?this._dataProvider.maxStackDepth():t[e+1].startLevel)!==t[e].startLevel+1||i.height!==i.itemsHeight}setSelectedEntry(e){this._selectedEntryIndex!==e&&(-1!==e&&this._chartViewport.hideRangeSelection(),this._selectedEntryIndex=e,this._revealEntry(e),this._updateElementPosition(this._selectedElement,this._selectedEntryIndex))}_updateElementPosition(e,t){if(e.classList.add("hidden"),-1===t)return;const i=this._timelineData(),s=i.entryStartTimes[t],r=i.entryTotalTimes[t];let o=0,n=0,a=!0;if(Number.isNaN(r)){const e=this._markerPositions.get(t);e?(o=e.x,n=e.width):a=!1}else o=this._chartViewport.timeToPosition(s),n=r*this._chartViewport.timeToPixel();if(o+n<=0||o>=this._offsetWidth)return;const h=o+n/2;n=Math.max(n,2),o=h-n/2;const l=i.entryLevels[t],d=this._levelToOffset(l)-this._chartViewport.scrollOffset(),c=this._levelHeight(l),_=e.style;_.left=o+"px",_.top=d+"px",_.width=n+"px",_.height=c-1+"px",e.classList.toggle("hidden",!a),this._viewportElement.appendChild(e)}_timeToPositionClipped(e){return Platform.NumberUtilities.clamp(this._chartViewport.timeToPosition(e),0,this._offsetWidth)}_levelToOffset(e){return this._visibleLevelOffsets[e]}_levelHeight(e){return this._visibleLevelHeights[e]}_updateBoundaries(){this._totalTime=this._dataProvider.totalTime(),this._minimumBoundary=this._dataProvider.minimumBoundary(),this._chartViewport.setBoundaries(this._minimumBoundary,this._totalTime)}_updateHeight(){const e=this._levelToOffset(this._dataProvider.maxStackDepth())+2;this._chartViewport.setContentHeight(e)}onResize(){this.scheduleUpdate()}update(){this._timelineData()&&(this._resetCanvas(),this._updateHeight(),this._updateBoundaries(),this._draw(),this._chartViewport.isDragging()||this._updateHighlight())}reset(){this._chartViewport.reset(),this._rawTimelineData=null,this._rawTimelineDataLength=0,this._highlightedMarkerIndex=-1,this._highlightedEntryIndex=-1,this._selectedEntryIndex=-1,this._textWidth=new Map,this._chartViewport.scheduleUpdate()}scheduleUpdate(){this._chartViewport.scheduleUpdate()}_enabled(){return 0!==this._rawTimelineDataLength}computePosition(e){return this._chartViewport.timeToPosition(e)}formatValue(e,t){return this._dataProvider.formatValue(e-this.zeroTime(),t)}maximumBoundary(){return this._chartViewport.windowRightTime()}minimumBoundary(){return this._chartViewport.windowLeftTime()}zeroTime(){return this._dataProvider.minimumBoundary()}boundarySpan(){return this.maximumBoundary()-this.minimumBoundary()}}export const HeaderHeight=15;export const MinimalTimeWindowMs=.5;export class TimelineData{constructor(e,t,i,s){this.entryLevels=e,this.entryTotalTimes=t,this.entryStartTimes=i,this.groups=s,this.markers=[],this.flowStartTimes=[],this.flowStartLevels=[],this.flowEndTimes=[],this.flowEndLevels=[],this.selectedGroup=null}}export class FlameChartDataProvider{minimumBoundary(){}totalTime(){}formatValue(e,t){}maxStackDepth(){}timelineData(){}prepareHighlightedEntryInfo(e){}canJumpToEntry(e){}entryTitle(e){}entryFont(e){}entryColor(e){}decorateEntry(e,t,i,s,r,o,n,a,h){}forceDecoration(e){}textColor(e){}}export class FlameChartMarker{startTime(){}color(){}title(){}draw(e,t,i,s){}}export const Events={CanvasFocused:Symbol("CanvasFocused"),EntryInvoked:Symbol("EntryInvoked"),EntrySelected:Symbol("EntrySelected"),EntryHighlighted:Symbol("EntryHighlighted")};export const Colors={SelectedGroupBackground:"hsl(215, 85%, 98%)",SelectedGroupBorder:"hsl(216, 68%, 54%)"};export let Group;export let GroupStyle;