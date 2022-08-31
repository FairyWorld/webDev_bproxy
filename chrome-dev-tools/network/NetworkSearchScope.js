import*as Common from"../common/common.js";import*as SDK from"../sdk/sdk.js";import*as Search from"../search/search.js";export class NetworkSearchScope{performIndexing(e){setImmediate(e.done.bind(e))}async performSearch(e,t,s,r){const o=[],n=self.SDK.networkLog.requests().filter(t=>e.filePathMatchesFileQuery(t.url()));t.setTotalWork(n.length);for(const s of n){const r=this._searchRequest(e,s,t);o.push(r)}const a=await Promise.all(o);if(t.isCanceled())r(!1);else{for(const e of a.sort((e,t)=>e.label().localeCompare(t.label())))e.matchesCount()>0&&s(e);t.done(),r(!0)}}async _searchRequest(e,t,s){let r=[];if(t.contentType().isTextType()&&(r=await t.searchInContent(e.query(),!e.ignoreCase(),e.isRegex())),s.isCanceled())return null;const o=[];a(t.url())&&o.push(UIRequestLocation.urlMatch(t));for(const e of t.requestHeaders())n(e)&&o.push(UIRequestLocation.requestHeaderMatch(t,e));for(const e of t.responseHeaders)n(e)&&o.push(UIRequestLocation.responseHeaderMatch(t,e));for(const e of r)o.push(UIRequestLocation.bodyMatch(t,e));return s.worked(),new NetworkSearchResult(t,o);function n(e){return a(`${e.name}: ${e.value}`)}function a(t){const s=e.ignoreCase()?"i":"",r=e.queries().map(e=>new RegExp(e,s));let o=0;for(const e of r){const s=t.substr(o).match(e);if(!s)return!1;o+=s.index+s[0].length}return!0}}stopSearch(){}}export class UIRequestLocation{constructor(e,t,s,r,o){this.request=e,this.requestHeader=t,this.responseHeader=s,this.searchMatch=r,this.isUrlMatch=o}static requestHeaderMatch(e,t){return new UIRequestLocation(e,t,null,null,!1)}static responseHeaderMatch(e,t){return new UIRequestLocation(e,null,t,null,!1)}static bodyMatch(e,t){return new UIRequestLocation(e,null,null,t,!1)}static urlMatch(e){return new UIRequestLocation(e,null,null,null,!0)}}export class NetworkSearchResult{constructor(e,t){this._request=e,this._locations=t}matchesCount(){return this._locations.length}label(){return this._request.displayName}description(){const e=this._request.parsedURL;return e?e.urlWithoutScheme():this._request.url()}matchLineContent(e){const t=this._locations[e];if(t.isUrlMatch)return this._request.url();const s=t.requestHeader||t.responseHeader;return s?s.value:t.searchMatch.lineContent}matchRevealable(e){return this._locations[e]}matchLabel(e){const t=this._locations[e];if(t.isUrlMatch)return Common.UIString.UIString("URL");const s=t.requestHeader||t.responseHeader;return s?s.name+":":t.searchMatch.lineNumber+1}}