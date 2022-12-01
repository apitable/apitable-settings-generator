![cover](https://socialify.git.ci/apitable/apitable-settings-generator/image?description=1&font=Inter&language=1&name=1&pattern=Diagonal%20Stripes&stargazers=1&theme=Dark)

# APITable Settings Generator

[![npm](https://img.shields.io/npm/v/apitable-settings-generator)](https://www.npmjs.com/package/apitable-settings-generator)
[![GitHub Workflow Status](https://img.shields.io/github/workflow/status/apitable/apitable-settings-generator/npm-publish)](https://github.com/apitable/apitable-settings-generator/actions)
[![npm bundle size](https://img.shields.io/bundlephobia/min/apitable-settings-generator)](https://www.npmjs.com/package/apitable-settings-generator)
[![npm](https://img.shields.io/npm/dm/apitable-settings-generator)](https://www.npmjs.com/package/apitable-settings-generator)

APITable Settings Generator convert APITable datasheet into JSON data.

For example, you have [APITable](https://apitable.com) like this:

| name           | emoji | category |
| -------------- | ----- | -------- |
| jack_o_lantern | 🎃    | A        |
| christmas_tree | 🎄    | B        |
| fireworks      | 🎆    | A        |
| sparkler       | 🎇    | C        |
| firecracker    | 🧨    | D        |

It will generate JSON settings like this:

```json
{
  "jack_o_lantern": {
    "emoji": "🎃",
    "category": "A"
  },
  "christmas_tree": {
    "emoji": "🎄",
    "category": "B"
  },
  "fireworks": {
    "emoji": "🎆",
    "category": "A"
  },
  "sparkler": {
    "emoji": "🎇",
    "category": "C"
  },
  "firecracker": {
    "emoji": "🧨",
    "category": "D"
  }
}
```

## Use Case

- Localization
- Features Flag
- Remote Config
- Software Settings
- Game Development
- ......

## Usage

APITable Settings Generator provides 5 generated settings format:

- `rows` (default)
- `columns`
- `array`
- `column-files`
- `properties-files`

Assume you have this APITable:

| id          | en_US           | zh_CN           |
| ----------- | --------------- | --------------- |
| login_title | Login APITable  | 中文 APITable   |
| some text   | some text en_US | some text zh_CN |

APITable Settings Generator generate settings in different mode:

### Format: `Rows`

You have this JSON config file `config.json`:

```json
[
  {
    "dirName": "./generated",
    "fileName": "i18n.generated.json",
    "tables": {
      {
        "datasheetId": "dstbUhd5coNXQoXFD8",
        "datasheetName": "strings",
        "format": "rows",
        "params": {
        }
      }
    }
  }
]
```

Run APITable Settings Generator (`asg`):

```bash
# run in bash
npx apitable-settings-generator --config config.json --token ${HERE_IS_YOUR_APITABLE_TOKEN}
```

Generated settings `i18n.generated.json`:

```json
{
  "strings": {
    "login_title": {
      "en_US": "Login APITable",
      "zh_CN": "中文APITable"
    },
    "some text": {
      "en_US": "some text en_US",
      "zh_CN": "some text zh_CN"
    }
  }
}
```

### Format: `Columns`

You have this JSON config file `config.json`:

```json
[
  {
    "dirName": "./generated",
    "fileName": "i18n.generated.json",
    "tables": {
      {
        "datasheetId": "dstbUhd5coNXQoXFD8",
        "datasheetName": "strings",
        "format": "columns",
        "params": {
        }
      }
    }
  }
]
```

Run APITable Settings Generator (`asg`):

```bash
# run in bash
npx asg --config config.json --token ${HERE_IS_YOUR_APITABLE_TOKEN}
```

Generated settings `i18n.generated.json`:

```json
{
  "strings": {
    "zh_CN": {
      "login_title": "中文APITable",
      "some text": "some text zh_CN"
    },
    "en_US": {
      "login_title": "Login APITable",
      "some text": "some text en_US"
    }
  }
}
```

### Format: `Array`

You have this JSON config file `config.json`:

```json
[
  {
    "dirName": "./generated",
    "fileName": "i18n.generated.json",
    "tables": {
      {
        "datasheetId": "dstbUhd5coNXQoXFD8",
        "datasheetName": "strings",
        "format": "array",
        "params": {}
      }
    }
  }
]
```

Run APITable Settings Generator (`asg`):

```bash
# run in bash
npx apitable-settings-generator --config config.json --token ${HERE_IS_YOUR_APITABLE_TOKEN}
```

Generated settings `i18n.generated.json`:

```json
{
  "strings": [
    {
      "id": "login_title",
      "en_US": "Login APITable",
      "zh_CN": "中文APITable"
    },
    {
      "id": "some text",
      "en_US": "some text en_US",
      "zh_CN": "some text zh_CN"
    }
  ]
}
```

### Format: `Column Files`

This format will separate columns into different files.

You have this JSON config file `config.json`:

```json
[
  {
    "dirName": "./generated",
    "fileName": "i18n.*.generated.json",
    "tables": {
      {
        "datasheetId": "dstbUhd5coNXQoXFD8",
        "datasheetName": "strings",
        "format": "column-files",
        "params": {}
      }
    }
  }
]
```

Run APITable Settings Generator (`asg`):

```bash
# run in bash
npx apitable-settings-generator --config config.json --token ${HERE_IS_YOUR_APITABLE_TOKEN}
```

Generated settings `i18n.en_US.generated.json`:

```json
{
  "strings": {
    "en_US": {
      "login_title": "Login APITable",
      "some text": "some text en_US"
    }
  }
}
```

Generated settings `i18n.zh_CN.generated.json`:

```json
{
  "strings": {
    "zh_CN": {
      "login_title": "中文APITable",
      "some text": "some text zh_CN"
    }
  }
}
```

### Format: `Properties Files`

`.properties` is a file extension for files that store configurable parameters for an application. They can also store strings for internationalization and localization, and such files are called Property Resource Bundles.

Usually the format of the file contents is `key=value`.

So the files need to be saved according to the different languages when they are generated

You have this JSON config file `config.json`:
```typescript
[
  {
    "dirName": "./generated",
    "fileName": "i18n_*.properties",
    "languageList"?: [
      "zh_CN",
      "en_US"
    ],
    "tables": [
      {
        "datasheetId": "dstbUhd5coNXQoXFD8",
        "datasheetName": "i18n",
        "format": "properties-files",
        "params"?: {...}
      }
    ]
  }
]
```

> **Note:** We have provided an interesting parameter `languageList` here.
> when you have many internationalized language settings, then you can specify parameters to control the list of accepted languages.
>
> example：
>  languageList:["zh_CN"]

Run APITable Settings Generator (`asg`):
```bash
# run in bash
npx apitable-settings-generator --config config.json --token ${HERE_IS_YOUR_APITABLE_TOKEN}
```

Generated settings `i18n_en_US.properties`:
```properties
long_text=Hello apitable
short_text=Hello
```

Generated settings `i18n_zh_CN.properties`:
```properties
long_text=你好 apitable
short_text=你好
```

Tips：
1. When you have the following list of languages

```
i18n_en_US.properties
i18n_zh_CN.properties
```

When you only need the `zh_CN` configuration package, you can now use the `languageList` attribute to control the output files, e.g.

```
...
languageList: ['zh-CN']
...
```
Now only the language file `i18n_zh_CN.properties` you specified will be output

## Conventions

We make some convetion that help you do more magic work:

- Ignore the column that name starts with `.`;
- Ignore the Primary Key that valut starts with `.`;


If you want to more features, please [new an issue](https://github.com/apitable/apitable-settings-generator/issues/new) for us.
