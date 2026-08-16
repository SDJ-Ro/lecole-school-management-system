# L'ÉCOLE VERIFICATION RULES
Every meaningful refactor requires verification.

## Before
Understand current page behavior, navigation, visible UI, assets/icons, important interactions, console errors and relevant API/PHP behavior.

## After
Check the same behavior again. Verify links/routes, icons/assets, layout, responsive behavior, forms, buttons, modals, tabs, filters, dynamic rendering, console errors, API interactions and role-specific permissions.

## Regression Rule
If unrelated behavior changes, treat it as a regression and investigate before continuing.

## Scope
Verify the changed feature first, then affected shared consumers.
