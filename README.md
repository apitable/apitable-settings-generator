# APITable Settings Generator

A settings generator with APITable power.

## Usage

APITable Settings Generator provides 3 generated settings mode:

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
        "zh_CN": "中文APITable",
    },
    "some text": {
        "en_US": "some text en_US",
        "zh_CN": "some text zh_CN",
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



## Future

### TODO Format: `Column Files`

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