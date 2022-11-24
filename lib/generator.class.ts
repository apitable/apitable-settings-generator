import { APITable, IGetRecordsReqParams, IRecord, } from "apitable";
import * as fs from "fs";
import { forIn, join, keys, merge, replace } from "lodash";
import * as path from "path";
import { resolve } from "path";
import { IConfig } from "./config.interface";
import { Transformer } from "./transfomer.class";

export type RequestDataMap = { [datasheetId: string]: IRecord[] };

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
    const requestDatas: RequestDataMap = {};

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
      console.log("\n==========Getting start============");
      const begin = +new Date();

      const result = resultMap[fileName];
      const { config, data } = result;

      const fileExt = path.parse(config.fileName).ext;
      if ('.properties' === fileExt) {
        await this.writePropertiesFile(config, data);
      } else {
        await this.writeJsonFile(config, data);
      }

      const end = +new Date();
      console.log("Write finished，Time: %d seconds", (end - begin) / 1000);
      console.log("==========End============");
    }
  }

  /**
   * write to JSON file
   * @param config config
   * @param tableData
   */
  private async writeJsonFile(config: IConfig, tableData: object) {
    const rootDir = process.cwd();
    const outputPath = resolve(rootDir, config.dirName, config.fileName);

    console.log("Start writing file: %s", outputPath);

    // write into file
    const outputJson = JSON.stringify(tableData, null, 4);
    fs.writeFile(outputPath, outputJson, (err) => {
      if (err !== null) {
        console.error("Write failed：", err);
        return;
      }
    });
  }

  /**
   * write to Properties file
   * @param config config
   * @param tableData
   */
  private async writePropertiesFile(config: IConfig, tableData: any) {
    const rootDir = process.cwd();

    let mergeData: any = {};
    // If there are multiple tables, merge the data first
    for (const key in tableData) {
      mergeData = merge(mergeData, tableData[key]);
    }

    const languageList: string[] = [];
    if (config.languageList) {
      languageList.push(...config.languageList);
    } else {
      languageList.push(...keys(mergeData));
    }

    console.log("Waiting for the list of output languages: %s", languageList);

    for (const language of languageList) {
      const fileName = replace(config.fileName, '\*', language);
      const outputPath = resolve(
        rootDir,
        config.dirName,
        fileName
      );
      console.log("Start writing file: %s", outputPath);

      const formatStr: string[] = [];
      // Read the corresponding language and convert it into key=value
      forIn(mergeData[language], (value, key) => {
        formatStr.push(`${key}=${value}`);
      });

      // write into file
      const outputData = join(formatStr, '\r\n');
      fs.writeFile(outputPath, outputData, (err) => {
        if (err !== null) {
          console.error("Write failed：", err);
          return;
        }
      });
    }
  }

  /**
   * requiest data by APITable API Client
   * @param datasheetId Datasheet ID
   * @param reqParams
   */
  async requestData(
    datasheetId: string,
    reqParams?: IGetRecordsReqParams
  ): Promise<IRecord[]> {
    let records: IRecord[] = [];
    for await (const eachPageRecords of this._api
      .datasheet(datasheetId)
      .records.queryAll({ ...reqParams })) {
      records = [...records, ...eachPageRecords];
    }

    return records;
  }

}
