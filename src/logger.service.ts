import * as winston from 'winston';
import DailyRotateFile = require('winston-daily-rotate-file');

export class WinstonLoggerService {
  dailyRotateFileTransport: any = null;
  private format: winston.Logform.Format = null;
  createLoggerConfig: winston.LoggerOptions = null;

  constructor() {
    this.dailyRotateFileTransport = new DailyRotateFile({
      filename: `logs/app-%DATE%.log`,
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '1d',
    });

    this.format = winston.format.printf(
      ({ level = 'info', message, timestamp, req, err, ...metadata }) => {
        if (!req) {
          req = { headers: {} };
        }

        let msg = `${timestamp} [${level}] : ${message} `;
        const json: any = {
          timestamp,
          level,
          ...metadata,
          message,
          error: {},
        };

        if (err) {
          json.error = err.stack || err;
        }

        msg = JSON.stringify(json);
        return msg;
      },
    );

    this.createLoggerConfig = {
      level: 'warn', // this will print warn and above level (error also)
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.splat(),
        winston.format.errors({ stack: true }),
        winston.format.json(),
        winston.format.timestamp({
          format: 'YYYY-MM-DD HH:mm:ss',
        }),
        this.format,
      ),

      transports: [
        new winston.transports.Console({ level: 'info' }),
        this.dailyRotateFileTransport,
      ],
    };
  }
}
