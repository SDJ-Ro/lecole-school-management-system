# L'ÉCOLE REFACTORING RULES
Refactoring changes internal structure while preserving required external behavior.

Before refactoring:
1. Map the current implementation.
2. Identify dependencies.
3. Identify duplicated responsibilities.
4. Identify genuinely shared functionality.
5. Define the target structure.
6. Refactor one logical feature at a time.

## Duplication
Classify duplication as exact duplication, similar implementation with different behavior, or coincidental similarity. Share exact/common responsibility, not coincidental similarity.

## Safe Extraction
Identify all consumers → create shared implementation → migrate consumers → verify every consumer → remove old duplicate only after verification.

## MVC Migration
Do not blindly move files into MVC folders. Identify responsibilities first, then place/extract them according to those responsibilities.
