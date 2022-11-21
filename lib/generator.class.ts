import { APITable, IGetRecordsReqParams, IRecord, } from "apitable";
import dot from "dot-object";
import * as fs from "fs";
import { resolve } from "path";
import { IConfig, ITableConfig } from "./config.interface";
import { Transformer } from "./transfomer.class";

export type RequestDataMap = { [datasheetId: string]: IRecord[] };

/**
 * The main settings generator
 */
export class Generator {
  private _api: APITable;

  private _configs: IConfig[];

  // private _transformer: Transformer;

  private _currentHandleTableConfig: ITableConfig | undefined;

  constructor(configs: IConfig[], token: string, host: string = 'https://apitable.com/fusion/v1') {

    // APITable API client
    this._api = new APITable({
      token: token,
      host: host,
    });

    this._configs = configs;

    this._tableCustomizeApiClientConfig();
  }

  public async generate() {
    const requestDatas: RequestDataMap = {};

    for (const config of this._configs) {
      // process multi table configs
      for (const tableConfig of config.tables) {
        this._currentHandleTableConfig = tableConfig;

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
      const result = resultMap[fileName];

      this.writeJsonFile(result.config, result.data);
    }
  }

  /**
   * write to JSON file
   * @param config config
   * @param tableData output data
   */
  private async writeJsonFile(config: IConfig, tableData: object) {
    const rootDir = process.cwd();
    const outputPath = resolve(
      rootDir,
      config.dirName,
      config.fileName
    );
    console.log("\n==========Getting start============");
    console.log("Start writting file: %s", outputPath);
    const begin = +new Date();

    if ((config.create ?? true)) {
      // Filter out the keys that do not need to be generated
      const removeKeys = config.tables.reduce<string[]>((pre, cur) => {
        if (!(cur.create ?? true)) {
          pre.push(cur.datasheetName);
        }
        return pre;
      }, []) as string[];
      console.log('Key to be deleted: %s', removeKeys);
      const filterData = removeKeys.length > 0 ? dot.remove(removeKeys, tableData) : tableData;

      // write into file
      const outputJson = JSON.stringify(filterData, null, 4);
      fs.writeFile(outputPath, outputJson, (err) => {
        if (err !== null) {
          console.error("Write failed");
          console.error(err);
          return;
        }
      });
      const end = +new Date();
      console.log("Write finished，Time: %d seconds", (end - begin) / 1000);
      console.log("==========End============");
    } else {
      console.log('No need to generate file: %s ', config.fileName);
      console.log('==========End============');
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

  private _tableCustomizeApiClientConfig() {
    this._api.axios.interceptors.request.use(config => {
      const _tableConfig = this._currentHandleTableConfig;
      const _host = _tableConfig?._api_client_config?._host || this._api.config.host;
      const _token = _tableConfig?._api_client_config?._token || this._api.config.token;

      config.baseURL = _host;
      config.headers = {
        ...config.headers,
        Authorization: 'Bearer ' + _token
      };
      return config;
    });
  }

}
