'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _isFunction2 = require('lodash/isFunction');

var _isFunction3 = _interopRequireDefault(_isFunction2);

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _class, _class2, _temp2;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; /**
                                                                                                                                                                                                                                                                   * @fileOverview TreemapChart
                                                                                                                                                                                                                                                                   */


var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _reactSmooth = require('react-smooth');

var _reactSmooth2 = _interopRequireDefault(_reactSmooth);

var _classnames = require('classnames');

var _classnames2 = _interopRequireDefault(_classnames);

var _Surface = require('../container/Surface');

var _Surface2 = _interopRequireDefault(_Surface);

var _Layer = require('../container/Layer');

var _Layer2 = _interopRequireDefault(_Layer);

var _Rectangle = require('../shape/Rectangle');

var _Rectangle2 = _interopRequireDefault(_Rectangle);

var _ReactUtils = require('../util/ReactUtils');

var _Tooltip = require('../component/Tooltip');

var _Tooltip2 = _interopRequireDefault(_Tooltip);

var _PureRender = require('../util/PureRender');

var _PureRender2 = _interopRequireDefault(_PureRender);

var _DataUtils = require('../util/DataUtils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var computeNode = function computeNode(_ref) {
  var depth = _ref.depth,
      node = _ref.node,
      index = _ref.index,
      valueKey = _ref.valueKey;
  var children = node.children;

  var childDepth = depth + 1;
  var computedChildren = children && children.length ? children.map(function (child, i) {
    return computeNode({ depth: childDepth, node: child, index: i, valueKey: valueKey });
  }) : null;
  var value = void 0;

  if (children && children.length) {
    value = computedChildren.reduce(function (result, child) {
      return result + child.value;
    }, 0);
  } else {
    value = isNaN(node[valueKey]) || node[valueKey] <= 0 ? 0 : node[valueKey];
  }

  return _extends({}, node, {
    children: computedChildren,
    value: value, depth: depth, index: index
  });
};

var filterRect = function filterRect(node) {
  return { x: node.x, y: node.y, width: node.width, height: node.height };
};

// Compute the area for each child based on value & scale.
var getAreaOfChildren = function getAreaOfChildren(children, areaValueRatio) {
  var ratio = areaValueRatio < 0 ? 0 : areaValueRatio;

  return children.map(function (child) {
    var area = child.value * ratio;

    return _extends({}, child, {
      area: isNaN(area) || area <= 0 ? 0 : area
    });
  });
};

// Computes the score for the specified row, as the worst aspect ratio.
var getWorstScore = function getWorstScore(row, parentSize, aspectRatio) {
  var parentArea = parentSize * parentSize;
  var rowArea = row.area * row.area;

  var _row$reduce = row.reduce(function (result, child) {
    return {
      min: Math.min(result.min, child.area),
      max: Math.max(result.max, child.area)
    };
  }, { min: Infinity, max: 0 }),
      min = _row$reduce.min,
      max = _row$reduce.max;

  return rowArea ? Math.max(parentArea * max * aspectRatio / rowArea, rowArea / (parentArea * min * aspectRatio)) : Infinity;
};

var horizontalPosition = function horizontalPosition(row, parentSize, parentRect, isFlush) {
  var rowHeight = parentSize ? Math.round(row.area / parentSize) : 0;

  if (isFlush || rowHeight > parentRect.height) {
    rowHeight = parentRect.height;
  }

  var curX = parentRect.x;
  var child = void 0;
  for (var i = 0, len = row.length; i < len; i++) {
    child = row[i];
    child.x = curX;
    child.y = parentRect.y;
    child.height = rowHeight;
    child.width = Math.min(rowHeight ? Math.round(child.area / rowHeight) : 0, parentRect.x + parentRect.width - curX);
    curX += child.width;
  }
  // what's z
  child.z = true;
  // add the remain x to the last one of row
  child.width += parentRect.x + parentRect.width - curX;

  return _extends({}, parentRect, {
    y: parentRect.y + rowHeight,
    height: parentRect.height - rowHeight
  });
};

