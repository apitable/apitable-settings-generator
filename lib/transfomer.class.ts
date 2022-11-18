import { IFieldValueMap, IRecord } from "apitable";
import * as dot from "dot-object";
import { isArray, isString } from "lodash";
import { Format } from "./config.interface";
import { RequestDataMap } from "./generator.class";
import { IConfig, ITableConfig } from "./config.interface";
interface CacheRecord {
  id: string;
  dottedObject: object;
}
interface SettingsResult {
  data: object;
  config: IConfig;
  // requestedData: IRecord[]; 
}

/**
 * A map that store all final results in memory before write into local files.
 */
export type SettingsResultMap = { [fileName: string]: SettingsResult };

type CacheRecordsMap = { [key: string]: CacheRecord };
/**
 * Data transformer, from requested data (IRecord) and configs (IConfig) to settings result (JSON).
 */
export class Transformer {
  private _requestedData: RequestDataMap;
  private _configs: IConfig[];
  private _recordsCache:  CacheRecordsMap = {};

  generateSettings(): SettingsResultMap {

    const resultMap: SettingsResultMap = {};

    for (const config of this._configs) {
      const result = this.parseTables(config.tables)
      resultMap[config.fileName] = {
        data: result,
        config: config
      };

    }
    // 处理关联表数据替换
    this.handleRelateRecord();

    return resultMap;
  }


  /**
   * parse multi tables
   * 
   * @param tableConfigs configs
   */
   public parseTables(tableConfigs: ITableConfig[]): object {
    const tableObjects: { [key: string]: any } = {};

    // 处理生成json所需要的多个表格组合数据
    for (const tableConfig of tableConfigs) {
      const records = this._requestedData[tableConfig.datasheetId];
      const result = this.parseTable(tableConfig, records);

      tableObjects[tableConfig.datasheetName] = result;

    }
    const res = dot.object(tableObjects) as { [key: string]: any };
    delete res[""];
    return res;
  }

  constructor(configs: IConfig[], requestedDataMap: RequestDataMap) {
    this._configs = configs;
    this._requestedData = requestedDataMap;
  }

  private filter(obj: IFieldValueMap) {
    const ret: IFieldValueMap = {};
    for (let key in obj) {
      key = key.trim();
      if (key && key[0] !== ".") {
        ret[key] = obj[key];
      }
    }
    return ret;
  }

  public parseTable(tableConfig: ITableConfig, records: IRecord[]) {
    const recordList: object[] = [];

    console.log("表:[%s], 行数: %d", tableConfig.datasheetName, records.length);
    // 循环行记录
    for (const record of records) {
      const { fields, recordId } = record;
      if (fields.id !== undefined) {
        // 没写id列的，就跳过
        const fieldId = fields.id;
        // 移除 . 开头的用于注释的 key，再解析。
        const dotObj = dot.object(this.filter(fields)) as {
          [key: string]: any;
        };
        // 移除为空的 KEY
        delete dotObj[""];
        // 缓存记录，以recordId作为key存储，为了后置关联数据处理
        this._recordsCache[recordId] = {
          id: fieldId as string,
          // 缓存起来 (Ref 指针引用)
          dottedObject: dotObj,
        };
        recordList.push(dotObj);
      } else {
        console.warn(
          "行记录不存在id字段，recordId: %s, record: %s",
          recordId,
          JSON.stringify(record)
        );
      }
    }
    // 以表名作为key构造json对象或数组
    if (tableConfig.format === Format.Array) {
      // tableObjects[tableConfig.datasheetName] = recordList;
      return recordList;
    } else if (tableConfig.format === Format.Rows) {
      let bigObject: { [key: string]: any } = {};
      for (const recordObj of recordList) {
        const rObj = recordObj as { [key: string]: any };
        const key = rObj["id"];

        if (!tableConfig.id) {
          // remove the "id"
          delete rObj["id"];
        }

        bigObject[key] = rObj;
      }
      bigObject = dot.object(bigObject) as { [key: string]: any };
      delete bigObject[""];
      return bigObject;
    } else if (tableConfig.format === Format.Columns) {
      const retObj: { [key: string]: any } = {};

      for (const record of recordList) {
        const rObj = record as { [key: string]: any };
        for (const recordKey in record) {

          if (recordKey == 'id') continue; // ignore `id`

          if (!retObj[recordKey]) retObj[recordKey] = {}

          const valObj = retObj[recordKey];
          const rowPrimaryKey = rObj['id'];

          valObj[rowPrimaryKey] = rObj[recordKey];
        }

      }

      return retObj;
    }

    throw new Error("Unknow format: " + tableConfig.format);
  }

  /**
   * 处理关联数据
   */
  public handleRelateRecord() {
    for (const [recordId, recordObj] of Object.entries(this._recordsCache)) {
      const rowObject = recordObj.dottedObject as { [key: string]: any };
      for (const [key, cell] of Object.entries(rowObject)) {
        if (isArray(cell)) {
          let rowValue: string[] = [];
          for (const cellValue of cell) {
            if (isString(cellValue) && cellValue.startsWith("rec")) {
              if (Object.keys(this._recordsCache).includes(cellValue)) {
                rowValue.push(this._recordsCache[cellValue].id);
              } else {
                console.warn("关联数据不存在: %s", recordId);
              }
            } else if (cell.length === 1) {
              rowValue = cellValue;
              continue;
            } else {
              rowValue.push(cellValue);
            }
          }
          rowObject[key] = rowValue;
        }
      }
    }
  }
}
