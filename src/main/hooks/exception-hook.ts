/**
 * 全局异常处理钩子
 */
export function setupExceptionHook() {
  process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error)
  })

  process.on('unhandledRejection', (reason) => {
    console.error('Unhandled Rejection:', reason)
  })
}