var verticalPosition = function verticalPosition(row, parentSize, parentRect, isFlush) {
  var rowWidth = parentSize ? Math.round(row.area / parentSize) : 0;

  if (isFlush || rowWidth > parentRect.width) {
    rowWidth = parentRect.width;
  }

  var curY = parentRect.y;
  var child = void 0;
  for (var i = 0, len = row.length; i < len; i++) {
    child = row[i];
    child.x = parentRect.x;
    child.y = curY;
    child.width = rowWidth;
    child.height = Math.min(rowWidth ? Math.round(child.area / rowWidth) : 0, parentRect.y + parentRect.height - curY);
    curY += child.height;
  }
  child.z = false;
  child.height += parentRect.y + parentRect.height - curY;

  return _extends({}, parentRect, {
    x: parentRect.x + rowWidth,
    width: parentRect.width - rowWidth
  });
};

var position = function position(row, parentSize, parentRect, isFlush) {
  if (parentSize === parentRect.width) {
    return horizontalPosition(row, parentSize, parentRect, isFlush);
  }

  return verticalPosition(row, parentSize, parentRect, isFlush);
};

// Recursively arranges the specified node's children into squarified rows.
var squarify = function squarify(node, aspectRatio) {
  var children = node.children;

  if (children && children.length) {
    var rect = filterRect(node);
    var row = [];
    var best = Infinity; // the best row score so far
    var child = void 0,
        score = void 0; // the current row score
    var size = Math.min(rect.width, rect.height); // initial orientation
    var scaleChildren = getAreaOfChildren(children, rect.width * rect.height / node.value);
    var tempChildren = scaleChildren.slice();

    row.area = 0;

    while (tempChildren.length > 0) {
      // row first
      row.push(child = tempChildren[0]);
      row.area += child.area;

      score = getWorstScore(row, size, aspectRatio);
      if (score <= best) {
        // continue with this orientation
        tempChildren.shift();
        best = score;
      } else {
        // abort, and try a different orientation
        row.area -= row.pop().area;
        rect = position(row, size, rect, false);
        size = Math.min(rect.width, rect.height);
        row.length = row.area = 0;
        best = Infinity;
      }
    }

    if (row.length) {
      rect = position(row, size, rect, true);
      row.length = row.area = 0;
    }

    return _extends({}, node, { children: scaleChildren.map(function (c) {
        return squarify(c, aspectRatio);
      }) });
  }

  return node;
};

