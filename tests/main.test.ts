import { IConfig } from "../lib/config.interface";
import { RequestDataMap } from "../lib/generator.class";
import { SettingsResultMap, Transformer } from "../lib/transfomer.class";

const mockConfigs = require('./mock_config.json') as IConfig[];
const mockRequests = require('./mock_request.json');

const requestedDataMap: RequestDataMap = {};

for (const fileName in mockRequests) {
  requestedDataMap[fileName] = mockRequests[fileName].data.records;
}

describe("test APITable settings generator", () => {
  it("should mock data ok", async () => {
    expect(mockConfigs[0].fileName).toEqual("strings.rows.auto.json");
    expect(mockConfigs[0].tables[0].datasheetId).toEqual("dstDEMO");
    expect(mockRequests.dstDEMO.code).toEqual(200);
    expect(mockRequests.dstDEMO.data).not.toBeNull();
    expect(requestedDataMap['dstDEMO'][0].recordId = 'rec2RI5z7rdXg');
  });

  it("should single row settings transform ok", async () => {

    const tf: Transformer = new Transformer(mockConfigs, requestedDataMap);
    const firstConfig = mockConfigs[0];
    expect(firstConfig).not.toBeUndefined();
    const firstTableConfig = firstConfig.tables[0];
    expect(firstTableConfig).not.toBeUndefined();

    expect(requestedDataMap[firstTableConfig.datasheetId]).not.toBeUndefined();

    const genSettings: { [key: string]: any } = tf.parseTable(firstTableConfig, requestedDataMap[firstTableConfig.datasheetId]);
    expect(genSettings).not.toBeNull();
    expect(genSettings).not.toBeUndefined();

    /**
     * genSettings will be:
     *
     {
      please_contact_admin_if_you_have_any_problem: {
        zh_CN: '如有问题请联系空间站管理员',
        en_US: 'You do not have access to the file or the file has been deleted \n' +
          '👉🏻 Click the lower right button and I will assist you to solve'
      },
      not_found_this_file: { zh_CN: '找不到你想访问的文件', en_US: 'The file cannot be accessed' }
     }
     */
    const genItem = genSettings['please_contact_admin_if_you_have_any_problem'];
    expect(genItem['en_US'].indexOf('You do not have access to the file or the file has been deleted') != -1).toBe(true);

  });

  it("should single column settings transform ok", async () => {

    const tf: Transformer = new Transformer(mockConfigs, requestedDataMap);
    const columnConfig = mockConfigs[1];
    expect(columnConfig).not.toBeUndefined();
    const columnTableConfig = columnConfig.tables[0];
    expect(columnTableConfig).not.toBeUndefined();

    const genSettings: { [key: string]: any } = tf.parseTable(columnTableConfig, requestedDataMap[columnTableConfig.datasheetId]);
    expect(genSettings).not.toBeNull();
    expect(genSettings).not.toBeUndefined();
    console.log(genSettings);

    /**
     * genSettings will be:
     *
     * {
     *    "zh_CN": {
     *      "please_contact_admin_if_you_have_any_problem": "如有问题请联系空间站管理员"
     *    },
     *    "en_US": {
     *      "please_contact_admin_if_you_have_any_problem": "xxx"
     *    }
     * }
     */
    expect(typeof genSettings['zh_CN']).toBe("object");
    expect(genSettings['zh_CN']['please_contact_admin_if_you_have_any_problem']).toBe("如有问题请联系空间站管理员");

  });

  it("call format: properties-files transform ok", async () => {
    const pfConfig = mockConfigs[4];

    const tf: Transformer = new Transformer([pfConfig], requestedDataMap);
    expect(pfConfig).not.toBeUndefined();
    const cpfTableConfig = pfConfig.tables[0];
    expect(cpfTableConfig).not.toBeUndefined();

    const resultMap: SettingsResultMap = tf.generateSettings();
    expect(resultMap).not.toBeNull();
    expect(resultMap).not.toBeUndefined();

    const result = resultMap[pfConfig.fileName];
    expect(result).not.toBeUndefined();
    expect(result.config).not.toBeUndefined();
    expect(result.data).not.toBeUndefined();

    const data = result.data[cpfTableConfig.datasheetName];
    expect(data).not.toBeUndefined();
    expect(data).toMatchObject({
      'en_US': expect.any(Object),
      'zh_CN': expect.any(Object),
    });
  });

  it("should multiple settings transform ok", async () => {
    //   expect(result['strings.array.auto.json']).not.toBeUndefined();
    //   expect(result['strings.columns.auto.json']).not.toBeUndefined();
    //   expect(result['strings.rows.auto.json']).not.toBeUndefined();
  });
});
