import * as util from 'util'

const inspect = util.inspect.custom || 'inspect'

interface ConfigOptions {
	displayCodes: boolean
	displayReferences: boolean
	requireCodes: boolean
	skipCodes: string[]
}

export const config: ConfigOptions = {
	displayCodes: true,
	displayReferences: true,
	requireCodes: false,
	skipCodes: []
}

export class Exception {
	public header: string
	public __data: {
		at: {
			[key: string]: Exception
		}
		nest: Exception[]
		message: Array<string>
	} = { at: {}, nest: [], message: [] }

	constructor (header: string) {
		this.header = header
	}

	public at (key: string | number): Exception {
		const at = this.__data.at
		if (!at[key]) at[key] = new Exception('')
		return at[key]
	}

	public get count (): number {
		const children = this.__data
		return children.message.length +
			children.nest.reduce((count, exception) => count + exception.count, 0) +
			Object.keys(children.at).reduce((count, key) => count + children.at[key].count, 0)
	}

	public get hasException () : boolean {
		const children = this.__data
		if (children.message.length) return true

		const nest = children.nest
		const length = nest.length
		for (let i = 0; i < length; i++) {
			if (nest[i].hasException) return true
		}

		const keys = Object.keys(children.at)
		const length2 = keys.length
		for (let i = 0; i < length2; i++) {
			if (children.at[keys[i]].hasException) return true
		}

		return false
	}

	public message (message: string, code?: string, reference?: string): Exception {
		if (config.requireCodes && arguments.length < 2) throw Error('Missing required code with message: ' + message)
		if (!code || !config.skipCodes.includes(code)) {
			const result = (config.displayCodes && code ? '[' + code + '] ' : '') +
				(config.displayReferences && reference ? '(' + reference + ') ' : '') +
				message
			this.__data.message.push(result)
		}
		return this
	}

	public nest (header: string): Exception {
		const exception = new Exception(header)
		this.push(exception)
		return exception
	}

	public push (exception: Exception): Exception {
		this.__data.nest.push(exception)
		return exception
	}

	public toString (): string {
		return toString(this, null, '')
	}

	get config () {
		return config
	}

	[inspect] () {
		if (this.hasException) {
			return '[ EnforcerException: ' + toString(this, null, '  ') + ' ]';
		} else {
			return '[ EnforcerException ]';
		}
	}
}

function toString (context: Exception, parent: Exception | null, prefix: string) : string {
	if (!context.hasException) return ''

	const prefixPlus = prefix + '  '
	const children = context.__data
	let result = ''

	if (context.header) result += (parent ? prefix : '') + context.header

	const at = children.at
	const atKeys = Object.keys(at).filter(key => at[key].hasException)
	const singleAtKey = atKeys.length === 1
	atKeys.forEach(key => {
		const exception = children.at[key]
		if (context.header || !singleAtKey || children.nest.length > 0 || children.message.length > 0) {
			result += '\n' + prefixPlus + 'at: ' + key + toString(exception, context, prefixPlus)
		} else {
			result += ' > ' + key + toString(exception, context, prefix)
		}
	})

	children.nest.forEach(exception => {
		if (exception.hasException) result += '\n' + toString(exception, context, prefixPlus);
	})

	children.message.forEach(message => {
		result += '\n' + prefixPlus + message
	})

	return result
}

// function toStringLeaders (context: EnforcerException, parent: EnforcerException | null, prefix: string) : string {
//     if (!context.hasException) return ''
//
//     const prefixPlus = prefix + '  '
//     const children = context.__data
//     let result = ''
//
//     if (context.header) result += (parent ? prefix : '') + context.header
//
//     const at = children.at
//     const atKeys = Object.keys(at).filter(key => at[key].hasException)
//     const atKeysLength = atKeys.length
//     const singleAtKey = atKeysLength === 1
//     const nestFiltered = children.nest.filter(exception => exception.hasException)
//     const nestLength = nestFiltered.length
//     const messageLength = children.message.length
//     const totalLength = atKeysLength + nestLength + messageLength
//     let i = 0
//
//     atKeys.forEach(key => {
//         i++
//         const prefix2 = i < totalLength ? '│' : ''
//         const exception = children.at[key]
//         if (context.header || !singleAtKey || children.nest.length > 0 || children.message.length > 0) {
//             result += '\n' + prefixPlus +
//                 (i < totalLength ? '├ ' : '└ ') +
//                 'at: ' + key + toStringLeaders(exception, context, prefixPlus + prefix2)
//         } else {
//             result += ' > ' +
//                 (i < totalLength ? '├ ' : '└ ') +
//                 key + toStringLeaders(exception, context, prefix + prefix2)
//         }
//     })
//
//
//     nestFiltered.forEach((exception, i) => {
//         i++
//         const prefix2 = i < totalLength ? '│  ' : '└  '
//         result += '\n' +
//             (i < totalLength ? '├ ' : '└ ') +
//             toStringLeaders(exception, context, prefix2);
//     })
//
//     children.message.forEach(message => {
//         i++
//         result += '\n' + prefixPlus +
//             (i < totalLength ? '├ ' : '└ ') +
//             (EnforcerException.displayCodes ? '[' + message.code + '] ' : '') +
//             message.message
//     })
//
//     return result
// }
