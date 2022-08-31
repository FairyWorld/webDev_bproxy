import*as Common from"../common/common.js";import*as MobileThrottling from"../mobile_throttling/mobile_throttling.js";import*as SDK from"../sdk/sdk.js";import*as UI from"../ui/ui.js";export class NetworkConfigView extends UI.Widget.VBox{constructor(){super(!0),this.registerRequiredCSS("network/networkConfigView.css"),this.contentElement.classList.add("network-config"),this._createCacheSection(),this.contentElement.createChild("div").classList.add("panel-section-separator"),this._createNetworkThrottlingSection(),this.contentElement.createChild("div").classList.add("panel-section-separator"),this._createUserAgentSection()}static createUserAgentSelectAndInput(e){const i=Common.Settings.Settings.instance().createSetting("customUserAgent",""),t=createElement("select");UI.ARIAUtils.setAccessibleName(t,e);const l={title:Common.UIString.UIString("Custom..."),value:"custom"};t.appendChild(new Option(l.title,l.value));for(const e of userAgentGroups){const i=t.createChild("optgroup");i.label=e.title;for(const t of e.values){const e=SDK.NetworkManager.MultitargetNetworkManager.patchUserAgentWithChromeVersion(t.value);i.appendChild(new Option(t.title,e))}}t.selectedIndex=0;const o=UI.UIUtils.createInput("","text");o.value=i.get(),o.title=i.get(),o.placeholder=Common.UIString.UIString("Enter a custom user agent"),o.required=!0,UI.ARIAUtils.setAccessibleName(o,o.placeholder);const a=createElementWithClass("div","network-config-input-validation-error");function r(){const e=i.get(),l=t.options;let o=!1;for(let i=0;i<l.length;++i)if(l[i].value===e){t.selectedIndex=i,o=!0;break}o||(t.selectedIndex=0)}return UI.ARIAUtils.markAsAlert(a),o.value||(a.textContent=ls`Custom user agent field is required`),r(),t.addEventListener("change",(function(){const e=t.options[t.selectedIndex].value;e!==l.value?(i.set(e),o.value=e,o.title=e):o.select();a.textContent=""}),!1),o.addEventListener("input",(function(){i.get()!==o.value&&(o.value?a.textContent="":a.textContent=ls`Custom user agent field is required`,i.set(o.value),o.title=o.value,r())}),!1),{select:t,input:o,error:a}}_createSection(e,i){const t=this.contentElement.createChild("section","network-config-group");return i&&t.classList.add(i),t.createChild("div","network-config-title").textContent=e,t.createChild("div","network-config-fields")}_createCacheSection(){this._createSection(Common.UIString.UIString("Caching"),"network-config-disable-cache").appendChild(UI.SettingsUI.createSettingCheckbox(Common.UIString.UIString("Disable cache"),Common.Settings.Settings.instance().moduleSetting("cacheDisabled"),!0))}_createNetworkThrottlingSection(){const e=ls`Network throttling`,i=this._createSection(e,"network-config-throttling").createChild("select","chrome-select");MobileThrottling.ThrottlingManager.throttlingManager().decorateSelectWithNetworkThrottling(i),UI.ARIAUtils.setAccessibleName(i,e)}_createUserAgentSection(){const e=ls`User agent`,i=this._createSection(e,"network-config-ua"),t=UI.UIUtils.CheckboxLabel.create(Common.UIString.UIString("Select automatically"),!0);i.appendChild(t);const l=t.checkboxElement,o=Common.Settings.Settings.instance().createSetting("customUserAgent","");o.addChangeListener(()=>{l.checked||self.SDK.multitargetNetworkManager.setCustomUserAgentOverride(o.get())});const a=i.createChild("div","network-config-ua-custom");l.addEventListener("change",n);const r=NetworkConfigView.createUserAgentSelectAndInput(e);function n(){const e=!l.checked;a.classList.toggle("checked",e),r.select.disabled=!e,r.input.disabled=!e,r.error.hidden=!e;const i=e?o.get():"";self.SDK.multitargetNetworkManager.setCustomUserAgentOverride(i)}r.select.classList.add("chrome-select"),a.appendChild(r.select),a.appendChild(r.input),a.appendChild(r.error),n()}}export const userAgentGroups=[{title:ls`Android`,values:[{title:ls`Android (4.0.2) Browser \u2014 Galaxy Nexus`,value:"Mozilla/5.0 (Linux; U; Android 4.0.2; en-us; Galaxy Nexus Build/ICL53F) AppleWebKit/534.30 (KHTML, like Gecko) Version/4.0 Mobile Safari/534.30"},{title:ls`Android (2.3) Browser \u2014 Nexus S`,value:"Mozilla/5.0 (Linux; U; Android 2.3.6; en-us; Nexus S Build/GRK39F) AppleWebKit/533.1 (KHTML, like Gecko) Version/4.0 Mobile Safari/533.1"}]},{title:ls`BlackBerry`,values:[{title:ls`BlackBerry \u2014 BB10`,value:"Mozilla/5.0 (BB10; Touch) AppleWebKit/537.1+ (KHTML, like Gecko) Version/10.0.0.1337 Mobile Safari/537.1+"},{title:ls`BlackBerry \u2014 PlayBook 2.1`,value:"Mozilla/5.0 (PlayBook; U; RIM Tablet OS 2.1.0; en-US) AppleWebKit/536.2+ (KHTML, like Gecko) Version/7.2.1.0 Safari/536.2+"},{title:ls`BlackBerry \u2014 9900`,value:"Mozilla/5.0 (BlackBerry; U; BlackBerry 9900; en-US) AppleWebKit/534.11+ (KHTML, like Gecko) Version/7.0.0.187 Mobile Safari/534.11+"}]},{title:ls`Chrome`,values:[{title:ls`Chrome \u2014 Android Mobile`,value:"Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/%s Mobile Safari/537.36"},{title:ls`Chrome \u2014 Android Mobile (high-end)`,value:"Mozilla/5.0 (Linux; Android 10; Pixel 4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/%s Mobile Safari/537.36"},{title:ls`Chrome \u2014 Android Tablet`,value:"Mozilla/5.0 (Linux; Android 4.3; Nexus 7 Build/JSS15Q) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/%s Safari/537.36"},{title:ls`Chrome \u2014 iPhone`,value:"Mozilla/5.0 (iPhone; CPU iPhone OS 13_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/%s Mobile/15E148 Safari/604.1"},{title:ls`Chrome \u2014 iPad`,value:"Mozilla/5.0 (iPad; CPU OS 13_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/%s Mobile/15E148 Safari/604.1"},{title:ls`Chrome \u2014 Chrome OS`,value:"Mozilla/5.0 (X11; CrOS x86_64 10066.0.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/%s Safari/537.36"},{title:ls`Chrome \u2014 Mac`,value:"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/%s Safari/537.36"},{title:ls`Chrome \u2014 Windows`,value:"Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/%s Safari/537.36"}]},{title:ls`Firefox`,values:[{title:ls`Firefox \u2014 Android Mobile`,value:"Mozilla/5.0 (Android 4.4; Mobile; rv:70.0) Gecko/70.0 Firefox/70.0"},{title:ls`Firefox \u2014 Android Tablet`,value:"Mozilla/5.0 (Android 4.4; Tablet; rv:70.0) Gecko/70.0 Firefox/70.0"},{title:ls`Firefox \u2014 iPhone`,value:"Mozilla/5.0 (iPhone; CPU iPhone OS 8_3 like Mac OS X) AppleWebKit/600.1.4 (KHTML, like Gecko) FxiOS/1.0 Mobile/12F69 Safari/600.1.4"},{title:ls`Firefox \u2014 iPad`,value:"Mozilla/5.0 (iPad; CPU iPhone OS 8_3 like Mac OS X) AppleWebKit/600.1.4 (KHTML, like Gecko) FxiOS/1.0 Mobile/12F69 Safari/600.1.4"},{title:ls`Firefox \u2014 Mac`,value:"Mozilla/5.0 (Macintosh; Intel Mac OS X 10.14; rv:70.0) Gecko/20100101 Firefox/70.0"},{title:ls`Firefox \u2014 Windows`,value:"Mozilla/5.0 (Windows NT 10.0; WOW64; rv:70.0) Gecko/20100101 Firefox/70.0"}]},{title:ls`Googlebot`,values:[{title:ls`Googlebot`,value:"Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)"},{title:ls`Googlebot Desktop`,value:"Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; Googlebot/2.1; +http://www.google.com/bot.html) Chrome/%s Safari/537.36"},{title:ls`Googlebot Smartphone`,value:"Mozilla/5.0 (Linux; Android 6.0.1; Nexus 5X Build/MMB29P) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/%s Mobile Safari/537.36 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)"}]},{title:ls`Internet Explorer`,values:[{title:ls`Internet Explorer 11`,value:"Mozilla/5.0 (Windows NT 10.0; WOW64; Trident/7.0; rv:11.0) like Gecko"},{title:ls`Internet Explorer 10`,value:"Mozilla/5.0 (compatible; MSIE 10.0; Windows NT 6.1; WOW64; Trident/6.0)"},{title:ls`Internet Explorer 9`,value:"Mozilla/5.0 (compatible; MSIE 9.0; Windows NT 6.1; Trident/5.0)"},{title:ls`Internet Explorer 8`,value:"Mozilla/4.0 (compatible; MSIE 8.0; Windows NT 6.0; Trident/4.0)"},{title:ls`Internet Explorer 7`,value:"Mozilla/4.0 (compatible; MSIE 7.0; Windows NT 6.0)"}]},{title:ls`Microsoft Edge`,values:[{title:ls`Microsoft Edge (Chromium) \u2014 Windows`,value:"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/%s Safari/537.36 Edg/%s"},{title:ls`Microsoft Edge (Chromium) \u2014 Mac`,value:"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/605.1.15 (KHTML, like Gecko) Chrome/%s Safari/604.1 Edg/%s"},{title:ls`Microsoft Edge \u2014 iPhone`,value:"Mozilla/5.0 (iPhone; CPU iPhone OS 12_3_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/12.1.1 EdgiOS/44.5.0.10 Mobile/15E148 Safari/604.1"},{title:ls`Microsoft Edge \u2014 iPad`,value:"Mozilla/5.0 (iPad; CPU OS 12_3_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/12.0 EdgiOS/44.5.2 Mobile/15E148 Safari/605.1.15"},{title:ls`Microsoft Edge \u2014 Android Mobile`,value:"Mozilla/5.0 (Linux; Android 8.1.0; Pixel Build/OPM4.171019.021.D1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3325.109 Mobile Safari/537.36 EdgA/42.0.0.2057"},{title:ls`Microsoft Edge \u2014 Android Tablet`,value:"Mozilla/5.0 (Linux; Android 6.0.1; Nexus 7 Build/MOB30X) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3325.109 Safari/537.36 EdgA/42.0.0.2057"},{title:ls`Microsoft Edge (EdgeHTML) \u2014 Windows`,value:"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.102 Safari/537.36 Edge/18.18362"},{title:ls`Microsoft Edge (EdgeHTML) \u2014 XBox`,value:"Mozilla/5.0 (Windows NT 10.0; Win64; x64; Xbox; Xbox One) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.102 Safari/537.36 Edge/18.18362"}]},{title:ls`Opera`,values:[{title:ls`Opera \u2014 Mac`,value:"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.97 Safari/537.36 OPR/65.0.3467.48"},{title:ls`Opera \u2014 Windows`,value:"Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.97 Safari/537.36 OPR/65.0.3467.48"},{title:ls`Opera (Presto) \u2014 Mac`,value:"Opera/9.80 (Macintosh; Intel Mac OS X 10.9.1) Presto/2.12.388 Version/12.16"},{title:ls`Opera (Presto) \u2014 Windows`,value:"Opera/9.80 (Windows NT 6.1) Presto/2.12.388 Version/12.16"},{title:ls`Opera Mobile \u2014 Android Mobile`,value:"Opera/12.02 (Android 4.1; Linux; Opera Mobi/ADR-1111101157; U; en-US) Presto/2.9.201 Version/12.02"},{title:ls`Opera Mini \u2014 iOS`,value:"Opera/9.80 (iPhone; Opera Mini/8.0.0/34.2336; U; en) Presto/2.8.119 Version/11.10"}]},{title:ls`Safari`,values:[{title:ls`Safari \u2014 iPad iOS 13.2`,value:"Mozilla/5.0 (iPad; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1"},{title:ls`Safari \u2014 iPhone iOS 13.2`,value:"Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1"},{title:ls`Safari \u2014 Mac`,value:"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Safari/605.1.15"}]},{title:ls`UC Browser`,values:[{title:ls`UC Browser \u2014 Android Mobile`,value:"Mozilla/5.0 (Linux; U; Android 8.1.0; en-US; Nexus 6P Build/OPM7.181205.001) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/57.0.2987.108 UCBrowser/12.11.1.1197 Mobile Safari/537.36"},{title:ls`UC Browser \u2014 iOS`,value:"Mozilla/5.0 (iPhone; CPU iPhone OS 12_1 like Mac OS X; zh-CN) AppleWebKit/537.51.1 (KHTML, like Gecko) Mobile/16B92 UCBrowser/12.1.7.1109 Mobile AliApp(TUnionSDK/0.1.20.3)"},{title:ls`UC Browser \u2014 Windows Phone`,value:"Mozilla/5.0 (compatible; MSIE 10.0; Windows Phone 8.0; Trident/6.0; IEMobile/10.0; ARM; Touch; NOKIA; Lumia 920) UCBrowser/10.1.0.563 Mobile"}]}];