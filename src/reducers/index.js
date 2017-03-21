import { combineReducers } from 'redux';

import arch from './arch'; // 基础档案
import conversionRuleDefinition from './conversionRuleDefinition'; // 转换规则定义
import entity from './entity'; // 实体模型
import externalDataModelling from './externalDataModelling'; // 外部数据建模
import template from './template'; // 模板
import welcome from './welcome'; // 调试用首页

// 之前的代码，不知道是否还有用
import { role } from './role';
import permission from './permission';
import archSetting from './archSetting';
import ncSync from './ncSync';
import demo from './demo';

const rootReducer = combineReducers({
  arch,
  conversionRuleDefinition,
  entity,
  externalDataModelling,
  template,
  welcome,

  role,
  permission,
  archSetting,
  ncSync,
  demo
});

export default rootReducer;
