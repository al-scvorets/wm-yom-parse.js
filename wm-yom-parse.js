/*!
 * wm-yom-parse.js  v0.2.0
 * Parses YOM source and returns JS object
 *
 * Copyright (c) 2015 http://wamer.net
 * Released under the MIT license
 *
 * Latest Update: 2015-05-24
 */

(function (window, undefined) {
var _version_     = '0.2.0',
    last_error    = null,
    _entry_point_ = function (arg_str) {

    var src_str = arg_str.replace (/(\r\n|\r)/gm, '\n')    // replace CR
                         .replace (/[\\\+\-]\n/gm, ' '),   // do lines continuation

        _ptr = 0, _row = 1, _col = 1;
    
    last_error = null;

    if (!arg_str || typeof arg_str != 'string') return [];

    var sym = {_EOF: -1, _SEP: -2,
               _GROUP_START: -3, _GROUP_END: -4,
               _ATTR_START: -5, _ATTR_END: -6,
               _HASH: -7};

    function chr (lit) {
        var ch = src_str.charAt (_ptr);

        if (!ch) return sym._EOF;

        function _advance (x) {_ptr++; _col++; return x;}

        if (lit) return _advance (ch);  // treat literally

        // tok end
        if ({'\n':1, '\t':1, '\b':1, '\f':1, ',': 1}[ch])
            return _advance (sym._SEP);

        // escape
        if ('/' == ch) {_advance();  return chr (true);}

        // spec syms
        var t = {'[': sym._GROUP_START, ']': sym._GROUP_END,
                 '{': sym._ATTR_START,  '}': sym._ATTR_END,
                 '#': sym._HASH}[ch];

        if (t) return _advance (t);

        // default
        return _advance (ch);
    }

    function set_err (msg) {
        last_error = {msg: msg, row: _row, col: _col - 1};
    }

    function parse_attributes () {
        function parse_token (tok) {
            var t = tok.split(/[:=]/, 2);
            return {
                name: $.trim (t[0]),
                val:  t[1] ? $.trim (tok.substr (t[0].length + 1)) : true
            };
        }

        var _result = {}, _curr_token = '', ch, t;

        do {
            ch = chr();
            switch (ch) {
            case sym._EOF:
                set_err ('Unexpected end of data'); ch = null; _result = null;
                break;

            case sym._SEP:
            case sym._ATTR_END:
                if (_curr_token) {
                    t = parse_token (_curr_token);
                    if (t.name) _result[t.name] = t.val;
                    _curr_token = '';
                }
                
                if (sym._ATTR_END == ch) ch = null;
                break;

            case sym._GROUP_START:
                set_err ('Unexpected \'[\''); ch = null;  _result = null;
                break;

            case sym._GROUP_END:
                set_err ('Unexpected \']\''); ch = null;  _result = null;
                break;

            case sym._ATTR_START:
                set_err ('Unexpected \'{\''); ch = null;  _result = null;
                break;

            default:
                _curr_token += ch;
            }
        } while (ch);

        return _result;
    }

    function parse_hash () {
        var ch = chr();
        if (' ' === ch) return ' ';  // comment start

        if (!ch.match (/[a-zA-Z_$]/)) {
            set_err ('Bad char in hash: ' + ch);
            return undefined;
        }

        var _result = ch;

        do {
            ch = chr (true);
            if (ch.match(/[0-9a-zA-Z_$]/)) _result += ch;
            else                           ch = null;   
        } while (ch);

        var _r = {};  _r[_result] = true; // object... for mustache conv (?)
        return _r;
    }

    function new_node (p) {
        var n = {parent: p, text: '', nodes:[]};
        if (p) p.nodes.push (n);
        return n;
    }

    var _result    = new_node (null),
        _curr_node = new_node (_result),
        ch;

    function flush_node () {
        _curr_node.text = $.trim (_curr_node.text);
        if (!_curr_node.text &&             // no content
            !_curr_node.attr &&
            !_curr_node.nodes.length ||     // or comment
            ' ' === _curr_node.hash) {

            _curr_node.parent.nodes.pop();
        }
    }

    do {
        ch = chr();
        switch (ch) {
        case sym._EOF:   
            ch = 0;
            break;

        case sym._SEP:
        case sym._HASH:
            flush_node();
            _curr_node = new_node (_curr_node.parent);

            if (sym._HASH == ch) 
                _curr_node.hash = parse_hash ();
            break;

        case sym._GROUP_START:
            _curr_node = new_node (_curr_node);
            break;

        case sym._GROUP_END:
            flush_node();
            _curr_node = _curr_node.parent;
            if (!_curr_node) {
                set_err ('Unexpected \']\''); ch = null;
            }
            break;
                      
        case sym._ATTR_START:
            _curr_node.attr = parse_attributes ();
            if (!_curr_node.attr) ch = null;  // some errors
            break;

        case sym._ATTR_END:
            set_err ('Unexpected \'}\''); ch = null;
            break;

        default:
            _curr_node.text += ch;
        }
    } while (ch);

    return _result;
};


_entry_point_.last_error = function () {return last_error;};
_entry_point_.version    = _version_;

// Be modular
/* global module, define */
if (typeof module === 'object' && module && 
    typeof module.exports === 'object') {

    module.exports = _entry_point_;

} else {
    window.wmYomParse = _entry_point_;

    if (typeof define === 'function' && define.amd) {
        define ("wm-yom-parse", [], function () {return _entry_point_;});
    }
} 

})(window);
