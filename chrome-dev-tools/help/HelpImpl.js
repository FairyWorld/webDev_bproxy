import*as Common from"../common/common.js";import*as Host from"../host/host.js";import*as UI from"../ui/ui.js";import{releaseNoteText}from"./ReleaseNoteText.js";export const releaseNoteViewId="release-note";export function latestReleaseNote(){return Help._latestReleaseNote||(Help._latestReleaseNote=(self.Help.releaseNoteText||releaseNoteText).reduce((e,t)=>t.version>e.version?t:e)),Help._latestReleaseNote}export function showReleaseNoteIfNeeded(){innerShowReleaseNoteIfNeeded(Help._releaseNoteVersionSetting.get(),latestReleaseNote().version,Common.Settings.Settings.instance().moduleSetting("help.show-release-note").get())}export function innerShowReleaseNoteIfNeeded(e,t,o){e?o&&(e>=t||(Help._releaseNoteVersionSetting.set(t),UI.ViewManager.ViewManager.instance().showView("release-note",!0))):Help._releaseNoteVersionSetting.set(t)}export class HelpLateInitialization{async run(){Host.InspectorFrontendHost.isUnderTest()||showReleaseNoteIfNeeded()}}export class ReleaseNotesActionDelegate{handleAction(e,t){return Host.InspectorFrontendHost.InspectorFrontendHostInstance.openInNewTab(latestReleaseNote().link),!0}}export class ReportIssueActionDelegate{handleAction(e,t){return Host.InspectorFrontendHost.InspectorFrontendHostInstance.openInNewTab("https://bugs.chromium.org/p/chromium/issues/entry?template=DevTools+issue"),!0}}export let ReleaseNoteHighlight;export let ReleaseNote;