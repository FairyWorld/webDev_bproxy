import*as Common from"../common/common.js";import*as TextUtils from"../text_utils/text_utils.js";export class CompilerSourceMappingContentProvider{constructor(t,e){this._sourceURL=t,this._contentType=e}contentURL(){return this._sourceURL}contentType(){return this._contentType}contentEncoded(){return Promise.resolve(!1)}requestContent(){return new Promise(t=>{self.SDK.multitargetNetworkManager.loadResource(this._sourceURL,(e,o,n,r)=>{if(e)t({content:n,isEncoded:!1});else{const e=ls`Could not load content for ${this._sourceURL} (${r.message})`;console.error(e),t({error:e,isEncoded:!1})}})})}async searchInContent(t,e,o){const{content:n}=await this.requestContent();return"string"!=typeof n?[]:TextUtils.TextUtils.performSearchInContent(n,t,e,o)}}