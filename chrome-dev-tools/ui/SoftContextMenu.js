import*as Host from"../host/host.js";import*as ARIAUtils from"./ARIAUtils.js";import{AnchorBehavior,GlassPane,MarginBehavior,PointerEventsBehavior,SizeBehavior}from"./GlassPane.js";import{Icon}from"./Icon.js";import{ElementFocusRestorer}from"./UIUtils.js";export class SoftContextMenu{constructor(e,t,s){this._items=e,this._itemSelectedCallback=t,this._parentMenu=s,this._highlightedMenuItemElement=null}show(e,t){if(this._items.length){this._document=e,this._glassPane=new GlassPane,this._glassPane.setPointerEventsBehavior(this._parentMenu?PointerEventsBehavior.PierceGlassPane:PointerEventsBehavior.BlockedByGlassPane),this._glassPane.registerRequiredCSS("ui/softContextMenu.css"),this._glassPane.setContentAnchorBox(t),this._glassPane.setSizeBehavior(SizeBehavior.MeasureContent),this._glassPane.setMarginBehavior(MarginBehavior.NoMargin),this._glassPane.setAnchorBehavior(this._parentMenu?AnchorBehavior.PreferRight:AnchorBehavior.PreferBottom),this._contextMenuElement=this._glassPane.contentElement.createChild("div","soft-context-menu"),this._contextMenuElement.tabIndex=-1,ARIAUtils.markAsMenu(this._contextMenuElement),this._contextMenuElement.addEventListener("mouseup",e=>e.consume(),!1),this._contextMenuElement.addEventListener("keydown",this._menuKeyDown.bind(this),!1);for(let e=0;e<this._items.length;++e)this._contextMenuElement.appendChild(this._createMenuItem(this._items[e]));this._glassPane.show(e),this._focusRestorer=new ElementFocusRestorer(this._contextMenuElement),this._parentMenu||(this._hideOnUserGesture=e=>{let t=this._subMenu;for(;t;){if(t._contextMenuElement===e.path[0])return;t=t._subMenu}this.discard(),e.consume(!0)},this._document.body.addEventListener("mousedown",this._hideOnUserGesture,!1),this._document.defaultView.addEventListener("resize",this._hideOnUserGesture,!1))}}discard(){this._subMenu&&this._subMenu.discard(),this._focusRestorer&&this._focusRestorer.restore(),this._glassPane&&(this._glassPane.hide(),delete this._glassPane,this._hideOnUserGesture&&(this._document.body.removeEventListener("mousedown",this._hideOnUserGesture,!1),this._document.defaultView.removeEventListener("resize",this._hideOnUserGesture,!1),delete this._hideOnUserGesture)),this._parentMenu&&delete this._parentMenu._subMenu}_createMenuItem(e){if("separator"===e.type)return this._createSeparator();if("subMenu"===e.type)return this._createSubMenu(e);const t=createElementWithClass("div","soft-context-menu-item");t.tabIndex=-1,ARIAUtils.markAsMenuItem(t);const s=Icon.create("smallicon-checkmark","checkmark");if(t.appendChild(s),e.checked||(s.style.opacity="0"),e.element){return t.createChild("div","soft-context-menu-custom-item").appendChild(e.element),t._customElement=e.element,t}e.enabled||t.classList.add("soft-context-menu-disabled"),t.createTextChild(e.label),t.createChild("span","soft-context-menu-shortcut").textContent=e.shortcut,t.addEventListener("mousedown",this._menuItemMouseDown.bind(this),!1),t.addEventListener("mouseup",this._menuItemMouseUp.bind(this),!1),t.addEventListener("mouseover",this._menuItemMouseOver.bind(this),!1),t.addEventListener("mouseleave",this._menuItemMouseLeave.bind(this),!1),t._actionId=e.id;let i=e.label;if("checkbox"===e.type){const t=e.checked?ls`checked`:ls`unchecked`;i=e.shortcut?ls`${e.label}, ${e.shortcut}, ${t}`:ls`${e.label}, ${t}`}else e.shortcut&&(i=ls`${e.label}, ${e.shortcut}`);return ARIAUtils.setAccessibleName(t,i),t}_createSubMenu(e){const t=createElementWithClass("div","soft-context-menu-item");t._subItems=e.subItems,t.tabIndex=-1,ARIAUtils.markAsMenuItemSubMenu(t),ARIAUtils.setAccessibleName(t,e.label);const s=Icon.create("smallicon-checkmark","soft-context-menu-item-checkmark");if(s.classList.add("checkmark"),t.appendChild(s),s.style.opacity="0",t.createTextChild(e.label),Host.Platform.isMac()&&!self.UI.themeSupport.hasTheme()){t.createChild("span","soft-context-menu-item-submenu-arrow").textContent="▶"}else{const e=Icon.create("smallicon-triangle-right","soft-context-menu-item-submenu-arrow");t.appendChild(e)}return t.addEventListener("mousedown",this._menuItemMouseDown.bind(this),!1),t.addEventListener("mouseup",this._menuItemMouseUp.bind(this),!1),t.addEventListener("mouseover",this._menuItemMouseOver.bind(this),!1),t.addEventListener("mouseleave",this._menuItemMouseLeave.bind(this),!1),t}_createSeparator(){const e=createElementWithClass("div","soft-context-menu-separator");return e._isSeparator=!0,e.createChild("div","separator-line"),e}_menuItemMouseDown(e){e.consume(!0)}_menuItemMouseUp(e){this._triggerAction(e.target,e),e.consume()}_root(){let e=this;for(;e._parentMenu;)e=e._parentMenu;return e}_triggerAction(e,t){if(!e._subItems)return this._root().discard(),t.consume(!0),void(void 0!==e._actionId&&(this._itemSelectedCallback(e._actionId),delete e._actionId));this._showSubMenu(e),t.consume()}_showSubMenu(e){if(e._subMenuTimer&&(clearTimeout(e._subMenuTimer),delete e._subMenuTimer),this._subMenu)return;this._subMenu=new SoftContextMenu(e._subItems,this._itemSelectedCallback,this);const t=e.boxInWindow();t.y-=5,t.x+=3,t.width-=6,t.height+=10,this._subMenu.show(this._document,t)}_menuItemMouseOver(e){this._highlightMenuItem(e.target,!0)}_menuItemMouseLeave(e){if(!this._subMenu||!e.relatedTarget)return void this._highlightMenuItem(null,!0);e.relatedTarget===this._contextMenuElement&&this._highlightMenuItem(null,!0)}_highlightMenuItem(e,t){this._highlightedMenuItemElement!==e&&(this._subMenu&&this._subMenu.discard(),this._highlightedMenuItemElement&&(this._highlightedMenuItemElement.classList.remove("force-white-icons"),this._highlightedMenuItemElement.classList.remove("soft-context-menu-item-mouse-over"),this._highlightedMenuItemElement._subItems&&this._highlightedMenuItemElement._subMenuTimer&&(clearTimeout(this._highlightedMenuItemElement._subMenuTimer),delete this._highlightedMenuItemElement._subMenuTimer)),this._highlightedMenuItemElement=e,this._highlightedMenuItemElement&&((self.UI.themeSupport.hasTheme()||Host.Platform.isMac())&&this._highlightedMenuItemElement.classList.add("force-white-icons"),this._highlightedMenuItemElement.classList.add("soft-context-menu-item-mouse-over"),this._highlightedMenuItemElement._customElement?this._highlightedMenuItemElement._customElement.focus():this._highlightedMenuItemElement.focus(),t&&this._highlightedMenuItemElement._subItems&&!this._highlightedMenuItemElement._subMenuTimer&&(this._highlightedMenuItemElement._subMenuTimer=setTimeout(this._showSubMenu.bind(this,this._highlightedMenuItemElement),150))))}_highlightPrevious(){let e=this._highlightedMenuItemElement?this._highlightedMenuItemElement.previousSibling:this._contextMenuElement.lastChild;for(;e&&(e._isSeparator||e.classList.contains("soft-context-menu-disabled"));)e=e.previousSibling;e&&this._highlightMenuItem(e,!1)}_highlightNext(){let e=this._highlightedMenuItemElement?this._highlightedMenuItemElement.nextSibling:this._contextMenuElement.firstChild;for(;e&&(e._isSeparator||e.classList.contains("soft-context-menu-disabled"));)e=e.nextSibling;e&&this._highlightMenuItem(e,!1)}_menuKeyDown(e){switch(e.key){case"ArrowUp":this._highlightPrevious();break;case"ArrowDown":this._highlightNext();break;case"ArrowLeft":this._parentMenu&&(this._highlightMenuItem(null,!1),this.discard());break;case"ArrowRight":if(!this._highlightedMenuItemElement)break;this._highlightedMenuItemElement._subItems&&(this._showSubMenu(this._highlightedMenuItemElement),this._subMenu._highlightNext());break;case"Escape":this.discard();break;case"Enter":if(!isEnterKey(e))return;case" ":if(!this._highlightedMenuItemElement||this._highlightedMenuItemElement._customElement)return;this._triggerAction(this._highlightedMenuItemElement,e),this._highlightedMenuItemElement._subItems&&this._subMenu._highlightNext()}e.consume(!0)}}