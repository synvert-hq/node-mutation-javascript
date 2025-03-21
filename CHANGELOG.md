# NodeMutation

## 1.18.2 (2025-03-10)

* Get `childNodeRange` of empty parameters

## 1.18.1 (2025-03-10)

* Fix empty lines to insert'

## 1.18.0 (2025-02-12)

* Add `indent` api
* Add `wrap` api

## 1.17.3 (2024-10-19)

* Support node v22 on github actions

## 1.17.2 (2024-04-08)

* Moving from `@xinminlabs` to `@synvert-hq`

## 1.17.1 (2023-12-20)

* Check if function result is Promise

## 1.17.0 (2023-12-18)

* Make `group` work both sync and async

## 1.16.1 (2023-12-01)

* Expose `TypescriptAdapter`, `EspreeAdapter` and `GonzalesAdapter`

## 1.16.0 (2023-12-01)

* Add `adapter` parameter to `Action`
* Add `adapter` parameter to `NodeMutation`
* Do not allow configure an `adapter` globally
* Do no expose `TypescriptAdapter`, `EspreeAdapter` and `GonzalesAdapter`

## 1.15.11 (2023-11-20)

* Flat and sort actions after filtering actions when processing
* Fix typos

## 1.15.10 (2023-11-20)

* Optimize group actions
* Filter actions base on this.actions and then sort
* Filter group action if none of child action is conflicted

## 1.15.9 (2023-11-18)

* Sort actions before filtering them when testing
* Flat and sort actions before filtering them when processing

## 1.15.8 (2023-11-18)

* Check conflict in flatten actions

## 1.15.7 (2023-10-22)

* Support `xxxAttribute` in `childNodeRange` and `childNodeValue`

## 1.15.6 (2023-10-21)

* Support `xxxProperty` and `xxxValue` in `childNodeRange`

## 1.15.5 (2023-10-21)

* Follow camelCase convention for `xxxProperty` and `xxxValue`

## 1.15.4 (2023-10-20)

* Get child node by negative index

## 1.15.3 (2023-10-19)

* Remove `console.log` code

## 1.15.2 (2023-10-19)

* Add `childName` option to `getStart`, `getEnd`, `getStartLoc`, and `getEndLoc`

## 1.15.1 (2023-10-18)

* Insert with `this.rewrittenSource`
* Squeeze spaces after removing comma
* Remove `removeBraces`

## 1.15.0 (2023-10-16)

* Add `childNodeValue` to `Adapter`
* Move `rewrittenSource` to base action

## 1.14.1 (2023-10-15)

* Export `RemoveOptions`

## 1.14.0 (2023-10-15)

* Add `andComma` to `delete`, `insert`, and `remove` options
* Add `andSpace` to `insert` option
* Add `xxx_property` and `xxx_initializer` to typescript adapter
* Add `xxx_property` and `xxx_value` to espree adapter

## 1.13.0 (2023-09-29)

* Add `actions` attributes to `Action`
* Do not expose `NodeMutation#actions`
* Add `GroupAction`
* Add `group` api

## 1.12.0 (2023-07-09)

* Update `@xinminlabs/gonzales-pe` to 1.1.0
* Remove `getChildNode` function from `GonzalesPeAdapter`

## 1.11.0 (2023-06-05)

* Remove `ALLOW_INSERT_AT_SAME_POSITION` strategy
* Add `conflictPosition` when insert at the same position

## 1.10.2 (2023-06-05)

* Shortcut to find gonzales child node

## 1.10.1 (2023-06-05)

* Fix gonzales-pe `end` position

## 1.10.0 (2023-06-04)

* Export `GonzalesPeAdapter`
* Fix `start` / `end` locations in `GonzalesPeAdapter`
* Add `wholeLine` options in `delete` option
* Support `leftCurlyBracket` and `rightCurlyBracket` for `block` node in `childNodeRange`

## 1.9.0 (2023-05-28)

* Add `GonzalesPeAdapter`

## 1.8.0 (2023-04-19)

* Add `type` to `Action`
* Abstract to `types` folder
* Abstract to `adapter` folder

## 1.7.0 (2023-03-17)

* Add `espree` adapter

## 1.6.3 (2023-03-15)

* Add default option to `insert` api

## 1.6.2 (2023-03-09)

* Remove `replaceWith` `autoIndent` option

## 1.6.1 (2023-02-08)

* Fix configure `tabWidth`

## 1.6.0 (2023-02-08)

* Configure `tabWidth`
* Make use of `NodeMutation.tabWidth`

## 1.5.2 (2022-10-28)

* Revert "use getStartLoc().column instead of getIndent()"
* Use `Adapter#getIndent` for `getSource#indent`

## 1.5.1 (2022-10-28)

* Fix `getSource` indent

## 1.5.0 (2022-10-28)

* Adapter `getSource` accepts a `fixIndent` option
* Use `getStartLoc().column` instead of `getIndent()`

## 1.4.1 (2022-10-25)

* Rename `STRATEGY` to `Strategy`
* Abstract `Strategy` to `src/strategy.ts`

## 1.4.0 (2022-10-25)

* Add a new strategy ALLOW_INSERT_AT_SAME_POSITION

## 1.3.8 (2022-10-25)

* Mark same position as conflict action

## 1.3.7 (2022-10-24)

* Better error message when node does not respond to a key

## 1.3.6 (2022-10-19)

* Better error message

## 1.3.5 (2022-10-18)

* Support PropertyAssignment semicolon in TypescriptAdapter

## 1.3.4 (2022-10-17)

* Location column starts with 0

## 1.3.3 (2022-09-27)

* Fix regexp to match evaluated value
* Process if `newCode` is empty string

## 1.3.2 (2022-09-26)

* Typescript adapter `actualValue` support function call

## 1.3.1 (2022-09-24)

* Update source only if `newCode` is not `undefined`

## 1.3.0 (2022-09-20)

* Add `NoopAction`

## 1.2.1 (2022-08-29)

* Export `TestResult`

## 1.2.0 (2022-08-28)

* Add `NodeMutation#test` method

## 1.1.5 (2022-08-23)

* Fix "typescript getText() may contain trailing whitespace and newlines"

## 1.1.4 (2022-08-18)

* Add `actions` in `ProcessResult`

## 1.1.3 (2022-08-10)

* Export `TypescriptAdapter`

## 1.1.2 (2022-08-09)

* Fix `TypescriptAdapter#rewrittenSource` if regex does not match

## 1.1.1 (2022-07-07)

* Export `ProcessResult`

## 1.1.0 (2022-07-02)

* Return `newSource` instead of writing file

## 1.0.4 (2022-06-23)

* Fix node array `getSource` result

## 1.0.3 (2022-06-22)

* Import `TypescriptAdapter`

## 1.0.2 (2022-06-21)

* Fix PrependAction start

## 1.0.1 (2022-06-21)

* Add debug

## 1.0.0 (2022-06-19)

* Initial release
