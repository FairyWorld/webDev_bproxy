import*as SDK from"../sdk/sdk.js";import*as TextUtils from"../text_utils/text_utils.js";import{ConsoleViewMessage}from"./ConsoleViewMessage.js";export class ConsoleFilter{constructor(e,t,s,r){this.name=e,this.parsedFilters=t,this.executionContext=s,this.levelsMask=r||ConsoleFilter.defaultLevelsFilterValue()}static allLevelsFilterValue(){const e={};for(const t of Object.values(SDK.ConsoleModel.MessageLevel))e[t]=!0;return e}static defaultLevelsFilterValue(){const e=ConsoleFilter.allLevelsFilterValue();return e[SDK.ConsoleModel.MessageLevel.Verbose]=!1,e}static singleLevelMask(e){const t={};return t[e]=!0,t}clone(){const e=this.parsedFilters.map(TextUtils.TextUtils.FilterParser.cloneFilter),t=Object.assign({},this.levelsMask);return new ConsoleFilter(this.name,e,this.executionContext,t)}shouldBeVisible(e){const t=e.consoleMessage();if(this.executionContext&&(this.executionContext.runtimeModel!==t.runtimeModel()||this.executionContext.id!==t.executionContextId))return!1;if(t.type===SDK.ConsoleModel.MessageType.Command||t.type===SDK.ConsoleModel.MessageType.Result||t.isGroupMessage())return!0;if(t.level&&!this.levelsMask[t.level])return!1;for(const r of this.parsedFilters)if(r.key)switch(r.key){case FilterType.Context:if(!s(r,t.context,!1))return!1;break;case FilterType.Source:if(!s(r,t.source?SDK.ConsoleModel.MessageSourceDisplayName.get(t.source):t.source,!0))return!1;break;case FilterType.Url:if(!s(r,t.url,!1))return!1}else{if(r.regex&&e.matchesFilterRegex(r.regex)===r.negative)return!1;if(r.text&&e.matchesFilterText(r.text)===r.negative)return!1}return!0;function s(e,t,s){if(!e.text)return!!t===e.negative;if(!t)return!e.text==!e.negative;const r=e.text.toLowerCase(),o=t.toLowerCase();return(!s||o===r!==e.negative)&&!(!s&&o.includes(r)===e.negative)}}}export const FilterType={Context:"context",Source:"source",Url:"url"};