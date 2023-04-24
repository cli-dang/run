#!/usr/bin/env node --no-warnings
import run from './lib/input/run.js'
import { entry_point } from '@cli-dang/input'

process.argv.splice( 0, 2 )
process.title = 'dang-run'

await entry_point( process.argv, run ).catch( console.error )