# BaudBound contracts

This repository contains the public compatibility contracts shared by the [BaudBound Editor](https://github.com/BaudBound/editor) and [BaudBound runner](https://github.com/BaudBound/baudbound).

The root JSON Schemas define `.bbs` package files and node configuration. Files under `runner/` define generated node capabilities, permissions, ports, numeric limits, keyboard names, and cross-implementation behavior cases.

Consumers use this repository as a Git submodule pinned to a reviewed commit. Runtime builds use that local checkout and never download mutable contract files from the network.

The public schemas are served at [schemas.baudbound.app](https://schemas.baudbound.app).

## Validate

    node scripts/validate.mjs

## Contract changes

1. Generate the proposed files from the matching editor branch.
2. Review compatibility and security impact in this repository.
3. Update the contracts submodule reference in the editor and runner repositories.
4. Merge consumer updates only after their contract tests pass.
