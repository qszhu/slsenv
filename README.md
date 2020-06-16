### SLSENV

Load the contents of `.env` into `serverless.yml` (Serverless Component V2).

#### Install

```bash
$ npm i -g slsenv
```

#### Run

In project root folder which has `.env` and `serverless.yml`, run:

```bash
$ slsenv
```

Changes are write back to `serverless.yml`.

#### Config

Create `.slsenvrc` in project root folder

```json
{
  "path": "inputs.functionConf.environment",
  "excludes": ["TENCENT_SECRET_ID", "TENCENT_SECRET_KEY"]
}
```

* `path`: key path to environment `variables`
* `excludes`: excluded `.env` variables
