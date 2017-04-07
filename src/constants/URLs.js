/**
 * 配置后端服务器的IP和端口
 */

/** 本地开发环境，使用swagger作为后端 */
export const LOCAL_EXPRESS_SERVER = '127.0.0.1:3009';

/**
 * 后端开发/联调/测试服务器
 * 分两种，一种是后端程序员自己开发机上的跑的服务，我们称为“开发机”，
 * 一种是CI自动部署代码到独立的服务器上，我们称为“测试机”
 * XX_SERVERS = [
 *   '1.1.1.1', // 0 - 开发机
 *   '2.2.2.2'  // 1 - 测试机
 * ]
 */

/**
 * 友报账
 */

/** 基础档案 */
export const BASEDOC_DEV_SERVER = '10.3.14.239';
export const BASEDOC_DEV_SERVERS = [
  '0.0.0.0',
  '10.3.14.239'
];
/** 参照 */
export const REFER_DEV_SERVER = '172.20.13.230:8090';
export const REFER_DEV_SERVERS = [
  '0.0.0.0',
  '172.20.13.230:8090'
];

/**
 * 【废弃】
 * 请直接使用`process.env.PROD_SERVER`来获取“友报账/友账表”服务器IP，由编译期来决定代码
 * 属于哪个项目，已经在webpack中配置好。
 * --------------------------------------------------------------------------
 * 实际联调环境
 * 测试不是直接在这些服务器上使用
 */

export const PROD_SERVER = '172.20.4.88:8088';
export const YZB_PROD_SERVER = '59.110.123.20';

/**
 * --------------------------------------------------------------------------
 * 友账表
 * --------------------------------------------------------------------------
 */

/** 基础档案 */
export const YBZ_BASEDOC_DEV_SERVER = '10.3.14.240';
export const YBZ_BASEDOC_DEV_SERVERS = [
  '10.1.218.36:8080', // 郭老师私服
  '10.3.14.240'       // 某台测试服务器，无须登录
];

/** 外部数据建模左树模型，郭老师私服 */
export const EXTERNAL_DATA_MODELLING_DEV_SERVER = '10.1.218.36:8080';
/** 实体模型，郭老师私服 */
export const ENTITY_DEV_SERVER = '10.1.218.36:8080';
/** 实体映射，郭老师私服 */
export const ENTITYMAP_DEV_SERVER = '10.1.218.36:8080';
export const ENTITYMAP_DEV_SERVERS = [
  '10.1.218.36:8080', // 郭老师私服
  '10.3.14.240'       // 某台测试服务器，无须登录
];
/** 转换规则模型，郭老师私服 */
export const MAPPING_DEF_DEV_SERVER = '10.1.218.36:8080';
export const MAPPING_DEF_DEV_SERVERS = [
  '10.1.218.36:8080', // 郭老师私服
  '10.3.14.240'       // 某台测试服务器，无须登录
];
