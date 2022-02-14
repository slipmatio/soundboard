type logLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR' | 'FATAL'

export interface LogItem {
  level: logLevel
  message: string
  extra?: any
  duration?: number
}
