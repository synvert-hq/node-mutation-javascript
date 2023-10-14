[![npm version](https://badge.fury.io/js/@xinminlabs%2Fnode-mutation.svg)](https://badge.fury.io/js/@xinminlabs%2Fnode-mutation)
[![CI](https://github.com/xinminlabs/node-mutation-javascript/actions/workflows/main.yml/badge.svg)](https://github.com/xinminlabs/node-mutation-javascript/actions/workflows/main.yml)

# NodeMutation

NodeMutation provides a set of APIs to rewrite node source code.

## Table of Contents

- [NodeMutation](#nodemutation)
  - [Table of Contents](#table-of-contents)
  - [Installation](#installation)
  - [Usage](#usage)
  - [Evaluated Value](#evaluated-value)
  - [Configuration](#configuration)
    - [adapter](#adapter)
    - [strategy](#strategy)
    - [tabWidth](#tabwidth)
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
mutation.delete(node: Node, selectors: string | string[], options: DeleteOptions)
// insert code to the ast node.
mutation.insert(node: Node, code: string, options: InsertOptions)
// prepend code to the ast node.
mutation.prepend(node: Node, code: string)
// remove source code of the ast node
mutation.remove(node: Node, options: RemoveOptions)
// replace child node of the ast node with new code
mutation.replace(node: Node, selectors: string | string[], options: ReplaceOptions)
// replace the ast node with new code
mutation.replaceWith(node: Node, code: string)
// no operation
mutation.noop(node: Node)
// group actions
mutation.group(() => {
  mutation.delete(node: Node, selectors: string | string[], options: DeleteOptions)
  mutation.insert(node: Node, code: string, options: InsertOptions)
})
```

3. process actions and write the new source code to file:

```typescript
mutation.process()
```

## Evaluated Value

NodeMutation supports to evaluate the value of the node, and use the evaluated value to rewrite the source code.

```ruby
source = 'class Synvert {}'
node = espree.parse(source)
mutation.replace node, '{{id}}', with: 'Foobar'
source # class Foobar {}
```

See more in [TypescriptAdapter](https://xinminlabs.github.io/node-mutation-javascript/TypescriptAdapter.html), [SyntaxTreeAdapter](https://xinminlabs.github.io/node-mutation-javascript/EspreeAdapter.html), and [GonzalesPeAdapter](https://xinminlabs.github.io/node-mutation-javascript/GonzalesPeAdapter.html)

## Configuration

### adapter

Different parsers, like typescript and espree, will generate different AST nodes, to make NodeMutation work for them all,
we define an [Adapter](https://github.com/xinminlabs/node-mutation-javascript/blob/main/src/adapter.ts) interface,
if you implement the Adapter interface, you can set it as NodeMutation's adapter.

It provides 3 adapters:

1. `TypescriptAdapter`
2. `EspreeAdapter`
3. `GonzalesPeAdapter`

```typescript
NodeMutation.configure({ adapter: new EspreeAdapter() }); // default is TypescriptAdapter
```

### strategy

It provides 2 strategies to handle conflicts when processing actions:

1. `Strategy.KEEP_RUNNING`: keep running and ignore the conflict action.
2. `Strategy.THROW_ERROR`: throw error when conflict action is found.

```typescript
NodeMutation.configure({ strategy: Strategy.KEEP_RUNNING }); // default is Strategy.THROW_ERROR
```

### tabWidth

```typescript
NodeMutation.configure({ tabWidth: 4 }); // default is 2
```

## Contributing Guide

1. Fork and clone the repo.

2. Run `npm install` to install dependencies.

3. Run `npm run test` or `npm run watch:test` to run tests.

4. Make some changes and make tests all passed.

5. Push the changes to the repo.
