import { IFieldValueMap, IRecord } from "apitable";
import * as dot from "dot-object";
import { camelCase, capitalize, forIn, isArray, isString, kebabCase, lowerCase } from "lodash";
import { Format, IConfig, ITableConfig } from "./config.interface";
import { RequestDataMap } from "./generator.class";

interface CacheRecord {
  id: string;
  dottedObject: any;
}

interface SettingsResult {
  data: { [key: string]: any };
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
  private readonly _requestedData: RequestDataMap;
  private readonly _configs: IConfig[];
  private _recordsCache: CacheRecordsMap = {};

  constructor(configs: IConfig[], requestedDataMap: RequestDataMap) {
    this._configs = configs;
    this._requestedData = requestedDataMap;
  }

  generateSettings(): SettingsResultMap {
    const resultMap: SettingsResultMap = {};

    for (const config of this._configs) {
      const result = this.parseTables(config.tables);
      resultMap[config.fileName] = {
        data: result,
        config: config
      };
    }
    // relation datasheets replacement
    this.handleRelateRecord();

    return resultMap;
  }

  /**
   * parse multi tables
   *
   * @param tableConfigs configs
   */
  public parseTables(tableConfigs: ITableConfig[]): { [key: string]: any } {
    const tableObjects: { [key: string]: any } = {};

    // multi table process
    for (const tableConfig of tableConfigs) {
      const records = this._requestedData[tableConfig.datasheetId];
      const result = this.parseTable(tableConfig, records);

      tableObjects[tableConfig.datasheetName] = result;
    }
    const res = dot.object(tableObjects);
    dot.remove("", res);
    return res;
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

    console.log("Table:[%s], Lines: %d", tableConfig.datasheetName, records?.length);
    // loop the records
    for (const record of records) {
      const { fields, recordId } = record;
      if (fields.id !== undefined) {
        // if no ID field, ignore it.
        const fieldId = fields.id;

        // Remove the key used for comments at the beginning with ".", and then parse agia again
        const dotObj = dot.object(this.filter(fields));
        // remove empty key
        dot.remove("", dotObj);
        // Cache records, stored with recordId as the key, for post-association data processing
        this._recordsCache[recordId] = {
          id: fieldId as string,
          // Cache it (Ref pointer reference)
          dottedObject: dotObj,
        };
        recordList.push(dotObj);
      } else {
        console.warn(
          "Record does not exist ID field, recordId: %s, record: %s",
          recordId,
          JSON.stringify(record)
        );
      }
    }

    // Use the table name as the key to construct a json object or array
    const context: Context = { recordList: recordList, tableConfig: tableConfig };

    return FormatFactory.get(tableConfig.format).execute(context);
  }

  /**
   * Handle linked relation datasheet
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
                console.warn("Relation record does not exist: %s", recordId);
              }
            } else if (cell.length === 1) {
              rowValue = cellValue;
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

interface Context {
  recordList: any[];
  tableConfig?: ITableConfig;
}

interface IFormat {
  execute(context: Context): any[] | { [key: string]: any };
}

class FormatArray implements IFormat {
  execute(context: Context): any[] {
    return context.recordList;
  }
}

class FormatRows implements IFormat {
  execute(context: Context): { [key: string]: any } {
    const { recordList, tableConfig } = context;
    let bigObject: { [key: string]: any } = {};

    for (const recordObj of recordList) {
      const rObj = recordObj as { [key: string]: any };
      const key = rObj["id"];

      if (!tableConfig!.id) {
        // remove the "id"
        delete rObj["id"];
      }

      bigObject[key] = rObj;
    }
    bigObject = dot.object(bigObject);
    dot.remove("", bigObject);
    return bigObject;
  }
}

class FormatColumns {
  execute(context: Context): { [key: string]: any } {
    const { recordList } = context;
    const retObj: { [key: string]: any } = {};

    for (const record of recordList) {
      const rObj = record as { [key: string]: any };
      for (const recordKey in record) {

        if (recordKey == 'id') {
          // ignore `id`
          continue;
        }

        if (!retObj[recordKey]) retObj[recordKey] = {};

        const valObj = retObj[recordKey];
        const rowPrimaryKey = rObj['id'];

        valObj[rowPrimaryKey] = rObj[recordKey];
      }
    }
    return retObj;
  }
}

class FormatFactory {
  private static _services: { [s: string]: IFormat } = {};

  static {
    this._services[Format.Array] = new FormatArray();
    this._services[Format.Rows] = new FormatRows();
    this._services[Format.Columns] = new FormatColumns();
    this._services[Format.Properties_Files] = new FormatColumns();
    this._services[Format.Column_Files] = new FormatColumns();

    // adapt to more naming styles
    forIn(this._services, (value, key) => {
      // lowerCase: fooBar => foo bar ; Bar => bar
      this._services[lowerCase(key)] = value;
      // camelCase: Foo Bar => fooBar ; Foo Bar => fooBar
      this._services[camelCase(key)] = value;
      // kebabCase: Foo Bar => foo-bar
      this._services[kebabCase(key)] = value;
      // capitalize: FOOBar => Foobar
      this._services[capitalize(key)] = value;
    });
  }

  static get(type: string): IFormat {
    const service: IFormat = this._services[type];
    if (!service) {
      throw new Error("Unknown format: " + type);
    }
    return service;
  }
}