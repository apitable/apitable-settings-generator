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
}

export interface IConfig {
  dirName: string;
  fileName: string;
  tables: ITableConfig[];
}
