import*as Common from"../common/common.js";import{DataGridNode}from"./DataGrid.js";export class ShowMoreDataGridNode extends DataGridNode{constructor(t,s,i,e){super({summaryRow:!0},!1),this._callback=t,this._startPosition=s,this._endPosition=i,this._chunkSize=e,this.showNext=createElement("button"),this.showNext.setAttribute("type","button"),this.showNext.addEventListener("click",this._showNextChunk.bind(this),!1),this.showNext.textContent=Common.UIString.UIString("Show %d before",this._chunkSize),this.showAll=createElement("button"),this.showAll.setAttribute("type","button"),this.showAll.addEventListener("click",this._showAll.bind(this),!1),this.showLast=createElement("button"),this.showLast.setAttribute("type","button"),this.showLast.addEventListener("click",this._showLastChunk.bind(this),!1),this.showLast.textContent=Common.UIString.UIString("Show %d after",this._chunkSize),this._updateLabels(),this.selectable=!1}_showNextChunk(){this._callback(this._startPosition,this._startPosition+this._chunkSize)}_showAll(){this._callback(this._startPosition,this._endPosition)}_showLastChunk(){this._callback(this._endPosition-this._chunkSize,this._endPosition)}_updateLabels(){const t=this._endPosition-this._startPosition;t>this._chunkSize?(this.showNext.classList.remove("hidden"),this.showLast.classList.remove("hidden")):(this.showNext.classList.add("hidden"),this.showLast.classList.add("hidden")),this.showAll.textContent=Common.UIString.UIString("Show all %d",t)}createCells(t){this._hasCells=!1,super.createCells(t)}createCell(t){const s=this.createTD(t);return s.classList.add("show-more"),this._hasCells||(this._hasCells=!0,this.depth&&s.style.setProperty("padding-left",this.depth*this.dataGrid.indentWidth+"px"),s.appendChild(this.showNext),s.appendChild(this.showAll),s.appendChild(this.showLast)),s}setStartPosition(t){this._startPosition=t,this._updateLabels()}setEndPosition(t){this._endPosition=t,this._updateLabels()}nodeSelfHeight(){return 40}dispose(){}}