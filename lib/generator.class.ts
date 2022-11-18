
import {
  APITable,
  IRecord,
  IGetRecordsReqParams,
} from "apitable";
import * as fs from "fs";
import { resolve } from "path";
import { IConfig, ITableConfig } from "./config.interface";
import { Transformer } from "./transfomer.class";

export type RequestDataMap = {[datasheetId: string]: IRecord[]};

/**
 * The main settings generator
 */
export class Generator {
  private _api: APITable;

  private _configs: IConfig[];
  // private _transformer: Transformer;

  constructor(configs: IConfig[], token: string, host: string = 'https://apitable.com/fusion/v1') {

    // APITable API client
    this._api = new APITable({
      token: token,
      host: host,
    });

    this._configs = configs;
    
  }
  public async generate() {

    const requestDatas: RequestDataMap = {}

    for (const config of this._configs) {
      // process multi table configs
      for (const tableConfig of config.tables) {
        // request data
        const records = await this.requestData(
          tableConfig.datasheetId,
          tableConfig.params
        );
        requestDatas[tableConfig.datasheetId] = records;
      }
    }

    const tf = new Transformer(this._configs, requestDatas);
    const resultMap = tf.generateSettings();
    for (const fileName in resultMap) {
      const result = resultMap[fileName]

      this.writeJsonFile(result.config, result.data);
    }
  }

  /**
   * write to JSON file
   * @param config config
   */
  private async writeJsonFile(config: IConfig, tableData: object) {
    const rootDir = process.cwd();
    const outputPath = resolve(
      rootDir,
      config.dirName,
      config.fileName
    );
    console.log("\n==========开始============");
    console.log("写入文件路径开始: %s", outputPath);
    const begin = +new Date();



    // 解析多个表返回对象
    // const tableData = await this.parseTables(config.tables);
    // // 处理关联表数据替换
    // this._transformer.handleRelateRecord();

    // write into file
    const outputJson = JSON.stringify(tableData, null, 4);
    fs.writeFile(outputPath, outputJson, (err) => {
      if (err !== null) {
        console.error("写入失败");
        console.error(err);
        return;
      }
    });
    const end = +new Date();
    console.log("写入文件完成，耗时: %d 秒", (end - begin) / 1000);
    console.log("==========结束============");
  }

  /**
   * parse multi tables
   * 
   * @param tableConfigs configs
   */
  // async parseTables(tableConfigs: ITableConfig[]): Promise<object> {
  //   const tableObjects: { [key: string]: object } = {};

  //   // 处理生成json所需要的多个表格组合数据
  //   for (const tableConfig of tableConfigs) {
  //     // 请求获取表数据
  //     const records = await this.requestData(
  //       tableConfig.datasheetId,
  //       tableConfig.params
  //     );
  //     const result = this._transformer.parseTable(tableConfig, records);

  //     tableObjects[tableConfig.datasheetName] = result;

  //   }
  //   const res = dot.object(tableObjects) as { [key: string]: any };
  //   delete res[""];
  //   return res;
  // }

  /**
   * requiest data by APITable API Client
   * @param datasheetId Datasheet ID
   */
  async requestData(
    datasheetId: string,
    setting?: IGetRecordsReqParams
  ): Promise<IRecord[]> {
    let records: IRecord[] = [];
    for await (const eachPageRecords of this._api
      .datasheet(datasheetId)
      .records.queryAll({ ...setting })) {
      records = [...records, ...eachPageRecords];
    }

    return records;
  }

}
