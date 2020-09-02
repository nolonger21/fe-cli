typeof window !== 'undefined' &&
  (function(e) {
    'use strict'
    if (e.DOMTokenList) {
      var t = document.createElement('a').classList,
        n = DOMTokenList.prototype,
        i = n.add,
        o = n.remove,
        r = n.toggle
      t.add('c1', 'c2')
      var s = function(e) {
        return function() {
          var t,
            n = arguments
          for (t = 0; t < n.length; t += 1) e.call(this, n[t])
        }
      }
      t.contains('c2') || ((n.add = s(i)), (n.remove = s(o))),
        t.toggle('c1', !0) ||
          (n.toggle = function(e, t) {
            return void 0 === t ? r.call(this, e) : ((t ? i : o).call(this, e), !!t)
          })
    }
  })(window),
  typeof window !== 'undefined' &&
    (function(e) {
      'use strict'
      var t = [],
        n = function(e, n) {
          var i
          if (t.indexOf) return t.indexOf.call(e, n)
          for (i = 0; i < e.length; i++) if (e[i] === n) return i
          return -1
        },
        i = function(e) {
          var t = /[\u0009\u000A\u000C\u000D\u0020]/
          if (e === '' || t.test(e)) throw new Error('Token must not be empty or contain whitespace.')
        },
        o = function(e, t) {
          var n,
            i = this,
            o = []
          if (e && t && ((i.element = e), (i.prop = t), e[t]))
            for (o = e[t].replace(/^\s+|\s+$/g, '').split(/\s+/), n = 0; n < o.length; n++) i[n] = o[n]
          i.length = o.length
        }
      ;(o.prototype = {
        add: function() {
          var e,
            n = this,
            o = arguments
          for (e = 0; e < o.length; e++) i(o[e]), n.contains(o[e]) || t.push.call(n, o[e])
          n.element && (n.element[n.prop] = n)
        },
        contains: function(e) {
          return i(e), n(this, e) !== -1
        },
        item: function(e) {
          return this[e] || null
        },
        remove: function() {
          var e,
            o,
            r = arguments,
            s = this
          for (o = 0; o < r.length; o++) i(r[o]), (e = n(s, r[o])), e !== -1 && t.splice.call(s, e, 1)
          s.element && (s.element[s.prop] = s)
        },
        toggle: function(e, t) {
          var n = this
          return n.contains(e) ? (t ? !0 : (n.remove(e), !1)) : t === !1 ? !1 : (n.add(e), !0)
        },
        toString: function() {
          return t.join.call(this, ' ')
        },
      }),
        (e.DOMTokenList = o)
    })(window),
  typeof window !== 'undefined' &&
    (function() {
      'use strict'
      'classList' in document.createElement('a') ||
        Object.defineProperty(Element.prototype, 'classList', {
          get: function() {
            return new DOMTokenList(this, 'className')
          },
        })
    })(),
  typeof window !== 'undefined' &&
    (function() {
      'use strict'
      if (!('relList' in document.createElement('a'))) {
        var e,
          t = [HTMLAnchorElement, HTMLAreaElement, HTMLLinkElement],
          n = function() {
            return new DOMTokenList(this, 'rel')
          }
        for (e = 0; e < t.length; e++) Object.defineProperty(t[e].prototype, 'relList', { get: n })
      }
    })(),
  typeof window !== 'undefined' &&
    (function() {
      'use strict'
      if (typeof SVGElement !== 'undefined') {
        var e = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
        ;('classList' in e && !window.QUnit) ||
          Object.defineProperty(SVGElement.prototype, 'classList', {
            get: function() {
              return typeof this.className === 'string'
                ? new DOMTokenList(this, 'className')
                : typeof this.className.baseVal === 'string'
                ? new DOMTokenList(this.className, 'baseVal')
                : void 0
            },
          })
      }
    })()