var Treemap = (0, _PureRender2.default)(_class = (_temp2 = _class2 = function (_Component) {
  _inherits(Treemap, _Component);

  function Treemap() {
    var _ref2;

    var _temp, _this, _ret;

    _classCallCheck(this, Treemap);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref2 = Treemap.__proto__ || Object.getPrototypeOf(Treemap)).call.apply(_ref2, [this].concat(args))), _this), _this.state = _this.createDefaultState(), _temp), _possibleConstructorReturn(_this, _ret);
  }

  _createClass(Treemap, [{
    key: 'componentWillReceiveProps',
    value: function componentWillReceiveProps(nextProps) {
      if (nextProps.data !== this.props.data) {
        this.setState(this.createDefaultState());
      }
    }
    /**
     * Returns default, reset state for the treemap chart.
     * @return {Object} Whole new state
     */

  }, {
    key: 'createDefaultState',
    value: function createDefaultState() {
      return {
        isTooltipActive: false,
        activeNode: null
      };
    }
  }, {
    key: 'handleMouseEnter',
    value: function handleMouseEnter(node, e) {
      var _props = this.props,
          onMouseEnter = _props.onMouseEnter,
          children = _props.children;

      var tooltipItem = (0, _ReactUtils.findChildByType)(children, _Tooltip2.default);

      if (tooltipItem) {
        this.setState({
          isTooltipActive: true,
          activeNode: node
        }, function () {
          if (onMouseEnter) {
            onMouseEnter(node, e);
          }
        });
      } else if (onMouseEnter) {
        onMouseEnter(node, e);
      }
    }
  }, {
    key: 'handleMouseLeave',
    value: function handleMouseLeave(node, e) {
      var _props2 = this.props,
          onMouseLeave = _props2.onMouseLeave,
          children = _props2.children;

      var tooltipItem = (0, _ReactUtils.findChildByType)(children, _Tooltip2.default);

      if (tooltipItem) {
        this.setState({
          isTooltipActive: false,
          activeNode: null
        }, function () {
          if (onMouseLeave) {
            onMouseLeave(node, e);
          }
        });
      } else if (onMouseLeave) {
        onMouseLeave(node, e);
      }
    }
  }, {
    key: 'handleClick',
    value: function handleClick(node) {
      var onClick = this.props.onClick;


      if (onClick) {
        onClick(node);
      }
    }
  }, {
    key: 'renderAnimatedItem',
    value: function renderAnimatedItem(content, nodeProps, isLeaf) {
      var _this2 = this;

      var _props3 = this.props,
          isAnimationActive = _props3.isAnimationActive,
          animationBegin = _props3.animationBegin,
          animationDuration = _props3.animationDuration,
          animationEasing = _props3.animationEasing,
          isUpdateAnimationActive = _props3.isUpdateAnimationActive;
      var width = nodeProps.width,
          height = nodeProps.height,
          x = nodeProps.x,
          y = nodeProps.y;

      var translateX = parseInt((Math.random() * 2 - 1) * width, 10);
      var event = {};

      if (isLeaf) {
        event = {
          onMouseEnter: this.handleMouseEnter.bind(this, nodeProps),
          onMouseLeave: this.handleMouseLeave.bind(this, nodeProps),
          onClick: this.handleClick.bind(this, nodeProps)
        };
      }

      return _react2.default.createElement(
        _reactSmooth2.default,
        {
          from: { x: x, y: y, width: width, height: height },
          to: { x: x, y: y, width: width, height: height },
          duration: animationDuration,
          easing: animationEasing,
          isActive: isUpdateAnimationActive
        },
        function (_ref3) {
          var currX = _ref3.x,
              currY = _ref3.y,
              currWidth = _ref3.width,
              currHeight = _ref3.height;
          return _react2.default.createElement(
            _reactSmooth2.default,
            {
              from: 'translate(' + translateX + 'px, ' + translateX + 'px)',
              to: 'translate(0, 0)',
              attributeName: 'transform',
              begin: animationBegin,
              easing: animationEasing,
              isActive: isAnimationActive,
              duration: animationDuration
            },
            _react2.default.createElement(
              _Layer2.default,
              event,
              _this2.renderContentItem(content, _extends({}, nodeProps, {
                isAnimationActive: isAnimationActive,
                isUpdateAnimationActive: !isUpdateAnimationActive,
                width: currWidth,
                height: currHeight,
                x: currX,
                y: currY
              }))
            )
          );
        }
      );
    }
  }, {
    key: 'renderContentItem',
    value: function renderContentItem(content, nodeProps) {
      if (_react2.default.isValidElement(content)) {
        return _react2.default.cloneElement(content, nodeProps);
      } else if ((0, _isFunction3.default)(content)) {
        return content(nodeProps);
      }

      return _react2.default.createElement(_Rectangle2.default, _extends({
        fill: '#fff',
        stroke: '#000'
      }, nodeProps));
    }
  }, {
    key: 'renderNode',
    value: function renderNode(root, node, i) {
      var _this3 = this;

      var content = this.props.content;

      var nodeProps = _extends({}, (0, _ReactUtils.getPresentationAttributes)(this.props), node, { root: root });
      var isLeaf = !node.children || !node.children.length;

      return _react2.default.createElement(
        _Layer2.default,
        { key: 'recharts-treemap-node-' + i, className: 'recharts-treemap-depth-' + node.depth },
        this.renderAnimatedItem(content, nodeProps, isLeaf),
        node.children && node.children.length ? node.children.map(function (child, index) {
          return _this3.renderNode(node, child, index);
        }) : null
      );
    }
  }, {
    key: 'renderAllNodes',
    value: function renderAllNodes() {
      var _props4 = this.props,
          width = _props4.width,
          height = _props4.height,
          data = _props4.data,
          dataKey = _props4.dataKey,
          aspectRatio = _props4.aspectRatio;


      var root = computeNode({
        depth: 0,
        node: { children: data, x: 0, y: 0, width: width, height: height },
        index: 0,
        valueKey: dataKey
      });

      var formatRoot = squarify(root, aspectRatio);

      return this.renderNode(formatRoot, formatRoot, 0);
    }
  }, {
    key: 'renderTooltip',
    value: function renderTooltip() {
      var _props5 = this.props,
          children = _props5.children,
          nameKey = _props5.nameKey;

      var tooltipItem = (0, _ReactUtils.findChildByType)(children, _Tooltip2.default);

      if (!tooltipItem) {
        return null;
      }

      var _props6 = this.props,
          width = _props6.width,
          height = _props6.height,
          dataKey = _props6.dataKey;
      var _state = this.state,
          isTooltipActive = _state.isTooltipActive,
          activeNode = _state.activeNode;

      var viewBox = { x: 0, y: 0, width: width, height: height };
      var coordinate = activeNode ? {
        x: activeNode.x + activeNode.width / 2,
        y: activeNode.y + activeNode.height / 2
      } : null;
      var payload = isTooltipActive && activeNode ? [{
        payload: activeNode,
        name: (0, _DataUtils.getValueByDataKey)(activeNode, nameKey, ''),
        value: (0, _DataUtils.getValueByDataKey)(activeNode, dataKey)
      }] : [];

      return _react2.default.cloneElement(tooltipItem, {
        viewBox: viewBox,
        active: isTooltipActive,
        coordinate: coordinate,
        label: '',
        payload: payload
      });
    }
  }, {
    key: 'render',
    value: function render() {
      if (!(0, _ReactUtils.validateWidthHeight)(this)) {
        return null;
      }

      var _props7 = this.props,
          width = _props7.width,
          height = _props7.height,
          className = _props7.className,
          style = _props7.style,
          children = _props7.children,
          others = _objectWithoutProperties(_props7, ['width', 'height', 'className', 'style', 'children']);

      var attrs = (0, _ReactUtils.getPresentationAttributes)(others);

      return _react2.default.createElement(
        'div',
        {
          className: (0, _classnames2.default)('recharts-wrapper', className),
          style: _extends({}, style, { position: 'relative', cursor: 'default', width: width, height: height })
        },
        _react2.default.createElement(
          _Surface2.default,
          _extends({}, attrs, { width: width, height: height }),
          this.renderAllNodes(),
          (0, _ReactUtils.filterSvgElements)(children)
        ),
        this.renderTooltip()
      );
    }
  }]);

  return Treemap;
}(_react.Component), _class2.displayName = 'Treemap', _class2.propTypes = {
  width: _propTypes2.default.number,
  height: _propTypes2.default.number,
  data: _propTypes2.default.array,
  style: _propTypes2.default.object,
  aspectRatio: _propTypes2.default.number,
  content: _propTypes2.default.oneOfType([_propTypes2.default.element, _propTypes2.default.func]),
  fill: _propTypes2.default.string,
  stroke: _propTypes2.default.string,
  className: _propTypes2.default.string,
  nameKey: _propTypes2.default.oneOfType([_propTypes2.default.string, _propTypes2.default.number, _propTypes2.default.func]),
  dataKey: _propTypes2.default.oneOfType([_propTypes2.default.string, _propTypes2.default.number, _propTypes2.default.func]),
  children: _propTypes2.default.oneOfType([_propTypes2.default.arrayOf(_propTypes2.default.node), _propTypes2.default.node]),

  onMouseEnter: _propTypes2.default.func,
  onMouseLeave: _propTypes2.default.func,
  onClick: _propTypes2.default.func,

  isAnimationActive: _propTypes2.default.bool,
  isUpdateAnimationActive: _propTypes2.default.bool,
  animationBegin: _propTypes2.default.number,
  animationDuration: _propTypes2.default.number,
  animationEasing: _propTypes2.default.oneOf(['ease', 'ease-in', 'ease-out', 'ease-in-out', 'linear'])
}, _class2.defaultProps = {
  dataKey: 'value',
  aspectRatio: 0.5 * (1 + Math.sqrt(5)),
  isAnimationActive: !(0, _ReactUtils.isSsr)(),
  isUpdateAnimationActive: !(0, _ReactUtils.isSsr)(),
  animationBegin: 0,
  animationDuration: 1500,
  animationEasing: 'linear'
}, _temp2)) || _class;

exports.default = Treemap;