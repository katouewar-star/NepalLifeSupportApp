/**
 * Jest globalSetup
 *
 * このファイルは Jest ワーカーが起動する前にメインプロセスで実行される。
 * ここで設定した process.env の値は各ワーカーに引き継がれる。
 *
 * EXPO_PUBLIC_OPENAI_API_KEY を設定することで、babel-preset-expo が
 * translation.ts をコンパイルする際に有効な API キーとしてインライン化できる。
 */
module.exports = async function () {
  process.env.EXPO_PUBLIC_OPENAI_API_KEY = 'test-api-key-for-jest'
}
