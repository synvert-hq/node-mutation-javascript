[![npm version](https://badge.fury.io/js/@xinminlabs%2Fnode-mutation.svg)](https://badge.fury.io/js/@xinminlabs%2Fnode-mutation)
[![CI](https://github.com/xinminlabs/node-mutation-javascript/actions/workflows/main.yml/badge.svg)](https://github.com/xinminlabs/node-mutation-javascript/actions/workflows/main.yml)

# NodeMutation

NodeMutation provides a set of APIs to rewrite node source code.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [Write Adapter](#write-adapter)
- [Contributing Guide](#contributing-guide)

## Installation

Install NodeMutation using npm:

```
npm install --save @xinminlabs/node-mutation
```

Or yarn;

```
yarn add @xinminlabs/node-mutation
```

## Usage

1. initialize the NodeMutation instance:

```typescript
import { Node } from "typescript"

mutation = new NodeMutation<Node>(filePath: string, source: string)
```

2. call the rewrite apis:

```typescript
// append the code to the current node.
mutation.append(node: Node, code: string)
// delete source code of the child ast node
mutation.delete(node: Node, selectors: string | string[])
// insert code to the ast node.
mutation.insert(node: Node, code: string, options: InsertOptions)
// prepend code to the ast node.
mutation.prepend(node: Node, code: string)
// remove source code of the ast node
mutation.remove(node: Node)
// replace child node of the ast node with new code
mutation.replace(node: Node, selectors: string | string[], options: ReplaceOptions)
// replace the ast node with new code
mutation.replaceWith(node: Node, code: string, options: ReplaceWithOptions = { autoIndent: true })
```

3. process actions and write the new source code to file:

```typescript
mutation.process()
```

## Write Adapter

Different parsers, like typescript and espree, will generate different AST nodes, to make NodeMutation work for them all,
we define an [Adapter](https://github.com/xinminlabs/node-mutation-javascript/blob/main/src/adapter.ts) interface,
if you implement the Adapter interface, you can set it as NodeMutation's adapter.

```typescript
NodeMutation.configure({ adapter: new EspreeAdapter() })
```

## Contributing Guide

1. Fork and clone the repo.

2. Run `npm install` to install dependencies.

3. Run `npm run test` or `npm run watch:test` to run tests.

4. Make some changes and make tests all passed.

5. Push the changes to the repo.