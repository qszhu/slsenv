#!/usr/bin/env node

import * as fs from 'fs'
import { join } from 'path'
import { promisify } from 'util'

import * as commander from 'commander'
import * as yaml from 'js-yaml'
import * as dotenv from 'dotenv'

async function readFile(fn: string, readFn: Function, def?: any) {
  try {
    const buf = await promisify(fs.readFile)(fn, 'utf8')
    return readFn(buf)
  } catch (e) {
    return def
  }
}

const DEFAULT_CONFIG = {
  path: 'inputs.functionConf.environment',
  excludes: ['TENCENT_SECRET_ID', 'TENCENT_SECRET_KEY'],
}

async function insertEnv(
  yaml: object,
  dotenv: object,
  inputConfig: { path: string; excludes?: string[] }
) {
  const config = Object.assign(DEFAULT_CONFIG, inputConfig)
  let obj: any = yaml
  for (const key of config.path.split('.')) {
    if (!obj.hasOwnProperty(key)) {
      obj[key] = {}
    }
    obj = obj[key]
  }
  obj.variables = {}

  Object.keys(dotenv)
    .filter((key) => !config.excludes.includes(key))
    .forEach((key) => (obj.variables[key] = `\${env:${key}}`))

  return yaml
}

async function main() {
  const program = new commander.Command()
  program.option('-p, --path <project_root>', 'project root path', '.')
  program.option('-c, --config <config_file>', 'config file', '.slsenvrc')
  program.parseAsync(process.argv)

  const yamlDoc = await readFile(join(program.path, 'serverless.yml'), yaml.safeLoad)

  const dotenvDoc = await readFile(join(program.path, '.env'), dotenv.parse)

  const config = await readFile(join(program.path, program.config), JSON.parse, {})

  const newYamlDoc = await insertEnv(yamlDoc, dotenvDoc, config)
  const newYaml = yaml.safeDump(newYamlDoc)
  await promisify(fs.writeFile)(join(program.path, 'serverless.yml'), newYaml, 'utf8')
}

if (require.main === module) {
  main().catch(console.error)
}
