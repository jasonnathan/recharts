import _sortBy from 'lodash/sortBy';
import _isFunction from 'lodash/isFunction';
import _range from 'lodash/range';
import _isNil from 'lodash/isNil';
import _throttle from 'lodash/throttle';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import Surface from '../container/Surface';
import Layer from '../container/Layer';
import Tooltip from '../component/Tooltip';
import Legend from '../component/Legend';

import { warn } from '../util/LogUtils';
import { findAllByType, findChildByType, filterSvgElements, getDisplayName, getPresentationAttributes, validateWidthHeight, isChildrenEqual } from '../util/ReactUtils';

import CartesianAxis from '../cartesian/CartesianAxis';
import CartesianGrid from '../cartesian/CartesianGrid';
import ReferenceLine from '../cartesian/ReferenceLine';
import ReferenceDot from '../cartesian/ReferenceDot';
import ReferenceArea from '../cartesian/ReferenceArea';
import XAxis from '../cartesian/XAxis';
import YAxis from '../cartesian/YAxis';
import Brush from '../cartesian/Brush';
import { getOffset, calculateChartCoordinate } from '../util/DOMUtils';
import { parseSpecifiedDomain, getAnyElementOfObject, hasDuplicate, checkDomainOfScale, combineEventHandlers, parseScale, getValueByDataKey, uniqueId } from '../util/DataUtils';
import { calculateActiveTickIndex, detectReferenceElementsDomain, getMainColorOfGraphicItem, getDomainOfStackGroups, getDomainOfDataByKey, getLegendProps, getDomainOfItemsWithSameAxis, getCoordinatesOfGrid, getStackGroupsByAxisId, getTicksOfAxis, isCategorialAxis, getTicksOfScale, appendOffsetOfLegend } from '../util/CartesianUtils';
import { shallowEqual } from '../util/PureRender';
import { eventCenter, SYNC_EVENT } from '../util/Events';

var ORIENT_MAP = {
  xAxis: ['bottom', 'top'],
  yAxis: ['left', 'right']
};

var originCoordinate = { x: 0, y: 0 };

