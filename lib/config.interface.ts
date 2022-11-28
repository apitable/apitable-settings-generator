import { IGetRecordsReqParams } from "apitable";

export enum Format {
  Array = "array",
  Rows = "rows",
  Columns = "columns",
  Properties_Files = "properties-files",
  Column_Files = "column-files"
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
  /*
   * Optional property, when you have many internationalized language settings,
   * then you can specify parameters to control the list of accepted languages.
   *
   * this property currently supports the `format` format list:
   *  - properties-files
   *  - column-files
   *
   * example：["zh_CN", "en_US"]
   */
  languageList?: string[];
  tables: ITableConfig[];
}
