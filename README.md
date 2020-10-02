# Exception Tree

This library makes it easy to produce error messages that clearly indicate where the problem exists.

This library is different from an Error's stack trace because it does not tell you where in the code the error is. Instead, it produces a message that is easily human readable, can target problems within nested structures, and can join multiple problems into a single error. This library shines when it comes to validating configurations.

## Example

This example shows two errors:

1. One at `one > two > a` as `Error 1`
2. Another at `one > two > b > 0` as `Error 2`

```js
const { Exception } = require('exception-tree')

const exception = new Exception('Header 1')
const subException = exception.at('one').at('two')
subException.at('a').message('Error 1');
subException.at('b').at(0).message('Error 2');

console.log(exception)
// Header 1
//   at: one > two
//     at: a
//       Error 1
//     at: b > 0
//       Error 2
```

# Instance Properties

## count

`Exception.count : number`

The number of *messages* added to an Exception, including those added to any child Exception instances.

**Example**

```js
const { Exception } = require('exception-tree')

const parent = new Exception('Header 1')
parent.message('Parent message')

const child = parent.at('x')
child.message('Child message')

console.log(parent.count) // 2
console.log(child.count)  // 1
```

## hasException

`Exception.hasException : boolean`

Whether an Exception instance has any messages or not.

**Example**

```js
const { Exception } = require('exception-tree')

const exception = new Exception('Header 1')
console.log(exception.hasException) // false

exception.message('Failed to compute')
console.log(exception.hasException) // true
```

# Instance Methods

## at

`Exception.prototype.at ( path: string ) : Exception`

Use this method to create a child exception that indicates a sub path. This differs from the `nest` function in that it creates a shared Exception space where the provided `path` is the key.

**Parameters:**

| Parameter | Description | Type | Default |
| --------- | ----------- | ---- | ------- |
| **path** | The label for the sub path being created. | `string` | |

**Returns:** The child Exception instance

**Example**


```js
const { Exception } = require('exception-tree')
const exception = new Exception('Header 1')

const subPathException = exception.at('some path')
subPathException.message('No soup for you')

console.log(exception)
// Header 1
//   at: some path
//     No soup for you
```

## nest

`Exception.prototype.nest ( header: string ) : Exception`

Use this method to create a child exception. Unlike the `at` function, this will not share messages with other nested exceptions that share the same `header` value.

**Parameters:**

| Parameter | Description | Type | Default |
| --------- | ----------- | ---- | ------- |
| **header** | The label for the sub Exception instance being created. | `string` | |

**Returns:** The child Exception instance

**Example**

```js
const { Exception } = require('exception-tree')
const exception = new Exception('There was an error')

const subException = exception.nest('Could not do action X')
subException.message("I'm a teapot")
subException.message('Too busy to comply')

console.log(exception)
// There was an error
//   Could not do action X
//     I'm a teapot
//     Too busy to comply
```

## message

`Exception.prototype.message ( message: string [, code: string [, reference: string ]] ) : Exception`

Add a message to the Exception instance. Once a message is added then the Exception instance is considered to have an exception.

**Parameters:**

| Parameter | Description | Type | Default |
| --------- | ----------- | ---- | ------- |
| **message** | The message to add. | `string` | |
| code | An optional error code to associate with the message. The codes will only show if `config.showCodes` is set to `true`. This parameter will be required if `config.requireCodes == true`. | `string` | |
| reference | An optional reference string citing where correct operation is defined. This could be a URL. | `string` | |

**Returns:** The Exception instance that the message was added to

**Example**

```js
const { Exception } = require('exception-tree')

const exception = new Exception('Header 1')
exception.message('Message 1')

console.log(exception)
// Header 1
//   Message 1
```

## push

`Exception.prototype.push ( value: Exception ) : Exception`

This method can be used to add an EnforcerInstance object to another EnforcerInstance.

**Parameters:**

| Parameter | Description | Type | Default |
| --------- | ----------- | ---- | ------- |
| **value** | An Exception instance to add as a child to this Exception instance. | `Exception` | |

**Returns:** The Exception instance that was passed in

**Example**

```js
const { Exception } = require('exception-tree')

const child = new Exception('Header 2')
child.message('Message 2')

const parent = new Exception('Header 1')
parent.push(child)

console.log(exception)
// Header 1
//   Header 2
//     Message 2
```

## toString

`Exception.prototype.toString () : string`

Get the error message that represents the Exception instance. If the Exception instance and its children have no messages then this will return an empty string, otherwise it will show the error(s) in an organized hierarchy.

**Parameters:**

None

**Returns:** a `string`

# Global Configuration

The global configuration allows you to affect the behavior of the exception library.

There are two ways to set the global configuration properties, both of which are demonstrated in the following example.

```js
const { Exception, config } = require('exception-tree')

config.displayCodes = false
Exception.config.requireCodes = true
```

| Property | Description | Type | Default |
| -------- | ----------- | ---- | ------- |
| displayCodes | Set to `true` to display message codes along with messages. This is especially useful to allow users to specify `skipCodes`, another global configuration option. | `boolean` | `true` |
| displayReferences | Set to `true` to display references along with messages. | `boolean` | `true` |
| requireCodes | This option is useful for the developer who is producing exception messages. If you'd like to require that calling the [message](#message) method includes the `code` parameter then set this to `true`. | `boolean` | `false` |
| skipCodes | This option is useful for whoever receives the exceptions. Specify any codes that you'd like to not have added to the exception's message list. This is especially useful if you're using this library to produce warning messages. | `string[]` | `[]` |