var generateCategoricalChart = function generateCategoricalChart(ChartComponent, GraphicalChild) {
  var _class, _temp;

  var CategoricalChartWrapper = (_temp = _class = function (_Component) {
    _inherits(CategoricalChartWrapper, _Component);

    function CategoricalChartWrapper(props) {
      _classCallCheck(this, CategoricalChartWrapper);

      var _this = _possibleConstructorReturn(this, (CategoricalChartWrapper.__proto__ || Object.getPrototypeOf(CategoricalChartWrapper)).call(this, props));

      _this.handleLegendBBoxUpdate = function (box) {
        if (box && _this.legendInstance) {
          var _this$state = _this.state,
              dataStartIndex = _this$state.dataStartIndex,
              dataEndIndex = _this$state.dataEndIndex;


          _this.setState(_this.updateStateOfAxisMapsOffsetAndStackGroups({
            props: _this.props, dataStartIndex: dataStartIndex, dataEndIndex: dataEndIndex
          }));
        }
      };

      _this.handleReceiveSyncEvent = function (cId, chartId, data) {
        var _this$props = _this.props,
            syncId = _this$props.syncId,
            layout = _this$props.layout;


        if (syncId === cId && chartId !== _this.uniqueChartId) {
          var dataStartIndex = data.dataStartIndex,
              dataEndIndex = data.dataEndIndex;


          if (!_isNil(data.dataStartIndex) || !_isNil(data.dataEndIndex)) {
            _this.setState(_extends({
              dataStartIndex: dataStartIndex,
              dataEndIndex: dataEndIndex
            }, _this.updateStateOfAxisMapsOffsetAndStackGroups({ props: _this.props, dataStartIndex: dataStartIndex, dataEndIndex: dataEndIndex })));
          } else if (!_isNil(data.activeTooltipIndex)) {
            var chartX = data.chartX,
                chartY = data.chartY,
                activeTooltipIndex = data.activeTooltipIndex;
            var _this$state2 = _this.state,
                offset = _this$state2.offset,
                tooltipTicks = _this$state2.tooltipTicks;

            if (!offset) {
              return;
            }
            var viewBox = _extends({}, offset, { x: offset.left, y: offset.top });
            // When a categotical chart is combined with another chart, the value of chartX
            // and chartY may beyond the boundaries.
            var validateChartX = Math.min(chartX, viewBox.x + viewBox.width);
            var validateChartY = Math.min(chartY, viewBox.y + viewBox.height);
            var activeLabel = tooltipTicks[activeTooltipIndex] && tooltipTicks[activeTooltipIndex].value;
            var activePayload = _this.getTooltipContent(activeTooltipIndex);
            var activeCoordinate = tooltipTicks[activeTooltipIndex] ? {
              x: layout === 'horizontal' ? tooltipTicks[activeTooltipIndex].coordinate : validateChartX,
              y: layout === 'horizontal' ? validateChartY : tooltipTicks[activeTooltipIndex].coordinate
            } : originCoordinate;

            _this.setState(_extends({}, data, { activeLabel: activeLabel, activeCoordinate: activeCoordinate, activePayload: activePayload }));
          } else {
            _this.setState(data);
          }
        }
      };

      _this.handleBrushChange = function (_ref) {
        var startIndex = _ref.startIndex,
            endIndex = _ref.endIndex;

        // Only trigger changes if the extents of the brush have actually changed
        if (startIndex !== _this.state.dataStartIndex || endIndex !== _this.state.dataEndIndex) {
          _this.setState(_extends({
            dataStartIndex: startIndex,
            dataEndIndex: endIndex
          }, _this.updateStateOfAxisMapsOffsetAndStackGroups({ props: _this.props, dataStartIndex: startIndex, dataEndIndex: endIndex })));

          _this.triggerSyncEvent({
            dataStartIndex: startIndex,
            dataEndIndex: endIndex
          });
        }
      };

      _this.handleMouseEnter = function (e) {
        var onMouseEnter = _this.props.onMouseEnter;

        var mouse = _this.getMouseInfo(e);

        if (mouse) {
          var nextState = _extends({}, mouse, { isTooltipActive: true });
          _this.setState(nextState);
          _this.triggerSyncEvent(nextState);

          if (_isFunction(onMouseEnter)) {
            onMouseEnter(nextState, e);
          }
        }
      };

      _this.triggeredAfterMouseMove = function (e) {
        var onMouseMove = _this.props.onMouseMove;

        var mouse = _this.getMouseInfo(e);
        var nextState = mouse ? _extends({}, mouse, { isTooltipActive: true }) : { isTooltipActive: false };

        _this.setState(nextState);
        _this.triggerSyncEvent(nextState);

        if (_isFunction(onMouseMove)) {
          onMouseMove(nextState, e);
        }
      };

      _this.handleMouseMove = function (e) {
        if (e && _isFunction(e.persist)) {
          e.persist();
          _this.triggeredAfterMouseMove(e);
        }
      };

      _this.handleMouseLeave = function (e) {
        var onMouseLeave = _this.props.onMouseLeave;

        var nextState = { isTooltipActive: false };

        _this.setState(nextState);
        _this.triggerSyncEvent(nextState);

        if (_isFunction(onMouseLeave)) {
          onMouseLeave(nextState, e);
        }
      };

      _this.handleClick = function (e) {
        var onClick = _this.props.onClick;


        if (_isFunction(onClick)) {
          var mouse = _this.getMouseInfo(e);

          onClick(mouse, e);
        }
      };

      _this.handleMouseDown = function (e) {
        var onMouseDown = _this.props.onMouseDown;


        if (_isFunction(onMouseDown)) {
          var mouse = _this.getMouseInfo(e);

          onMouseDown(mouse, e);
        }
      };

      _this.handleMouseUp = function (e) {
        var onMouseUp = _this.props.onMouseUp;


        if (_isFunction(onMouseUp)) {
          var mouse = _this.getMouseInfo(e);

          onMouseUp(mouse, e);
        }
      };

      _this.handleTouchMove = function (e) {
        if (e.changedTouches != null && e.changedTouches.length > 0) {
          _this.handleMouseMove(e.changedTouches[0]);
        }
      };

      _this.verticalCoordinatesGenerator = function (_ref2) {
        var xAxis = _ref2.xAxis,
            width = _ref2.width,
            height = _ref2.height,
            offset = _ref2.offset;
        return getCoordinatesOfGrid(CartesianAxis.getTicks(_extends({}, CartesianAxis.defaultProps, xAxis, {
          ticks: getTicksOfAxis(xAxis, true),
          viewBox: { x: 0, y: 0, width: width, height: height }
        })), offset.left, offset.left + offset.width);
      };

      _this.horizontalCoordinatesGenerator = function (_ref3) {
        var yAxis = _ref3.yAxis,
            width = _ref3.width,
            height = _ref3.height,
            offset = _ref3.offset;
        return getCoordinatesOfGrid(CartesianAxis.getTicks(_extends({}, CartesianAxis.defaultProps, yAxis, {
          ticks: getTicksOfAxis(yAxis, true),
          viewBox: { x: 0, y: 0, width: width, height: height }
        })), offset.top, offset.top + offset.height);
      };

      _this.axesTicksGenerator = function (axis) {
        return getTicksOfAxis(axis, true);
      };

      _this.tooltipTicksGenerator = function (_ref4) {
        var layout = _ref4.layout,
            xAxisMap = _ref4.xAxisMap,
            yAxisMap = _ref4.yAxisMap;

        var axisMap = layout === 'horizontal' ? xAxisMap : yAxisMap;
        var axis = getAnyElementOfObject(axisMap);
        var tooltipTicks = getTicksOfAxis(axis, false, true);

        return {
          tooltipTicks: tooltipTicks,
          orderedTooltipTicks: _sortBy(tooltipTicks, function (o) {
            return o.coordinate;
          }),
          tooltipAxis: axis
        };
      };

      var defaultState = _this.createDefaultState(props);
      _this.state = _extends({}, defaultState, { updateId: 0
      }, _this.updateStateOfAxisMapsOffsetAndStackGroups(_extends({ props: props }, defaultState)));
      _this.validateAxes();
      _this.uniqueChartId = uniqueId('recharts');

      if (props.throttleDelay) {
        _this.triggeredAfterMouseMove = _throttle(_this.triggeredAfterMouseMove, props.throttleDelay);
      }
      return _this;
    }

    /* eslint-disable  react/no-did-mount-set-state */


    _createClass(CategoricalChartWrapper, [{
      key: 'componentDidMount',
      value: function componentDidMount() {
        if (!_isNil(this.props.syncId)) {
          this.addListener();
        }
      }
    }, {
      key: 'componentWillReceiveProps',
      value: function componentWillReceiveProps(nextProps) {
        var _props = this.props,
            data = _props.data,
            children = _props.children,
            width = _props.width,
            height = _props.height,
            layout = _props.layout,
            stackOffset = _props.stackOffset,
            margin = _props.margin;


        if (nextProps.data !== data || nextProps.width !== width || nextProps.height !== height || nextProps.layout !== layout || nextProps.stackOffset !== stackOffset || !shallowEqual(nextProps.margin, margin)) {
          var defaultState = this.createDefaultState(nextProps);
          this.setState(_extends({}, defaultState, { updateId: this.state.updateId + 1
          }, this.updateStateOfAxisMapsOffsetAndStackGroups(_extends({ props: nextProps }, defaultState))));
        } else if (!isChildrenEqual(nextProps.children, children)) {
          var _state = this.state,
              dataStartIndex = _state.dataStartIndex,
              dataEndIndex = _state.dataEndIndex;
          // Don't update brush

          var _defaultState = _extends({}, this.createDefaultState(nextProps), { dataEndIndex: dataEndIndex, dataStartIndex: dataStartIndex
          });
          this.setState(_extends({}, _defaultState, this.updateStateOfAxisMapsOffsetAndStackGroups(_extends({ props: nextProps }, _defaultState))));
        }
        // add syncId
        if (_isNil(this.props.syncId) && !_isNil(nextProps.syncId)) {
          this.addListener();
        }
        // remove syncId
        if (!_isNil(this.props.syncId) && _isNil(nextProps.syncId)) {
          this.removeListener();
        }
      }
    }, {
      key: 'componentWillUnmount',
      value: function componentWillUnmount() {
        if (!_isNil(this.props.syncId)) {
          this.removeListener();
        }
        if (typeof this.triggeredAfterMouseMove.cancel === 'function') {
          this.triggeredAfterMouseMove.cancel();
        }
      }
      /**
      * Get the configuration of all x-axis or y-axis
      * @param  {Object} props          Latest props
      * @param  {String} axisType       The type of axis
      * @param  {Array}  graphicalItems The instances of item
      * @param  {Object} stackGroups    The items grouped by axisId and stackId
      * @param {Number} dataStartIndex  The start index of the data series when a brush is applied
      * @param {Number} dataEndIndex    The end index of the data series when a brush is applied
      * @return {Object}          Configuration
      */

    }, {
      key: 'getAxisMap',
      value: function getAxisMap(props, _ref5) {
        var _ref5$axisType = _ref5.axisType,
            axisType = _ref5$axisType === undefined ? 'xAxis' : _ref5$axisType,
            graphicalItems = _ref5.graphicalItems,
            stackGroups = _ref5.stackGroups,
            dataStartIndex = _ref5.dataStartIndex,
            dataEndIndex = _ref5.dataEndIndex;
        var children = props.children;

        var Axis = axisType === 'xAxis' ? XAxis : YAxis;
        var axisIdKey = axisType === 'xAxis' ? 'xAxisId' : 'yAxisId';
        // Get all the instance of Axis
        var axes = findAllByType(children, Axis);

        var axisMap = {};

        if (axes && axes.length) {
          axisMap = this.getAxisMapByAxes(props, { axes: axes, graphicalItems: graphicalItems, axisType: axisType, axisIdKey: axisIdKey,
            stackGroups: stackGroups, dataStartIndex: dataStartIndex, dataEndIndex: dataEndIndex });
        } else if (graphicalItems && graphicalItems.length) {
          axisMap = this.getAxisMapByItems(props, { graphicalItems: graphicalItems, Axis: Axis, axisType: axisType, axisIdKey: axisIdKey,
            stackGroups: stackGroups, dataStartIndex: dataStartIndex, dataEndIndex: dataEndIndex });
        }

        return axisMap;
      }

      /**
       * Get the configuration of axis by the options of axis instance
       * @param  {Object} props         Latest props
       * @param {Array}  axes           The instance of axes
       * @param  {Array} graphicalItems The instances of item
       * @param  {String} axisType      The type of axis, xAxis - x-axis, yAxis - y-axis
       * @param  {String} axisIdKey     The unique id of an axis
       * @param  {Object} stackGroups   The items grouped by axisId and stackId
       * @param {Number} dataStartIndex The start index of the data series when a brush is applied
       * @param {Number} dataEndIndex   The end index of the data series when a brush is applied
       * @return {Object}      Configuration
       */

    }, {
      key: 'getAxisMapByAxes',
      value: function getAxisMapByAxes(props, _ref6) {
        var axes = _ref6.axes,
            graphicalItems = _ref6.graphicalItems,
            axisType = _ref6.axisType,
            axisIdKey = _ref6.axisIdKey,
            stackGroups = _ref6.stackGroups,
            dataStartIndex = _ref6.dataStartIndex,
            dataEndIndex = _ref6.dataEndIndex;
        var layout = props.layout,
            children = props.children,
            data = props.data,
            stackOffset = props.stackOffset;

        var displayedData = data.slice(dataStartIndex, dataEndIndex + 1);
        var len = displayedData.length;
        var isCategorial = isCategorialAxis(layout, axisType);

        // Eliminate duplicated axes
        var axisMap = axes.reduce(function (result, child) {
          var _child$props = child.props,
              type = _child$props.type,
              dataKey = _child$props.dataKey,
              allowDataOverflow = _child$props.allowDataOverflow,
              scale = _child$props.scale;

          var axisId = child.props[axisIdKey];

          if (!result[axisId]) {
            var domain = void 0,
                duplicateDomain = void 0,
                categoricalDomain = void 0;

            if (dataKey) {
              domain = getDomainOfDataByKey(displayedData, dataKey, type);

              if (type === 'category' && isCategorial) {
                var duplicate = hasDuplicate(domain);
                duplicateDomain = duplicate ? domain : null;

                // When category axis has duplicated text, serial numbers are used to generate scale
                domain = duplicate ? _range(0, len) : domain;
              } else if (type === 'category') {
                // eliminate undefined or null or empty string
                domain = domain.filter(function (entry) {
                  return entry !== '' && !_isNil(entry);
                });
              }

              if (isCategorial && (type === 'number' || scale !== 'auto')) {
                categoricalDomain = getDomainOfDataByKey(displayedData, dataKey, 'category');
              }
            } else if (isCategorial) {
              domain = _range(0, len);
            } else if (stackGroups && stackGroups[axisId] && stackGroups[axisId].hasStack && type === 'number') {
              // when stackOffset is 'expand', the domain may be calculated as [0, 1.000000000002]
              domain = stackOffset === 'expand' ? [0, 1] : getDomainOfStackGroups(stackGroups[axisId].stackGroups, dataStartIndex, dataEndIndex);
            } else {
              domain = getDomainOfItemsWithSameAxis(displayedData, graphicalItems.filter(function (entry) {
                return entry.props[axisIdKey] === axisId;
              }), type, true);
            }
            if (type === 'number') {
              // To detect wether there is any reference lines whose props alwaysShow is true
              domain = detectReferenceElementsDomain(children, domain, axisId, axisType);

              if (child.props.domain) {
                domain = parseSpecifiedDomain(child.props.domain, domain, allowDataOverflow);
              }
            }

            return _extends({}, result, _defineProperty({}, axisId, _extends({}, child.props, {
              axisType: axisType,
              domain: domain,
              categoricalDomain: categoricalDomain,
              duplicateDomain: duplicateDomain,
              originalDomain: child.props.domain,
              isCategorial: isCategorial
            })));
          }

          return result;
        }, {});
        return axisMap;
      }

      /**
       * Get the configuration of axis by the options of item,
       * this kind of axis does not display in chart
       * @param  {Object} props         Latest props
       * @param  {Array} graphicalItems The instances of item
       * @param  {ReactElement} Axis    Axis Component
       * @param  {String} axisType      The type of axis, xAxis - x-axis, yAxis - y-axis
       * @param  {String} axisIdKey     The unique id of an axis
       * @param  {Object} stackGroups   The items grouped by axisId and stackId
       * @param {Number} dataStartIndex The start index of the data series when a brush is applied
       * @param {Number} dataEndIndex   The end index of the data series when a brush is applied
       * @return {Object}               Configuration
       */

    }, {
      key: 'getAxisMapByItems',
      value: function getAxisMapByItems(props, _ref7) {
        var graphicalItems = _ref7.graphicalItems,
            Axis = _ref7.Axis,
            axisType = _ref7.axisType,
            axisIdKey = _ref7.axisIdKey,
            stackGroups = _ref7.stackGroups,
            dataStartIndex = _ref7.dataStartIndex,
            dataEndIndex = _ref7.dataEndIndex;
        var layout = props.layout,
            children = props.children,
            data = props.data;

        var displayedData = data.slice(dataStartIndex, dataEndIndex + 1);
        var len = displayedData.length;
        var isCategorial = isCategorialAxis(layout, axisType);
        var index = -1;

        // The default type of x-axis is category axis,
        // The default contents of x-axis is the serial numbers of data
        // The default type of y-axis is number axis
        // The default contents of y-axis is the domain of data
        var axisMap = graphicalItems.reduce(function (result, child) {
          var axisId = child.props[axisIdKey];

          if (!result[axisId]) {
            index++;
            var domain = void 0;

            if (isCategorial) {
              domain = _range(0, len);
            } else if (stackGroups && stackGroups[axisId] && stackGroups[axisId].hasStack) {
              domain = getDomainOfStackGroups(stackGroups[axisId].stackGroups, dataStartIndex, dataEndIndex);
              domain = detectReferenceElementsDomain(children, domain, axisId, axisType);
            } else {
              domain = parseSpecifiedDomain(Axis.defaultProps.domain, getDomainOfItemsWithSameAxis(displayedData, graphicalItems.filter(function (entry) {
                return entry.props[axisIdKey] === axisId;
              }), 'number'), Axis.defaultProps.allowDataOverflow);
              domain = detectReferenceElementsDomain(children, domain, axisId, axisType);
            }

            return _extends({}, result, _defineProperty({}, axisId, _extends({
              axisType: axisType
            }, Axis.defaultProps, {
              hide: true,
              orientation: ORIENT_MAP[axisType][index % 2],
              domain: domain,
              originalDomain: Axis.defaultProps.domain,
              isCategorial: isCategorial
            })));
          }

          return result;
        }, {});

        return axisMap;
      }
      /**
       * Calculate the scale function, position, width, height of axes
       * @param  {Object} props    Latest props
       * @param  {Object} axisMap  The configuration of axes
       * @param  {Object} offset   The offset of main part in the svg element
       * @param  {Object} axisType The type of axes, x-axis or y-axis
       * @return {Object} Configuration
       */

    }, {
      key: 'getFormatAxisMap',
      value: function getFormatAxisMap(props, axisMap, offset, axisType) {
        var width = props.width,
            height = props.height,
            layout = props.layout;

        var displayName = this.constructor.displayName;
        var ids = Object.keys(axisMap);
        var steps = {
          left: offset.left,
          leftMirror: offset.left,
          right: width - offset.right,
          rightMirror: width - offset.right,
          top: offset.top,
          topMirror: offset.top,
          bottom: height - offset.bottom,
          bottomMirror: height - offset.bottom
        };

        return ids.reduce(function (result, id) {
          var axis = axisMap[id];
          var orientation = axis.orientation,
              domain = axis.domain,
              _axis$padding = axis.padding,
              padding = _axis$padding === undefined ? {} : _axis$padding,
              mirror = axis.mirror,
              reversed = axis.reversed;

          var offsetKey = '' + orientation + (mirror ? 'Mirror' : '');

          var range = void 0,
              x = void 0,
              y = void 0,
              needSpace = void 0;

          if (axisType === 'xAxis') {
            range = [offset.left + (padding.left || 0), offset.left + offset.width - (padding.right || 0)];
          } else {
            range = layout === 'horizontal' ? [offset.top + offset.height - (padding.bottom || 0), offset.top + (padding.top || 0)] : [offset.top + (padding.top || 0), offset.top + offset.height - (padding.bottom || 0)];
          }

          if (reversed) {
            range = [range[1], range[0]];
          }

          var scale = parseScale(axis, displayName);
          scale.domain(domain).range(range);
          checkDomainOfScale(scale);
          var ticks = getTicksOfScale(scale, axis);

          if (axisType === 'xAxis') {
            needSpace = orientation === 'top' && !mirror || orientation === 'bottom' && mirror;
            x = offset.left;
            y = steps[offsetKey] - needSpace * axis.height;
          } else {
            needSpace = orientation === 'left' && !mirror || orientation === 'right' && mirror;
            x = steps[offsetKey] - needSpace * axis.width;
            y = offset.top;
          }

          var finalAxis = _extends({}, axis, ticks, {
            range: range, x: x, y: y, scale: scale,
            width: axisType === 'xAxis' ? offset.width : axis.width,
            height: axisType === 'yAxis' ? offset.height : axis.height
          });
          if (!axis.hide && axisType === 'xAxis') {
            steps[offsetKey] += (needSpace ? -1 : 1) * finalAxis.height;
          } else if (!axis.hide) {
            steps[offsetKey] += (needSpace ? -1 : 1) * finalAxis.width;
          }

          return _extends({}, result, _defineProperty({}, id, finalAxis));
        }, {});
      }
      /**
       * Get the information of mouse in chart, return null when the mouse is not in the chart
       * @param  {Object} event    The event object
       * @return {Object}          Mouse data
       */

    }, {
      key: 'getMouseInfo',
      value: function getMouseInfo(event) {
        if (!this.container) {
          return null;
        }

        var offset = this.state.offset;

        var containerOffset = getOffset(this.container);
        var e = calculateChartCoordinate(event, containerOffset);
        var isIn = e.chartX >= offset.left && e.chartX <= offset.left + offset.width && e.chartY >= offset.top && e.chartY <= offset.top + offset.height;

        if (!isIn) {
          return null;
        }

        var layout = this.props.layout;
        var _state2 = this.state,
            ticks = _state2.orderedTooltipTicks,
            axis = _state2.tooltipAxis,
            tooltipTicks = _state2.tooltipTicks;

        var pos = layout === 'horizontal' ? e.chartX : e.chartY;
        var activeIndex = calculateActiveTickIndex(pos, ticks, axis);

        if (activeIndex >= 0) {
          var activeLabel = tooltipTicks[activeIndex] && tooltipTicks[activeIndex].value;
          var activePayload = this.getTooltipContent(activeIndex);
          var activeCoordinate = tooltipTicks[activeIndex] ? {
            x: layout === 'horizontal' ? tooltipTicks[activeIndex].coordinate : e.chartX,
            y: layout === 'horizontal' ? e.chartY : tooltipTicks[activeIndex].coordinate
          } : originCoordinate;

          return _extends({}, e, {
            activeTooltipIndex: activeIndex,
            activeLabel: activeLabel,
            activePayload: activePayload,
            activeCoordinate: activeCoordinate
          });
        }

        return null;
      }
      /**
       * Get the content to be displayed in the tooltip
       * @param  {Number} activeIndex    Active index of data
       * @return {Array}                 The content of tooltip
       */

    }, {
      key: 'getTooltipContent',
      value: function getTooltipContent(activeIndex) {
        var _state3 = this.state,
            dataStartIndex = _state3.dataStartIndex,
            dataEndIndex = _state3.dataEndIndex,
            graphicalItems = _state3.graphicalItems;

        var data = this.props.data.slice(dataStartIndex, dataEndIndex + 1);

        if (activeIndex < 0 || !graphicalItems || !graphicalItems.length || activeIndex >= data.length) {
          return null;
        }

        return graphicalItems.map(function (child) {
          var _child$props2 = child.props,
              dataKey = _child$props2.dataKey,
              name = _child$props2.name,
              unit = _child$props2.unit,
              formatter = _child$props2.formatter;


          return _extends({}, getPresentationAttributes(child), {
            dataKey: dataKey, unit: unit, formatter: formatter,
            name: name || dataKey,
            color: getMainColorOfGraphicItem(child),
            value: getValueByDataKey(data[activeIndex], dataKey),
            payload: data[activeIndex]
          });
        });
      }

      /**
       * The AxisMaps are expensive to render on large data sets
       * so provide the ability to store them in state and only update them when necessary
       * they are dependent upon the start and end index of
       * the brush so it's important that this method is called _after_
       * the state is updated with any new start/end indices
       *
       * @param {Object} props The props object to be used for updating the axismaps
       * @param {Number} dataStartIndex The start index of the data series when a brush is applied
       * @param {Number} dataEndIndex The end index of the data series when a brush is applied
       * @return {Object} state New state to set
       */

    }, {
      key: 'updateStateOfAxisMapsOffsetAndStackGroups',
      value: function updateStateOfAxisMapsOffsetAndStackGroups(_ref8) {
        var props = _ref8.props,
            dataStartIndex = _ref8.dataStartIndex,
            dataEndIndex = _ref8.dataEndIndex;
        var data = props.data;

        if (!validateWidthHeight({ props: props }) || !data || !data.length) {
          return null;
        }

        var children = props.children,
            layout = props.layout,
            stackOffset = props.stackOffset;

        var numericIdName = layout === 'horizontal' ? 'yAxis' : 'xAxis';
        var cateIdName = layout === 'horizontal' ? 'xAxis' : 'yAxis';
        var graphicalItems = findAllByType(children, GraphicalChild);
        var stackGroups = getStackGroupsByAxisId(data, graphicalItems, numericIdName + 'Id', cateIdName + 'Id', stackOffset);

        var xAxisMap = this.getAxisMap(props, {
          axisType: 'xAxis',
          graphicalItems: graphicalItems,
          stackGroups: numericIdName === 'xAxis' && stackGroups,
          dataStartIndex: dataStartIndex,
          dataEndIndex: dataEndIndex
        });

        var yAxisMap = this.getAxisMap(props, {
          axisType: 'yAxis',
          graphicalItems: graphicalItems,
          stackGroups: numericIdName === 'yAxis' && stackGroups,
          dataStartIndex: dataStartIndex,
          dataEndIndex: dataEndIndex
        });

        var offset = this.calculateOffset(props, graphicalItems, xAxisMap, yAxisMap);

        xAxisMap = this.getFormatAxisMap(props, xAxisMap, offset, 'xAxis');
        yAxisMap = this.getFormatAxisMap(props, yAxisMap, offset, 'yAxis');

        var ticksObj = this.tooltipTicksGenerator({
          layout: layout, xAxisMap: xAxisMap, yAxisMap: yAxisMap
        });

        return _extends({ graphicalItems: graphicalItems, xAxisMap: xAxisMap, yAxisMap: yAxisMap, offset: offset, stackGroups: stackGroups }, ticksObj);
      }

      /* eslint-disable  no-underscore-dangle */

    }, {
      key: 'addListener',
      value: function addListener() {
        eventCenter.on(SYNC_EVENT, this.handleReceiveSyncEvent);

        if (eventCenter.setMaxListeners && eventCenter._maxListeners) {
          eventCenter.setMaxListeners(eventCenter._maxListeners + 1);
        }
      }
    }, {
      key: 'removeListener',
      value: function removeListener() {
        eventCenter.removeListener(SYNC_EVENT, this.handleReceiveSyncEvent);

        if (eventCenter.setMaxListeners && eventCenter._maxListeners) {
          eventCenter.setMaxListeners(eventCenter._maxListeners - 1);
        }
      }
      /**
       * Returns default, reset state for the categorical chart.
       * @param {Object} props Props object to use when creating the default state
       * @return {Object} Whole new state
       */

    }, {
      key: 'createDefaultState',
      value: function createDefaultState(props) {
        var children = props.children;

        var brushItem = findChildByType(children, Brush);
        var startIndex = brushItem && brushItem.props && brushItem.props.startIndex || 0;
        var endIndex = brushItem && brushItem.props && brushItem.props.endIndex || props.data && props.data.length - 1 || 0;
        return {
          chartX: 0,
          chartY: 0,
          dataStartIndex: startIndex,
          dataEndIndex: endIndex,
          activeTooltipIndex: -1,
          isTooltipActive: false
        };
      }
      /**
       * Calculate the offset of main part in the svg element
       * @param  {Object} props          Latest props
       * @param  {Array}  graphicalItems The instances of item
       * @param  {Object} xAxisMap       The configuration of x-axis
       * @param  {Object} yAxisMap       The configuration of y-axis
       * @return {Object} The offset of main part in the svg element
       */

    }, {
      key: 'calculateOffset',
      value: function calculateOffset(props, graphicalItems, xAxisMap, yAxisMap) {
        var width = props.width,
            height = props.height,
            children = props.children;

        var margin = props.margin || {};
        var brushItem = findChildByType(children, Brush);
        var legendItem = findChildByType(children, Legend);

        var offsetH = Object.keys(yAxisMap).reduce(function (result, id) {
          var entry = yAxisMap[id];
          var orientation = entry.orientation;

          if (!entry.mirror && !entry.hide) {
            return _extends({}, result, _defineProperty({}, orientation, result[orientation] + entry.width));
          }

          return result;
        }, { left: margin.left || 0, right: margin.right || 0 });

        var offsetV = Object.keys(xAxisMap).reduce(function (result, id) {
          var entry = xAxisMap[id];
          var orientation = entry.orientation;

          if (!entry.mirror && !entry.hide) {
            return _extends({}, result, _defineProperty({}, orientation, result[orientation] + entry.height));
          }

          return result;
        }, { top: margin.top || 0, bottom: margin.bottom || 0 });

        var offset = _extends({}, offsetV, offsetH);

        var brushBottom = offset.bottom;

        if (brushItem) {
          offset.bottom += brushItem.props.height || Brush.defaultProps.height;
        }

        if (legendItem && this.legendInstance) {
          var legendBox = this.legendInstance.getBBox();
          offset = appendOffsetOfLegend(offset, graphicalItems, props, legendBox);
        }

        return _extends({
          brushBottom: brushBottom
        }, offset, {
          width: width - offset.left - offset.right,
          height: height - offset.top - offset.bottom
        });
      }
      /**
       * The handler of mouse entering chart
       * @param  {Object} e              Event object
       * @return {Null}                  null
       */


      /**
       * The handler of mouse moving in chart
       * @param  {Object} e        Event object
       * @return {Null} no return
       */

      /**
       * The handler if mouse leaving chart
       * @param {Object} e Event object
       * @return {Null} no return
       */

    }, {
      key: 'validateAxes',
      value: function validateAxes() {
        var _props2 = this.props,
            layout = _props2.layout,
            children = _props2.children;

        var xAxes = findAllByType(children, XAxis);
        var yAxes = findAllByType(children, YAxis);

        if (layout === 'horizontal' && xAxes && xAxes.length) {
          xAxes.forEach(function (axis) {
            warn(axis.props.type === 'category' || axis.props.type === 'number' && !_isNil(axis.props.dataKey), 'x-axis should be a category axis or a number axis which has specifed dataKey\n             when the layout is horizontal');
          });
        } else if (layout === 'vertical') {
          var displayName = this.constructor.displayName;

          warn(yAxes && yAxes.length, 'You should add <YAxis type="number" /> in ' + displayName + '.\n           The layout is vertical now, y-axis should be category axis,\n           but y-axis is number axis when no YAxis is added.');
          warn(xAxes && xAxes.length, 'You should add <XAxis /> in ' + displayName + '.\n          The layout is vertical now, x-axis is category when no XAxis is added.');

          if (yAxes && yAxes.length) {
            yAxes.forEach(function (axis) {
              warn(axis.props.type === 'category' || axis.props.type === 'number' && !_isNil(axis.props.dataKey), 'y-axis should be a category axis or a number axis which has specifed dataKey\n               when the layout is vertical');
            });
          }
        }

        return null;
      }
    }, {
      key: 'triggerSyncEvent',
      value: function triggerSyncEvent(data) {
        var syncId = this.props.syncId;


        if (!_isNil(syncId)) {
          eventCenter.emit(SYNC_EVENT, syncId, this.uniqueChartId, data);
        }
      }
    }, {
      key: 'renderAxes',


      /**
       * Draw axes
       * @param {Object} axisMap The configuration of all x-axes or y-axes
       * @param {String} name    The name of axes
       * @return {ReactElement}  The instance of x-axes
       */
      value: function renderAxes(axisMap, name) {
        var _props3 = this.props,
            width = _props3.width,
            height = _props3.height;

        var ids = axisMap && Object.keys(axisMap);

        if (ids && ids.length) {
          var axes = [];

          for (var i = 0, len = ids.length; i < len; i++) {
            var axis = axisMap[ids[i]];

            if (!axis.hide) {

              axes.push(React.createElement(CartesianAxis, _extends({}, axis, {
                key: name + '-' + ids[i],
                viewBox: { x: 0, y: 0, width: width, height: height },
                ticksGenerator: this.axesTicksGenerator
              })));
            }
          }

          return axes.length ? React.createElement(
            Layer,
            { key: name + '-layer', className: 'recharts-' + name },
            axes
          ) : null;
        }

        return null;
      }

      /**
       * Draw grid
       * @return {ReactElement} The instance of grid
       */

    }, {
      key: 'renderGrid',
      value: function renderGrid() {
        var _state4 = this.state,
            xAxisMap = _state4.xAxisMap,
            yAxisMap = _state4.yAxisMap,
            offset = _state4.offset;
        var _props4 = this.props,
            children = _props4.children,
            width = _props4.width,
            height = _props4.height;

        var gridItem = findChildByType(children, CartesianGrid);

        if (!gridItem) {
          return null;
        }

        var xAxis = getAnyElementOfObject(xAxisMap);
        var yAxis = getAnyElementOfObject(yAxisMap);

        return React.cloneElement(gridItem, {
          key: 'grid',
          x: offset.left,
          y: offset.top,
          width: offset.width,
          height: offset.height,
          xAxis: xAxis,
          yAxis: yAxis,
          offset: offset,
          chartWidth: width,
          chartHeight: height,
          verticalCoordinatesGenerator: this.verticalCoordinatesGenerator,
          horizontalCoordinatesGenerator: this.horizontalCoordinatesGenerator
        });
      }
      /**
       * Draw legend
       * @return {ReactElement}            The instance of Legend
       */

    }, {
      key: 'renderLegend',
      value: function renderLegend() {
        var _this2 = this;

        var graphicalItems = this.state.graphicalItems;
        var _props5 = this.props,
            children = _props5.children,
            width = _props5.width,
            height = _props5.height;

        var margin = this.props.margin || {};
        var legendWidth = width - (margin.left || 0) - (margin.right || 0);
        var legendHeight = height - (margin.top || 0) - (margin.bottom || 0);
        var props = getLegendProps(children, graphicalItems, legendWidth, legendHeight);

        if (!props) {
          return null;
        }

        return React.createElement(Legend, _extends({}, props, {
          chartWidth: width,
          chartHeight: height,
          margin: margin,
          ref: function ref(legend) {
            _this2.legendInstance = legend;
          },
          onBBoxUpdate: this.handleLegendBBoxUpdate
        }));
      }

      /**
       * Draw Tooltip
       * @return {ReactElement}  The instance of Tooltip
       */

    }, {
      key: 'renderTooltip',
      value: function renderTooltip() {
        var children = this.props.children;

        var tooltipItem = findChildByType(children, Tooltip);

        if (!tooltipItem) {
          return null;
        }

        var _state5 = this.state,
            isTooltipActive = _state5.isTooltipActive,
            activeCoordinate = _state5.activeCoordinate,
            activePayload = _state5.activePayload,
            activeLabel = _state5.activeLabel,
            offset = _state5.offset;


        return React.cloneElement(tooltipItem, {
          viewBox: _extends({}, offset, { x: offset.left, y: offset.top }),
          active: isTooltipActive,
          label: activeLabel,
          payload: isTooltipActive ? activePayload : [],
          coordinate: activeCoordinate
        });
      }
    }, {
      key: 'renderBrush',
      value: function renderBrush() {
        var _props6 = this.props,
            children = _props6.children,
            margin = _props6.margin,
            data = _props6.data;
        var _state6 = this.state,
            offset = _state6.offset,
            dataStartIndex = _state6.dataStartIndex,
            dataEndIndex = _state6.dataEndIndex,
            updateId = _state6.updateId;

        var brushItem = findChildByType(children, Brush);

        if (!brushItem) {
          return null;
        }

        // TODO: update brush when children update
        return React.cloneElement(brushItem, {
          onChange: combineEventHandlers(this.handleBrushChange, null, brushItem.props.onChange),
          data: data,
          x: offset.left,
          y: offset.top + offset.height + offset.brushBottom - (margin.bottom || 0),
          width: offset.width,
          startIndex: dataStartIndex,
          endIndex: dataEndIndex,
          updateId: 'brush-' + updateId
        });
      }
    }, {
      key: 'renderReferenceElements',
      value: function renderReferenceElements(isFront, Compt) {
        var children = this.props.children;

        var elements = findAllByType(children, Compt);

        if (!elements || !elements.length) {
          return null;
        }

        var _state7 = this.state,
            xAxisMap = _state7.xAxisMap,
            yAxisMap = _state7.yAxisMap,
            offset = _state7.offset;

        var keyPrefix = getDisplayName(Compt) + '-' + (isFront ? 'front' : 'back');

        return elements.filter(function (entry) {
          return isFront === entry.props.isFront;
        }).map(function (entry, i) {
          var _entry$props = entry.props,
              xAxisId = _entry$props.xAxisId,
              yAxisId = _entry$props.yAxisId;


          return React.cloneElement(entry, {
            key: keyPrefix + '-' + i,
            xAxis: xAxisMap[xAxisId],
            yAxis: yAxisMap[yAxisId],
            viewBox: {
              x: offset.left,
              y: offset.top,
              width: offset.width,
              height: offset.height
            }
          });
        });
      }
    }, {
      key: 'renderChart',
      value: function renderChart() {
        var _props7 = this.props,
            children = _props7.children,
            width = _props7.width,
            height = _props7.height,
            others = _objectWithoutProperties(_props7, ['children', 'width', 'height']);

        var _state8 = this.state,
            xAxisMap = _state8.xAxisMap,
            yAxisMap = _state8.yAxisMap;
        var _props$gridOnTop = this.props.gridOnTop,
            gridOnTop = _props$gridOnTop === undefined ? true : _props$gridOnTop;

        var attrs = getPresentationAttributes(others);

        return React.createElement(
          Surface,
          _extends({}, attrs, { width: width, height: height }),
          gridOnTop && this.renderGrid(),
          this.renderReferenceElements(false, ReferenceArea),
          this.renderReferenceElements(false, ReferenceLine),
          this.renderReferenceElements(false, ReferenceDot),
          this.renderAxes(xAxisMap, 'x-axis'),
          this.renderAxes(yAxisMap, 'y-axis'),
          React.createElement(ChartComponent, _extends({}, this.props, this.state)),
          !gridOnTop && this.renderGrid(),
          this.renderReferenceElements(true, ReferenceArea),
          this.renderReferenceElements(true, ReferenceLine),
          this.renderReferenceElements(true, ReferenceDot),
          this.renderBrush(),
          filterSvgElements(children)
        );
      }
    }, {
      key: 'render',
      value: function render() {
        var _this3 = this;

        var data = this.props.data;

        if (!validateWidthHeight(this) || !data || !data.length) {
          return null;
        }

        var _props8 = this.props,
            className = _props8.className,
            width = _props8.width,
            height = _props8.height,
            style = _props8.style,
            compact = _props8.compact;


        var events = {
          onMouseEnter: this.handleMouseEnter,
          onMouseMove: this.handleMouseMove,
          onMouseLeave: this.handleMouseLeave,
          onClick: this.handleClick,
          onMouseDown: this.handleMouseDown,
          onMouseUp: this.handleMouseUp,
          onTouchMove: this.handleTouchMove
        };

        // The "compact" mode is mainly used as the panorama within Brush
        if (compact) {
          return this.renderChart();
        }

        return React.createElement(
          'div',
          _extends({
            className: classNames('recharts-wrapper', className),
            style: _extends({}, style, { position: 'relative', cursor: 'default', width: width, height: height })
          }, events, {
            ref: function ref(node) {
              _this3.container = node;
            }
          }),
          this.renderChart(),
          this.renderLegend(),
          this.renderTooltip()
        );
      }
    }]);

    return CategoricalChartWrapper;
  }(Component), _class.displayName = getDisplayName(ChartComponent), _class.propTypes = _extends({}, ChartComponent.propTypes, {
    syncId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    compact: PropTypes.bool,
    width: PropTypes.number,
    height: PropTypes.number,
    data: PropTypes.arrayOf(PropTypes.object),
    gridOnTop: PropTypes.bool,
    layout: PropTypes.oneOf(['horizontal', 'vertical']),
    stackOffset: PropTypes.oneOf(['sign', 'expand', 'none', 'wiggle', 'silhouette']),
    throttleDelay: PropTypes.number,
    margin: PropTypes.shape({
      top: PropTypes.number,
      right: PropTypes.number,
      bottom: PropTypes.number,
      left: PropTypes.number
    }),
    style: PropTypes.object,
    className: PropTypes.string,
    children: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.node), PropTypes.node]),
    onClick: PropTypes.func,
    onMouseLeave: PropTypes.func,
    onMouseEnter: PropTypes.func,
    onMouseMove: PropTypes.func
  }), _class.defaultProps = {
    layout: 'horizontal',
    gridOnTop: true,
    stackOffset: 'none',
    margin: { top: 5, right: 5, bottom: 5, left: 5 }
  }, _temp);


  return CategoricalChartWrapper;
};

export default generateCategoricalChart;