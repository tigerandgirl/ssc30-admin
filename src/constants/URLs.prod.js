/**
 * 配置后端服务器的IP和端口
 * 可以通过在生产环境中创建`config.js`文件，来覆盖这些配置。
 * config.js举例
 * ```
 * G_SCHEME = 'https';
 * G_HOST_PORT = 'fi2.yonyoucloud.com';
 * G_PATH_PREFIX = '/ficloud2';
 * ```
 */

// 友账表生产环境服务器
// 曾用：59.110.123.20
const DEFAULT_SCHEME = 'https';
const DEFAULT_HOST_PORT = 'fi.yonyoucloud.com';
const DEFAULT_PATH_PREFIX = '/ficloud';

export const SCHEME = G_SCHEME || DEFAULT_SCHEME;
export const HOST_PORT = G_HOST_PORT || DEFAULT_HOST_PORT;
export const PATH_PREFIX = G_PATH_PREFIX || DEFAULT_PATH_PREFIX;

// scheme:[//[user:password@]host[:port]][/]path[?query][#fragment]
const makeURL = path => `${SCHEME}://${HOST_PORT}${PATH_PREFIX}${path}`;

/**
 * 通用接口
 */

// 基础档案 模型查询接口
export const FICLOUDPUB_INITGRID_URL = makeURL('/ficloud_pub/initgrid');
// 基础档案 数据查询接口
export const getAddURL = type => `${SCHEME}://${HOST_PORT}${PATH_PREFIX}/${type}/add`;
export const getSaveURL = type => `${SCHEME}://${HOST_PORT}${PATH_PREFIX}/${type}/save`;
export const getDeleteURL = type => `${SCHEME}://${HOST_PORT}${PATH_PREFIX}/${type}/delete`;
export const getQueryURL = type => `${SCHEME}://${HOST_PORT}${PATH_PREFIX}/${type}/query`;
export const getEnableURL = type => `${SCHEME}://${HOST_PORT}${PATH_PREFIX}/${type}/turnenable`;

// 参照 查询接口
export const ReferDataURL = makeURL('/refbase_ctr/queryRefJSON');
export const ReferUserDataURL = makeURL('/userCenter/queryUserAndDeptByDeptPk');

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
