/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as nls from 'vs/nls';
import { InstantiationType, registerSingleton } from 'vs/platform/instantiation/common/extensions';
import { Registry } from 'vs/platform/registry/common/platform';
import 'vs/workbench/contrib/comments/browser/commentsEditorContribution';
import { ICommentService, CommentService } from 'vs/workbench/contrib/comments/browser/commentService';
import { IConfigurationRegistry, Extensions as ConfigurationExtensions } from 'vs/platform/configuration/common/configurationRegistry';
import { ctxCommentEditorFocused } from 'vs/workbench/contrib/comments/browser/simpleCommentEditor';
// import * as strings from 'vs/base/common/strings';
import { AccessibilityVerbositySettingId } from 'vs/workbench/contrib/accessibility/browser/accessibilityConfiguration';
import { AccessibleViewType, IAccessibleContentProvider, IAccessibleViewOptions, IAccessibleViewService } from 'vs/workbench/contrib/accessibility/browser/accessibleView';
import { AccessibilityHelpAction } from 'vs/workbench/contrib/accessibility/browser/accessibleViewActions';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { IKeybindingService } from 'vs/platform/keybinding/common/keybinding';
import { Disposable } from 'vs/base/common/lifecycle';
import { ContextKeyExpr } from 'vs/platform/contextkey/common/contextkey';
import { CommentContextKeys } from 'vs/workbench/contrib/comments/common/commentContextKeys';


Registry.as<IConfigurationRegistry>(ConfigurationExtensions.Configuration).registerConfiguration({
	id: 'comments',
	order: 20,
	title: nls.localize('commentsConfigurationTitle', "Comments"),
	type: 'object',
	properties: {
		'comments.openPanel': {
			enum: ['neverOpen', 'openOnSessionStart', 'openOnSessionStartWithComments'],
			default: 'openOnSessionStartWithComments',
			description: nls.localize('openComments', "Controls when the comments panel should open."),
			restricted: false,
			markdownDeprecationMessage: nls.localize('comments.openPanel.deprecated', "This setting is deprecated in favor of `comments.openView`.")
		},
		'comments.openView': {
			enum: ['never', 'file', 'firstFile', 'firstFileUnresolved'],
			enumDescriptions: [nls.localize('comments.openView.never', "The comments view will never be opened."), nls.localize('comments.openView.file', "The comments view will open when a file with comments is active."), nls.localize('comments.openView.firstFile', "If the comments view has not been opened yet during this session it will open the first time during a session that a file with comments is active."), nls.localize('comments.openView.firstFileUnresolved', "If the comments view has not been opened yet during this session and the comment is not resolved, it will open the first time during a session that a file with comments is active.")],
			default: 'firstFile',
			description: nls.localize('comments.openView', "Controls when the comments view should open."),
			restricted: false
		},
		'comments.useRelativeTime': {
			type: 'boolean',
			default: true,
			description: nls.localize('useRelativeTime', "Determines if relative time will be used in comment timestamps (ex. '1 day ago').")
		},
		'comments.visible': {
			type: 'boolean',
			default: true,
			description: nls.localize('comments.visible', "Controls the visibility of the comments bar and comment threads in editors that have commenting ranges and comments. Comments are still accessible via the Comments view and will cause commenting to be toggled on in the same way running the command \"Comments: Toggle Editor Commenting\" toggles comments.")
		},
		'comments.maxHeight': {
			type: 'boolean',
			default: true,
			description: nls.localize('comments.maxHeight', "Controls whether the comments widget scrolls or expands.")
		},
		'comments.collapseOnResolve': {
			type: 'boolean',
			default: true,
			description: nls.localize('collapseOnResolve', "Controls whether the comment thread should collapse when the thread is resolved.")
		}
	}
});

registerSingleton(ICommentService, CommentService, InstantiationType.Delayed);


export class CommentsAccessibilityHelpContribution extends Disposable {
	static ID: 'commentsAccessibilityHelpContribution';
	constructor() {
		super();
		this._register(AccessibilityHelpAction.addImplementation(110, 'comments', accessor => {
			const instantiationService = accessor.get(IInstantiationService);
			const accessibleViewService = accessor.get(IAccessibleViewService);
			accessibleViewService.show(instantiationService.createInstance(CommentsAccessibilityHelpProvider));
			return true;
		}, ContextKeyExpr.or(ctxCommentEditorFocused, CommentContextKeys.commentFocused)));
	}
}
export class CommentsAccessibilityHelpProvider implements IAccessibleContentProvider {
	verbositySettingKey: AccessibilityVerbositySettingId = AccessibilityVerbositySettingId.Comments;
	options: IAccessibleViewOptions = { type: AccessibleViewType.Help };
	private _element: HTMLElement | undefined;
	constructor(
		// @IKeybindingService private readonly _keybindingService: IKeybindingService
	) {

	}
	// private _descriptionForCommand(commandId: string, msg: string, noKbMsg: string): string {
	// 	const kb = this._keybindingService.lookupKeybinding(commandId);
	// 	if (kb) {
	// 		return strings.format(msg, kb.getAriaLabel());
	// 	}
	// 	return strings.format(noKbMsg, commandId);
	// }
	provideContent(): string {
		this._element = document.activeElement as HTMLElement;
		return 'Comment help info';
	}
	onClose(): void {
		this._element?.focus();
	}
}
