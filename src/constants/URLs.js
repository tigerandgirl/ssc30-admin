/**
 * 配置后端服务器的IP和端口
 */

/** 本地开发环境，使用swagger作为后端 */
export const LOCAL_EXPRESS_SERVER = '127.0.0.1:3009';

/**
 * 友报账
 */

/**
 * 后端开发服务器
 */

/** 基础档案 */
export const BASEDOC_DEV_SERVER = '10.3.14.239';
/** 参照 */
export const REFER_DEV_SERVER = '172.20.13.230:8090';

/**
 * 【废弃】
 * 请直接使用process.env.YBZ_PROD_SERVER来获取“友报账”服务器IP，
 * 请直接使用process.env.YZB_PROD_SERVER来获取“友账表”服务器IP，
 * 已经在webpack中配置好
 * --------------------------------------------------------------------------
 * 实际联调环境
 * 测试不是直接在这些服务器上使用
 */

export const PROD_SERVER = '172.20.4.88:8088';

/******************************************************************************
 * 友账表
 ******************************************************************************/

/**
 * 后端开发服务器
 */

/** 外部数据建模左树模型，郭老师私服 */
export const EXTERNAL_DATA_MODELLING_DEV_SERVER = '10.1.218.36:8080';
/** 实体模型，郭老师私服 */
export const ENTITY_DEV_SERVER = '10.1.218.36:8080';
/** 转换规则模型，郭老师私服 */
export const CONVERSION_RULE_DEFINITION_DEV_SERVER = '10.1.218.36:8080';
