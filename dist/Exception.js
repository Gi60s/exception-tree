var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "util"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Exception = exports.config = void 0;
    const util = __importStar(require("util"));
    const inspect = util.inspect.custom || 'inspect';
    exports.config = {
        displayCodes: true,
        displayReferences: true
    };
    class Exception {
        constructor(header) {
            this.__data = { at: {}, nest: [], message: [] };
            this.header = header;
        }
        at(key) {
            const at = this.__data.at;
            if (!at[key])
                at[key] = new Exception('');
            return at[key];
        }
        get count() {
            const children = this.__data;
            return children.message.length +
                children.nest.reduce((count, exception) => count + exception.count, 0) +
                Object.keys(children.at).reduce((count, key) => count + children.at[key].count, 0);
        }
        get hasException() {
            const children = this.__data;
            if (children.message.length)
                return true;
            const nest = children.nest;
            const length = nest.length;
            for (let i = 0; i < length; i++) {
                if (nest[i].hasException)
                    return true;
            }
            const keys = Object.keys(children.at);
            const length2 = keys.length;
            for (let i = 0; i < length2; i++) {
                if (children.at[keys[i]].hasException)
                    return true;
            }
            return false;
        }
        message(message, code, reference) {
            const result = (exports.config.displayCodes && code ? '[' + code + '] ' : '') +
                (exports.config.displayReferences && reference ? '(' + reference + ') ' : '') +
                message;
            this.__data.message.push(result);
            return this;
        }
        nest(header) {
            const exception = new Exception(header);
            this.push(exception);
            return exception;
        }
        push(exception) {
            this.__data.nest.push(exception);
            return exception;
        }
        toString() {
            return toString(this, null, '');
        }
        [inspect]() {
            if (this.hasException) {
                return '[ EnforcerException: ' + toString(this, null, '  ') + ' ]';
            }
            else {
                return '[ EnforcerException ]';
            }
        }
    }
    exports.Exception = Exception;
    function toString(context, parent, prefix) {
        if (!context.hasException)
            return '';
        const prefixPlus = prefix + '  ';
        const children = context.__data;
        let result = '';
        if (context.header)
            result += (parent ? prefix : '') + context.header;
        const at = children.at;
        const atKeys = Object.keys(at).filter(key => at[key].hasException);
        const singleAtKey = atKeys.length === 1;
        atKeys.forEach(key => {
            const exception = children.at[key];
            if (context.header || !singleAtKey || children.nest.length > 0 || children.message.length > 0) {
                result += '\n' + prefixPlus + 'at: ' + key + toString(exception, context, prefixPlus);
            }
            else {
                result += ' > ' + key + toString(exception, context, prefix);
            }
        });
        children.nest.forEach(exception => {
            if (exception.hasException)
                result += '\n' + toString(exception, context, prefixPlus);
        });
        children.message.forEach(message => {
            result += '\n' + prefixPlus + message;
        });
        return result;
    }
});
//# sourceMappingURL=Exception.js.map