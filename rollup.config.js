import babel from '@rollup/plugin-babel'
import commonjs from '@rollup/plugin-commonjs'
import resolve from '@rollup/plugin-node-resolve'
import terser from '@rollup/plugin-terser'
import dts from 'rollup-plugin-dts'
import typescript from 'rollup-plugin-typescript2'

const extensions = ['.js', '.ts']

const plugins = [
  resolve({
    moduleDirectories: ['node_modules']
  }),
  commonjs(),
  typescript({
    useTsconfigDeclarationDir: true
  }),
  babel({
    exclude: 'node_modules/**',
    extensions
  })
]

export default [
  {
    input: 'src/index.ts',
    output: [
      {
        file: './lib/index.js',
        format: 'umd',
        name: 'cookie-client-monitor'
      },
      {
        file: './lib/index.esm.js',
        format: 'es',
        sourcemap: true
      },
      {
        file: './lib/index.min.js',
        format: 'iife',
        name: 'version',
        plugins: [terser()]
      }
    ],
    plugins
  },
  {
    input: 'src/index.ts',
    output: {
      file: 'lib/index.d.ts',
      format: 'es'
    },
    plugins: [...plugins, dts()]
  }
]
