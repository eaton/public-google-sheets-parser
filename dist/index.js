function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
const isBrowser = typeof window !== 'undefined' && typeof window.document !== 'undefined';
const fetch = isBrowser ? /* istanbul ignore next */window.fetch : require('../src/fetch');
let PublicGoogleSheetsParser = /*#__PURE__*/function () {
  function PublicGoogleSheetsParser(spreadsheetId, option) {
    _classCallCheck(this, PublicGoogleSheetsParser);
    this.id = spreadsheetId;
    this.setOption(option);
  }
  return _createClass(PublicGoogleSheetsParser, [{
    key: "setOption",
    value: function setOption(option) {
      if (!option) {
        this.sheetName = this.sheetName || null;
        this.sheetId = this.sheetId || null;
        this.useFormattedDate = this.useFormattedDate || false;
        this.useFormat = this.useFormat || false;
      } else if (typeof option === 'string') {
        this.sheetName = option;
        this.sheetId = this.sheetId || null;
      } else if (typeof option === 'object') {
        this.sheetName = option.sheetName || this.sheetName;
        this.sheetId = option.sheetId || this.sheetId;
        this.useFormattedDate = option.hasOwnProperty('useFormattedDate') ? option.useFormattedDate : this.useFormattedDate;
        this.useFormat = option.hasOwnProperty('useFormat') ? option.useFormat : this.useFormat;
      }
    }
  }, {
    key: "isDate",
    value: function isDate(date) {
      return date && typeof date === 'string' && /Date\((\d+),(\d+),(\d+)\)/.test(date);
    }
  }, {
    key: "getSpreadsheetDataUsingFetch",
    value: function () {
      var _getSpreadsheetDataUsingFetch = _asyncToGenerator(function* () {
        if (!this.id) return null;
        let url = `https://docs.google.com/spreadsheets/d/${this.id}/gviz/tq?`;
        url += this.sheetId ? `gid=${this.sheetId}` : `sheet=${this.sheetName}`;
        try {
          const response = yield fetch(url);
          return response && response.ok ? response.text() : null;
        } catch (e) {
          /* istanbul ignore next */
          console.error('Error fetching spreadsheet data:', e);
          /* istanbul ignore next */
          return null;
        }
      });
      function getSpreadsheetDataUsingFetch() {
        return _getSpreadsheetDataUsingFetch.apply(this, arguments);
      }
      return getSpreadsheetDataUsingFetch;
    }()
  }, {
    key: "normalizeRow",
    value: function normalizeRow(rows) {
      return rows.map(row => row && row.v !== null && row.v !== undefined ? row : {});
    }
  }, {
    key: "applyHeaderIntoRows",
    value: function applyHeaderIntoRows(header, rows) {
      return rows.map(({
        c: row
      }) => this.normalizeRow(row)).map(row => row.reduce((p, c, i) => c.v !== null && c.v !== undefined ? Object.assign(p, {
        [header[i]]: this.useFormat ? c.f || c.v : this.useFormattedDate && this.isDate(c.v) ? c.f || c.v : c.v
      }) : p, {}));
    }
  }, {
    key: "getItems",
    value: function getItems(spreadsheetResponse) {
      let rows = [];
      try {
        const payloadExtractRegex = /google\.visualization\.Query\.setResponse\(({.*})\);/;
        const [_, payload] = spreadsheetResponse.match(payloadExtractRegex);
        const parsedJSON = JSON.parse(payload);
        const hasSomeLabelPropertyInCols = parsedJSON.table.cols.some(({
          label
        }) => !!label);
        if (hasSomeLabelPropertyInCols) {
          const header = parsedJSON.table.cols.map(({
            label
          }) => label);
          rows = this.applyHeaderIntoRows(header, parsedJSON.table.rows);
        } else {
          const [headerRow, ...originalRows] = parsedJSON.table.rows;
          const header = this.normalizeRow(headerRow.c).map(row => row.v);
          rows = this.applyHeaderIntoRows(header, originalRows);
        }
      } catch (e) {
        /* istanbul ignore next */
        console.error('Error parsing spreadsheet data:', e);
      }
      return rows;
    }
  }, {
    key: "parse",
    value: function () {
      var _parse = _asyncToGenerator(function* (spreadsheetId, option) {
        if (spreadsheetId) this.id = spreadsheetId;
        if (option) this.setOption(option);
        if (!this.id) throw new Error('SpreadsheetId is required.');
        const spreadsheetResponse = yield this.getSpreadsheetDataUsingFetch();
        if (spreadsheetResponse === null) return [];
        return this.getItems(spreadsheetResponse);
      });
      function parse(_x, _x2) {
        return _parse.apply(this, arguments);
      }
      return parse;
    }()
  }]);
}();
/* istanbul ignore next */
if (isBrowser && typeof module === 'undefined') {
  window.PublicGoogleSheetsParser = PublicGoogleSheetsParser;
} else {
  module.exports = PublicGoogleSheetsParser;
  module.exports.default = PublicGoogleSheetsParser;
}
