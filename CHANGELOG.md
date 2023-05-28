# NodeMutation

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

* Fix "typescript getText() may contain trailing whitespaces and newlines"

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
