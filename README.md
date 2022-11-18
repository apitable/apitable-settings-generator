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
- Software Settings
- Game Development
- ......

## Usage

APITable Settings Generator provides 3 generated settings format:

- `rows` (default)
- `columns`
- `array`

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

## Conventions

- Ignore the column that name starts with `.`;
- Ignore the Primary Key that valut starts with `.`;
