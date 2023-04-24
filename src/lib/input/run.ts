import { Command } from '@cli-dang/input'
import { Dang } from '@cli-dang/decors'
import { spawn } from 'node:child_process'

const root = `${process.cwd()}/shell-script/`
const ext = '.sh'

const script_name_fn = ( data: string ): string => {
  return data.replace( '.sh', '' )
}

const run_cb:CommandCallBack = async ( data: ParsedArgv, ...rest_args: RestArgsCallbacks ): Promise<void> => {

  const script_name = script_name_fn( data.flag[ '--filename' ] || data.flag[ '--name' ] )
  const path = `${root}${script_name}${ext}`
  const args: string[] = []
  if( rest_args[ 0 ] === 'chmod' )
    args.push( 'u+x' )
  args.push( path )

  const childProcess = spawn( rest_args[ 0 ] as string, args, {
    stdio: [ 'ignore', process.stdout, process.stderr ]
  } )

  childProcess.on( 'error', error => process.stderr.write( error.message ) )
  childProcess.on( 'exit', code => {
    code === 0
      ? console.log( `*${Dang.magenta( script_name )}${rest_args[ 0 ]=== 'chmod' ? ' u+x' : ''} -> ${Dang.b_green( rest_args[ 1 ] as string )}` )
      : console.log( `${rest_args[ 2 ]} failed with code -> ${ code }` )
  } )
}

export default async function run( parsed: ParsedArgv ): Promise<void>{

  let rest_args: undefined|RestArgsCallbacks
  let parsedArgv: undefined|ParsedArgv = undefined

  if( ! parsed.keys.includes( 'help' ) ) {
    if ( parsed.keys.includes( 'chmodx' ) )
      rest_args = [ 'chmod', 'succeed', 'chmodx' ]
    else {
      rest_args = [ 'sh', 'executed', 'run' ]
      parsedArgv = {
        object: {
          'run': undefined,
          '--filename': parsed.keys[ 0 ]
        },
        keys: [
          'run',
          '--filename'
        ]
      }
    }
  }

  const run = new Command()

  /**
   *  - hidden command.
   *
   *  RUN COMMAND
   */
  run.define( 'run', run_cb, {
    description: 'run a shell-script, sh extension can be avoided. Default directory `shell-script`',
    usage: 'run filename'
  }, undefined, undefined, rest_args )

  /**
   * - hidden flag.
   * no need to define description and usage field.
   *
   * RUN --FILENAME FLAG
   */
  await run.flag( [ '--filename' ], {
    short: '--filename',
    type: 'string',
    void: false,
    check: true
  } )

  /* CHMODX COMMAND */
  run.define( 'chmodx', run_cb, {
    description: 'fix executable attribute for the shell script, sh extension can be avoided. Default directory `shell-script`',
    usage: 'run chmodx --name=filename'
  }, undefined, undefined, rest_args )

  /* CHMODX --NAME FLAG */
  await run.flag( [ '--name' ], {
    short: '--name',
    type: 'string',
    void: false,
    check: true,
    description: 'fix executable attribute of the shell-script file, sh extension can be avoided. Default directory `shell-script`',
    usage: 'run chmodx --name=filename'
  } )

  await run.intercept( parsedArgv || parsed )
}