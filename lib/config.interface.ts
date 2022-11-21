import { IGetRecordsReqParams } from "apitable";

export enum Format {
  Array = "array",
  Rows = "rows",
  Columns = "columns",
}

export interface ITableConfig {
  datasheetId: string;
  datasheetName: string;
  format: Format;
  id?: boolean;
  params?: IGetRecordsReqParams;
  create?: boolean;
  _api_client_config: _IApiClientConfig;
}

export interface IConfig {
  dirName: string;
  fileName: string;
  create?: boolean;
  tables: ITableConfig[];
}

export interface _IApiClientConfig {
  _host: string,
  _token: string
}
