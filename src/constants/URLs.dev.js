/**
 * 配置后端服务器的IP和端口
 */

/**
 * 是否启用后端的开发用服务器
 * * -1 使用本地的expressjs服务器伪造数据
 * *  1 使用后端开发人员提供的开发机上跑的服务
 * *  2 使用后端提供的测试服务器
 */
const DEV_BACKEND_INDEX = -1;

// 郭老师私服
const GBH_SERVER = '10.1.218.36:8080';
// 后端某台测试服务器
const DEV_SERVER = '10.3.14.240';

// 默认使用本地开发环境，使用swagger作为后端，而且默认使用友报账后端
const DEFAULT_SCHEME = 'http';
const DEFAULT_HOST_PORT = '172.20.13.230:8082';
const DEFAULT_PATH_PREFIX = '';

export const SCHEME = typeof G_SCHEME === 'undefined'
  ? DEFAULT_SCHEME
  : G_SCHEME;
export const HOST_PORT = [
  /* 0 */ GBH_SERVER,
  /* 1 */ DEV_SERVER
][DEV_BACKEND_INDEX] || DEFAULT_HOST_PORT;
export const PATH_PREFIX = typeof G_PATH_PREFIX === 'undefined'
  ? DEFAULT_PATH_PREFIX
  : G_PATH_PREFIX;

// scheme:[//[user:password@]host[:port]][/]path[?query][#fragment]
const makeURL = path => `${SCHEME}://${HOST_PORT}${PATH_PREFIX}${path}`;

/**
 * 通用接口
 */

// 基础档案 模型查询接口
export const FICLOUDPUB_INITGRID_URL = makeURL('/initheader/initgrid?phone=13920171111');
// 基础档案 数据查询接口
export const getAddURL = type => `${SCHEME}://${HOST_PORT}${PATH_PREFIX}/${type}/add?phone=13920171111`;
export const getSaveURL = type => `${SCHEME}://${HOST_PORT}${PATH_PREFIX}/${type}/save?phone=13920171111`;
export const getDeleteURL = type => `${SCHEME}://${HOST_PORT}${PATH_PREFIX}/${type}/delete?phone=13920171111`;
export const getQueryURL = type => `${SCHEME}://${HOST_PORT}/doc/${type}/query?phone=13920171111`;
export const getEnableURL = type => `${SCHEME}://${HOST_PORT}${PATH_PREFIX}/${type}/turnenable?phone=13920171111`;

// 参照 查询接口
export const ReferDataURL = makeURL('/refbase_ctr/queryRefJSON');
export const ReferUserDataURL = makeURL('/userCenter/queryUserAndDeptByDeptPk');

// 职务职级城市 查询接口
export const ReferDutyURL = makeURL('/doc/duty/findAll');
export const ReferDutyLevelURL = makeURL('/doc/dutyLevel/findAll');

// 公式编辑器
export const FormulaURL = makeURL('/echart/metatree');

/**
 * 转换规则模型
 */

export const MAPPING_DEF_QUERY_URL = makeURL('/mappingdef/query');
export const MAPPING_DEF_SAVE_URL = makeURL('/mappingdef/save');
export const MAPPING_DEF_DELETE_URL = makeURL('/mappingdef/delete');

/**
 * 实体映射模型 exchanger/entitymap.md
 */

// 左树查询服务
// export const OUTER_ENTITY_TREE_URL = makeURL('/template/tree');
export const OUTER_ENTITY_TREE_URL = makeURL('/outerentitytree/querymdtree');
// 左树节点查询服务
// export const OUTER_ENTITY_TREE_NODE_CHILDREN_URL = makeURL('/template/node');
// 右表查询服务
export const OUTER_ENTITY_TREE_NODE_DATA_URL = makeURL('/outerentitytree/querynodedata');
export const OUTER_ENTITY_TREE_ADD_NODE_DATA_URL = makeURL('/outerentitytree/addnodedata');
export const OUTER_ENTITY_TREE_UPDATE_NODE_DATA_URL = makeURL('/outerentitytree/updatenodedata');
export const OUTER_ENTITY_TREE_DEL_NODE_DATA_URL = makeURL('/outerentitytree/delnodedata');
